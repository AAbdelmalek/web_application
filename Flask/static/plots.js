// Setting up variables
var published = [];
var views = [];
var duration = [];
var likes = [];
var likeview_ratio = [];
var total_likes = 0;
var total_views = 0;
var likes_per_view = 0;


function getData(data) {

  if (data.length > 0 ){
    scrape_data = JSON.parse(data);
    // search(scrape_data);
    // plot_1(scrape_data);
    }

  for (var i = 0; i<scrape_data.length; i++){

    published.push(scrape_data[i]["PUBLISHED_STR"]);
    views.push(scrape_data[i]["VIEWS"]);
    duration.push(scrape_data[i]["DURATION"]);
    likes.push(scrape_data[i]["LIKES"]);
    likeview_ratio.push(likes[i]/views[i]);
    total_likes = total_likes + likes[i];
    total_views = total_views + views[i];

}


likes_per_view = (total_likes/total_views)*1000;
likes_per_view_round = Math.round((likes_per_view + 0.00001) * 100) / 100;

document.getElementById("total-views").innerHTML = `${total_views} Total Views`;
document.getElementById("total-likes").innerHTML = `${total_likes} Total Likes`;
document.getElementById("likes-per-view").innerHTML = `${likes_per_view_round} Likes Per 1000 Views`;

  
  data = [{
    x: published,
    y: views ,
    mode: 'markers',
    type: 'scatter'}];

  Plotly.plot("plot-1", data);
}

// function plot_1(scrape_data){

// for (var i = 0; i<scrape_data.length; i++){

//     x.push(scrape_data[i]["PUBLISHED_STR"]);
//     y.push(scrape_data[i]["VIEWS"]);
  
// }

// var trace = {
//   x: x,
//   y: y,
// };

// var data = [trace];

// Plotly.newPlot("plot-1", data);

// }

function updatePlotly(newx, newy, layout) {

  // Note the extra brackets around 'newx' and 'newy'
  Plotly.restyle("plot-1", "x", [newx], layout);
  Plotly.restyle("plot-1", "y", [newy], layout);
}

function switch_data(data) {
  // if (data.length > 0 ){
  //   scrape_data = JSON.parse(data);
  //   plot_1(scrape_data);
  //   }

  // Initialize empty arrays to contain our axes
  var x = [];
  var y = [];

  // Convert JSON to Arrays
  // for (var i = 0; i<scrape_data.length; i++){

  //   x.push(scrape_data[i]["PUBLISHED_STR"]);
  //   y.push(scrape_data[i]["VIEWS"]);
  // }
  // Fill the x and y arrays as a function of the selected dataset
  switch (data) {
  case "Views Time Series":
    x = published;
    y = views;
    var layout = {
      title: 'Views Time Series',
      xaxis: {
        title: 'Published Date',
        titlefont: {
          family: 'Courier New, monospace',
          size: 18,
          color: '#7f7f7f'
        }
      },
      yaxis: {
        title: 'Views',
        titlefont: {
          family: 'Courier New, monospace',
          size: 18,
          color: '#7f7f7f'
        }
      }
    };
    break;
  case "Duration Time Series":
    x = published
    y = duration;
    break;
  case "Likes Time Series":
    x = published;
    y = likes;
    break;
  case "Views vs Views/Likes":
    x = views;
    y = likeview_ratio;
    break;
  default:
    x = published;
    y = views;
    x = published;
    y = views;
    var layout = {
      title: 'Views Time Series',
      xaxis: {
        title: 'Published Date',
        titlefont: {
          family: 'Courier New, monospace',
          size: 18,
          color: '#7f7f7f'
        }
      },
      yaxis: {
        title: 'Views',
        titlefont: {
          family: 'Courier New, monospace',
          size: 18,
          color: '#7f7f7f'
        }
      }
    };
    break;
  }

  updatePlotly(x, y, layout);
}

