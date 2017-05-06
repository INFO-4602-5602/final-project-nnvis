function describe_stats(data) {
  var mean, variance, std;
  
  // Mean
  var sum = 0.0;
  var data_size = data.length;
  for (var x=0; x < data_size; x++) {
    sum += data[x];
  }
  
  var mean = sum / data_size;
  
  // Variance
  var sum = 0.0;
  for (var x=0; x < data_size; x++) {
    sum += (data[x] - mean)**2;
  }
  
  var variance = sum / data_size;
  
  var std = Math.sqrt(variance);
  
  return {"mean" : mean, "variance" : variance, "std" : std};
  
}


