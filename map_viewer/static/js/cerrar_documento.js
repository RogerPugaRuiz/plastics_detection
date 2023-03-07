$(document).ready(function() {
    // Cuando el elemento submit que esta dentro del id form-cerrar-documento
    $("#cerrar-documento-submit").on('click',function(event) {
        console.log('click');
        // Se elimina la variable de sesión "file"
        sessionStorage.removeItem("file");
        // Redirecciona a la página principal
        window.location.href = "http://127.0.0.1:8000/";
        event.preventDefault(); // Evita que se recargue la página automáticamente
    });
});