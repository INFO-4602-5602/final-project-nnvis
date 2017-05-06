var gaussian_on = false;


// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//               Define Histogram for creating BINS
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
var histogram = d3.histogram()
    .value(function(d) { 
        return d;
    })
    .domain(xScale.domain())
   .thresholds(xScale.ticks(100));
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------






// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//               Bar Tool Tip
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function barToolTip(d, svg) {
  svg.append("text")
        .style("font-size", 14)
        .attr("x", width*0.8)
        .attr("y", 40).attr("class", "tooltip")
        .text(function() {
          return "Range: ["+d.x0.toFixed(4)+", "+d.x1.toFixed(4)+"]";
        });
  
  svg.append("text")
        .style("font-size", 14)
        .attr("x", width*0.8)
        .attr("y", 70).attr("class", "tooltip")
        .text(function() {
          return "Count: " + d.length;
        });
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------






// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//               Refresh Histogram Bars
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function refreshBars(model_name, weight_data, stats_data, test_accuracy, histo_g) {
  
  // Set new bins
  var bins = histogram(weight_data);
  
  // Update yScale domain
  var yMax = d3.max(bins, function(d){return d.length});
  yScale.domain([0, yMax]);
  
  // Set model color
  var model_color = colorScale(test_accuracy);
  
  var bar = histo_g.selectAll(".bar").data(bins);

  bar.exit().remove();
  
  d3.select("#accuracy_scores_"+model_name)
        .transition()
        .duration(100)
        .text(function() {
          
          return "Accuracy: " + test_accuracy;
        })
  
  d3.select("#current_epoch_marker_"+model_name)
        .transition()
        .duration(100)
        .text(function() {
          return "Training Epoch: " + current_epoch;
        })
  
  var xMin = d3.min(bins, function(d){return d.x0});
  var xMax = d3.max(bins, function(d){return d.x0});
  xScale.domain([xMin, xMax]);
  
  bar.transition().duration(400)
      .attr("transform", function(d, i) { 
        var new_x = xScale(d.x0);
        var new_y = yScale(d.length);
        return "translate("+ new_x +", "+ new_y +")";
      })
      .attr("height", function(d) { return height - yScale(d.length) })
      .style("fill", function(d) { 
        return model_color; 
      });
  
  
  // Update Stats data
  var mean = stats_data["mean"];
  var variance = stats_data["variance"];
  var std = stats_data["std"];
  
  var mean_line = d3.select("#mean_line_"+model_name);
  
  // Update mean line
  mean_line.transition().duration(400)
              .attr("x1", xScale(mean))  
              .attr("y1", 0)
              .attr("x2", xScale(mean))  
              .attr("y2", height - margin.top - margin.bottom)
              .style("stroke-width", 4)
              .style("stroke", "red")
              .style("fill", "none");
  
  // Update mean text
  var mean_text = d3.select("#mean_text_"+model_name);
  mean_text.transition().duration(400)
            .attr("x", xScale(mean))  
            .attr("y", -5)
            .text(function() { return "Mean: " + mean.toFixed(5); });
  
  // Update variance text
  var variance_text = d3.select("#variance_text_"+model_name);
  variance_text.transition().duration(400)
            .attr("x", width*0.85)  
            .attr("y", -5)
            .text(function() { return "Variance: " + variance.toFixed(5); });
  
  // Update std text
  var std_text = d3.select("#std_text_"+model_name);
  std_text.transition().duration(400)
            .attr("x", width*0.85)  
            .attr("y", 15)
            .text(function() { return "STD: " + std.toFixed(5); });
  
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------




// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                Check for UPDATING the Histogram
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function updateHistogram(h) {
  // Round slider value, h, to integer for use as epoch
  var epoch = Math.round(h);
  
  // If epoch hasn't changed, do not update histogram
  if (epoch == current_epoch) {
    return;
  }
  
  // Update current epoch
  current_epoch = epoch;
  
  // Update all histograms
  for (var histo_plot_id in HISTOGRAM_PLOTS["plots"]) {
    var model_name = HISTOGRAM_PLOTS["plots"][histo_plot_id];
    if (model_name == undefined) {
      continue;
    }
    
    var model = MODELS[model_name];
    var model_epochs = model["epochs"];
    var current_epoch_data = model_epochs[current_epoch];
    var weight_data = current_epoch_data["weight_data"];
    var test_accuracy = current_epoch_data["scores"]["test accuracy"];
    var stats_data = current_epoch_data["stats"];
    
    // Set the correct DIV
    var histo_svg_id = MODEL_INTERACTIONS[model_name]["hist_plot"] + "_svg";
    var histo_svg = d3.select("#"+histo_svg_id);
    var histo_g = d3.select("#histo_group_"+histo_svg_id);
    refreshBars(model_name, weight_data, stats_data, test_accuracy, histo_g);
    
    // Refresh Gaussian
    if (gaussian_on) {
      refreshGaussian(weight_data);
    }
  }
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------










// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                CREATE the Histogram
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function createHistogram(weight_data, stats_data, test_accuracy_score, model_name, histo_g) {
    console.log(stats_data);
    // Format model name for printing
    var print_name = model_name.replace("_", " ");
    print_name = print_name.charAt(0).toUpperCase() + print_name.slice(1);
  
    // Set initial model color 
    model_color = colorScale(test_accuracy_score);
    
    // CREATE BINS: group the data for the bars
    var bins = histogram(weight_data);
    
    // Update yScale domain
    var yMax = d3.max(bins, function(d){return d.length});
    yScale.domain([0, yMax]);
  
    // Update xScale domain
    var xMin = d3.min(bins, function(d){return d.x0});
    var xMax = d3.max(bins, function(d){return d.x0});
    xScale.domain([xMin, xMax]);
    
  
    // Add the x axis
    histo_g.append("g")
        .attr("id", "x_axis_"+model_name)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));
  
  // Add the y Axis
    histo_g.append("g")
       .attr("id", "y_axis_"+model_name)
        .call(d3.axisLeft(yScale));
  
  
    // Add model header text
    // Header
    histo_g.append("text")
              .attr("x", 20)
              .attr("y", -20)
              .text(function() { 
                return print_name + " - Layer 1 Weight Histogram"; 
              });
    
    
    // Add epoch text
    histo_g.append("text")
        .attr("id", "current_epoch_marker_"+model_name)
        .attr("x", 20)
        .attr("y", 0)
        .text(function() {
          return "Training Epoch: " + current_epoch;
        })
    
    // Add scores text
    histo_g.append("text")
        .attr("id", "accuracy_scores_"+model_name)
        .attr("x", 20)
        .attr("y", 20)
        .text(function() {
          return "Accuracy: " + test_accuracy_score;
        })
    
    // Append the bar rectangles to the svg element
    histo_g.selectAll("rect."+model_name)
        .data(bins)
      .enter().append("rect")
        .attr("class", "model_"+model_name)
        .attr("class", "bar")
        .attr("x", 1)
        .attr("width", function(d) { return xScale(d.x1) - xScale(d.x0) - 1 ; })
        .attr("height", function(d) { return height - yScale(d.length); })
        .attr("transform", function(d) {
            return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")"; })
        .style("fill", model_color)
        .style("opacity", function() {
            return 0.8;
        })
        .style("stroke", "black")
        .on("mouseover", function(d,i) {
          var current_bar = d3.select(this);
          prev_hover_color = current_bar.style("fill");
          current_bar.style("fill", "black");
          barToolTip(d, histo_g);
        })
        .on("mouseout", function(d,i) {
          d3.selectAll(".tooltip").remove();
          d3.select(this).style("fill", prev_hover_color);
        });
  
  
    // Add stats visual info
    var mean = stats_data["mean"];
    var variance = stats_data["variance"];
    var std = stats_data["std"];
  
    // Mean line
    histo_g.append("line")
              .attr("id", "mean_line_"+model_name)
              .attr("x1", xScale(mean))  
              .attr("y1", 0)
              .attr("x2", xScale(mean))  
              .attr("y2", height - margin.top - margin.bottom)
              .style("stroke-width", 4)
              .style("stroke", "red")
              .style("fill", "none");
  
    // Mean text
    histo_g.append("text")
              .attr("id", "mean_text_"+model_name)
              .attr("x", xScale(mean))  
              .attr("y", -5)
              .text(function() { return "Mean: " + mean.toFixed(5); });
  
  
    // Variance text
    histo_g.append("text")
              .attr("id", "variance_text_"+model_name)
              .attr("x", width*0.85)  
              .attr("y", -5)
              .text(function() { return "Variance: " + variance.toFixed(5); });

    // Std text
    histo_g.append("text")
              .attr("id", "std_text_"+model_name)
              .attr("x", width*0.85)  
              .attr("y", 15)
              .text(function() { return "STD: " + std.toFixed(5); });
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------




// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                INITIALIZE the Histogram
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function initializeHistogram(data, model_name) {

  // Set the correct DIV
  var histo_svg_id = MODEL_INTERACTIONS[model_name]["hist_plot"] + "_svg";
  var histo_svg = d3.select("#"+histo_svg_id);
  
  // Clear previous
  d3.select("#histo_group_"+histo_svg_id).remove();
  
  // Set group for histogram
  var histo_g = histo_svg.append("g")
                          .attr("id", "histo_group_"+histo_svg_id)
                          .attr("class", "histo_groups")
                          .attr("transform", 
                                "translate(" + margin.left + "," + (margin.top+20) + ")");
  
  
  
  
  // Set weight adat and score for creating histogram plot
  var weight_data = data["weight_data"];
  var test_accuracy_score = data["scores"]["test accuracy"];
  var stats_data = data["stats"];
  
  // Create the histogram
  createHistogram(weight_data, stats_data, test_accuracy_score, model_name, histo_g);
  
  // Create Gaussian
  if (gaussian_on) {
    createGaussianOverlay(weight_data, stats_data);
  }
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
