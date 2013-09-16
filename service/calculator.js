(function () {
	"use strict";
	var cfg = require('../config.js');
	var redis = require("redis");
	var redclient = redis.createClient();
	var usd_trade_key = cfg.usd_trade_key;
	var usd_involved_trade_key = cfg.usd_involved_trade_key;
	var usd_index_history_key = cfg.usd_index_history_key;
	var usd_index_current_key = cfg.usd_index_current_key;
	var usd_volume_current_key = cfg.usd_volume_current_key;
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
				return (+item[2]) * (+item[3]);
			}).reduce(function(p, c) {
				return (p + c);
			}, 0);
			var sum2 = res.map(function(em) {
				var item = em.split('#');
				return (+item[2]);
			}).reduce(function(p, c) {
				return (p + c);
			}, 0);
			if (sum2 > 0) {
				var usdindex = Math.round(sum1 / sum2);
				redclient.getset(usd_index_current_key, usdindex, function(err, keyres) {
					if (err) {
						console.log(err);
					} else {
						if ((+keyres) !== usdindex) {
							redclient.set(usd_volume_current_key, sum2);
							redclient.set(usd_involved_trade_key, JSON.stringify(res));
							redclient.zadd(usd_index_history_key, timestamp,
								'USD#' + timestamp + '#' + sum2 + '#' + usdindex);
							redclient.rpush(index_log_key, 'USD#' + timestamp + '#' + sum2 + '#' + usdindex);
							redclient.publish(usd_publish_key, 'USD#' + timestamp + '#' + sum2 + '#' + usdindex);
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
				if ((+res) > (+cfg.min_trade_count)) {
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

