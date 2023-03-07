"use strict";

// // Obtener la URL actual
// var urlActual = window.location.href;
// // Crear un objeto URLSearchParams
// var searchParams = new URLSearchParams(new URL(urlActual).search);
// // Obtener el valor del parámetro 'q'
// var qParam = searchParams.get('q');
// // Decodificar el valor del parámetro 'q'
// var qValue = decodeURIComponent(qParam);
// var element_file_name =  $('#ver-documento-cargado-button')
// element_file_name.text("Documento cargado: " + qValue)
// console.log(element_file_name.text())
qValue = sessionStorage.getItem('file');
searchByName(qValue);
var dataReady = new Promise(function (resolve, reject) {
  var intervalId = setInterval(function () {
    if (typeof data !== 'undefined') {
      clearInterval(intervalId);
      resolve();
    }
  }, 100);
}); // Indexar los datos por tiempo

var datosPorTiempo = {};
dataReady.then(function () {
  data.forEach(function (dato) {
    var tiempoStr = dato.time;

    if (!datosPorTiempo[tiempoStr]) {
      datosPorTiempo[tiempoStr] = [];
    }

    datosPorTiempo[tiempoStr].push(dato);
  }); // map.remove()

  map_loader();
});

function searchByName(nombre) {
  $.ajax({
    url: "http://127.0.0.1:8000/cargar-con-ajax",
    data: {
      'q': nombre
    },
    dataType: "json",
    success: function success(response) {
      data = response.data;
    },
    error: function error(xhr, status, _error) {
      console.log("Ha ocurrido un error:", _error);
    }
  });
}

function map_loader() {
  var mapLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">BIOST3</a>',
    maxZoom: 18,
    minZoom: 4
  });

  function extractCoordsAndTimes(geojson) {
    return geojson.features.map(function (feature) {
      var coords = [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
      var time = feature.properties.time;
      return {
        lat: coords[0],
        lng: coords[1],
        time: time
      };
    });
  }

  timeInterval = '2014-09-30/2023-02-25';
  timeInterval = setIntervalTimeDimensionControler();
  console.log(timeInterval); // Crea el mapa con la capa de tiempo

  var new_map = L.map('map', {
    center: [41.356, 2.176],
    zoom: 10,
    timeDimension: true,
    timeDimensionOptions: {
      timeInterval: timeInterval.start + "/" + timeInterval.end,
      period: 'P1D',
      autoPlay: true,
      playButton: true,
      playerOptions: {
        transitionTime: 1000,
        loop: true
      }
    },
    timeDimensionControl: true // layers: [mapLayer, timeDimensionLayer]

  }); // Crea una capa de tiempo con los datos y el heatmap

  var heatmapLayer = L.heatLayer([], {
    radius: 25,
    blur: 30,
    scaleRadius: true,
    maxZoom: 12,
    gradient: {
      0.4: 'rgba(0, 0, 255)',
      0.6: 'rgba(0, 255, 0)',
      0.8: 'rgba(255, 255, 0, 0.5)',
      1.0: 'rgba(255, 0, 0, 0.5)'
    }
  });
  heatmapLayer.addTo(new_map);
  mapLayer.addTo(new_map); // initialize data

  console.log();
  var tiempoActual = new_map.timeDimension.getCurrentTime();
  var fechaActual = new Date(tiempoActual);
  var tiempoActualStr = fechaActual.toISOString().slice(0, -5);
  mostrarDatosActuales(tiempoActualStr);
  new_map.timeDimension.on("timeloading", function (timer) {// setIntervalTimeDimensionControler()
  });
  new_map.timeDimension.on("timeload", function (timer) {
    var tiempoActual = timer.time;

    if (typeof tiempoActual === 'number') {
      tiempoActual = new Date(tiempoActual);
    }

    var tiempoActualStr = tiempoActual.toISOString().slice(0, -5);
    mostrarDatosActuales(tiempoActualStr); // var timeDimension = timer.timeDimension;
    // if (!timeDimension.currentLoadedTime || timeDimension.player.isPlaying()) {
    //   return;
    // }
    // if (!timeDimension.hasTime(timeDimension.currentLoadedTime)) {
    //   timeDimension.setCurrentTime(data.time);
    // }
  }); // Mostrar los datos actuales

  function mostrarDatosActuales(tiempoActualStr) {
    var datosActuales = datosPorTiempo[tiempoActualStr] || [];
    console.log(tiempoActualStr);
    console.log(datosActuales);
    heatmapLayer.setLatLngs(datosActuales);
  }

  function setIntervalTimeDimensionControler() {
    // var timeDimensionControl = map.timeDimension.getControl();
    var keys = Object.keys(datosPorTiempo);
    console.log(keys.length);

    if (keys.length === 0) {
      var start = "2014-09-30";
      var end = new Date();
    } else {
      var dates = keys.map(function (key) {
        return new Date(key);
      });
      var start = new Date(Math.min.apply(null, dates));
      start.setHours(start.getHours() + 1);
      var end = new Date(Math.max.apply(null, dates));
      end.setHours(end.getHours() + 1);
    } // var daysAgo = (end.toISOString() - start.toISOString()) / (1000 * 60 * 60 * 24); // Restar fechas para obtener número de días


    return {
      "start": start,
      "end": end
    };
  }

  new_map.on('mousemove', function (e) {
    $('#lat').html(e.latlng.lat);
    $('#lng').html(e.latlng.lng);
  });

  function savePosition(map, heatmapLayer) {
    if (latlng != null) {
      new_map.setView([latlng.lat, latlng.lng], zoom, {
        duration: 0,
        animate: false
      });
    }

    setInterval(function () {
      latlng = new_map.getCenter();
      zoom = new_map.getZoom();
      localStorage.setItem('latlng', JSON.stringify(latlng));
      localStorage.setItem('zoom', JSON.stringify(zoom));
    });
  }
}