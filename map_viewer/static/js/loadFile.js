

$(document).ready(function(){
    $("#outputFile").on("change", function(){
        alert($("#outputFile").prop("files"));
    });
});