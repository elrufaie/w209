// set the dimensions of the canvas

var svg = d3.select("svg"), 
margin = { top: 50, right: 50, bottom: 100, left: 70 },
width  = +svg.attr("width"),
height = +svg.attr("height");

const innerHeight = height - margin.top - margin.bottom;
const innerWidth  = width - margin.left - margin.right;

// parse the date / time
var parseTime = d3.timeParse("%s");
var formatTime = d3.timeFormat("%B %d, %Y");

var group = ["a", "d"];

//--- BarChart ----//
const renderBarChart = data => {

  record = data[0];
  
  //Format the dates
  record.weeks.forEach( d => { 
    var parsedDate = parseTime(d.w);
    d.w = formatTime(parsedDate);
  });
  
  var data_size = Object.keys(record.weeks).length;
  
  const xValue = d => d.w;
  const yValue = d => d.a + d.d;

  //--- Define X and Y Scale ----//
  const xScale = d3.scaleBand()
    .domain(record.weeks.map(xValue))
    .range([0, innerWidth])
    .round(true) 
    .rangeRound([margin.left, width - margin.right])
    .paddingInner(0.1)
  
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(record.weeks, yValue)])
    .range([innerHeight, 0]);
  
  var layers = d3.stack()
    .keys(group)
    .offset(d3.stackOffsetDiverging)
    (record.weeks);

  const g = svg.append("g");
  
  // add x-axis
  g.append("g")
    .call(d3.axisBottom(xScale))
    .attr("transform", "translate(0," + innerHeight + ")")
    .selectAll("text")  
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", function(d) { return "rotate(-40)" });
  
  g.append("g")
    .attr("transform", "translate(" + margin.left + ", 0)")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height / 2))
    .attr("y", 15 - (margin.left))
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .text("# of Lines");

  //--- Tip ----//
  var tip = d3.tip()
    .attr('class', 'bar-tip')
    .offset([-10, 10])
    .html(function(d) {
      return "<strong>Lines Changes:</strong> <span style='color:red'>" + (d.a + d.d) + "</span>";
    })

  svg.call(tip);

  //--- Draw Bars ----//
  g.selectAll("rect")
    .data(record.weeks)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => xScale(xValue(d)))
    .attr("y", d => yScale(d.a + d.d))
    .attr("width", xScale.bandwidth())
    .attr("height", d => innerHeight - yScale(yValue(d)))
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .on('click', click);
  
  // tracks first time bubble load vs. redraw
  var bubble_index = 0;

  
  //---Bar click action--//
  function click(d) {

    var svg = d3.select("#bubble")
      .select("svg"), 
      margin = { top: 50, right: 50, bottom: 100, left: 50 },
      width  = +svg.attr("width"),
      height = +svg.attr("height");

    // Setup data
    var circleData = [ 
      { "count": d.a, "cx": 400, "cy": 100, "color": "green"},
      { "count": d.d, "cx": 600, "cy": 100, "color": "red"},
    ];

    // Add a scale for bubble size
    var z = d3.scaleSqrt()
      .domain([0, 3000])
      .range([ 2, 125]);

    // Add circles to the svg 
    circles = svg.selectAll("circle")
    .data(circleData);

    text = svg.selectAll("text")
      .data(circleData);

    if (bubble_index == 0) {
      circles.enter()
        .append("circle")
        .attr("cx", d => d.cx)
        .attr("cy", d => d.cy)
        .attr("r",  d => z(d.count))
        .style("fill", d => d.color);

      //Add the SVG Text Element to the 
      text.enter()
       .append("text")
       .attr("x", d => d.cx - 15)
       .attr("y", d => d.cy)
       .text( d => d.count)
       .attr("font-family", "sans-serif")
       .attr("font-size", "18px")
       .attr("fill", "black")
       .attr("text-align", "center");

      bubble_index = 1;
     } else { 
        // update existing circles with a transition
        circles.transition()
          .duration(500)
          .attr("cx", d => d.cx)
          .attr("cy", d => d.cy)
          .attr("r",  d => z(d.count))
          .style("fill", d => d.color);

        text.transition()
          .duration(500)
          .attr("x", d => d.cx - 15)
          .attr("y", d => d.cy)
          .text( d => d.count)
          .attr("font-family", "sans-serif")
          .attr("font-size", "18px")
          .attr("fill", "black")
          .attr("text-align", "center");
      }
    }
  };

  // -- Add legend --//
  function renderLegend() {
    var svg = d3.select("#legend")
      .select("svg");

    var valuesToShow = [{ "cx": 650, "cy": 50, "color": "green", "label": "Add" }, 
    { "cx": 650, "cy": 75, "color": "red", "label": "Delete"}]

    // Add circles to the svg 
    legend = svg.selectAll("circle")
      .data(valuesToShow)
          .enter()
          .append("circle")
          .attr("cx", d => d.cx)
          .attr("cy", d  => d.cy)
          .attr("r",  "10")
          .style("fill", d => d.color);

    //add labels
    labels = svg.selectAll("text")
      .data(valuesToShow)
       .enter()
       .append("text")
       .attr("x", d => d.cx + 15)
       .attr("y", d => d.cy + 5)
       .text( d => d.label)
       .attr("font-family", "sans-serif")
       .attr("font-size", "10px")
       .attr("fill", "black")
       .attr("text-align", "center");
  }

  var dataUrl = "https://raw.githubusercontent.com/elrufaie/w209/master/commits.json";

  d3.json(dataUrl, function(error, data) {
    if (error) throw error;

   renderBarChart(data);
   renderLegend();
});