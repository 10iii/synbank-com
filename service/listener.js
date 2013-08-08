(function () {
	"use strict";
	var cfg = require('../config.js');
	var io = require('socket.io-client');
	var redis = require("redis");
	var redclient = redis.createClient();
	var usd_trade_key = cfg.usd_trade_key;
	redclient.on("error", function (err) {
		console.log("Redis connection error to " + redclient.host + ":" + redclient.port + " - " + err);
	});
	redclient.select(cfg.redisdb);
	var pushmtgoxtrade = function(trade) {
		if (trade['item'] === 'BTC' && trade['price_currency'] === 'USD') {
			var tradestr = 'MTGOX' + '#' +
					trade.tid + '#' +
					trade.amount_int + '#' +
					trade.price_int;
			redclient.zadd(usd_trade_key, trade.tid, tradestr);
		}
	};
	var mtgox = function() {
		var socket = io.connect('https://socketio.mtgox.com/mtgox');
		socket.on('connect', function() {
			socket.send(JSON.stringify({
				"op": "unsubscribe",
				"channel": "d5f06780-30a8-4a48-a2f8-7ed181b4a13f"
			}));
			socket.send(JSON.stringify({
				"op": "unsubscribe",
				"channel": "24e67e0d-1cad-4cc0-9e7a-f8523ef460fe"
			}));
			socket.on('message', function(msg) {
				console.log('mtgox trade msg');
				if (msg['private'] === 'trade') {
					pushmtgoxtrade(msg.trade);
				}
			});
		});
	};
	var listener = {
		mtgox: mtgox
	};
	module.exports = listener;
}());

