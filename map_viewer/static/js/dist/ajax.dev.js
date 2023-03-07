"use strict";

$(document).ready(function () {
  // Seleccionamos el formulario y el input
  var input = $('input[name="q"]');
  search_document(set_name); // Cuando el valor del input cambia, enviamos una petición ajax

  var debounceTimer;
  input.on('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      search_document(set_name);
    }, 500);
  });
  submit_data(); // set_name()
});

function search_document(callback) {
  var form = $('#search-form');
  var input = $('input[name="q"]');
  var query = input.val(); // Hacemos la petición ajax

  $.ajax({
    url: "http://127.0.0.1:8000/documentos-ajax/",
    data: {
      'q': query
    },
    dataType: 'json',
    success: function success(response) {
      // Manejamos la respuesta
      resultado = $('#resultado-busqueda-por-nombre');
      resultado.empty();

      for (var index = 0; index < response.resultados.length; index++) {
        var element = response.resultados[index];
        $('#resultado-busqueda-por-nombre').append("<p>" + element.title + "</p>");
      }

      if (callback) {
        callback();
      }
    },
    error: function error(jqXHR, textStatus, errorThrown) {
      console.log(textStatus, errorThrown);
    }
  });
}

function set_name() {
  var names = $("#resultado-busqueda-por-nombre p");
  var resultado = $("#resultado-busqueda-por-nombre");
  var input = $('input[name="q"]');
  names.each(function () {
    $(this).on('click', function () {
      var name = $(this).text();
      input.val(name);
      resultado.html("<p>" + name + "</p>");
    });
  });
}

function submit_data() {
  submit_button = $('#add-name-data');
  input = $('input[name="q"]');
  submit_button.on("click", function () {
    var name = input.val();
    sessionStorage.setItem('file', name);
    window.location.href = "http://127.0.0.1:8000/";
  });
}