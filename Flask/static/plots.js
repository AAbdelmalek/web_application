// Setting up variables
var x_values = Array();
var y_values = Array();

// Get JSON Data from Flask
function getData(data) {
    if (data.length > 0 ){
    scrape_data = JSON.parse(data);
    // search(scrape_data);
    plot_1(scrape_data);
    }
}


function plot_1(scrape_data){

for (var i = 0; i<scrape_data.length; i++){

    x_values.push(scrape_data[i]["PUBLISHED_STR"]);
    y_values.push(scrape_data[i]["VIEWS"]);
    console.log("test");
}

var trace = {
  x: x_values,
  y: y_values,
  mode: 'markers',
  type: 'bar'
};
var data = [trace];

Plotly.newPlot("plot-1", data);
// plot_div = document.getElementById('plot-1');

}



