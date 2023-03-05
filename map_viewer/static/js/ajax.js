$(document).ready(function() {
    // Seleccionamos el formulario y el input

    const input = $('input[name="q"]');
    search_document(set_name)
    // Cuando el valor del input cambia, enviamos una petición ajax
    let debounceTimer;
    input.on('input', function() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        search_document(set_name);
      }, 500);
    });

    submit_data()

    // set_name()
  });


  function search_document(callback) {
    const form = $('#search-form');
    const input = $('input[name="q"]');

    const query = input.val();
  
    // Hacemos la petición ajax
    $.ajax({
      url: "http://127.0.0.1:8000/documentos-ajax/",
      data: {
        'q': query
      },
      dataType: 'json',
      success: function(response) {
        // Manejamos la respuesta
        resultado = $('#resultado-busqueda-por-nombre')
        resultado.empty()
        for (let index = 0; index < response.resultados.length; index++) {
          const element = response.resultados[index];
          $('#resultado-busqueda-por-nombre').append("<p>" + element.title + "</p>");
        }
        if (callback) {
          callback();
        }

      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
      }
    });
  }
  function set_name() {
    const names = $("#resultado-busqueda-por-nombre p");
    const resultado = $("#resultado-busqueda-por-nombre");
    const input = $('input[name="q"]');

    names.each(function() {
      $(this).on('click', function() {
        const name = $(this).text();
        input.val(name);
        resultado.html("<p>"+name+"</p>")
      });
    });

    
  }

  function submit_data(){
    submit_button = $('#add-name-data')
    input = $('input[name="q"]');
    submit_button.on("click", function(){
      console.log("click")
    })
  }
