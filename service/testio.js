var io = require('socket.io-client');
var socket = io.connect('https://socketio.mtgox.com/mtgox?Currency=USD');
socket.on('connect', function() {
	console.log('connected');
	//socket.send({
	//	    "op": "mtgox.subscribe",
	//	    "type": "ticker"
	//})
	socket.send(JSON.stringify({
		    "op": "unsubscribe",
		    "channel": "d5f06780-30a8-4a48-a2f8-7ed181b4a13f"
	}));
	socket.send(JSON.stringify({
		    "op": "unsubscribe",
		    "channel": "24e67e0d-1cad-4cc0-9e7a-f8523ef460fe"
	}));
	socket.on('message', function(msg) {
		console.log(msg);
	});
});

