(function () {
	"use strict";
	var cfg = require('../config.js');
	var redis = require("redis");
	var redclient = redis.createClient();
	var usd_trade_key = cfg.usd_trade_key;
	var usd_index_history_key = cfg.usd_index_history_key;
	var usd_index_current_key = cfg.usd_index_current_key;
	var index_log_key = cfg.index_log_key;
	var usd_publish_key = cfg.usd_publish_key;
	redclient.on("error", function (err) {
		console.log("Redis connection error to " + redclient.host + ":" + redclient.port + " - " + err);
	});
	redclient.select(cfg.redisdb);
	var calusdarr = function(err, res) {
		var timestamp = Date.now() * 1000;
		if (err) {
			console.log(err);
		} else {
			var sum1 = res.map(function(em) {
				var item = em.split('#');
				return (item[2]|0) * (item[3]|0);
			}).reduce(function(p, c) {
				return (p + c);
			});
			var sum2 = res.map(function(em) {
				var item = em.split('#');
				return (item[2]|0);
			}).reduce(function(p, c) {
				return (p + c);
			});
			if (sum2 > 0) {
				var usdindex = (sum1 / sum2)|0;
				redclient.getset(usd_index_current_key, usdindex, function(err, res) {
					if (err) {
						console.log(err);
					} else {
						if ((res|0) !== usdindex) {
							redclient.zadd(usd_index_history_key, timestamp, usdindex);
							redclient.rpush(index_log_key, 'USD#' + timestamp + '#' + usdindex);
							redclient.publish(usd_publish_key, '' + timestamp + '#' + usdindex);
						}
					}
				});
			}
		}
	};
	var calusd = function() {
		var mintime = (Date.now() - cfg.time_window_ms) * 1000;
		redclient.zcount(usd_trade_key, mintime, '+inf', function(err, res) {
			if (!err) {
				if ((res|0) > (cfg.min_trade_count|0)) {
					redclient.zrangebyscore(usd_trade_key, mintime, '+inf', calusdarr);
				} else {
					redclient.zrevrange(usd_trade_key, 0, cfg.min_trade_count, calusdarr);
				}
			}
		});
	};
	var calculator = {
		usd : function() {
			setInterval(calusd, cfg.time_idle_ms);
		},
		tailholder : 0
	};
	module.exports = calculator;
}());

