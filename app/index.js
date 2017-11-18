"use strict"

// require('dotenv').config()

let express = require('express')
let http = require('http')
let bodyParser = require('body-parser')
let socketio = require('socket.io')

let port = process.env.PORT || 8080

let app = express()
app.use(express.static(__dirname + '/../public'))

let httpServer = http.Server(app)

// configure the app to use bodyParser()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// let io = socketio.listen(httpServer)
// let socket_controller = require('./socket-controller.js')
// socket_controller.setup(io)

// let router = require('./api-router.js')
// app.use('/api', router)

httpServer.listen(port, function () {
  console.log("Server listening on port", port)
})
