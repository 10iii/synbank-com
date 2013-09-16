(function() {
	"use strict"
  var updchart = function(indarr){
    var data = [];
    if (typeof(indarr) === "undefined") {
      return;
    }
    indarr.map(function(em) {
      data.push([new Date(em[1]/1000), em[2]/100000000, em[3]/100000]);
    });
    var g2 = new Dygraph(
      document.getElementById("usdchart"),
      data,
      {
        labels: [ 'Date', 'Volume', 'Price'],
        ylabel: 'Price',
        y2label: 'Volume',
        highlightCircleSize: 6,
        strokeWidth: 3,
        series : {
          'Volume': {
            axis: 'y2',
            fillGraph: true
          }
        },
        axes: {
          y: {
            // set axis-related properties here
            valueRange: [data[0][2]*0.96, null],
            drawGrid: false,
            independentTicks: false
          },
          y2: {
            // set axis-related properties here
            labelsKMB: true,
            drawGrid: true,
            independentTicks: true
          }
        }
      }
    );
  };
  
  
	var updusd = function() {
		$.getJSON('http://synbank.com/api/price/usd', function(thejson){
				var oldval = Math.round((+($("#usdprice").html()) * 100000));
				var newval = +(thejson.body);
				if (newval !== oldval) {
          $.getJSON('http://synbank.com/api/history/usd', function(thejson) {
            var indexarr = thejson.body.map(function(em) { 
              return em.split('#');
            });
            var pricearr = indexarr.map(function(em) {
              return em[3];
            });
            var newprice = +(pricearr[0]);
            pricearr.sort(function(a,b) { 
              return a - b;
            });
            $("#usdprice").html(newprice/100000);
            $("#usdvolume").html(+(indexarr[0][2])/100000000);
            $("#usdhigh").html(pricearr[pricearr.length - 1]/100000);
            $("#usdlow").html(pricearr[0]/100000);
            updchart(indexarr.reverse());
          });
          $.getJSON('http://synbank.com/api/base/usd', function(thejson) {
            var tradetbody = thejson.body.map(function(em) { 
              var its = em.split('#');
              var tmarket = its[0];
              var ttime = (new Date((its[1]/1000))).toLocaleTimeString();//toISOString().substr(2, 17);
              var tvolume = its[2]/100000000;
              var tprice = its[3]/100000;
              return '<tr>' + 
                '<td>' + tmarket + '</td>' +
                '<td>' + ttime + '</td>' +
                '<td>' + tvolume + '</td>' +
                '<td>' + tprice + '</td>' +
                '</tr>';
            });
            $("#basetradesbody").html(tradetbody);
          });
        }	
			});
	};
	$().ready(function() {
		updusd();
		setInterval(updusd, 5000);
	});
})();
	