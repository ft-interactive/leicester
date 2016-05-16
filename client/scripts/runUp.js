/* eslint-disable */

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

function sortBy(a,b) {
    if(sortDir == 'asc'){
        return a.values[0][sortCriteria] - b.values[0][sortCriteria];
    }else{
        return b.values[0][sortCriteria] - a.values[0][sortCriteria];
    }
};

function dropNAs(data){
	if(data == "NA"){
		return ""
	}else return data
};

function oc(a)
{
  var o = {};
  for(var i=0;i<a.length;i++)
  {
    o[a[i]]='';
  }
  return o;
}

function wrap(text, width, lineheight) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 1,
        lineHeight = lineheight,
        x = text.attr("x"),
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy"));
        if(!dy){dy=0};
        var tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        console.log(lineNumber)
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ((lineHeight*lineNumber++) + dy) + "em").text(word);
      }
    }
  });
}

function runUp(frame,data){

	var	bounds = frame.node().getBoundingClientRect(),
		width = bounds.width-20,
		height = d3.min([bounds.width*0.8,window.innerHeight]),
		// height = bounds.height,
		M = {T:0, B:0, L:0, R:0},
		pM = {T:20, B:40, L:16, R:0, G:0},
        titleText = "Leicester City's record-breaking run:Started from the bottom, now they're here",
        subTitleText = "Leicester were bottom of the Premier League on April 10 2015, but a year later had climbed to the top, winning 91 points in 41 matches along the way. In more than 100 years of English league football since 1888, no team beginning at the foot of the top flight has ever won that many points* over the subsequent year",
        parseDate = d3.time.format("%Y-%m-%d").parse,
        r=4
        ;

    frame.html('');

    var viz = frame.append('div').attr({
        'id':'viz'
    })
    .style({
        'width':width + 'px',
        'height':height + 'px',
    });

	var svg = viz.append('svg').attr({
        'id':'graphic'
    })
    .style({
        'width':width,
        'height':height
    });

    var canvasHolder = viz.append('div.canvasHolder');

	var svgTop = viz.append('svg').attr({
        'id':'svgTop'
    })
    .style({
        'width':width,
        'height':height
    });

    var defs = svgTop.append('defs');

    svgTop.append('marker')
	    .attr('id', 'arrow')
	    .attr('viewBox', '-10 -10 20 20')
	    .attr('markerWidth', 15)
	    .attr('markerHeight', 15)
	    .attr('orient', 'auto')
	  	.append('path')
	    .attr('d', 'M-9.75,-4.75 L -1,0 L -9.75,4.75');

    var chartHolder = svg.append('g').attr({
		'id':'chartHolder',
		'transform':'translate(0,0)'
	});

    var textHolder = svgTop.append('g').attr({
		'id':'textHolder',
		'transform':'translate(0,0)'
	});

    function drawChart(){

		data =  data.map(function (d,i){return{
		        // daysIn: +d.daysIn,
		        gamesIn: +d.gamesIn,
		        rollingSum: +d.rollingSum,
		        runID: d.runID,
		        // start: parseDate(d.startDate),
		        natPos: d.natPos,
		        phase: d.phase,
		        Season: +d.Season,
		        date: parseDate(d.endDate)
		    }
		});

		data = data.filter(function(d){return d.phase == 'run'});

		data = d3.nest()
		    .key(function(d) { return d.runID})
		    .entries(data);

		keys = [];
		data.forEach(function(d,i){
			keys.push(d.key);
			d.max = d3.max(d.values,function(x){return x.rollingSum});
			d.played = d3.max(d.values,function(x){return x.gamesIn});
			d.start = d3.max(d.values,function(x){return x.start});
		});

		data = data.sort(function(a,b){
			return a.max-b.max}
			);

		// console.log(keys,data);

		var highlight = ['Leicester City-2015','Ipswich Town-1980','Sheffield Wednesday-1928'];

		// SCRIPTS TO GENERATE SMALL MULTIPLE HOLDERS IF REQUIRED
	    var plotW = ((width-(M.L+M.R)))-(pM.G/2),
		    plotH = ((height-(M.T+M.B)));

	    var plots = chartHolder.selectAll("g.plot").data([data]);
	    plots.enter().append("g").attr({
	        class:function(d,i){return 'plot_' + i},
	        "transform":function(d,i){
	            var xPos = i % 1;
	            var yPos = Math.floor(i/1);
	            var gap = (i % 1 == 1) ? pM.G:0;
	            return 'translate(' + (M.L+(plotW*xPos+gap)) + ',' + (M.T+plotH*yPos) + ')'
	        }
	    });

		var devicePixelRatio = window.devicePixelRatio || 1;
	    
	    var canvases = canvasHolder.selectAll("canvas").data([data]);
        canvases.enter().append("canvas").attr({
            class:function(d,i){return 'canvas_ ' + i},
            width:(plotW * devicePixelRatio),
        	height:(plotH * devicePixelRatio)
        })
        .style({
        	position:'absolute',
        	left:function(d,i){
        		return (M.L+(plotW*0)) + 'px'
        	},
        	top:function(d,i){return (M.T+plotH*0) + 'px'},
        	width:(plotW + 'px'),
        	height:(plotH + 'px')
        });
	    
	    var canvasTop = canvasHolder.append("canvas").attr({
            class:function(d,i){return 'canvas_ ' + i},
            width:(plotW * devicePixelRatio),
        	height:(plotH * devicePixelRatio)
        })
        .style({
        	position:'absolute',
        	left:function(d,i){
        		return (M.L+(plotW*0)) + 'px'
        	},
        	top:function(d,i){return (M.T+plotH*0) + 'px'},
        	width:(plotW + 'px'),
        	height:(plotH + 'px')
        });

        var context2 = canvasTop.node().getContext("2d");
			context2.scale(devicePixelRatio, devicePixelRatio);

	    var textPlots = textHolder.selectAll("g.textPlot").data([data]);
	    textPlots.enter().append("g").attr({
	        class:function(d,i){return 'textPlot_' + i},
	        "transform":function(d,i){
	            var xPos = i % 1;
	            var yPos = Math.floor(i/1);
	            var gap = (i % 1 == 1) ? pM.G:0;
	            return 'translate(' + (M.L+(plotW*xPos+gap)) + ',' + (M.T+plotH*yPos) + ')'
	        }
	    });

		var clipHolder = defs.append('clipPath#plot');
		var clipPlot = clipHolder.append('rect').attr({x:pM.L,y:pM.T,width:plotW-(pM.L+pM.R),height:plotH-(pM.T+pM.B)});

		var colours = d3.scale.ordinal()
			.domain(keys)
			.range(['#af516c','#5ba829','#0091a7','#87cbf2','#b4bf2c','#ccc2c2','#3267b4','#f3abc8','#b07979']);

		var textColours = colours.copy();
		textColours.range(['#9e2f50','#5ba928','#008094','#69c0f2','#a7b224','#bfb0b0','#3267b4','#f197bc','#a96565']);

		function drawLegend(shape){

			var legend = chartHolder.append('g.legend').translate([0,M.T-5]);

			var legLabs = legend.selectAll('text').data(highlight);
			legLabs.enter().append('text');
			legLabs.exit().remove();
			legLabs
			.attr({
				x:function(d,i){return i*50},
				y:0
			})
			.style({
				'text-anchor':'start',
				fill:'#74736c',
				'font-size':'14px'
			})
			.html(function(d,i){return d});

			var labelLengths = [];

			legLabs.each(function(d,i){
				labelLengths.push([d3.select(this).node().getBoundingClientRect().width,i]);
			});

			legLabs.attr({
				x:function(d,i){
					var thisPos = d3.sum(labelLengths.filter(function(a,b){return a[1] <= i-1}),function(x,y){return x[0]});
					return thisPos+((shape == 'line' ? 4:11)+i*15);
				}
			});

			if(shape == 'line'){
				legLabs.enter().append('line')
				.attr({
		    		x1:function(d,i){
		    			var thisPos = d3.sum(labelLengths.filter(function(a,b){return a[1] <= i-1}),function(x,y){return x[0]});
						return thisPos+(2+i*15);
		    		},
		    		x2:function(d,i){
		    			var thisPos = d3.sum(labelLengths.filter(function(a,b){return a[1] <= i-1}),function(x,y){return x[0]});
						return thisPos+(2+i*15);
		    		},
		    		y1:-13,
		    		y2:3
		    	})
		    	.style({
		    		stroke:function(d,i){return colours(d)},
		    		'stroke-width':3
		    	});
			}else{
				legLabs.enter().append('circle')
		    	.attr({
		    		cx:function(d,i){
		    			var thisPos = d3.sum(labelLengths.filter(function(a,b){return a[1] <= i-1}),function(x,y){return x[0]});
						return thisPos+(5+i*15);
		    		},
		        	cy:-5,
		        	r:4
		    	})
		    	.style({
		    		fill:function(d,i){return colours(d)},
		    		stroke:function(d,i){return textColours(d)},
		    	});
			}

		}

		// drawLegend('line');

		var y = d3.scale.linear()
			.range([plotH-pM.B,pM.T])
			.domain([0,95]);

		var ys = d3.svg.axis()
			.orient("left")
			.ticks(5)
			.tickSize(-1*((plotW)))
			.tickFormat(d3.format("d"))
			.scale(y);

		var ya = plots.append('g.axis.y')
			.translate([pM.L,0])
			.call(ys);

		var yt = plots.append('text.y.axis.title')
			.attr({
				x:0,
				y:y(+d3.select('.y .tick:nth-last-of-type(1) text').html())-20
			})
			.html('Rolling points won');

		var x = d3.scale.linear()
			.range([pM.L,plotW-(pM.L+pM.R)])
			.domain([0,50]);

		var xs = d3.svg.axis()
			.orient("bottom")
			.ticks(5)
			.tickSize(5)
			.tickFormat(d3.format("d"))
			.scale(x);

		var xa = plots.append('g.axis.x')
			.translate([0,plotH-(pM.B)])
			.call(xs);
		plots.selectAll('g.axis.y .tick line')
			.style({
				stroke:'#e9decf',
				'stroke-dasharray':'2 2'
			});

		var xt = plots.append('text.x.axis.title')
			.attr({
				x:d3.mean(x.range()),
				y:plotH-pM.B+35
			})
			.style({
				'text-anchor':'middle'
			})
			.html('Games played within a year of being in last place');

		plots.selectAll('.axis.y .tick text').attr({'dy':-2});
		plots.selectAll('.axis.y .tick line').translate([-pM.L,0]);
		plots.selectAll('.axis.y .tick').filter(function(d,i){return d==0}).selectAll('line').style({'stroke-dasharray':'none',stroke:'#74736c'});

		var anchor = viz.append('div.anchor');

		viz.on('mousemove', function(){
			var coords = d3.mouse(viz.node());
			var xExact = x.invert(coords[0]);
			var yExact = y.invert(coords[1]);
			data.forEach(function(d,i){
				d.dist = Math.pow(Math.pow((d.played - xExact),2) + Math.pow((d.max - yExact),2),0.5);
			});
			var point = data.sort(function(a,b){
				return a.dist - b.dist;
			})[0];

			anchor.html('')
			.style({
				left:x(point.played) + 'px',
				top:y(point.max) + 'px'
			})
			.append('div.tooltip')
			.style({
				left:point.played > d3.mean(x.domain()) ? 'auto':0,
				right:point.played > d3.mean(x.domain()) ? 0:'auto',
			})
			.html(point.key.replace(/-.*/g,'') + ' ' + point.values[0].date.getFullYear() + '&nbsp;-&nbsp;' + (point.values[(point.values.length-1)].Season+1).toString().substr(2,3));

			context2.clearRect(0,0,(plotW * devicePixelRatio),(plotH * devicePixelRatio));

			context2.strokeStyle = point.key in oc(highlight) ? colours(point.key):'#74736c';
			context2.lineWidth = point.key in oc(highlight) ? 4:2;
			context2.beginPath();
			context2.lineCap == 'round';
			point.values.forEach(function(a,b){
				if(b==0 || a==(point.values.length-1)){
					context2.moveTo(x(a.gamesIn), y(a.rollingSum))
				}else{
					var prev = point.values[(b-1)];
					context2.lineTo(x(a.gamesIn), y(prev.rollingSum));
					context2.lineTo(x(a.gamesIn), y(a.rollingSum));
				}
			});
			context2.stroke();
   			context2.closePath();

   			context2.beginPath();
			context2.arc(x(point.played), y(point.max), (point.key in oc(highlight) ? r+2:r) , 0, 2 * Math.PI, true);
			context2.fillStyle = point.key in oc(highlight) ? textColours(point.key):'#74736c';
			context2.strokeStyle = '#fff1e0';
			context2.lineWidth = 1;
			context2.fill();
			context2.stroke();
			context2.closePath();
		})
		.on('mouseleave', function(){
			anchor.html('');
			context2.clearRect(0,0,(plotW * devicePixelRatio),(plotH * devicePixelRatio));
		});

		// Custom, story-specific bits start here

		var graphics = textPlots.append('g.graphics')
		.style({
			'clip-path':'url(#plot)'
		});

		// var clubs = graphics.selectAll('g.club').data(function(d){return d});
		// clubs.enter().append('g.club');

		var line = d3.svg.line()
			.interpolate('step-after')
			.x(function(d){return x(d.gamesIn)})
			.y(function(d){return y(d.rollingSum)});

		colours.domain(highlight);

		canvases.each(function(d,i){
			var canvas = d3.select(this);
			var context = canvas.node().getContext("2d");
			context.scale(devicePixelRatio, devicePixelRatio);

			d.forEach(function(c){
				context.strokeStyle = '#fff1e0';
				context.lineWidth = c.key in oc(highlight) ? 4:2;
				context.beginPath();
				context.lineCap == 'round';
				c.values.forEach(function(a,b){
					if(b==0 || a==(c.values.length-1)){
						context.moveTo(x(a.gamesIn), y(a.rollingSum))
					}else{
						var prev = c.values[(b-1)];
						context.lineTo(x(a.gamesIn), y(prev.rollingSum));
						context.lineTo(x(a.gamesIn), y(a.rollingSum));
					}
				});
				context.stroke();
	   			context.closePath();

	   			context.strokeStyle = c.key in oc(highlight) ? colours(c.key):'#bfb0b0';
				context.lineWidth = c.key in oc(highlight) ? 2:1;
				context.beginPath();
				context.lineCap == 'round';
				c.values.forEach(function(a,b){
					if(b==0 || a==(c.values.length-1)){
						context.moveTo(x(a.gamesIn), y(a.rollingSum))
					}else{
						var prev = c.values[(b-1)];
						context.lineTo(x(a.gamesIn), y(prev.rollingSum));
						context.lineTo(x(a.gamesIn), y(a.rollingSum));
					}
				});
				context.stroke();
	   			context.closePath();
			});

			d.forEach(function(c){
				context.beginPath();
				context.arc(x(c.played), y(c.max), (c.key in oc(highlight) ? r:r-1) , 0, 2 * Math.PI, true);
				context.fillStyle = c.key in oc(highlight) ? textColours(c.key):'#bfb0b0';
				context.strokeStyle = '#fff1e0';
				context.lineWidth = 1;
				context.fill();
				context.stroke();
				context.closePath();
			});

		});

		// var outLines = clubs.append('path')
		// 	.attr({
		// 		d:function(d){return line(d.values)},
		// 		fill:'none',
		// 		stroke:'#fff1e0'
		// 	})
		// 	.style({
		// 		'stroke-width':function(d){return d.key in oc(highlight) ? 4:2 }
		// 	});

		// var lines = clubs.append('path')
		// 	.attr({
		// 		d:function(d){return line(d.values)},
		// 		fill:'none',
		// 		stroke:function(d){return d.key in oc(highlight) ? colours(d.key):'#bfb0b0' }
		// 	})
		// 	.style({
		// 		'stroke-width':function(d){return d.key in oc(highlight) ? 2:1},
		// 	});

		// var pointHolders = graphics.selectAll('g.pointHolder').data(function(d){return d});
		// pointHolders.enter().append('g.pointHolder');

		// var dots = pointHolders.append('circle')
		// 	.attr({
		// 		cx:function(d){return x(d.played)},
		// 		cy:function(d){return y(d.max)},
		// 		r:function(d){return d.key in oc(highlight) ? r:r-1 },
		// 		fill:function(d){return d.key in oc(highlight) ? textColours(d.key):'#bfb0b0' },
		// 		stroke:'#fff1e0'
		// 	});

		// var labs = clubs.filter(function(d,i){return d.key in oc(highlight)})
		// 	.append('g.lab')
		// 	.translate(function(d){return [x(d.played),y(d.max)]})
		// 	.append('text')
		// 	.html(function(d){return d.key});


		// var labs = plots.append('g.legBox').translate([25,25])
		// 	.selectAll('g.lab').data(data.filter(function(d){return d.key in oc(highlight)}).sort(function(a,b){return b.max-a.max}))
		// 	.enter().append('g.lab')
		// 	.translate(function(d,i){return [95-[-5,10,35][i],i*17]});
		// labs.append('text.shadow').html(function(d){return d.key
		// 	.replace(/City-/g,"")
		// 	.replace(/Town-/g,"")
		// 	.replace(/ield |nesday-/g," ")
		// 	.replace(/[0-9]/g,"")
		// 	+ d.start.getFullYear() + '-' + (d.start.getFullYear()+1).toString().substr(2,3) + ': ' + d.max + 'pts'
		// })
		// .style({
		// 	fill:function(d){return textColours(d.key)},
		// 	'font-size':14
		// });

		// JBM annotations here

		var annos = [
			{	
				key:highlight[2],
				point:[46,89],
				text:'Sheffield Wednesday 1928-29: 89 pts in 46 games',
				textPoint:[20,180],
				anchor:'end',
				side:1
			},
			{	
				key:highlight[1],
				point:[42,90],
				text:'Ipswich 1979-81: 90 pts in 42 games',
				textPoint:[-80,30],
				anchor:'end',
				side:1
			},
			{	
				key:highlight[0],
				point:[41,91],
				text:'Leicester 2015-16: 91 pts in 41 games',
				textPoint:[-50,-20],
				anchor:'end',
				side:1
			}
		];

		function annotate(annos){

			annos.forEach(function(d){
				
				if(d.anchor == 'start'){
					d.textX = -r/4
				}else if(d.anchor == 'end'){
					d.textX = r/4
				}else{
					d.textX = 0
				}

				if((d.textPoint[1])>0){
					d.textY = -r/4
				}else if((d.textPoint[1])<0){
					d.textY = r/4
				}else{
					d.textY = 0
				}

				if((d.textPoint[0]<0)){
					d.pointX = -r/4
				}else if((d.textPoint[0]>0)){
					d.pointX = r/4
				}else{
					d.pointX = 0
				}

				var length = Math.pow(Math.pow(((d.textPoint[0])),2) + Math.pow(((d.textPoint[1])),2),0.5);
				var x1 = x(d.point[0])+((d.textPoint[0])*0.333);
				var y1 = y(d.point[1])+((d.textPoint[1])*0.333);
				var x2 = x(d.point[0])+((d.textPoint[0])*0.666);
				var y2 = y(d.point[1])+((d.textPoint[1])*0.666);

				if(d.textPoint[0]<0){
					var cx2 = (x1) + (d.side*(((-y1 + y(d.point[1])))*(length*2/3)))/(length);
					var cy2 = (y1) + (d.side*(((x1 - x(d.point[0]))))*(length*2/3))/(length);
					var cx1 = (x2) + (d.side*(((-y2 + y(d.point[1]))))*(length/3))/(length);
					var cy1 = (y2) + (d.side*(((x2 - x(d.point[0]))))*(length/3))/(length);
					d.path = 'M' + ((x(d.point[0])+d.textPoint[0])+d.textX) + ',' + ((y(d.point[1])+d.textPoint[1])+d.textY) + 'C' + cx1 + ',' + cy1 + ',' + cx2 + ',' + cy2 + ',' + (x(d.point[0])-d.pointX)+ ',' + (y(d.point[1])-d.textY);
				}else if(d.textPoint[0]>0){
					var cx2 = (x1) + (d.side*(((-y1 + y(d.point[1])))*(length*2/3)))/(length);
					var cy2 = (y1) + (d.side*(((x1 - x(d.point[0]))))*(length*2/3))/(length);
					var cx1 = (x2) + (d.side*(((-y2 + y(d.point[1])))*(length/3)))/(length);
					var cy1 = (y2) + (d.side*(((x2 - x(d.point[0]))))*(length/3))/(length);
					d.path = 'M' + ((x(d.point[0])+d.textPoint[0])+d.textX) + ',' + ((y(d.point[1])+d.textPoint[1])+d.textY) + 'C' + cx1 + ',' + cy1 + ',' + cx2 + ',' + cy2 + ',' + (x(d.point[0])-d.pointX)+ ',' + (y(d.point[1])-d.textY);
				}else if(d.textPoint[1]>0){
					var cx2 = (x1) + (d.side*(((-y1 + y(d.point[1])))*(length*2/3)))/(length);
					var cy2 = (y1) + (d.side*(((x1 - x(d.point[0]))))*(length*2/3))/(length);
					var cx1 = (x2) + (d.side*(((-y2 + y(d.point[1])))*(length/3)))/(length);
					var cy1 = (y2) + (d.side*(((x2 - x(d.point[0]))))*(length/3))/(length);
					d.path = 'M' + ((x(d.point[0])+d.textPoint[0])+d.textX) + ',' + ((y(d.point[1])+d.textPoint[1])+d.textY) + 'C' + cx1 + ',' + cy1 + ',' + cx2 + ',' + cy2 + ',' + (x(d.point[0])-d.pointX)+ ',' + (y(d.point[1])-d.textY);
				}else{
					var cx2 = (x1) + (d.side*(((-y1 + y(d.point[1])))*(length*2/3)))/(length);
					var cy2 = (y1) + (d.side*(((x1 - x(d.point[0]))))*(length*2/3))/(length);
					var cx1 = (x2) + (d.side*(((-y2 + y(d.point[1])))*(length/3)))/(length);
					var cy1 = (y2) + (d.side*(((x2 - x(d.point[0]))))*(length/3))/(length);
					d.path = 'M' + ((x(d.point[0])+d.textPoint[0])+d.textX) + ',' + ((y(d.point[1])+d.textPoint[1])+d.textY) + 'C' + cx1 + ',' + cy1 + ',' + cx2 + ',' + cy2 + ',' + (x(d.point[0])-d.pointX)+ ',' + (y(d.point[1])-d.textY);
				}
			})

			var holders = textPlots.selectAll('g.anno').data(annos).enter()
				.append('g.anno');

			var backPaths = holders.append('path')
				.attr({
					d:function(d){
						return d.path;
					}
				})
				.style({
					stroke:'#fff1e0',
					fill:'none',
					'stroke-width':3
				});

			var arrows = holders.append('path')
				.attr({
					d:function(d){
						return d.path;
					}
				})
				.style({
					stroke:'#43423e',
					fill:'none',
					'marker-end':'url(#arrow)',
				});

			var labs = holders.append('text.shadow')
				.translate(function(d){return [(x(d.point[0]) + d.textPoint[0]),(y(d.point[1]) + d.textPoint[1])]})
				.style({
					'text-anchor':function(d){
						return d.anchor;
					},
					fill:function(d){return textColours(d.key)},
					'font-weight':500
				})
		      	.tspans(function(d){return d3.wordwrap(d.text, 20)});

		}

		annotate(annos);

		// Annotations stuff here

		// var swoopy = d3.swoopyDrag()
		// .x(function(d){ return x(d.xVal) })
		// .y(function(d){ return y(d.yVal) })
		// .draggable(true)
		// .annotations(annotations);

		// var swoopySel = plots.append('g').call(swoopy);
		// swoopySel.selectAll('path').style({
		// 	'marker-end':'url(#arrow)',
		// 	fill:'none',
		// 	stroke:'#43423e'
		// });

		// swoopySel.selectAll('text')
		// .each(function(d){
		//   d3.select(this)
		//       .text('')                        //clear existing text
		//       .tspans(d3.wordwrap(d.text, 20)) //wrap after 20 char
		// });

	}

	var annotations = [
	  // {
	  //   "xVal": 41,
	  //   "yVal": 91,
	  //   "path": "M-60,-60C-40,-40,-20,-20,0,0",
	  //   "text": "Leicester 2015-16: 91 points in 41 matches",
	  //   "textOffset": [
	  //     60,
	  //     60
	  //   ]
	  // },
	  // {
	  //   "xVal": 42,
	  //   "yVal": 90,
	  //   "path": "M-60,-60C-40,-40,-20,-20,0,0",
	  //   "text": "Ipswich 1979-80: 90 points in 42 matches",
	  //   "textOffset": [
	  //     60,
	  //     60
	  //   ]
	  // },
	  // {
	  //   "xVal": 46,
	  //   "yVal": 89,
	  //   "path": "M-60,-60C-40,-40,-20,-20,0,0",
	  //   "text": "Sheffield Wednesday 1928-29: 89 points in 46 matches",
	  //   "textOffset": [
	  //     60,
	  //     60
	  //   ]
	  // }
	];

	drawChart();

	chartHolder.append('g').attr({
        'id':'ftlogo',
        'transform':'translate(' + (width-31) + ',' + (height-18) + ')'
    }).append('path').attr('d','M1.57,17h7.617v-0.621c-0.529-0.015-0.927-0.044-1.192-0.089c-0.266-0.044-0.492-0.138-0.688-0.275c-0.198-0.139-0.324-0.328-0.384-0.565c-0.054-0.234-0.085-0.565-0.085-0.989V9.233h1.189c1.07,0,1.854,0.164,2.35,0.494c0.493,0.33,0.82,0.949,0.984,1.859h0.602V5.962h-0.602C11.26,6.554,11.105,7,10.903,7.286C10.7,7.582,10.385,7.792,9.945,7.917C9.507,8.046,8.87,8.113,8.028,8.113H6.838V3c0-0.328,0.06-0.547,0.174-0.657c0.115-0.112,0.35-0.17,0.703-0.17h2.422c0.792,0,1.433,0.039,1.914,0.109c0.482,0.068,0.881,0.207,1.195,0.409c0.318,0.2,0.558,0.44,0.719,0.715c0.162,0.272,0.312,0.655,0.467,1.142h0.673L15.002,1H1.6v0.608c0.441,0.021,0.774,0.055,1,0.095c0.225,0.04,0.423,0.129,0.603,0.265c0.179,0.142,0.3,0.33,0.356,0.57C3.622,2.78,3.647,3.116,3.647,3.542V14.46c0,0.424-0.025,0.755-0.088,0.989c-0.057,0.237-0.178,0.427-0.356,0.565c-0.18,0.138-0.383,0.231-0.62,0.275c-0.236,0.045-0.575,0.074-1.013,0.089V17z M15.778,4.548h0.812c0.254-0.871,0.598-1.486,1.031-1.84c0.441-0.354,1.078-0.535,1.918-0.535h1.965V14.46c0,0.424-0.027,0.755-0.092,0.989c-0.057,0.237-0.176,0.427-0.365,0.565c-0.188,0.138-0.41,0.231-0.662,0.275c-0.252,0.045-0.627,0.074-1.119,0.089V17h7.691v-0.621c-0.496-0.015-0.873-0.044-1.133-0.089c-0.26-0.044-0.484-0.138-0.672-0.275c-0.191-0.139-0.314-0.328-0.373-0.565c-0.053-0.234-0.084-0.565-0.084-0.989V2.173h1.969c0.838,0,1.48,0.182,1.916,0.535c0.439,0.354,0.781,0.969,1.035,1.84h0.814L30.104,1H16.189L15.778,4.548z');

}

/* eslint-enable */