//Crea una capa de mapa base
var mapLayer = L.tileLayer(
  'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org">BIOST3</a>',
    maxZoom: 18,
    minZoom: 4
  }
)

var geojson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [10.2, 47.5]
      },
      properties: {
        time: '2023-02-22T10:30:00'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [10.1, 47.4]
      },
      properties: {
        time: '2023-02-21T11:00:00'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [10.3, 47.6]
      },
      properties: {
        time: '2023-02-24T00:00:00Z'
      }
    }
  ]
}
function extractCoordsAndTimes (geojson) {
  return geojson.features.map(function (feature) {
    var coords = [
      feature.geometry.coordinates[0],
      feature.geometry.coordinates[1]
    ]
    var time = feature.properties.time
    return { lat: coords[0], lng: coords[1], time: time }
  })
}

var date = new Date('2014-10-01T00:00:00Z').toISOString()

// Crea el mapa con la capa de tiempo
var map = L.map('map', {
  center: [41.356, 2.176],
  zoom: 10,
  timeDimension: true,
  timeDimensionOptions: {
    timeInterval: '2014-09-30/2023-02-25',
    period: 'P1D',
    autoPlay: true,
    currentTime: new Date('2014-09-30').getTime(),
    playButton: true,
    playerOptions: {
      transitionTime: 1000,
      loop: true
    }
  },
  timeDimensionControl: true
  // layers: [mapLayer, timeDimensionLayer]
})

  // Obtener la URL actual
  var urlActual = window.location.href;
  
  // Crear un objeto URLSearchParams
  var searchParams = new URLSearchParams(new URL(urlActual).search);
  
  // Obtener el valor del parámetro 'q'
  var qParam = searchParams.get('q');
  
  // Decodificar el valor del parámetro 'q'
  var qValue = decodeURIComponent(qParam);
  
  searchByName(qValue)
// Crea una capa de tiempo con los datos y el heatmap
var heatmapLayer = L.heatLayer([], {
  radius: 25,
  blur: 30,
  scaleRadius: true,
  maxZoom: 12,
  gradient: {
    0.4: 'rgba(0, 0, 255, 0.05)',
    0.6: 'rgba(0, 255, 0, 0.05)',
    0.8: 'rgba(255, 255, 0, 0.05)',
    1.0: 'rgba(255, 0, 0, 0.05)'
  }
})

var timeLayer = L.timeDimension.layer({
  layer: heatmapLayer,
  updateTimeDimension: true,
  addlastPoint: false,
  waitForReady: true,
  getStartTime: function (feature) {
    return moment.utc(feature.properties.time).valueOf()
  },
  getEndTime: function (feature) {
    return moment.utc(feature.properties.time).valueOf()
  }
})

timeLayer.addTo(map)

// var timeDimensionControl = L.control.timeDimension({
  //   position: "bottomleft",
  //   autoPlay: true,
//   playerOptions: {
//       buffer: 10,
//       transitionTime: 1000
//   }
// });

// timeDimensionControl.addTo(map);

// L.control.layers({}, {"Heatmap Layer": heatmapLayer}).addTo(map);

heatmapLayer.addTo(map)
mapLayer.addTo(map)

// setInterval(mostrarDatosActuales,100);

// function mostrarDatosActuales() {
//   // Obtener el tiempo actual del TimeDimensionControl
//   var tiempoActual = map.timeDimension.getCurrentTime();
//   var tiempoActual = new Date(tiempoActual);
//   // Obtener los tiempos disponibles en la capa de tiempo
//   var tiemposDisponibles = timeLayer.options.times;
  
  
//   // Filtrar los datos que coincidan con el tiempo actual del controlador
//   var datosActuales = data.filter(function(dato) {
//     console.log(dato.time)
//     console.log(tiempoActual.toISOString().slice(0, -5))
//     return dato.time === tiempoActual.toISOString().slice(0, -5);
//   });

//   // Mostrar los datos en la consola
//   heatmapLayer.setLatLngs(datosActuales)
// }

// Obtener el tiempo actual del TimeDimensionControl

var dataReady = new Promise(function(resolve, reject) {
  var intervalId = setInterval(function() {
    if (typeof data !== 'undefined') {
      clearInterval(intervalId);
      resolve();
    }
  }, 100);
});


// Indexar los datos por tiempo
var datosPorTiempo = {};

dataReady.then(function() {
  data.forEach(function(dato) {
    var tiempoStr = dato.time
    if (!datosPorTiempo[tiempoStr]) {
      datosPorTiempo[tiempoStr] = [];
    }
      datosPorTiempo[tiempoStr].push(dato);
  });

});

map.timeDimension.on("timeload", function(data){
  var tiempoActual = data.time
  if (typeof tiempoActual === 'number') {
    tiempoActual = new Date(tiempoActual);
  }
  var tiempoActualStr = tiempoActual.toISOString().slice(0, -5);
  mostrarDatosActuales(tiempoActualStr)
})

// Mostrar los datos actuales
function mostrarDatosActuales(tiempoActualStr) {
  var datosActuales = datosPorTiempo[tiempoActualStr] || [];
  console.log(datosActuales)
  heatmapLayer.setLatLngs(datosActuales);
}


function searchByName(nombre) {
  $.ajax({
    url: "http://127.0.0.1:8000/cargar-con-ajax",
    data: {
      'q': nombre,
    },
    dataType: "json",
    success: function(response) {
      data = response.data;
      // console.log(data);
    },
    error: function(xhr, status, error) {
      console.log("Ha ocurrido un error:", error);
    }
  });
}



// Crea el TimeDimension control y agrégalo al mapa
// var timeDimensionControl = new L.Control.TimeDimension({
  //   timeDimension: timeDimension,
  //   position: 'bottomleft',
//   autoPlay: true,
//   playerOptions: {
  //     transitionTime: 1000,
  //     loop: true
  //   }
// })

// timeDimensionControl.addTo(map)
// timeLayer.addTimeData(geojson);

// function loadMap () {
//   mapCSV = localStorage.getItem('map')
//   latlng = localStorage.getItem('latlng')
//   zoom = localStorage.getItem('zoom')
//   zoom = JSON.parse(zoom)
//   latlng = JSON.parse(latlng)

//   if (mapCSV == null) {
//     testData = {
//       data: []
//     }
//   } else {
//     testData = JSON.parse(mapCSV)
//   }

//   var baseLayer = L.tileLayer(
//     'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//     {
//       attribution:
//         'Map data &copy; <a href="http://openstreetmap.org">BIOST3</a>',
//       maxZoom: 18,
//       minZoom: 4
//     }
//   )

//   var cfg = {
//     // radius should be small ONLY if scaleRadius is true (or small radius is intended)
//     radius: 2,
//     maxOpacity: 0.7,
//     // scales the radius based on map zoom
//     scaleRadius: true,
//     // if set to false the heatmap uses the global maximum for colorization
//     // if activated: uses the data maximum within the current map boundaries
//     //   (there will always be a red spot with useLocalExtremas true)
//     useLocalExtrema: true,
//     // which field name in your data represents the latitude - default "lat"
//     latField: 'lat',
//     // which field name in your data represents the longitude - default "lng"
//     lngField: 'lng',
//     // which field name in your data represents the data value - default "value"
//     valueField: 'count'
//   }

//   heatmapLayer = new HeatmapOverlay(cfg)

//   dia_2023_02_1 = {
//     data: [
//       { lat: 24.6408, lng: 46.7728, count: 3 },
//       { lat: 50.75, lng: -1.55, count: 1 },
//       { lat: 52.6333, lng: 1.75, count: 1 },
//       { lat: 48.15, lng: 9.4667, count: 1 },
//       { lat: 52.35, lng: 4.9167, count: 2 },
//       { lat: 60.8, lng: 11.1, count: 1 },
//       { lat: 43.561, lng: -116.214, count: 1 },
//       { lat: 47.5036, lng: -94.685, count: 1 },
//       { lat: 42.1818, lng: -71.1962, count: 1 },
//       { lat: 42.0477, lng: -74.1227, count: 1 },
//       { lat: 40.0326, lng: -75.719, count: 1 },
//       { lat: 40.7128, lng: -73.2962, count: 2 },
//       { lat: 27.9003, lng: -82.3024, count: 1 },
//       { lat: 38.2085, lng: -85.6918, count: 1 },
//       { lat: 46.8159, lng: -100.706, count: 1 },
//       { lat: 30.5449, lng: -90.8083, count: 1 },
//       { lat: 44.735, lng: -89.61, count: 1 },
//       { lat: 41.4201, lng: -75.6485, count: 2 },
//       { lat: 39.4209, lng: -74.4977, count: 1 },
//       { lat: 39.7437, lng: -104.979, count: 1 },
//       { lat: 39.5593, lng: -105.006, count: 1 },
//       { lat: 45.2673, lng: -93.0196, count: 1 },
//       { lat: 41.1215, lng: -89.4635, count: 1 },
//       { lat: 43.4314, lng: -83.9784, count: 1 },
//       { lat: 43.7279, lng: -86.284, count: 1 },
//       { lat: 40.7168, lng: -73.9861, count: 1 },
//       { lat: 47.7294, lng: -116.757, count: 1 },
//       { lat: 47.7294, lng: -116.757, count: 2 },
//       { lat: 35.5498, lng: -118.917, count: 1 },
//       { lat: 34.1568, lng: -118.523, count: 1 },
//       { lat: 39.501, lng: -87.3919, count: 3 },
//       { lat: 33.5586, lng: -112.095, count: 1 },
//       { lat: 38.757, lng: -77.1487, count: 1 },
//       { lat: 33.223, lng: -117.107, count: 1 },
//       { lat: 30.2316, lng: -85.502, count: 1 },
//       { lat: 39.1703, lng: -75.5456, count: 8 },
//       { lat: 30.0041, lng: -95.2984, count: 2 },
//       { lat: 29.7755, lng: -95.4152, count: 1 },
//       { lat: 41.8014, lng: -87.6005, count: 1 },
//       { lat: 37.8754, lng: -121.687, count: 7 },
//       { lat: 38.4493, lng: -122.709, count: 1 },
//       { lat: 40.5494, lng: -89.6252, count: 1 },
//       { lat: 42.6105, lng: -71.2306, count: 1 },
//       { lat: 40.0973, lng: -85.671, count: 1 },
//       { lat: 40.3987, lng: -86.8642, count: 1 },
//       { lat: 40.4224, lng: -86.8031, count: 4 },
//       { lat: 47.2166, lng: -122.451, count: 1 },
//       { lat: 32.2369, lng: -110.956, count: 1 },
//       { lat: 41.3969, lng: -87.3274, count: 2 },
//       { lat: 41.7364, lng: -89.7043, count: 2 },
//       { lat: 42.3425, lng: -71.0677, count: 1 },
//       { lat: 33.8042, lng: -83.8893, count: 1 },
//       { lat: 36.6859, lng: -121.629, count: 2 },
//       { lat: 41.0957, lng: -80.5052, count: 1 },
//       { lat: 46.8841, lng: -123.995, count: 1 },
//       { lat: 40.2851, lng: -75.9523, count: 2 },
//       { lat: 42.4235, lng: -85.3992, count: 1 },
//       { lat: 39.7437, lng: -104.979, count: 2 },
//       { lat: 25.6586, lng: -80.3568, count: 7 },
//       { lat: 33.0975, lng: -80.1753, count: 1 },
//       { lat: 25.7615, lng: -80.2939, count: 1 },
//       { lat: 26.3739, lng: -80.1468, count: 1 },
//       { lat: 37.6454, lng: -84.8171, count: 1 },
//       { lat: 34.2321, lng: -77.8835, count: 1 },
//       { lat: 34.6774, lng: -82.928, count: 1 },
//       { lat: 39.9744, lng: -86.0779, count: 1 },
//       { lat: 35.6784, lng: -97.4944, count: 2 },
//       { lat: 33.5547, lng: -84.1872, count: 1 },
//       { lat: 27.2498, lng: -80.3797, count: 1 },
//       { lat: 41.4789, lng: -81.6473, count: 1 },
//       { lat: 41.813, lng: -87.7134, count: 1 },
//       { lat: 41.8917, lng: -87.9359, count: 1 },
//       { lat: 35.0911, lng: -89.651, count: 1 },
//       { lat: 32.6102, lng: -117.03, count: 1 },
//       { lat: 41.758, lng: -72.7444, count: 1 },
//       { lat: 39.8062, lng: -86.1407, count: 1 },
//       { lat: 41.872, lng: -88.1662, count: 1 },
//       { lat: 34.1404, lng: -81.3369, count: 1 },
//       { lat: 46.15, lng: -60.1667, count: 1 },
//       { lat: 36.0679, lng: -86.7194, count: 1 },
//       { lat: 43.45, lng: -80.5, count: 1 },
//       { lat: 44.3833, lng: -79.7, count: 1 },
//       { lat: 45.4167, lng: -75.7, count: 2 },
//       { lat: 43.75, lng: -79.2, count: 2 },
//       { lat: 45.2667, lng: -66.0667, count: 3 },
//       { lat: 42.9833, lng: -81.25, count: 2 },
//       { lat: 44.25, lng: -79.4667, count: 3 },
//       { lat: 45.2667, lng: -66.0667, count: 2 },
//       { lat: 34.3667, lng: -118.478, count: 3 },
//       { lat: 42.734, lng: -87.8211, count: 1 },
//       { lat: 39.9738, lng: -86.1765, count: 1 },
//       { lat: 33.7438, lng: -117.866, count: 1 },
//       { lat: 37.5741, lng: -122.321, count: 1 },
//       { lat: 42.2843, lng: -85.2293, count: 1 },
//       { lat: 34.6574, lng: -92.5295, count: 1 },
//       { lat: 41.4881, lng: -87.4424, count: 1 },
//       { lat: 25.72, lng: -80.2707, count: 1 },
//       { lat: 34.5873, lng: -118.245, count: 1 },
//       { lat: 35.8278, lng: -78.6421, count: 1 }
//     ]
//   }
//   dia_2023_02_2 = {
//     data: [
//       { lat: 24.6408, lng: 46.7728, count: 3 },
//       { lat: 50.75, lng: -1.55, count: 1 },
//       { lat: 52.6333, lng: 1.75, count: 1 },
//       { lat: 48.15, lng: 9.4667, count: 1 },
//       { lat: 52.35, lng: 4.9167, count: 2 },
//       { lat: 60.8, lng: 11.1, count: 1 },
//       { lat: 43.561, lng: -116.214, count: 1 },
//       { lat: 47.5036, lng: -94.685, count: 1 },
//       { lat: 42.1818, lng: -71.1962, count: 1 },
//       { lat: 42.0477, lng: -74.1227, count: 1 },
//       { lat: 40.0326, lng: -75.719, count: 1 },
//       { lat: 40.7128, lng: -73.2962, count: 2 },
//       { lat: 27.9003, lng: -82.3024, count: 1 },
//       { lat: 38.2085, lng: -85.6918, count: 1 },
//       { lat: 46.8159, lng: -100.706, count: 1 },
//       { lat: 30.5449, lng: -90.8083, count: 1 },
//       { lat: 44.735, lng: -89.61, count: 1 },
//       { lat: 41.4201, lng: -75.6485, count: 2 },
//       { lat: 39.4209, lng: -74.4977, count: 1 },
//       { lat: 39.7437, lng: -104.979, count: 1 },
//       { lat: 39.5593, lng: -105.006, count: 1 },
//       { lat: 45.2673, lng: -93.0196, count: 1 },
//       { lat: 41.1215, lng: -89.4635, count: 1 },
//       { lat: 43.4314, lng: -83.9784, count: 1 },
//       { lat: 43.7279, lng: -86.284, count: 1 },
//       { lat: 40.7168, lng: -73.9861, count: 1 },
//       { lat: 47.7294, lng: -116.757, count: 1 },
//       { lat: 47.7294, lng: -116.757, count: 2 },
//       { lat: 35.5498, lng: -118.917, count: 1 },
//       { lat: 34.1568, lng: -118.523, count: 1 },
//       { lat: 39.501, lng: -87.3919, count: 3 },
//       { lat: 33.5586, lng: -112.095, count: 1 },
//       { lat: 38.757, lng: -77.1487, count: 1 },
//       { lat: 33.223, lng: -117.107, count: 1 },
//       { lat: 30.2316, lng: -85.502, count: 1 },
//       { lat: 39.1703, lng: -75.5456, count: 8 },
//       { lat: 30.0041, lng: -95.2984, count: 2 },
//       { lat: 29.7755, lng: -95.4152, count: 1 },
//       { lat: 41.8014, lng: -87.6005, count: 1 },
//       { lat: 37.8754, lng: -121.687, count: 7 },
//       { lat: 38.4493, lng: -122.709, count: 1 },
//       { lat: 40.5494, lng: -89.6252, count: 1 },
//       { lat: 42.6105, lng: -71.2306, count: 1 },
//       { lat: 40.0973, lng: -85.671, count: 1 },
//       { lat: 40.3987, lng: -86.8642, count: 1 },
//       { lat: 40.4224, lng: -86.8031, count: 4 },
//       { lat: 47.2166, lng: -122.451, count: 1 },
//       { lat: 32.2369, lng: -110.956, count: 1 },
//       { lat: 41.3969, lng: -87.3274, count: 2 },
//       { lat: 41.7364, lng: -89.7043, count: 2 },
//       { lat: 42.3425, lng: -71.0677, count: 1 },
//       { lat: 33.8042, lng: -83.8893, count: 1 },
//       { lat: 36.6859, lng: -121.629, count: 2 },
//       { lat: 41.0957, lng: -80.5052, count: 1 },
//       { lat: 46.8841, lng: -123.995, count: 1 },
//       { lat: 40.2851, lng: -75.9523, count: 2 },
//       { lat: 42.4235, lng: -85.3992, count: 1 },
//       { lat: 39.7437, lng: -104.979, count: 2 },
//       { lat: 25.6586, lng: -80.3568, count: 7 },
//       { lat: 33.0975, lng: -80.1753, count: 1 },
//       { lat: 25.7615, lng: -80.2939, count: 1 },
//       { lat: 26.3739, lng: -80.1468, count: 1 },
//       { lat: 37.6454, lng: -84.8171, count: 1 },
//       { lat: 34.2321, lng: -77.8835, count: 1 },
//       { lat: 34.6774, lng: -82.928, count: 1 },
//       { lat: 39.9744, lng: -86.0779, count: 1 },
//       { lat: 35.6784, lng: -97.4944, count: 2 },
//       { lat: 33.5547, lng: -84.1872, count: 1 },
//       { lat: 27.2498, lng: -80.3797, count: 1 },
//       { lat: 41.4789, lng: -81.6473, count: 1 },
//       { lat: 41.813, lng: -87.7134, count: 1 },
//       { lat: 41.8917, lng: -87.9359, count: 1 },
//       { lat: 35.0911, lng: -89.651, count: 1 },
//       { lat: 32.6102, lng: -117.03, count: 1 },
//       { lat: 41.758, lng: -72.7444, count: 1 },
//       { lat: 39.8062, lng: -86.1407, count: 1 },
//       { lat: 41.872, lng: -88.1662, count: 1 },
//       { lat: 34.1404, lng: -81.3369, count: 1 },
//       { lat: 46.15, lng: -60.1667, count: 1 },
//       { lat: 36.0679, lng: -86.7194, count: 1 },
//       { lat: 43.45, lng: -80.5, count: 1 },
//       { lat: 44.3833, lng: -79.7, count: 1 },
//       { lat: 45.4167, lng: -75.7, count: 2 },
//       { lat: 43.75, lng: -79.2, count: 2 },
//       { lat: 45.2667, lng: -66.0667, count: 3 },
//       { lat: 42.9833, lng: -81.25, count: 2 },
//       { lat: 44.25, lng: -79.4667, count: 3 },
//       { lat: 45.2667, lng: -66.0667, count: 2 },
//       { lat: 34.3667, lng: -118.478, count: 3 },
//       { lat: 42.734, lng: -87.8211, count: 1 },
//       { lat: 39.9738, lng: -86.1765, count: 1 },
//       { lat: 33.7438, lng: -117.866, count: 1 },
//       { lat: 37.5741, lng: -122.321, count: 1 },
//       { lat: 42.2843, lng: -85.2293, count: 1 },
//       { lat: 34.6574, lng: -92.5295, count: 1 },
//       { lat: 41.4881, lng: -87.4424, count: 1 },
//       { lat: 25.72, lng: -80.2707, count: 1 },
//       { lat: 34.5873, lng: -118.245, count: 1 },
//       { lat: 35.8278, lng: -78.6421, count: 1 }
//     ]
//   }
//   dia_2023_02_3 = {
//     data: [
//       { lat: 24.6408, lng: 46.7728, count: 3 },
//       { lat: 50.75, lng: -1.55, count: 1 },
//       { lat: 52.6333, lng: 1.75, count: 1 },
//       { lat: 48.15, lng: 9.4667, count: 1 },
//       { lat: 52.35, lng: 4.9167, count: 2 },
//       { lat: 60.8, lng: 11.1, count: 1 },
//       { lat: 43.561, lng: -116.214, count: 1 },
//       { lat: 47.5036, lng: -94.685, count: 1 },
//       { lat: 42.1818, lng: -71.1962, count: 1 },
//       { lat: 42.0477, lng: -74.1227, count: 1 },
//       { lat: 40.0326, lng: -75.719, count: 1 },
//       { lat: 40.7128, lng: -73.2962, count: 2 },
//       { lat: 27.9003, lng: -82.3024, count: 1 },
//       { lat: 38.2085, lng: -85.6918, count: 1 },
//       { lat: 46.8159, lng: -100.706, count: 1 },
//       { lat: 30.5449, lng: -90.8083, count: 1 },
//       { lat: 44.735, lng: -89.61, count: 1 },
//       { lat: 41.4201, lng: -75.6485, count: 2 },
//       { lat: 39.4209, lng: -74.4977, count: 1 },
//       { lat: 39.7437, lng: -104.979, count: 1 },
//       { lat: 39.5593, lng: -105.006, count: 1 },
//       { lat: 45.2673, lng: -93.0196, count: 1 },
//       { lat: 41.1215, lng: -89.4635, count: 1 },
//       { lat: 43.4314, lng: -83.9784, count: 1 },
//       { lat: 43.7279, lng: -86.284, count: 1 },
//       { lat: 40.7168, lng: -73.9861, count: 1 },
//       { lat: 47.7294, lng: -116.757, count: 1 },
//       { lat: 47.7294, lng: -116.757, count: 2 },
//       { lat: 35.5498, lng: -118.917, count: 1 },
//       { lat: 34.1568, lng: -118.523, count: 1 },
//       { lat: 39.501, lng: -87.3919, count: 3 },
//       { lat: 33.5586, lng: -112.095, count: 1 },
//       { lat: 38.757, lng: -77.1487, count: 1 },
//       { lat: 33.223, lng: -117.107, count: 1 },
//       { lat: 30.2316, lng: -85.502, count: 1 },
//       { lat: 39.1703, lng: -75.5456, count: 8 },
//       { lat: 30.0041, lng: -95.2984, count: 2 },
//       { lat: 29.7755, lng: -95.4152, count: 1 },
//       { lat: 41.8014, lng: -87.6005, count: 1 },
//       { lat: 37.8754, lng: -121.687, count: 7 },
//       { lat: 38.4493, lng: -122.709, count: 1 },
//       { lat: 40.5494, lng: -89.6252, count: 1 },
//       { lat: 42.6105, lng: -71.2306, count: 1 },
//       { lat: 40.0973, lng: -85.671, count: 1 },
//       { lat: 40.3987, lng: -86.8642, count: 1 },
//       { lat: 40.4224, lng: -86.8031, count: 4 },
//       { lat: 47.2166, lng: -122.451, count: 1 },
//       { lat: 32.2369, lng: -110.956, count: 1 },
//       { lat: 41.3969, lng: -87.3274, count: 2 },
//       { lat: 41.7364, lng: -89.7043, count: 2 },
//       { lat: 42.3425, lng: -71.0677, count: 1 },
//       { lat: 33.8042, lng: -83.8893, count: 1 },
//       { lat: 36.6859, lng: -121.629, count: 2 },
//       { lat: 41.0957, lng: -80.5052, count: 1 },
//       { lat: 46.8841, lng: -123.995, count: 1 },
//       { lat: 40.2851, lng: -75.9523, count: 2 },
//       { lat: 42.4235, lng: -85.3992, count: 1 },
//       { lat: 39.7437, lng: -104.979, count: 2 },
//       { lat: 25.6586, lng: -80.3568, count: 7 },
//       { lat: 33.0975, lng: -80.1753, count: 1 },
//       { lat: 25.7615, lng: -80.2939, count: 1 },
//       { lat: 26.3739, lng: -80.1468, count: 1 },
//       { lat: 37.6454, lng: -84.8171, count: 1 },
//       { lat: 34.2321, lng: -77.8835, count: 1 },
//       { lat: 34.6774, lng: -82.928, count: 1 },
//       { lat: 39.9744, lng: -86.0779, count: 1 },
//       { lat: 35.6784, lng: -97.4944, count: 2 },
//       { lat: 33.5547, lng: -84.1872, count: 1 },
//       { lat: 27.2498, lng: -80.3797, count: 1 },
//       { lat: 41.4789, lng: -81.6473, count: 1 },
//       { lat: 41.813, lng: -87.7134, count: 1 },
//       { lat: 41.8917, lng: -87.9359, count: 1 },
//       { lat: 35.0911, lng: -89.651, count: 1 },
//       { lat: 32.6102, lng: -117.03, count: 1 },
//       { lat: 41.758, lng: -72.7444, count: 1 },
//       { lat: 39.8062, lng: -86.1407, count: 1 },
//       { lat: 41.872, lng: -88.1662, count: 1 },
//       { lat: 34.1404, lng: -81.3369, count: 1 },
//       { lat: 46.15, lng: -60.1667, count: 1 },
//       { lat: 36.0679, lng: -86.7194, count: 1 },
//       { lat: 43.45, lng: -80.5, count: 1 },
//       { lat: 44.3833, lng: -79.7, count: 1 },
//       { lat: 45.4167, lng: -75.7, count: 2 },
//       { lat: 43.75, lng: -79.2, count: 2 },
//       { lat: 45.2667, lng: -66.0667, count: 3 },
//       { lat: 42.9833, lng: -81.25, count: 2 },
//       { lat: 44.25, lng: -79.4667, count: 3 },
//       { lat: 45.2667, lng: -66.0667, count: 2 },
//       { lat: 34.3667, lng: -118.478, count: 3 },
//       { lat: 42.734, lng: -87.8211, count: 1 },
//       { lat: 39.9738, lng: -86.1765, count: 1 },
//       { lat: 33.7438, lng: -117.866, count: 1 },
//       { lat: 37.5741, lng: -122.321, count: 1 },
//       { lat: 42.2843, lng: -85.2293, count: 1 },
//       { lat: 34.6574, lng: -92.5295, count: 1 },
//       { lat: 41.4881, lng: -87.4424, count: 1 },
//       { lat: 25.72, lng: -80.2707, count: 1 },
//       { lat: 34.5873, lng: -118.245, count: 1 },
//       { lat: 35.8278, lng: -78.6421, count: 1 }
//     ]
//   }

//   //Crea una capa de tiempo y agrega la capa de mapa base y la capa de calor
//   var timeLayer = L.timeDimension.layer(heatmapLayer, {
//     updateTimeDimension: true,
//     updateTimeDimensionMode: 'replace',
//     addlastPoint: true,
//     duration: 'PT1M'
//   })

//   var map = new L.Map('map', {
//     center: new L.LatLng(0, 0),
//     zoom: 4,
//     timeDimension: true,
//     timeDimensionOptions: {
//       timeInterval: '2014-09-30/2014-10-30',
//       period: 'PT1H'
//     },
//     timeDimensionControl: true,
//     layers: [baseLayer, heatmapLayer, timeLayer]
//   })

//   L.control.scale({ maxWidth: 150 }).addTo(map)
map.on('mousemove', function (e) {
  $('#lat').html(e.latlng.lat)
  $('#lng').html(e.latlng.lng)
})

//   savePosition(map, heatmapLayer)
//   setInterval(() => {
//     changeRadio(map, heatmapLayer)
//   })

//   heatmapLayer.setData(testData)

//   // make accessible for debugging
//   layer = heatmapLayer
// }

// function changeRadio (map, heatmapLayer) {
//   radiusZoomControl = [
//     { zoom: 3, radius: 2 },
//     { zoom: 4, radius: 1 },
//     { zoom: 5, radius: 0.5 },
//     { zoom: 6, radius: 0.5 },
//     { zoom: 7, radius: 0.1 },
//     { zoom: 8, radius: 0.05 },
//     { zoom: 9, radius: 0.05 },
//     { zoom: 10, radius: 0.01 },
//     { zoom: 11, radius: 0.01 },
//     { zoom: 12, radius: 0.01 },
//     { zoom: 13, radius: 0.005 },
//     { zoom: 14, radius: 0.005 },
//     { zoom: 15, radius: 0.001 },
//     { zoom: 16, radius: 0.001 },
//     { zoom: 17, radius: 0.001 },
//     { zoom: 18, radius: 0.001 }
//   ]
//   for (let index = 0; index < radiusZoomControl.length; index++) {
//     const element = radiusZoomControl[index]
//     if (map.getZoom() == element.zoom) {
//       heatmapLayer.cfg.radius = element.radius
//     }
//   }
//   // if (map.getZoom() <= 4) {
//   //     heatmapLayer.cfg.radius = 2;
//   // } else if (map.getZoom() >= 5){
//   //     heatmapLayer.cfg.radius = 1;
//   // }
// }

function savePosition (map, heatmapLayer) {
  if (latlng != null) {
    map.setView([latlng.lat, latlng.lng], zoom, { duration: 0, animate: false })
    // changeRadio(map, heatmapLayer)
    changeRadio(map, heatmapLayer)
  }

  setInterval(() => {
    latlng = map.getCenter()
    zoom = map.getZoom()

    localStorage.setItem('latlng', JSON.stringify(latlng))
    localStorage.setItem('zoom', JSON.stringify(zoom))
  })
}

// window.onload = function () {
//   loadMap()
// }
