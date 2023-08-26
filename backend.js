const express = require('express')
const app = express()

// socket.io setup 
const http = require('http')
const server = http.createServer(app)

const { Server } = require('socket.io')
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 })
const wordsList = require("./words.js").words
const port = 3000

function generateWords() {
    let arr = []
    for (let i = 0; i < 20; i++) {
        arr.push(wordsList[Math.floor(Math.random() * wordsList.length)])
    }
    return arr
}

words = generateWords();
console.log(words)
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

const backendPlayers = {}

io.on('connection', (socket) => {
    console.log("a user connected" + socket.id);
    backendPlayers[socket.id] = {
        name: socket.handshake.query.name,
        color: `hsl(${360*Math.random()},100%,50%)`,
        wordNumber: 0,
        wrongs: 0,
        entryDate: Date.now()
    }

    io.emit('updatePlayers', backendPlayers)
    socket.emit('words', words)

    socket.on('newWord', (word) => {
        if (words[backendPlayers[socket.id].wordNumber] == word) {
            backendPlayers[socket.id].wordNumber++
        } else {
            backendPlayers[socket.id].wrongs++
        }
        io.emit('updatePlayers', backendPlayers)
    })
    socket.on('disconnect', (reason) => {
        console.log(reason)
        delete backendPlayers[socket.id]
        io.emit('updatePlayers', backendPlayers)
    })
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})