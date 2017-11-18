"use strict"

exports.setup = function(io) {

	io.on('connection', (socket) => {
		socket.on('join', (req) => {
			let radio_id = req.radio
		  socket.join(radio_id)
			console.log("Client socket connected to radio "+radio_id)
		})

		socket.on('track-change', (req) => {
			socket.broadcast.emit('track-change', req)
		})

		socket.on('pause', (req) => {
			socket.broadcast.emit('pause', req)
		})

		socket.on('resume', (req) => {
			socket.broadcast.emit('resume', req)
		})

	})

}

// exports.emitSongChange = function(radio_id, song_id) {
// 	radios.to(radio_id).emit('song-changed', {
// 		song_id,
// 	})
// }
