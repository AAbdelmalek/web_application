// Setting up variables
var published = [];
var views = [];
var duration = [];
var likes = [];
var likeview_ratio = [];
var total_likes = 0;
var total_views = 0;
var likes_per_view = 0;
var layout;
var variance = [];
var stdev = [];
var variance_num = 0;
var stdev_num = 0;


function getData(data) {
  orig_data = data;
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
    total_likes_str = total_likes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    total_views = total_views + views[i];
    total_views_str = total_views.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

}

// Variance and Standard Deviation for Views
views_avg_orig = total_views/views.length;
views_avg = Math.round(views_avg_orig).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");


for (var i=0; i< views.length; i++){
    variance_ = (views[i] - views_avg_orig);
    var variance_actual = Math.pow(variance_,2);
    
    variance.push(variance_actual);

    variance_num  = variance_num + variance_actual;

    // var std = Math.sqrt(variance_actual );

    // stdev_num = stdev_num + std;

    // stdev.push(std);

}

variance_num = Math.round(variance_num/views.length)
variance_str = variance_num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

stdev_num = Math.round(Math.sqrt(variance_num))
stdev_str = stdev_num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Other Stats
likes_per_view = (total_likes/total_views)*1000;
likes_per_view_round = Math.round((likes_per_view + 0.00001) * 100) / 100;

document.getElementById("total-views").innerHTML += `${total_views_str}`;
document.getElementById("total-likes").innerHTML = `${total_likes_str}`;
document.getElementById("likes-per-view").innerHTML = `${likes_per_view_round}`;

// Statistics Insertions into DOM
document.getElementById("variance").innerHTML += `${variance_str}`;
document.getElementById("stdev").innerHTML += `${stdev_str}`;
document.getElementById("avg-views").innerHTML += `${views_avg}`;
  
data = [{
    x: published,
    y: views ,
    mode: 'markers',
    type: 'scatter',
    opacity: 0.6,
    marker: {color:'blue'}
}];

    layout = {

      autosize:1,
      // showlegend: true,
      // legend: {
      //   x: 1,
      //   y: 1},
      title: {
        text:'Views vs Time',
        // font: {
        //   family: 'Courier New, monospace',
        //   size: 24
        // },
        xref: 'paper',
        x: 0.5,
      },
      xaxis: {
        // linecolor: 'black',
        // linewidth: 1,
        // mirror: true,
        title: {
          text: 'Date',
          // font: {
          //   family: 'Courier New, monospace',
          //   size: 18,
          //   color: '#7f7f7f'
          // }
          // tickson:"boundaries",
        },
      },
      yaxis: {
        // linecolor: 'black',
        // linewidth: 1,
        // mirror: true,
        title: {
          text: 'Views',
          // font: {
          //   family: 'Courier New, monospace',
          //   size: 18,
          //   color: '#7f7f7f'
          // }
        }
      }
    }

  Plotly.plot("plot-1", data, layout, { responsive: true });
  getPerformanceData(views, likeview_ratio);
  getBubbleData(published,views,likes,duration, total_likes);
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
  Plotly.restyle("plot-1", "x", [newx], layout, { responsive: true });
  Plotly.restyle("plot-1", "y", [newy], layout, { responsive: true });
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
  case "Views vs Time":
    x = published;
    y = views;
    layout = {
      title: 'Views Time Series',
      xaxis: {
        title: 'Published Date',
        // titlefont: {
        //   family: 'Courier New, monospace',
        //   size: 18,
        //   color: '#7f7f7f'
        // }
      },
      yaxis: {
        title: 'Views',
        // titlefont: {
        //   family: 'Courier New, monospace',
        //   size: 18,
        //   color: '#7f7f7f'
        // }
      }
    };
    break;
  case "Duration Time Series":
    x = published
    y = duration;
    layout = {
      autosize:1,
      // showlegend: true,
      // legend: {
      //   x: 1,
      //   y: 1},
      title: {
        text:'Duration vs Time',
        // font: {
        //   family: 'Courier New, monospace',
        //   size: 24
        // },
        xref: 'paper',
        x: 0.5,
      },
      xaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    }
    break;
  case "Likes Time Series":
    x = published;
    y = likes;
    layout = {
      autosize:1,
      // showlegend: true,
      // legend: {
      //   x: 1,
      //   y: 1},
      title: {
        text:'Likes vs Time',
        // font: {
        //   family: 'Courier New, monospace',
        //   size: 24
        // },
        xref: 'paper',
        x: 0.5,
      },
      xaxis: {
        title: {
          text: 'Date',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: 'Likes',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    }
    break;
  // case "Views vs Views/Likes":
  //   x = views;
  //   y = likeview_ratio;
  //   var layout = {showlegend: true,
  //     legend: {
  //       x: 1,
  //       y: 1},
  //     title: {
  //       text:'Views vs Views/Likes',
  //       // font: {
  //       //   family: 'Courier New, monospace',
  //       //   size: 24
  //       // },
  //       xref: 'paper',
  //       x: 0.5,
  //     },
  //     xaxis: {
  //       title: {
  //         text: 'Test',
  //         font: {
  //           family: 'Courier New, monospace',
  //           size: 18,
  //           color: '#7f7f7f'
  //         }
  //       },
  //     },
  //     yaxis: {
  //       title: {
  //         text: 'Test',
  //         font: {
  //           family: 'Courier New, monospace',
  //           size: 18,
  //           color: '#7f7f7f'
  //         }
  //       }
  //     }
  //   }
    // break;
  default:
    x = published;
    y = views;
    x = published;
    y = views;
    layout = {
      autosize:1,
      title: 'Views vs Time',
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


function updatePlotlyPerformance(newx, newy, layout) {

  // Note the extra brackets around 'newx' and 'newy'
  Plotly.restyle("plot-2", "x", [newx], layout, { responsive: true });
  Plotly.restyle("plot-2", "y", [newy], layout, { responsive: true });
}

function switch_data_performance(data) {
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
  case "Views vs Views/Likes":
    x = views;
    y = likeview_ratio;
    var layout = {
      autosize:1,
      legend: {
        x: 1,
        y: 1},
      title: {
        text:'Views vs Views/Likes',
        // font: {
        //   family: 'Courier New, monospace',
        //   size: 24
        // },
        xref: 'paper',
        x: 0.5,
      },
      xaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    }
    break;
    default:
    x = views;
    y = likeview_ratio;
    var layout = {
      autosize:1,
      legend: {
        x: 1,
        y: 1},
      title: {
        text:'Views vs Views/Likes',
        // font: {
        //   family: 'Courier New, monospace',
        //   size: 24
        // },
        xref: 'paper',
        x: 0.5,
      },
      xaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    }
    break;
  }

  updatePlotlyPerformance(x, y, layout);
}

function getPerformanceData(views, likeview_ratio) {
//  if (document.getElementById("plot-1").style.visibility = "visible"){
//   document.getElementById("plot-1").style.visibility = "hidden";

//  }

//  else{



  data = [{
    x: views,
    y: likeview_ratio*1000,
    mode: 'markers',
    type: 'scatter',
    opacity: 0.6,
    marker: {color:"red"}
  }];

    layout = {
      // showlegend: true,
      // legend: {
      //   x: 1,
      //   y: 1},
      title: {
        text:'Views vs Likes/1,000 Views',
        // font: {
        //   family: 'Courier New, monospace',
        //   size: 24
        // },
        xref: 'paper',
        x: 0.5,
      },
      xaxis: {
        title: {
          text: 'Views',
          // font: {
          //   family: 'Courier New, monospace',
          //   size: 18,
          //   color: '#7f7f7f'
          // }
        },
      },
      yaxis: {
        title: {
          text: 'Likes/1,000 Views',
          // font: {
          //   family: 'Courier New, monospace',
          //   size: 18,
          //   color: '#7f7f7f'
          // }
        }
      }
    }

Plotly.plot("plot-2", data, layout, { responsive: true });
}


if (document.getElementById("plot-2") !== null){

  document.getElementById("plot-2").style.display = "none"
  document.getElementById("select-plot-data-2").style.display = "none";
}

if (document.getElementById("plot-3") !== null){

  document.getElementById("plot-3").style.display = "none"
  document.getElementById("select-plot-data-3").style.display = "none";
}

function showPerformance(){

    document.getElementById("plot-1").style.display = "none";
    document.getElementById("select-plot-data").style.display = "none";
    document.getElementById("plot-2").style.display = "block";
    document.getElementById("select-plot-data-2").style.display = "block";
    document.getElementById("plot-3").style.display = "none";
    document.getElementById("select-plot-data-3").style.display = "none";
    

}

function showBubble(){

  document.getElementById("plot-3").style.display = "block";
  document.getElementById("select-plot-data-3").style.display = "block";
  document.getElementById("plot-1").style.display = "none";
  document.getElementById("select-plot-data").style.display = "none";
  document.getElementById("plot-2").style.display = "none";
  document.getElementById("select-plot-data-2").style.display = "none";
  

}


function updateBubblePerformance(newx, newy, layout) {

  // Note the extra brackets around 'newx' and 'newy'
  Plotly.restyle("plot-3", "x", [newx], layout, { responsive: true });
  Plotly.restyle("plot-3", "y", [newy], layout, { responsive: true });
}

function switch_data_performance(data) {
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
  case "Views vs Views/Likes":
    x = views;
    y = likeview_ratio;
    var layout = {
      autosize:1,
      legend: {
        x: 1,
        y: 1},
      title: {
        text:'Views vs Views/Likes',
        // font: {
        //   family: 'Courier New, monospace',
        //   size: 24
        // },
        xref: 'paper',
        x: 0.5,
      },
      xaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    }
    break;
    default:
    x = views;
    y = likeview_ratio;
    var layout = {
      autosize:1,
      legend: {
        x: 1,
        y: 1},
      title: {
        text:'Views vs Views/Likes',
        // font: {
        //   family: 'Courier New, monospace',
        //   size: 24
        // },
        xref: 'paper',
        x: 0.5,
      },
      xaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        },
      },
      yaxis: {
        title: {
          text: 'Test',
          font: {
            family: 'Courier New, monospace',
            size: 18,
            color: '#7f7f7f'
          }
        }
      }
    }
    break;
  }

  updateBubblePerformance(x, y, layout);
}

function getBubbleData(published,views,likes, duration, total_likes) {
  //  if (document.getElementById("plot-1").style.visibility = "visible"){
  //   document.getElementById("plot-1").style.visibility = "hidden";
  
  //  }
  
  //  else{
  size = total_likes/10000;
  
    data = [{
      x: published,
      y: views ,
      mode: 'markers',
      marker: {
        size: likes,
        sizemode: 'area',
        // color:'#0099CC',
        color:"#2AD341",
        sizeref: size,
        },
      type: 'scatter',
      opacity: 0.6,

    }];
  
      layout = {
        // showlegend: true,
        // legend: {
        //   x: 1,
        //   y: 1},
        title: {
          text:'Views vs Time vs Likes',
          // font: {
          //   family: 'Courier New, monospace',
          //   size: 24
          // },
          xref: 'paper',
          x: 0.5,
        },
        xaxis: {
          title: {
            text: 'Views',
            // font: {
            //   family: 'Courier New, monospace',
            //   size: 18,
            //   color: '#7f7f7f'
            // }
          },
        },
        yaxis: {
          title: {
            text: 'Date',
            // font: {
            //   family: 'Courier New, monospace',
            //   size: 18,
            //   color: '#7f7f7f'
            // }
          }
        }
      }
  
  Plotly.plot("plot-3", data, layout, { responsive: true });
  }

// var trace1 = {
//   x: [1, 2, 3, 4],
//   y: [10, 11, 12, 13],
//   mode: 'markers',
//   marker: {
//     size: [40, 60, 80, 100]
//   }
// };

// var data = [trace1];

// var layout = {
//   title: 'Marker Size',
//   showlegend: false,
//   height: 600,
//   width: 600
// };

// Plotly.newPlot('myDiv', data, layout);