function createSlider() {
  
  var controls_div = d3.select("#slider_div").style("display", "none");
  
  var svg = controls_div.append("svg").attr("width", 960).attr("height", 200);
  
  var margin = {right: 50, left: 50},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height");
  
  // Add slider
  var slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + margin.left + "," + height *.2 + ")");
  
  slider.append("line")
      .attr("class", "track")
      .attr("x1", xScale.range()[0])
      .attr("x2", xScale.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() { hue(sliderScale.invert(d3.event.x)); }));
  
  slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(sliderScale.ticks(10))
    .enter().append("text")
      .attr("x", sliderScale)
      .attr("text-anchor", "middle")
      .text(function(d) { return d; });
  
  var handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

  
  function hue(h) {
    handle.attr("cx", sliderScale(h));
    updateHistogram(h);
  }
  
  // Add Text
  svg.append("text").attr("x", width*0.5).attr("y", 80).text("Training Epochs");
  
}




function spinnerSetup() {
  
  // Setup div for loading spinner 
  d3.select("body").append("div").attr("id", "loading_data_div");
  
  
  // Define spinner options
  var spinner_options = {
                lines: 13 // The number of lines to draw
              , length: 28 // The length of each line
              , width: 14 // The line thickness
              , radius: 4 // The radius of the inner circle
              , scale: 1.5 // Scales overall size of the spinner
              , corners: 1 // Corner roundness (0..1)
              , color: '#99ff99' // #rgb or #rrggbb or array of colors
              , opacity: 0.45 // Opacity of the lines
              , rotate: 0 // The rotation offset
              , direction: 1 // 1: clockwise, -1: counterclockwise
              , speed: 1 // Rounds per second
              , trail: 60 // Afterglow percentage
              , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
              , zIndex: 2e9 // The z-index (defaults to 2000000000)
              , className: 'spinner' // The CSS class to assign to the spinner
              , top: '50%' // Top position relative to parent
              , left: '50%' // Left position relative to parent
              , shadow: false // Whether to render a shadow
              , hwaccel: false // Whether to use hardware acceleration
              , position: 'absolute' // Element positioning
            };
  
  // Define spinner
  spinner = new Spinner(spinner_options);
}