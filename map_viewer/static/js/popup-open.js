function togglePopup(buttonId, popupId) {
    const button = document.getElementById(buttonId);
    const popup = document.getElementById(popupId);

    button.addEventListener("click", function() {
        popup.style.display = "block";
    });

    const closeButton = popup.querySelector("#closeButton");

    closeButton.addEventListener("click", function() {
        popup.style.display = "none";
    });

    popup.addEventListener("click", function(e) {
        if (e.target === popup) {
            popup.style.display = "none";
        }
    });
}

// // Toggles the visibility of the popup
// form_list = [
//     'importar-documento',
//     'crear-nueva-documento',
//     'agregar-documento-al-mapa',
//     'agregar-documento-local-al-mapa',
//     'cerrar-documento'
// ];

// button_list = [
//     'importar-documento-button',
//     'crear-nuevo-documento-button',
//     'agregar-documento-al-mapa-button',
//     'agregar-documento-local-al-mapa-button',
//     'cerrar-documento-button'
// ];

// // loop through the form_list and button_list
// for (let i = 0; i < form_list.length; i++) {
//     togglePopup(button_list[i], form_list[i]);
// }

togglePopup("importar-documento-button", "importar-documento");
togglePopup("crear-nuevo-documento-button", "crear-nuevo-documento");
togglePopup("agregar-documento-al-mapa-button", "agregar-documento-al-mapa");
// togglePopup("agregar-documento-local-al-mapa-button", "agregar-documento-local-al-mapa")
togglePopup("cerrar-documento-button", "cerrar-documento");