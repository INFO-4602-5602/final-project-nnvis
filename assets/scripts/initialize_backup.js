// http://bl.ocks.org/nnattawat/8916402

var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

var slider_x;
var weight_data;
var current_epoch;
var full_model_data;
var model_data;
var prev_hover_color;


function set_slider_x(time_step) {
  slider_x = d3.scaleLinear()
      .domain([0, time_step])
      .range([0, width])
      .clamp(true);
}

// set the ranges
var x = d3.scaleLinear()
          .domain([-0.15, 0.15])
          .range([0, width]);

var y = d3.scaleLinear()
          .range([height, 0]);

var colors = ["#ffad99", "#ffd9b3", "#99ff99"];


// set the parameters for the histogram
var histogram = d3.histogram()
    .value(function(d) { 
        return d;
    })
    .domain(x.domain())
   .thresholds(x.ticks(100));

var prev_max;





function createHistogram(model_data, model_name, model_num, epoch_num) {
    
    // Select histogram svg
    var histo_g = d3.select("#histo_group_"+model_num);
    
    
    // Set initial data point at t = 0
    model_epochs = model_data["epochs"];
    model_scores = model_data["scores"];
    epoch_0_data = model_epochs[0];
    epoch_0_score = model_scores[0]["test accuracy"];
    
    
    // Set initial model color 
    model_color = model_data["color_scale"](epoch_0_score);
  
    // group the data for the bars
    var bins = histogram(epoch_0_data);
    
    var yMax = d3.max(bins, function(d){return d.length});
    y.domain([0, yMax]);
  
    var xMin = d3.min(bins, function(d){return d.x0});
    var xMax = d3.max(bins, function(d){return d.x0});
    x.domain([xMin, xMax]);
    
    // add the y Axis
    histo_g.append("g")
       .attr("id", "y_axis_"+model_num)
        .call(d3.axisLeft(y));
  
    // add the x axis
    histo_g.append("g")
        .attr("id", "x_axis_"+model_num)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
  
    
    // Add scores text
    histo_g.append("text")
        .attr("id", "accuracy_scores_"+model_num)
        .attr("x", 20)
        .attr("y", 20)
        .text(function() {
          return "Accuracy: " + epoch_0_score;
        })
    
    // append the bar rectangles to the svg element
    histo_g.selectAll("rect."+model_name)
        .data(bins)
      .enter().append("rect")
        .attr("class", "model_"+model_name)
        .attr("class", "bar")
        .attr("x", 1)
        .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .attr("transform", function(d) {
            return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .style("fill", model_color)
        .style("opacity", function() {
            return (epoch_num == 0) ? 0.8 : 0;
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
  
  
    // Select histogram svg
    var gaussian_g = histo_g.append("g").attr("id", "gaussian_group_"+model_num);

    // Set initial statistics
    var model_stats = describe_stats(model_epochs[0]);
  
    var gaussian_data = normal_distribution(model_epochs[0], model_stats);
  
    var line = d3.line()
                  .x(function(d) {
                      return x(d[0]);
                  })
                  .y(function(d) {
                    console.log(d[1])
                      return height - d[1];
                  });
  
    gaussian_g.append("path")
        .datum(gaussian_data)
        .attr("class", "line")
        .attr("id", "gauss_line_"+model_num)
        .attr("d", line);
}



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


function refreshBars(epoch, model_num) {
  var current_model_name = Object.keys(full_model_data[model_num])[0];
  var current_model = full_model_data[model_num][current_model_name];
  var current_model_accuracy = current_model["scores"][current_epoch]["test accuracy"];
  var new_data = full_model_data[model_num][current_model_name]["epochs"][current_epoch];
  
  var bins = histogram(new_data);
  
  var yMax = d3.max(bins, function(d){return d.length});
  y.domain([0, yMax]);
  
  
  var model_color = model_data["color_scale"](current_model_accuracy);
  
  
  var bar = d3.select("#histo_group_"+model_num).selectAll(".bar").data(bins);

  bar.exit().remove();
  
  d3.select("#accuracy_scores_"+model_num)
        .transition()
        .duration(100)
        .text(function() {
          
          return "Accuracy: " + current_model_accuracy;
        })
  
  var xMin = d3.min(bins, function(d){return d.x0});
  var xMax = d3.max(bins, function(d){return d.x0});
  x.domain([xMin, xMax]);
  
  bar.transition().duration(400)
      .attr("transform", function(d, i) { 
        var new_x = x(d.x0);
        var new_y = y(d.length);
        return "translate("+ new_x +", "+ new_y +")";
      })
      .attr("height", function(d) { return height - y(d.length) })
      .style("fill", function(d) { 
        return model_color; 
      });
    
}

function updateGaussian() {
  // Set initial statistics
  var model_stats = describe_stats(new_data);

  var gaussian_data = normal_distribution(new_data, model_stats);

  
  var gauss_line = d3.select("#gaussian_group_"+model_num).selectAll(".line").data(gaussian_data);
  gauss_line.exit().remove();
  
  gauss_line.transition().duration(400)
        .attr("x", function(d, i) { 
      console.log(d)
          return x(d[0]);
        })
        .attr("y", function(d, i) { 
          return y(height - d[1]);
        })
}


function updateHistogram(h) {
  var epoch = Math.round(h);
  if (epoch == current_epoch) {
    return;
  }

  current_epoch = epoch;
  
  for (var model_num=0; model_num < full_model_data.length; model_num++) {
    refreshBars(current_epoch, model_num);  
  }
  
}


function initHistograms(data, model_num) {
  var main_div = d3.select("#main_div");
  
  var hist_div = main_div.append("div").attr("id", "histo_div_"+model_num);
  
  hist_div.append("h2").html("Model " + (model_num +1 ) + " Weight Histogram");
  
  var svg = hist_div.append("svg").attr("id", "main_svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  // Set group for histogram
  svg.append("g")
      .attr("id", "histo_group_"+model_num)
      .attr("class", "histo_groups")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

  
  prev_max = 0;
  weight_data = data;
  
  // make histogram with data
  for (var model_name in data) {
    epochs = data[model_name]["epochs"];
    scores = data[model_name]["scores"];
    
    var minScore = d3.min(scores, function(d) { return d["test accuracy"]; });
    var maxScore = d3.max(scores, function(d) { return d["test accuracy"]; });
    
    var color_scale = d3.scaleLinear()
          .domain([minScore, 0.9, 1.0])
          .range(colors);
    
    model_data = {"epochs" : epochs,
                  "scores" : scores,
                  "color_scale" : color_scale};
    
    current_epoch = 0;
    
    createHistogram(model_data, model_name, model_num, 0);  
  }
}


function initializeScatterPlot(model_data, model_num) {
  var scatter_div = d3.select("#scatter_div");
  scatter_div.append("h2").html("Model Selection");
  
  var scatter_svg = scatter_div.append("svg").attr("id", "scatter_svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);
  
  var y_scatter_scale = d3.scaleLinear().domain([0, 1]).range([height, 0]);
  var r_scatter_scale = d3.scaleLinear().domain([0, 1]).range([1, 30]);
  
  var scatter_group;
  for (var model_num=0; model_num < model_data.length; model_num++) {
    // Set group for scatter
    scatter_group = scatter_svg.append("g")
                    .attr("id", "scatter_group_"+model_num)
                    .attr("class", "scatter_groups");
    
    var model_name = Object.keys(model_data[model_num])[0];
    var model = model_data[model_num][model_name];
    
    
    
    scatter_group.selectAll("circle.model_"+model_num)
                  .data([model]).enter()
                 .append("circle")
                 .attr("id", "model_"+model_num)
                 .attr("cx", function(d, i) {
                    return 100*(model_num+1)
                 })
                 .attr("cy", function(d, i) {
                    return 50*(model_num+1)
                 })
                 .attr("r", function(d, i) {
                    var scores = d["scores"];
                    var final_accuracy = d3.max(scores, function(g) {
                      return g["test accuracy"];
                    });
                    return r_scatter_scale(final_accuracy);
                 })
                 .style("fill", function(d, i) {
      
                    var scores = d["scores"];
                    var minScore = d3.min(scores, function(g) { return g["test accuracy"]; });
                    var final_accuracy = d3.max(scores, function(g) {
                      return g["test accuracy"];
                    });
      
                    var color_scale = d3.scaleLinear()
                          .domain([minScore, 0.9, 1.0])
                          .range(colors);
      
                    return color_scale(final_accuracy);
                 })
                 .style("stroke", "black");
  }
}


function initializeVis(data) {
  full_model_data = data;

  var main_div = d3.select("body").append("div").attr("id", "main_div");
  var scatter_div = main_div.append("div").attr("id", "scatter_div")
  
  // Initialize scatter plot
  initializeScatterPlot(data);
  
  
  // Initialize histograms
  for (var i=0; i < data.length; i++) {
    model_data = data[i];
    initHistograms(model_data, i);
  }
  
  var controls_div = main_div.append("div").attr("id", "controls_div");
  var time_steps = data[0][Object.keys(data[0])[0]]["epochs"].length;
  set_slider_x(time_steps-1);
  createSlider();
  
}

function initializeData() {
  d3.select("body").append("h1").html("Deep Neural Network Visualization")
  
  var json_path_1 = "json_files/model_1.json";
  var json_path_2 = "json_files/model_2.json";
  
  d3.queue()
      .defer(d3.json, json_path_1)
      .defer(d3.json, json_path_2)
      .await(function(error, data1, data2)
      {
        var data = [data1, data2];
        initializeVis(data);
      });

}