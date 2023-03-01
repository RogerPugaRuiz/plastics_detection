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

togglePopup("importar-documento-button", "importar-documento");
togglePopup("crear-nuevo-documento-button", "crear-nuevo-documento");
togglePopup("agregar-documento-al-mapa-button", "agregar-documento-al-mapa");
togglePopup("agregar-documento-local-al-mapa-button", "agregar-documento-local-al-mapa")