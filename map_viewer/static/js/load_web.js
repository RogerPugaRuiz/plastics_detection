let loadingText = ""
let addingChars = ".".repeat(5)
const element = document.getElementById("loading-dots")
let charCount = 0;
let currentString = loadingText
let timer = 0

function doLoop() {
    if (charCount >= addingChars.length) {
        charCount = 0;
        currentString = loadingText
    }

    currentString += addingChars[charCount]
    element.innerText = currentString
    charCount++
    timer++
    if (timer > 3) {
        // document.getElementById("mapContainer").style.height = "100%"
        document.getElementById("loading").style.display = "none"
        document.getElementById("press-any-key").style.display = "block"
        document.addEventListener("keydown", function(event) {
            document.getElementById("load-app").style.display = "none"

        })

    } else {
        setTimeout(doLoop, 500)
    }

}

doLoop()