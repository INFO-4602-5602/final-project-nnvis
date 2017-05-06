// Spinner variables
var data_load_sim_time = 1000;
var spinner;

// PRIMARY MODELS DATASTRUCT
var MODELS;
var MODEL_INTERACTIONS;


// Setup Histogram plot tracker
var HISTOGRAM_PLOTS;

// Define colors for accuracy mapping
var colors = ["#ffad99", "#ffd9b3", "#99ff99"];

// Globally track the number of epochs in the models. ASSUMPTION: all models have same epoch count. Make dynamic later
var epoch_count;

// Plotting / chart parameters
var margin = {top: 20, right: 30, bottom: 20, left: 40},
    width = 960 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom,
    histogram_width = width * 0.75,
    histogram_height = height * 0.75,
    gauss_height = height*0.75,
    gauss_width = width*0.25,
    gauss_plot_width = gauss_width,
    gauss_plot_height = gauss_height*0.85,
    gauss_plot_margin = {"top" : (gauss_height*0.25)/2, "left" : (gauss_plot_width*0.25)/2};



var gaussian_on = true;
var stats_font_size = 12;
var mean_line_y_shift = -20;


var current_epoch;
var prev_hover_color;


// -------*****--------^^^^-------*****--------
//              Scales
// -------*****--------^^^^-------*****--------
var xScale = d3.scaleLinear()
          .domain([-0.15, 0.15])
          .range([0, histogram_width]);

var yScale = d3.scaleLinear()
          .range([histogram_height, 0]);


var sliderScale = d3.scaleLinear()
                .range([0, histogram_width])
                .clamp(true);

var colorScale = d3.scaleLinear()
                    .domain([0, 0.9, 1.0])
                    .range(colors);

var selectionColorScale = d3.scaleLinear()
                          .range(colors);

var gauss_xScale = d3.scaleLinear()
                    .range([0, gauss_plot_width]);

var gauss_yScale = d3.scaleLinear()
                    .range([gauss_plot_height, 0]);
// -------*****--------^^^^-------*****--------







// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                        Initialize Frames for HISTOGRAMS
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function initializeModelFrame(model_id) {
  
  var model_div = d3.select("#model_"+model_id+"_div");
  
  model_div.style("display", "none");
  
  var model_svg = model_div.append("svg").attr("id", "model_"+model_id+"_svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom);
  // Set group for histogram
  model_svg.append("g")
            .attr("id", "model_"+model_id+"_histogram_group")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.top + ")")
            
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------






// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                        Tooltip for model selection frame
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function selectionTooltip(data, model_key) {
  var tooltip_svg = d3.select("#selection_svg");
  
  var restructured_data = [];
  for (var data_key in data) {
    
    var current_data = data[data_key];
    
    if (data_key == "arch_data") {
      var architecture = "Architecture: ";
      
      var layers = current_data["config"];

      for (var layer_i=0; layer_i < layers.length; layer_i++) {
        var current_layer = layers[layer_i];
        var layer_name = current_layer["class_name"];
        architecture += layer_name;
        if (layer_i != layers.length-1) {
          architecture += ", ";
        }
      }
      restructured_data.push("Number of layers: " + layers.length);
      restructured_data.push(architecture);
    }
    else if (data_key == "name") {
      current_data = current_data.replace("_", " ");
      current_data = current_data.charAt(0).toUpperCase() + current_data.slice(1);
      restructured_data.push(current_data);
    }
    else {
      restructured_data.push("Final Test Accuracy: " + current_data);  
    }
    
  }
  
  var text = tooltip_svg.selectAll("tspan")
                        .data(restructured_data).enter()
                        .append("text")
                          .attr("x", event.pageX + 50)
                          .attr("y", function(d, i) {
                            return event.pageY - 110 + 20*i;
                          })
                          .attr("class", "selection_tooltip_"+model_key)
                          .text(function(d, i) {
                            return d;
                          });
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------








// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                        Model Click HANDLER
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function model_click(d) {
  
  // Set current model name
  var model_name = d["name"];
  
  
  // First, check if all histogram plots are taken and current click is not amongst them - return
  if (HISTOGRAM_PLOTS["number_occupied"] == HISTOGRAM_PLOTS["max_plots"] && !(MODEL_INTERACTIONS[model_name]["selected"])) {
    return;
  }
  
  
  // Define current object
  var current = d3.select(this);
  
  // Invert model selected parameter (if on, turn off.  if off, turn on)
  MODEL_INTERACTIONS[model_name]["selected"] = !MODEL_INTERACTIONS[d["name"]]["selected"];

  
  // ****
  // ADD MODEL FROM HISTOGRAM AND SELECT
  // ****
  if (MODEL_INTERACTIONS[model_name]["selected"]) {

    // Set histogram data
    var histo_data = MODELS[model_name]["epochs"];
    
    // Set data at current epoch for initialization!
    init_histo_data = histo_data[current_epoch];
    
    // Determine which plot the model will go into, model_A or model_B
    var histo_plot_id = (HISTOGRAM_PLOTS["plots"]["model_A"] == undefined) ? "model_A" : "model_B";
    
    // Update histogram_plots data to map: model_name -> plot_location
    HISTOGRAM_PLOTS["plots"][histo_plot_id] = model_name;
    
    // Set MODEL INTERACTIONS mapping from model_name to plot_id
    MODEL_INTERACTIONS[model_name]["hist_plot"] = histo_plot_id;
    
    initializeHistogram(init_histo_data, model_name);
    
    // Set the histogram plots dictionary occupancy up by 1
    HISTOGRAM_PLOTS["number_occupied"]++;
    
    // Transition the radius and opacity of model in selection frame
    current.transition().duration(200).attr("r", 50).style("opacity", 0.6);
    
    // Unhide div
    var histo_plot_div = d3.select("#"+histo_plot_id+"_div");
    histo_plot_div.transition().duration(400).style("display", "block");
  }
  
  // ****
  // REMOVE MODEL FROM HISTOGRAM AND UNSELECT
  // ****
  else {
    
    // Find current model's histo plot id 
    var histo_plot_id = MODEL_INTERACTIONS[model_name]["hist_plot"];
    
    // Remove histoplot and model name mapping
    HISTOGRAM_PLOTS["plots"][histo_plot_id] = undefined;
    MODEL_INTERACTIONS[model_name]["hist_plot"] = undefined;
    
    // Transition the radius and opacity of model in selection frame
    current.transition().duration(100).attr("r", 40).style("opacity", 1.0); 
    
    // Set the histogram plots dictionary occupancy up by 1
    HISTOGRAM_PLOTS["number_occupied"]--;
    
    // Hide div
    var histo_plot_div = d3.select("#"+histo_plot_id+"_div");
    histo_plot_div.transition().duration(400).style("display", "none");
    
    // Remove Gauss overlay
    d3.select("#gauss_group_"+model_name).remove();
  }
  
  // Check if slider should be hidden or unhidden
  var display_type = (HISTOGRAM_PLOTS["number_occupied"] == 0) ? "none" : "block";
  d3.select("#slider_div").transition().duration(400).style("display", display_type);
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------






// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//              Initialize the MODEL SELECTION FRAME  (main frame at top)
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function initializeSelectionFrame() {
  
  // Select the model div
  var selection_div = d3.select("#model_selection_div");
  
  // Append model svg and group
  var selection_svg = selection_div.append("svg")
                                      .attr("id", "selection_svg")
                                      .attr("width", width + margin.left + margin.right)
                                      .attr("height", height + margin.top + margin.bottom)
                                    .append("g")
                                      .attr("id", "selection_group");

  
  
  
  // Add background to selection container
  selection_svg.append("rect")
    .attr("height", "100%")
    .attr("width", "100%")
    .style("fill", "white")
    .style("stroke", "black");
  
  // Add text header to selection container
  selection_svg.append("text")
    .attr("x", 20)
    .attr("y", 20)
    .text("Model Selection")
    .style("font-size", 24)
    .style("stroke", "black");
  
  
  // Set Scales
  //-------//-------//-------//-------//-------//-------//-------//-------
  var modelNumScale = d3.scaleLinear()
                            .domain([0, d3.keys(MODELS).length])
                            .range([0, width]);
  
  var accuracyScale = d3.scaleLinear()
                            .domain([0.0, 1.0])
                            .range([height-margin.bottom, 0+margin.top]);
  
  // Set selectionColorScale domain
  // 0. Get accuracies
  var model_max_accuracies = [];
  for (var model in MODELS) {
    var model_max_accuracy = MODELS[model]["max_test_accuracy"];
    model_max_accuracies.push(model_max_accuracy);
  }
  
  var accuracy_min = d3.min(model_max_accuracies);
  var accuracy_max = d3.max(model_max_accuracies);
  
  // 1. Set domain
  selectionColorScale.domain([accuracy_min, accuracy_max*0.9, accuracy_max]);
  
  //-------//-------//-------//-------//-------//-------//-------//-------
  
  var model_num = 0;
  for (var model_key in MODELS) {
    
    // Define a new SVG model group
    var new_model_group = selection_svg.append("g").attr("id", "group_"+model_key);
    
    // Extract mark info from models
    var model_obj = MODELS[model_key];
    var model_arch = model_obj["architecture_data"];
    var max_accuracy = model_obj["max_test_accuracy"];
    
    
    
    
    
    // Set the mark data
    var mark_data = [{ "name" : model_key, 
                       "arch_data" : model_arch, 
                       "max_accuracy" : max_accuracy }];
    
    // Define model mark
    var model_mark = new_model_group.selectAll("circle").data(mark_data).enter().append("circle")
    
    // Set mark attributes
    model_mark.attr("cx", function(d) {
                return modelNumScale(model_num);
              })
              .attr("cy", function(d) {
                var max_test_accuracy = d["max_accuracy"];
                return accuracyScale(max_test_accuracy);
              })
              .attr("r", 40);
    
    // Set mark styles
    model_mark.style("fill", function(d) {
                var max_test_accuracy = d["max_accuracy"];
      console.log(max_test_accuracy);
                return selectionColorScale(max_test_accuracy);
              })
              .style("stroke", "black") 
              .style("opacity", 0.0);
    
    
    
    // Set mark transition effects
    model_mark.transition().duration(500) 
                .attr("transform", "translate("+width*0.1+", "+height*0.5+")") 
                .style("opacity", 1);
    
    
    
    // Set mark interaction behaviors
    model_mark.on("mouseover", function(d) {
                var current = d3.select(this);
                if (!MODEL_INTERACTIONS[d["name"]]["selected"]) {
                  current.transition().duration(200).attr("r", 50);
                  selectionTooltip(d, d["name"]);
                }
                
              })
              .on("mouseout", function(d) {
                var current = d3.select(this)
                
      
                if (!MODEL_INTERACTIONS[d["name"]]["selected"]) {
                  current.transition().duration(200).attr("r", 40);  
                  d3.selectAll(".selection_tooltip_"+d["name"]).remove();
                }
                
              })
              .on("click", model_click);
    
    model_num++;
  }
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------





// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//             SEQUENCE for initializing visualization frames and sliders
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function initializeVisualizations() {
  // Set Model Selection Frame
  initializeSelectionFrame();
  
  // Initiailize model frames
  initializeModelFrame("A");
  initializeModelFrame("B");
  
  // Initialize slider
  var slider_div = d3.select("#slider_div");
  
  // Set slider domain for correct number of epochs
  sliderScale.domain([0, epoch_count-1]);
  
  // Create the slider
  createSlider();
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------




// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//              Process data - Restructure epoch, stats, and scores data
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function process_epoch_data(model_stats, weight_data) {
  var epochs = weight_data["epochs"];
  var scores = weight_data["scores"];
  
  epoch_count = epochs.length;
  
  var processed_epoch_data = [];
  for (var i=0; i < epochs.length; i++) {
    var current_epoch = epochs[i];
    var current_scores = scores[i];
    var current_stats = model_stats[i];
    
    var new_info_structure = { "weight_data" : current_epoch,
                               "scores" : current_scores,
                               "stats" : current_stats };
    
    processed_epoch_data.push(new_info_structure);
  }
  
  var maximum_test_accuracy = d3.max(scores, function(d) {
    return d["test accuracy"];
  });
  
  return [processed_epoch_data, maximum_test_accuracy];
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------





// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                            Get STATISTICS of data
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function get_stats(weight_data) {
  // Define epochs
  var epochs = weight_data["epochs"];
  
  var epoch_statistics = [];
  
  // Iterate through epochs and generate stats on each epoch
  for (var i=0; i < epochs.length; i++) {
    var current_epoch = epochs[i];
    var epoch_stats = describe_stats(current_epoch);
    epoch_statistics.push(epoch_stats);
  }
  
  return epoch_statistics;
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------





// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                           ** LOAD FILES **
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function load_file(model_information, load_index, total_model_num) {
  var current_model_info = model_information[load_index];
  var current_model_name = current_model_info["name"]
  var model_weight_filepath = current_model_info["filepaths"]["weights"];
  var model_filepath = current_model_info["filepaths"]["architecture"];
  
  d3.queue()
      .defer(d3.json, model_weight_filepath)
      .defer(d3.json, model_filepath)
      .await(function(error, weight_data, model_data)
      { 
        // Statistics on weight_data
        var model_stats = get_stats(weight_data);
    
    
        // Process epoch data
        var processed_data = process_epoch_data(model_stats, weight_data);
        var epoch_data = processed_data[0];
        var maximum_test_accuracy = processed_data[1];
        // Update MODELS
        MODELS[current_model_name]["epochs"] = epoch_data;
        MODELS[current_model_name]["architecture_data"] = model_data;
        MODELS[current_model_name]["max_test_accuracy"] = maximum_test_accuracy;
        
        // Increment load model index
        load_index++;
        if (load_index == total_model_num) {
          console.log("Done loading models!");
          
          // Stop spinner
          spinner.stop();
          
          // Initialize the visualizations
          initializeVisualizations(MODELS);
        }
        else {
          
          // Call next file
          load_file(model_information, load_index, total_model_num);
        }
      });
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------





// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                        Initialize Model Selection Frame
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function initializeModelSelection(models) {
  
  var model_selection_div = d3.select("#model_selection_div");
  
  
  MODELS = {};
  MODEL_INTERACTIONS = {};
  model_load_information = [];
  for (var i=0; i < models.length; i++) {
    var model = models[i];
    var model_name = model["Model Name"];  
    var model_filename = model["Model Filename"];
    
    model_information = { "name" : model_name, 
                          "filename" : model_filename, 
                          "filepaths" : { "weights" : "json_files/"+model_filename, "architecture" : "models/"+model_filename}};
                          
    
    MODELS[model_name] = model_information;
    
    // Initialize models interaction dictionary - used for tracking interactions and flags of models in visualization
    MODEL_INTERACTIONS[model_name] = {"selected" : false};
    
    model_load_information.push(model_information);
  }
  
  
  // Set spinner target
  var target = document.getElementById("loading_data_div");
  spinner.spin(target);
  
  var load_index = 0;
  var total_model_num = models.length;
  load_file(model_load_information, load_index, total_model_num);
  
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------




// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                   Read data - Read list of models and initialize them
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
function searchAndInitializeModels() {
  
  // Set data
  d3.csv("json_files/model_list.csv", function(error, filenames) {
    // Initialize scatter plot
    initializeModelSelection(filenames);
  }); 
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------



// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                 Initialize global variables used in program
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****-------- 
function initializeGlobalVariables() {
  HISTOGRAM_PLOTS = {"number_occupied" : 0, 
                     "max_plots" : 2, 
                     "plots" : {"model_A" : undefined, "model_B" : undefined}};
  
  
  // Initialize current epoch at epoch 0
  current_epoch = 0;
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------




// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------
//                 SEQUENCE: main
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****-------- 
function mainInitialize() {
  
  // Initialize global variables
  initializeGlobalVariables();
  
  // Initialize load spinner
  spinnerSetup();
  
  // Set title
  d3.select("body").append("h1").html("Deep Neural Network Visualization")
  
  // Set Model Selection Frame
  d3.select("body").append("div").attr("id", "model_selection_div");
  
  // Set Model A Frame
  d3.select("body").append("div").attr("id", "model_A_div");
  
  // Set Model B Frame
  d3.select("body").append("div").attr("id", "model_B_div");
  
  // Set Slider
  d3.select("body").append("div").attr("id", "slider_div");
  
  // Set Model A vs. B Gaussian curve comparison
  d3.select("body").append("div").attr("id", "model_A_vs_B_div");
  
  // Set loss scatter plot
  
  // Find models and initialize them
  searchAndInitializeModels();
  
}
// -------*****--------^^^^-------*****---------------*****--------^^^^-------*****--------