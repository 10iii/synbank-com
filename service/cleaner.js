(function () {
	"use strict";
	var cfg = require('../config.js');
	var redis = require("redis");
	var redclient = redis.createClient();
	var usd_trade_key = cfg.usd_trade_key;
	var usd_index_history_key = cfg.usd_index_history_key;
	var usd_index_current_key = cfg.usd_index_current_key;
	redclient.on("error", function (err) {
		console.log("Redis connection error to " + redclient.host + ":" + redclient.port + " - " + err);
	});
	redclient.select(cfg.redisdb);
	var cleantrade = function() {
		var mintime = (Date.now() - cfg.trade_clean_time_ms) * 1000;
		redclient.zremrangebyscore(usd_trade_key , 0, mintime);
		console.log('clean trade', mintime);
	};
	var cleanhistory = function() {
		var mintime = (Date.now() - cfg.index_his_clean_time_ms) * 1000;
		redclient.zremrangebyscore(usd_index_history_key , 0, mintime);
		console.log('clean history', mintime);
	};
	var cleanlog = function() {
		redclient.ltrim(cfg.index_log_key , 0, 1000);
		console.log('clean log');
	};
	var cleaner = {
		run : function() {
			setInterval(cleantrade, cfg.clean_idle_ms);
			setInterval(cleanhistory, cfg.clean_idle_ms);
			setInterval(cleanlog, cfg.clean_idle_ms);//for testing
		},
		tailholder : 0
	};
	module.exports = cleaner;
}());

