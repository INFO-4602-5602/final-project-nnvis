function gaussian(x, mean, variance) {
  var gaussianConstant = 1 / Math.sqrt(2 * Math.PI * variance);
		
  var gauss_exp = Math.exp(-0.5 * Math.pow((x - mean), 2) / (variance) );
  
  var gauss = gaussianConstant * gauss_exp;
  
  return gauss;
}

function generateGaussianData(stats_data, min=-200, max=200) {
  
  var mean = stats_data["mean"];
  var std = stats_data["std"];
  var variance = stats_data["variance"];
  
  // Generate domain data
  gauss_x = [];
  for (var i=min; i < max; i += 10) {
    gauss_x.push(i/1000);
  }
  
  gauss_data = [];
  for (var i = 0; i < gauss_x.length; i++) {
      var q = gauss_x[i];
      var p = gaussian(q, mean, variance);
      var el = { "q" : q, "p" : p};
      gauss_data.push(el);
  };

  // need to sort for plotting
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  gauss_data = gauss_data.sort(function(x, y) { return x.q - y.q; });
  
  return gauss_data;
}


var GAUSS_DATA = {};

// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//               Create GAUSSIAN overlay
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function createGaussianOverlay(stats_data, gauss_g, model_name) {
  
  // Define the gaussian plot group
  var gauss_plot_g = gauss_g.append("g")
          .attr("id", "gauss_plot_g_"+model_name)
          .attr("transform", "translate("+gauss_plot_margin.left+","+gauss_plot_margin.top+")");
  
  // Generate gaussian data
  var gauss_data = generateGaussianData(stats_data);
  
  
  // Set the line color
  var line_color = (HISTOGRAM_PLOTS["number_occupied"] == 1) ? "#ff661a" : "#0099ff";
  
  // Update gauss data
  GAUSS_DATA[model_name] = { "data" : gauss_data, "line_color" : line_color };
  
  // Update x scales
  gauss_xScale.domain(d3.extent(gauss_data, function(d) {
                            return d.q;
                          })
               );
  
  // Upate y scales
  gauss_yScale.domain([0, d3.max(gauss_data, function(d) { return d.p; }) ]);
  
  // Define line generator
  var line = d3.line()
                .x(function(d) {
                    return gauss_xScale(d.q);
                })
                .y(function(d) {
                    return gauss_yScale(d.p);
                });
  
  
  // Add the x axis
  gauss_plot_g.append("g")
      .attr("id", "gauss_x_axis_"+model_name)
      .attr("transform", "translate(0," + gauss_plot_height*1.05 + ")")
      .style("opacity", 0.5)
      .call(d3.axisBottom(gauss_xScale));
  
  // Add the y Axis
  gauss_plot_g.append("g")
      .attr("id", "gauss_y_axis_"+model_name)
      .attr("transform", "translate(-5,0)")
      .style("opacity", 0.5)
      .call(d3.axisLeft(gauss_yScale));


  // Add curve
  gauss_plot_g.append("path")
          .datum(gauss_data)
          .attr("id", "gauss_line_"+model_name)
          .attr("class", "line")
          .attr("d", line)
          .style("stroke", line_color);
  
  
//  for (var other_model_name in GAUSS_DATA) {
//    if (other_model_name != model_name) {
//      var other_model = GAUSS_DATA[other_model_name];
//      var other_gauss_data = other_model["data"];
//      var other_line_color = other_model["line_color"];
//      // Add other curve
//      gauss_plot_g.append("path")
//                    .datum(other_gauss_data)
//                    .attr("id", "gauss_line_"+other_model_name)
//                    .attr("class", "line")
//                    .attr("d", line)
//                    .style("stroke", other_line_color);
//    }
//  }
  

}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------






// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//               Refresh Gaussian Line
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function refreshGaussian(stats_data, model_name) {
  
  // Remove axes
  d3.select("#gauss_x_axis_"+model_name).remove();
  d3.select("#gauss_y_axis_"+model_name).remove();
  
  // Define new line gen
  var line = d3.line()
                .x(function(d) {
                    return gauss_xScale(d.q);
                })
                .y(function(d) {
                    return gauss_yScale(d.p);
                });
  
  var gauss_plot_g = d3.select("#gauss_plot_g_"+model_name);
  
  var gauss_data_update = generateGaussianData(stats_data);
  
  
  gauss_xScale.domain(d3.extent(gauss_data_update, function(d) {
                            return d.q;
                          })
               );
  
  gauss_yScale.domain([0, d3.max(gauss_data_update, function(d) { return d.p; }) ]);
  
  // Set gauss line
  var gauss_line = d3.select("#gauss_line_"+model_name).datum(gauss_data_update);
  
  // Refresh Gauss line
  gauss_line.attr("d", line).transition().duration(400);
  
  
  
  // Add the x axis
  gauss_plot_g.append("g")
      .attr("id", "gauss_x_axis_"+model_name)
      .attr("transform", "translate(0," + gauss_plot_height*1.05 + ")")
      .style("opacity", 0.5)
      .call(d3.axisBottom(gauss_xScale));
  
  // Add the y Axis
  gauss_plot_g.append("g")
      .attr("id", "gauss_y_axis_"+model_name)
      .attr("transform", "translate(-5,0)")
      .style("opacity", 0.5)
      .call(d3.axisLeft(gauss_yScale));

  
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------

