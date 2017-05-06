

function generateGaussianData(weight_data) {
  gauss_data = [];
  
  for (var i = 0; i < weight_data.length; i++) {
      if (i % 100 == 0) {
        continue;
      }
      var q = weight_data[i];
      var p = gaussian(q);
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
function createGaussianOverlay(weight_data, stats_data) {
  
  var histo_svg_id = "test";
  var model_name = "TEST";
  
  var gauss_margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
      },
      gauss_width = 960 - margin.left - margin.right,
      gauss_height = 500 - margin.top - margin.bottom;

  var gauss_xScale = d3.scaleLinear()
      .range([0, gauss_width]);

  var gauss_yScale = d3.scaleLinear()
      .range([gauss_height, 0]);
  
  
  // Set group for gaussian
  var gauss_div = d3.select("#model_A_vs_B_div");
  
  var gauss_svg = gauss_div.append("svg")
                              .attr("id", "gauss_svg")
                              .attr("width", gauss_width + gauss_margin.left + gauss_margin.right)
                              .attr("height", gauss_height + gauss_margin.top + gauss_margin.bottom);
  
  var gauss_g = gauss_svg.append("g")
                          .attr("id", "gaussian_group_"+histo_svg_id)
                          .attr("class", "gaussian_group")
                          .attr("transform", 
                                "translate(" + gauss_margin.left + "," + (gauss_margin.top) + ")");
  
  gauss_div.style("display", "inline");
  
  
  var gauss_data = generateGaussianData(weight_data);
  
  
  
  
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
  gauss_g.append("g")
      .attr("id", "x_axis_"+model_name)
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(gauss_xScale));
  
  // Add the y Axis
  gauss_g.append("g")
     .attr("id", "y_axis_"+model_name)
      .call(d3.axisLeft(gauss_yScale));


  // Add curve
  gauss_g.append("path")
          .datum(gauss_data)
          .attr("class", "line")
          .attr("d", line);
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------






// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//               Refresh Gaussian Line
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function refreshGaussian(weight_data) {
  
  
  var histo_svg_id = "test";
  var model_name = "TEST";
  
  var gauss_g = d3.select(".gaussian_group");
  
  var gauss_margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50
      },
      gauss_width = 960 - margin.left - margin.right,
      gauss_height = 500 - margin.top - margin.bottom;

  var gauss_xScale = d3.scaleLinear()
      .range([0, gauss_width]);

  var gauss_yScale = d3.scaleLinear()
      .range([gauss_height, 0]);
  
  
  var gauss_data_update = generateGaussianData(weight_data);
  
  
  gauss_xScale.domain(d3.extent(gauss_data_update, function(d) {
                            return d.q;
                          })
               );
  
  gauss_yScale.domain([0, d3.max(gauss_data_update, function(d) { return d.p; }) ]);

  var gauss_line = d3.select(".line").data(gauss_data_update);
  gauss_line.exit().remove();
  
  d3.select("#x_axis_"+model_name).remove();
  d3.select("#y_axis_"+model_name).remove();
  

  // Add the x axis
  gauss_g.append("g")
      .attr("id", "x_axis_"+model_name)
      .call(d3.axisBottom(gauss_xScale));
  
  // Add the y Axis
  gauss_g.append("g")
     .attr("id", "y_axis_"+model_name)
      .call(d3.axisLeft(gauss_yScale));
  
  
  gauss_line.transition().duration(400)
      .attr("transform", function(d, i) { 
        var new_x = gauss_xScale(d.q);
        var new_y = gauss_yScale(d.p);
        return "translate("+ new_x +", "+ new_y +")";
      })
  
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------

