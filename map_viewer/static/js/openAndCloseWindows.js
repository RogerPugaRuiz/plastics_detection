
function open(click_id, show_id, icon, color) {
    $(click_id).on("click", function () {
        $(show_id).show();
        $(show_id).draggable({ containment: "window" });
        // $(show_id + " .blur").resizable();
        $(icon).css("background-color", color)
    });
}

function close(click_id, show_id, icon) {
    $(click_id).on("click", function () {
        $(show_id).hide();
        $(icon).css("background-color", "transparent")
    });
}


function hoverDiv(show){
    $(show).mouseover(function(){
        $(show).css("z-index",20);
    });
    $(show).mouseout(function(){
        $(show).css("z-index",10);

    })
}
$(document).ready(function(){
    click_list = ["#folders-button", "#neural-network-button", "#configuration-button"]
    show_list = ["#folders", "#neural-network", "#configuration"]
    color_list = ["rgb(255, 88, 88)", "rgb(123, 123, 255)", "rgb(0, 168, 0)"]
    for (let index = 0; index < click_list.length; index++) {
        const click = click_list[index];
        const show = show_list[index];
        const color = color_list[index]
        open(click, show, click, color);
        close(show + " #close", show, click);
        hoverDiv(show + " div")
        // close(icon, show, icon);
    }
});