(function() {
	"use strict"
	var updusd = function() {
		$.getJSON('http://synbank.com/api/price/usd', function(thejson){
				var oldval = Math.round((+($("#usdprice").html()) * 100000));
				var newval = +(thejson.body);
				if (newval > oldval) {
					$("#usdarrow").html('&uArr;');
					$("#usdprice").html(newval/100000);
				} else if(newval < oldval) {
					$("#usdarrow").html('&dArr;');
					$("#usdprice").html(newval/100000);
				}
			});
	};
	$().ready(function() {
		updusd();
		setInterval(updusd, 5000);
	});
})();
	