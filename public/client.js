// const socket = io()

const frontendPlayers = {}
const text = document.getElementById("text")
var words = null;
const name = prompt("Please enter your name")
const input = document.getElementById("input")
const socket = io({
    query: { 'name': name },
});
const players = document.getElementById("players")
socket.on('words', (words) => {
    for (let i = 0; i < words.length; i++) {
        span = document.createElement("span")
        span.innerText = words[i]
        text.appendChild(span)
    }
    window.words = document.querySelectorAll("#text span")
    window.words[0].classList.add("highlight")

})
socket.on('updatePlayers', (backendPlayers) => {
    for (const id in backendPlayers) {
        const backendPlayer = backendPlayers[id]
        if (!frontendPlayers[id]) {
            players.innerHTML += `<div class="player" id =${id}>
<div class="meta-data">
    <div class="name">
        ${backendPlayer.name}
    </div>
    <div class="words" id="${id}words">
    words : ${backendPlayer.wordNumber}
    </div>
    <div class="word-per-min" id="${id}wpm">
    ${backendPlayer.wordNumber} wpm
    </div>
    <div class="wrongs" id="${id}wrongs">
    wrongs : ${backendPlayer.wrongs}
    </div>
</div>
<div class="progress-wrapper">
    <div class="progress">
        <span class="player-circle" id="${id}circle" style="background-color:${backendPlayer.color}"></span>
    </div>
</div>
</div>`
            frontendPlayers[id] = new Player(backendPlayer.name, backendPlayer.color, backendPlayer.wordNumber, backendPlayer.wrongs, backendPlayer.entryDate)
        } else {
            frontendPlayers[id].wordNumber = backendPlayer.wordNumber
            frontendPlayers[id].wrongs = backendPlayer.wrongs
            document.getElementById(id + "words").innerHTML = frontendPlayers[id].wordNumber
            if (frontendPlayers[id].wordNumber != 0)
                document.getElementById(id + "circle").style.left = `calc( ${frontendPlayers[id].wordNumber/words.length * 100}%)`
            if (document.getElementById(id + "circle").style.left == "100%")
                document.getElementById(id + "circle").style.left += "10px"
            document.getElementById(id + "wrongs").innerHTML = "wrongs : " + frontendPlayers[id].wrongs
            document.getElementById(id + "words").innerHTML = "words : " + frontendPlayers[id].wordNumber
            document.getElementById(id + "wpm").innerHTML = "wpm : " + Math.floor(frontendPlayers[id].wordNumber * 60 * 1000 / (Date.now() - frontendPlayers[id].entryDate))



        }
    }

    for (const id in frontendPlayers) {
        if (!backendPlayers[id]) {
            delete frontendPlayers[id]
            document.getElementById(id).remove()
        }
    }


})

input.onkeyup = function(e) {
    wordNumber = frontendPlayers[socket.id].wordNumber
    inputValue = input.value.trim()
    if (wordNumber >= words.length) return
    if (e.key == " ") {
        socket.emit("newWord", inputValue.slice(0, inputValue.length))
        if (inputValue == words[wordNumber].innerText) {
            words[wordNumber].classList.remove("wrong")
            words[wordNumber].classList.remove("highlight")
            words[wordNumber].classList.add("complete")
            if (wordNumber < words.length - 1)
                words[wordNumber + 1].classList.add("highlight")
        }
        input.value = " "

    } else if (inputValue != words[wordNumber].innerText.slice(0, inputValue.length)) {
        words[wordNumber].classList.remove("highlight")
        words[wordNumber].classList.add("wrong")
    } else {
        words[wordNumber].classList.remove("wrong")
        words[wordNumber].classList.add("highlight")
    }
}