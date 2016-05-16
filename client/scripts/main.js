/* eslint-disable */

queue()
  .defer(d3.csv, './data/runUp200.csv')
  .defer(d3.csv, './data/runDownAll2.csv')
  .await(drawAll);

function drawAll(error,data,down){

	runUp(d3.select('#runUp'),data);
	runPos(d3.select('#runPos'),data);
	runDown(d3.select('#runDown'),down);
	downPos(d3.select('#downPos'),down);

	d3.select(window).on('resize',function(){
		runUp(d3.select('#runUp'),data);
		runPos(d3.select('#runPos'),data);
		runDown(d3.select('#runDown'),down);
		downPos(d3.select('#downPos'),down);
	});

}

/* eslint-enable */