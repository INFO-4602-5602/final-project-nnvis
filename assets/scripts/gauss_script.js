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




// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//               Create GAUSSIAN overlay
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function createGaussianOverlay(stats_data, gauss_g, model_name) {
  
  var gauss_plot_g = gauss_g.append("g")
          .attr("id", "gauss_plot_g_"+model_name)
          .attr("transform", "translate("+gauss_plot_margin.left+","+gauss_plot_margin.top+")");
  

  var gauss_data = generateGaussianData(stats_data);
  
  
  gauss_xScale.domain(d3.extent(gauss_data, function(d) {
                            return d.q;
                          })
               );
  
  gauss_yScale.domain([0, d3.max(gauss_data, function(d) { return d.p; }) ]);
  
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
          .attr("d", line);
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------






// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//               Refresh Gaussian Line
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function refreshGaussian(stats_data, model_name) {
  
  d3.select("#gauss_x_axis_"+model_name).remove();
  d3.select("#gauss_y_axis_"+model_name).remove();
  
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

  var gauss_line = d3.select("#gauss_line_"+model_name).datum(gauss_data_update);
//  gauss_line.exit().remove();
  
  gauss_line.attr("d", line);
  
  
  
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


  // Refresh Gauss line
  gauss_line.transition().duration(400);
  
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------

