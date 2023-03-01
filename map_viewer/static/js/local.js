
$(document).ready(function() {
    const submit_button = $("#agregar-documento-local-al-mapa-submit")
    const input = $("#local-document")
    const separator = ";"
    submit_button.on("click", function(e){
        // Obtener el archivo seleccionado
        const file = input.prop('files')[0];

        // Crear una instancia de FileReader
        const reader = new FileReader();

        // Escuchar el evento load de FileReader
        reader.addEventListener('load', function(e) {
            // Obtener el contenido del archivo
            const content = e.target.result;

            // Convertir el contenido en un array de objetos
            const lines = content.trim().split('\n');
            const headers = lines[0].split(separator);
            
            data = []
            for (let i = 1; i < lines.length; i++) {
                const obj = {};
                const currentLine = lines[i].split(separator);

                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentLine[j];
                }

                data.push(obj);
            }
            console.log(data)

            // Hacer lo que sea con el array de objetos
            // console.log(data);
            // data.forEach(element => {
            //     console.log(element)
            // });
        });

        // Leer el archivo como texto
        reader.readAsText(file);
        
    });
});