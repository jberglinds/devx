"use strict"

let radio

exports.setup = function(io) {
	radio = io.of('/radio')

	radio.on('connection', (socket) => {

		socket.on('join', (req) => {
			let radio_id = req.radio
		  socket.join(radio_id)
			console.log("Client socket connected to radio "+radio_id)
		})

	})

}

// exports.emitSongChange = function(radio_id, song_id) {
// 	radios.to(radio_id).emit('song-changed', {
// 		song_id,
// 	})
// }
