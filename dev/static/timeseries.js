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
var normalize = [];
var normalize_ordered = [];
var perf_views = [];
var perf_ratio = []; 
var list = [];
var video_title = [];
var video_url = [];
var video_info = [];
var which_data = "Views Time Series";
var x = [];
var y = [];
var number_videos;
var x_range;
var x_publish_range_max;
var x_publish_range_min;
var x_perf_min;
var current_graph;
var rangeslider = 1;
var is_denorm = 0;


function getData(data) {

  orig_data = data;
  if (data.length > 0 ){
    scrape_data = JSON.parse(data);
    // search(scrape_data);
    // plot_1(scrape_data);
    }

  for (var i = 0; i<scrape_data.length; i++){
    var current_video_url = scrape_data[i]['URL'];
    video_info.push(scrape_data[i]["TITLE"] + "<br>" + current_video_url);
    video_url.push(scrape_data[i]["URL"]);
    video_title.push(scrape_data[i]["TITLE"]);
    normalize_ordered.push(i+1);
    normalize.push(scrape_data.length-i);
    published.push(scrape_data[i]["PUBLISHED_STR"]);
    views.push(scrape_data[i]["VIEWS"]);
    duration.push(scrape_data[i]["DURATION"]);
    likes.push(scrape_data[i]["LIKES"]);
    likeview_ratio.push((likes[i]*1000)/views[i]);
    total_likes = total_likes + likes[i];
    total_likes_str = total_likes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    total_views = total_views + parseInt(views[i]);
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
//document.getElementById("variance").innerHTML += `${variance_str}`;
// document.getElementById("stdev").innerHTML += `${stdev_str}`;
document.getElementById("avg-views").innerHTML += `${views_avg}`;

data = [{
    text: video_info,
    x: normalize,
    y: views ,
    mode: 'lines+markers',
    type: 'scatter',
    // opacity: 0.6,
    marker: {
      size: 8,
      opacity: 0.3,
      color:'blue',
      line:{color:'blue',
      opacity:0.7},
  },
}];

// var updatemenus=[
//   {
//       buttons: [
//           {
//               // args: [normalize, 'surface'],
//               label: 'Normalize',
//               method: 'restyle'
//           },
//       ],
//       direction: 'right',
//       pad: {'r': 10, 't': 10},
//       showactive: true,
//       type: 'buttons',
//       // x: normalize,
//       // xanchor: 'left',
//       // y: views,
//       // yanchor: 'top'
//   }
// ]
number_videos = normalize.length;
if (number_videos < 50){
// Max
  x_range_min = 1;
}
// 50 vids
else {

  x_range_min = number_videos-50;

}

if (number_videos < 50){
// Max
  x_publish_range_max = published[0];
  console.log(`x max date: ${x_publish_range_max}`);
  x_publish_range_min = published[published.length-1];
  console.log(`x min date: ${x_publish_range_min}`);
}

else{
// 50 vids
x_publish_range_max = published[0];
console.log(`x max date: ${x_publish_range_max}`);
x_publish_range_min = published[49];
console.log(`x min date: ${x_publish_range_min}`);


}

var layout = {
  title: 'Views Time Series',
  // updatemenus:updatemenus,
  xaxis: {
        text: video_info,
    title: 'Upload #',
    range:[x_range_min,number_videos],
    // autorange: true,
    // range: [0,normalize.length],
    // rangeselector: {buttons: [
    //     {
    //       count: 1,
    //       label: '1m',
    //       step: 'month',
    //       stepmode: 'backward'
    //     },
    //     {
    //       count: 6,
    //       label: '6m',
    //       step: 'month',
    //       stepmode: 'backward'
    //     },
    //     {step: 'all'}
    //   ]},
    rangeslider: {range: [1, normalize.length]},
    type: 'linear',


  },

  yaxis: {
    title: 'Views',
    autorange: true,
    // range: [Math.min(...views),Math.max(...views)],
    type: 'linear'
  }

};

  likeViewRatio(views,likeview_ratio);

  Plotly.plot("timeseries", data, layout, { responsive: true });

  current_graph = "views_timeseries";
  rangeslider = 1;
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

function updatePlotly(data, layout) {
  // document.getElementById("normalize").innerHTML = "Denormalize";

  // Note the extra brackets around 'newx' and 'newy'
  Plotly.newPlot("timeseries", data, layout, { responsive: true });
  // Plotly.restyle("timeseries", "x", [newx], layout);
  // Plotly.restyle("timeseries", "y", [newy], layout);
}

function switch_data(data) {
  console.log(data);
  which_data = data;
  // if (data.length > 0 ){
  //   scrape_data = JSON.parse(data);
  //   plot_1(scrape_data);
  //   }

  // Initialize empty arrays to contain our axes
  // var x = [];
  // var y = [];


  // Convert JSON to Arrays
  // for (var i = 0; i<scrape_data.length; i++){

  //   x.push(scrape_data[i]["PUBLISHED_STR"]);
  //   y.push(scrape_data[i]["VIEWS"]);
  // }
  // Fill the x and y arrays as a function of the selected dataset
  switch (data) {
  case "Views vs Time":
  
    data=[{
      text: video_info,
      x : normalize,
      y : views,
      mode: 'lines+markers',
      type: 'scatter',
      // opacity: 0.6,
      marker: {
        size: 8,
        opacity: 0.3,
        color:'blue',
        line:{color:'blue',
        opacity:0.7},
    },}]

    layout = {
      title: 'Views Time Series',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Upload #',
        range:[x_range_min,number_videos],

        rangeslider: {range: [1, normalize.length]},
        type: 'linear',
    
    
      },
    
      yaxis: {
        title: 'Views',
        autorange: true,
        // range: [Math.min(...views),Math.max(...views)],
        type: 'linear'
      }

    }
  
      current_graph = "views_timeseries";

    break;

  case "Duration Time Series":
  if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 0){
    console.log("normalize no rangeslider");
    data=[{
      text: video_info,
      x : normalize,
      y : duration,
      mode: 'lines+markers',
      type: 'scatter',
      // opacity: 0.6,
      marker: {
        size: 8,
        opacity: 0.3,
        color:'blue',
        line:{color:'blue',
        opacity:0.7},
    },}]

    layout = {
      title: 'Duration Time Series',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Upload #',
        range:[x_range_min,number_videos],

       

    
    
      },
    
      yaxis: {
        title: 'Duration',

      }

    }
  }
  

  else if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 1){
    console.log("normalize yes rangeslider");
    data=[{
      text: video_info,
      x : normalize,
      y : duration,
      mode: 'lines+markers',
      type: 'scatter',
      // opacity: 0.6,
      marker: {
        size: 8,
        opacity: 0.3,
        color:'blue',
        line:{color:'blue',
        opacity:0.7},
    },}]

    layout = {
      title: 'Duration Time Series',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Upload #',
        range:[x_range_min,number_videos],
        rangeslider: {range: [1, normalize.length]},

    
    
      },
    
      yaxis: {
        title: 'Duration',

      }

    }
  


    
  }

    else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 0){
      console.log("denormalize no rangeslider");
      layout = {
        title: 'Duration Time Series',
        // updatemenus:updatemenus,
        xaxis: {
          
          range:[x_publish_range_min,x_publish_range_max],
          title: 'Date',
      
      
      
        },
        yaxis: {
          title: 'Duration',

        }
  
      };

      // range:[x_publish_range_min,x_publish_range_max],
      // rangeslider: {range: [published[0], published[published.length]]},

      data=[{
        text: video_info,
        x : published,
        y : duration,
        mode: 'lines+markers',
        type: 'scatter',
        // opacity: 0.6,
        marker: {
          size: 8,
          opacity: 0.3,
          color:'blue',
          line:{color:'blue',
          opacity:0.7},
      },}]
      
    }

        else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 1){
          console.log("denormalize yes rangeslider");
      layout = {
        title: 'Duration Time Series',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Date',
          range:[x_publish_range_min,x_publish_range_max],
          rangeslider: {range: [published[0], published[published.length]]},


      
      
        },
      
        yaxis: {
          title: 'Duration',

        }
  
      };

      // range:[x_publish_range_min,x_publish_range_max],
      // rangeslider: {range: [published[0], published[published.length]]},

      data=[{
        text: video_info,
        x : published,
        y : duration,
        mode: 'lines+markers',
        type: 'scatter',
        // opacity: 0.6,
        marker: {
          size: 8,
          opacity: 0.3,
          color:'blue',
          line:{color:'blue',
          opacity:0.7},
      },}]
      
    }

      current_graph = "duration_timeseries";
      // rangeslider = 1;
    break;

  case "Likes Time Series":
  if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 0){
    console.log("normalize no rangeslider");
    data=[{
      text: video_info,
      x : normalize,
      y : likes,
      mode: 'lines+markers',
      type: 'scatter',
      // opacity: 0.6,
      marker: {
        size: 8,
        opacity: 0.3,
        color:'blue',
        line:{color:'blue',
        opacity:0.7},
    },}]

    layout = {
      title: 'Likes Time Series',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Upload #',
        range:[x_range_min,number_videos],

       

    
    
      },
    
      yaxis: {
        title: 'Likes',

      }

    }
  }
  

  else if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 1){
    console.log("normalize yes rangeslider");
    data=[{
      text: video_info,
      x : normalize,
      y : likes,
      mode: 'lines+markers',
      type: 'scatter',
      // opacity: 0.6,
      marker: {
        size: 8,
        opacity: 0.3,
        color:'blue',
        line:{color:'blue',
        opacity:0.7},
    },}]

    layout = {
      title: 'Likes Time Series',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Upload #',
        range:[x_range_min,number_videos],
        rangeslider: {range: [1, normalize.length]},

    
    
      },
    
      yaxis: {
        title: 'Likes',

      }

    }
  


    
  }

    else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 0){
      console.log("denormalize no rangeslider");
      layout = {
        title: 'Likes Time Series',
        // updatemenus:updatemenus,
        xaxis: {
          
          range:[x_publish_range_min,x_publish_range_max],
          title: 'Date',
      
      
      
        },
        yaxis: {
          title: 'Likes',

        }
  
      };

      // range:[x_publish_range_min,x_publish_range_max],
      // rangeslider: {range: [published[0], published[published.length]]},

      data=[{
        text: video_info,
        x : published,
        y : likes,
        mode: 'lines+markers',
        type: 'scatter',
        // opacity: 0.6,
        marker: {
          size: 8,
          opacity: 0.3,
          color:'blue',
          line:{color:'blue',
          opacity:0.7},
      },}]
      
    }

        else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 1){
          console.log("denormalize yes rangeslider");
      layout = {
        title: 'Likes Time Series',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Date',
          range:[x_publish_range_min,x_publish_range_max],
          rangeslider: {range: [published[0], published[published.length]]},


      
      
        },
      
        yaxis: {
          title: 'Likes',

        }
  
      };

      // range:[x_publish_range_min,x_publish_range_max],
      // rangeslider: {range: [published[0], published[published.length]]},

      data=[{
        text: video_info,
        x : published,
        y : likes,
        mode: 'lines+markers',
        type: 'scatter',
        // opacity: 0.6,
        marker: {
          size: 8,
          opacity: 0.3,
          color:'blue',
          line:{color:'blue',
          opacity:0.7},
      },}]
      
    }
  current_graph = "likes_timeseries";
  // rangeslider = 1;
    break;
    case "Bubble":
    data = [{
      text: video_info,
      x: normalize,
      y: views ,
      mode: 'markers',
      marker: {
        size: likes,
        sizemode: 'area',

        color:'blue',
        sizeref: size,
        },
      type: 'scatter',
      opacity: 0.7,

    }];
    if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 0){
      console.log("normalize no rangeslider");
      data=[{
        text: video_info,
        x : normalize,
        y : views,
        mode: 'markers',
        marker: {
          size: likes,
          sizemode: 'area',
  
          color:'blue',
          sizeref: size,
          },
        type: 'scatter',
        opacity: 0.7,
  
      }];
  
      layout = {
        title: 'Views Time Series w/ Likes',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Upload #',
          range:[x_range_min,number_videos],
  
         
  
      
      
        },
      
        yaxis: {
          title: 'Views',
  
        }
  
      }
    }
    
  
    else if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 1){
      console.log("normalize yes rangeslider");
      data=[{
        text: video_info,
        x : normalize,
        y : views,
        mode: 'markers',
        marker: {
          size: likes,
          sizemode: 'area',
  
          color:'blue',
          sizeref: size,
          },
        type: 'scatter',
        opacity: 0.7,
  
      }];
  
      layout = {
        title: 'Views Time Series w/ Likes',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Upload #',
          range:[x_range_min,number_videos],
          rangeslider: {range: [1, normalize.length]},
  
      
      
        },
      
        yaxis: {
          title: 'Views',
  
        }
  
      }
    
  
  
      
    }
  
      else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 0){
        console.log("denormalize no rangeslider");
        layout = {
          title: 'Views Time Series w/ Likes',
          // updatemenus:updatemenus,
          xaxis: {
            
            range:[x_publish_range_min,x_publish_range_max],
            title: 'Date',
        
        
        
          },
          yaxis: {
            title: 'Views',
  
          }
    
        };
  
        // range:[x_publish_range_min,x_publish_range_max],
        // rangeslider: {range: [published[0], published[published.length]]},
  
        data=[{
          text: video_info,
          x : published,
          y : views,
          mode: 'markers',
          marker: {
            size: likes,
            sizemode: 'area',
    
            color:'blue',
            sizeref: size,
            },
          type: 'scatter',
          opacity: 0.7,
    
        }];
        
      }
  
          else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 1){
            console.log("denormalize yes rangeslider");
        layout = {
          title: 'Views Time Series w/ Likes',
          // updatemenus:updatemenus,
          xaxis: {
            title: 'Date',
            range:[x_publish_range_min,x_publish_range_max],
            rangeslider: {range: [published[0], published[published.length]]},
  
  
        
        
          },
        
          yaxis: {
            title: 'Views',
  
          }
    
        };
  
        // range:[x_publish_range_min,x_publish_range_max],
        // rangeslider: {range: [published[0], published[published.length]]},
  
        data=[{
          text: video_info,
          x : published,
          y : views,
          mode: 'markers',
          marker: {
            size: likes,
            sizemode: 'area',
    
            color:'blue',
            sizeref: size,
            },
          type: 'scatter',
          opacity: 0.7,
    
        }];
        
      }
  

    current_graph = "bubble";
    // rangeslider = 1;
    break;

    case "Likes/View Ratio":

  
  if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 0){
    console.log("normalize no rangeslider");
    data=[{
      text: video_info,
      x : normalize_ordered,
      y : perf_ratio,
      mode: 'lines+markers',
      type: 'scatter',
      // opacity: 0.6,
      marker: {
        size: 8,
        opacity: 0.3,
        color:'blue',
        line:{color:'blue',
        opacity:0.7},
    },}]

    layout = {
      title: 'Likes/View Ratio vs Views',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Views (Increasing)',
        range:[x_range_min,number_videos],
        type: 'linear',
    
    
      },
    
      yaxis: {
        title: 'Likes/1,000 Views',
        autorange: true,
        // range: [Math.min(...views),Math.max(...views)],
        type: 'linear'
      }
      
  
    };
  }
  

  else if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 1){
    
    data=[{
      text: video_info,
      x : normalize_ordered,
      y : perf_ratio,
      mode: 'lines+markers',
      type: 'scatter',
      // opacity: 0.6,
      marker: {
        size: 8,
        opacity: 0.3,
        color:'blue',
        line:{color:'blue',
        opacity:0.7},
    },}]

    layout = {
      title: 'Likes/View Ratio vs Views',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Views (Increasing)',
        range:[x_range_min,number_videos],
   
        rangeslider: {range: [x_perf_min, perf_views[perf_views.length-1]]},
        type: 'linear',
    
    
      },
    
      yaxis: {
        title: 'Likes/1,000 Views',
        autorange: true,
        // range: [Math.min(...views),Math.max(...views)],
        type: 'linear'
      }
      
  
    };
  }
  

    else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 0){
      if (perf_views.length < 50){

        x_perf_min = perf_views[0]
        console.log(`perf min ${x_perf_min}`);
      }
      else{
        x_perf_min = perf_views[perf_views.length-50]
        console.log(`perf min ${x_perf_min}`);
      }

      console.log("denormalize no rangeslider");
      data=[{
        text: video_info,
        x : perf_views,
        y : perf_ratio,
        mode: 'lines+markers',
        type: 'scatter',
        // opacity: 0.6,
        marker: {
          size: 8,
          opacity: 0.3,
          color:'blue',
          line:{color:'blue',
          opacity:0.7},
      },}]
  
      layout = {
        title: 'Likes/View Ratio vs Views',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Views (Count)',
          range:[x_perf_min,perf_views[perf_views.length-1]], 
          type: 'linear',
      
      
        },
      
        yaxis: {
          title: 'Likes/1,000 Views',
          autorange: true,
          // range: [Math.min(...views),Math.max(...views)],
          type: 'linear'
        }
        
    
      };
      
    }

        else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 1){
          if (perf_views.length < 50){

            x_perf_min = perf_views[0]
            console.log(`perf min ${x_perf_min}`);
          }
          else{
            x_perf_min = perf_views[perf_views.length-50]
            console.log(`perf min ${x_perf_min}`);
          }
          console.log("denormalize yes rangeslider");
          data=[{
            text: video_info,
            x : perf_views,
            y : perf_ratio,
            mode: 'lines+markers',
            type: 'scatter',
            // opacity: 0.6,
            marker: {
              size: 8,
              opacity: 0.3,
              color:'blue',
              line:{color:'blue',
              opacity:0.7},
          },}]
      
          layout = {
            title: 'Likes/View Ratio vs Views',
            // updatemenus:updatemenus,
            xaxis: {
              title: 'Views (Count)',
              range:[x_perf_min,perf_views[perf_views.length-1]], 
         
              rangeslider: {range: [1, normalize.length]},
              type: 'linear',
          
          
            },
          
            yaxis: {
              title: 'Likes/1,000 Views',
              autorange: true,
              // range: [Math.min(...views),Math.max(...views)],
              type: 'linear'
            }
            
        
          };
      
    }

  current_graph = "likeview_ratio";
  // rangeslider = 1;
    break;
  default:
  if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 0){
    console.log("normalize no rangeslider");
    data=[{
      text: video_info,
      x : normalize,
      y : views,
      mode: 'lines+markers',
      type: 'scatter',
      // opacity: 0.6,
      marker: {
        size: 8,
        opacity: 0.3,
        color:'blue',
        line:{color:'blue',
        opacity:0.7},
    },}]

    layout = {
      title: 'Views Time Series',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Upload #',
        range:[x_range_min,number_videos],

       
        type: 'linear',
    
    
      },
    
      yaxis: {
        title: 'Views',
        autorange: true,
        // range: [Math.min(...views),Math.max(...views)],
        type: 'linear'
      }

    }
  }
  

  else if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 1){
    console.log("normalize yes rangeslider");
    data=[{
      text: video_info,
      x : normalize,
      y : views,
      mode: 'lines+markers',
      type: 'scatter',
      // opacity: 0.6,
      marker: {
        size: 8,
        opacity: 0.3,
        color:'blue',
        line:{color:'blue',
        opacity:0.7},
    },}]

    layout = {
      title: 'Views Time Series',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Upload #',
        range:[x_range_min,number_videos],
        rangeslider: {range: [1, normalize.length]},
        type: 'linear',
    
    
      },
    
      yaxis: {
        title: 'Views',
        autorange: true,
        // range: [Math.min(...views),Math.max(...views)],
        type: 'linear'
      }

    }
  


    
  }

    else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 0){
      console.log("denormalize no rangeslider");
      layout = {
        title: 'Views Time Series',
        // updatemenus:updatemenus,
        xaxis: {
          
          range:[x_publish_range_min,x_publish_range_max],
          title: 'Date',
      
      
      
        },
        yaxis: {
          title: 'Views',

        }
  
      };

      // range:[x_publish_range_min,x_publish_range_max],
      // rangeslider: {range: [published[0], published[published.length]]},

      data=[{
        text: video_info,
        x : published,
        y : views,
        mode: 'lines+markers',
        type: 'scatter',
        // opacity: 0.6,
        marker: {
          size: 8,
          opacity: 0.3,
          color:'blue',
          line:{color:'blue',
          opacity:0.7},
      },}]
      
    }

        else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 1){
          console.log("denormalize yes rangeslider");
      layout = {
        title: 'Views Time Series',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Date',
          range:[x_publish_range_min,x_publish_range_max],
          rangeslider: {range: [published[0], published[published.length]]},


      
      
        },
      
        yaxis: {
          title: 'Views',

        }
  
      };

      // range:[x_publish_range_min,x_publish_range_max],
      // rangeslider: {range: [published[0], published[published.length]]},

      data=[{
        text: video_info,
        x : published,
        y : views,
        mode: 'lines+markers',
        type: 'scatter',
        // opacity: 0.6,
        marker: {
          size: 8,
          opacity: 0.3,
          color:'blue',
          line:{color:'blue',
          opacity:0.7},
      },}]
      
    }

  current_graph = "views_timeseries";
    break;
  }

    // if (document.getElementById("normalize").innerHTML === "Denormalize"){
    //   console.log("keep normalized");
    // x = normalize;
  
    // }
  
    // else if (document.getElementById("normalize").innerHTML === "Normalize"){
    //   console.log("change to denormalized");
    //   x = published;
  
    // }

  updatePlotly(data, layout);

}


// function updatePlotlyPerformance(newx, newy, layout) {

//   // Note the extra brackets around 'newx' and 'newy'
//   Plotly.restyle("plot-2", "x", [newx], layout, { responsive: true });
//   Plotly.restyle("plot-2", "y", [newy], layout, { responsive: true });
// }

// function switch_data_performance(data) {
//   // if (data.length > 0 ){
//   //   scrape_data = JSON.parse(data);
//   //   plot_1(scrape_data);
//   //   }

//   // Initialize empty arrays to contain our axes
//   var x = [];
//   var y = [];


//   // Convert JSON to Arrays
//   // for (var i = 0; i<scrape_data.length; i++){

//   //   x.push(scrape_data[i]["PUBLISHED_STR"]);
//   //   y.push(scrape_data[i]["VIEWS"]);
//   // }
//   // Fill the x and y arrays as a function of the selected dataset
//   switch (data) {
//   case "Views vs Views/Likes":
//     x = views;
//     y = likeview_ratio;
//     var layout = {
//       autosize:1,
//       legend: {
//         x: 1,
//         y: 1},
//       title: {
//         text:'Views vs Views/Likes',
//         // font: {
//         //   family: 'Courier New, monospace',
//         //   size: 24
//         // },
//         xref: 'paper',
//         x: 0.5,
//       },
//       xaxis: {
//         title: {
//           text: 'Test',
//           font: {
//             family: 'Courier New, monospace',
//             size: 18,
//             color: '#7f7f7f'
//           }
//         },
//       },
//       yaxis: {
//         title: {
//           text: 'Test',
//           font: {
//             family: 'Courier New, monospace',
//             size: 18,
//             color: '#7f7f7f'
//           }
//         }
//       }
//     }
//     break;
//     default:
//     x = views;
//     y = likeview_ratio;
//     var layout = {
//       autosize:1,
//       legend: {
//         x: 1,
//         y: 1},
//       title: {
//         text:'Views vs Views/Likes',
//         // font: {
//         //   family: 'Courier New, monospace',
//         //   size: 24
//         // },
//         xref: 'paper',
//         x: 0.5,
//       },
//       xaxis: {
//         title: {
//           text: 'Test',
//           font: {
//             family: 'Courier New, monospace',
//             size: 18,
//             color: '#7f7f7f'
//           }
//         },
//       },
//       yaxis: {
//         title: {
//           text: 'Test',
//           font: {
//             family: 'Courier New, monospace',
//             size: 18,
//             color: '#7f7f7f'
//           }
//         }
//       }
//     }
//     break;
//   }

//   updatePlotlyPerformance(x, y, layout);
// }

function getPerformanceData(views, likeview_ratio) {
//  if (document.getElementById("plot-1").style.visibility = "visible"){
//   document.getElementById("plot-1").style.visibility = "hidden";

//  }

//  else{



  data = [{
    text: video_info,
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
          text: 'Views (Increasing Scale)',
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

// Plotly.plot("plot-2", data, layout, { responsive: true });
}


// if (document.getElementById("plot-2") !== null){

//   document.getElementById("plot-2").style.display = "none"
//   document.getElementById("select-plot-data-2").style.display = "none";
// }

// if (document.getElementById("plot-3") !== null){

//   document.getElementById("plot-3").style.display = "none"
//   document.getElementById("select-plot-data-3").style.display = "none";
// }

// function showPerformance(){

//     document.getElementById("plot-1").style.display = "none";
//     document.getElementById("select-plot-data").style.display = "none";
//     document.getElementById("plot-2").style.display = "block";
//     document.getElementById("select-plot-data-2").style.display = "block";
//     document.getElementById("plot-3").style.display = "none";
//     document.getElementById("select-plot-data-3").style.display = "none";
    

// }

// function showBubble(){

//   document.getElementById("plot-3").style.display = "block";
//   document.getElementById("select-plot-data-3").style.display = "block";
//   document.getElementById("plot-1").style.display = "none";
//   document.getElementById("select-plot-data").style.display = "none";
//   document.getElementById("plot-2").style.display = "none";
//   document.getElementById("select-plot-data-2").style.display = "none";
  

// }


// function updateBubblePerformance(newx, newy, layout) {

//   // Note the extra brackets around 'newx' and 'newy'
//   Plotly.restyle("plot-3", "x", [newx], layout, { responsive: true });
//   Plotly.restyle("plot-3", "y", [newy], layout, { responsive: true });
// }

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
        },
      },
      yaxis: {
        title: {
          text: 'Test',

        }
      }
    }
    break;
    default:
    x = views;
    y = normalize;
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

      },
      xaxis: {
        title: {
          text: 'Test',
        },
      },
      yaxis: {
        title: {
          text: 'Test',

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
      text: video_info,
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
  
  // Plotly.plot("plot-3", data, layout, { responsive: true });
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


function normalize_data(){
// console.log(which_data);
  if(which_data !== "Likes/View Ratio"){


    if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider === 1){
    // update = {
    //   'xaxis.range': [x_publish_range_min,x_publish_range_max], 
    //   'xaxis.rangeslider': {range: [published[0], published[published.length]]},
    //   'xaxis.title' :    {text: 'Date'},
 
    // };

    layout = {

      xaxis: {
        title: 'Date',
        range:[x_publish_range_min,x_publish_range_max],
        rangeslider: {range: [published[0], published[published.length]]},
  
      },
    }
    
    Plotly.restyle("timeseries", "x", [published], { responsive: true });

    Plotly.relayout("timeseries", layout);

    document.getElementById("normalize").innerHTML = "Normalize";

    }

    else if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider == 0){

      // update = {
      //   'xaxis.range': [x_range_min,number_videos], 
      //   'xaxis.rangeslider': {range: [x_publish_range_min, x_publish_range_max]},
      //   'xaxis.title' :    {text: 'Upload #'},
  
      // };

      layout = {

        xaxis: {
          title: 'Date',
          range:[x_publish_range_min,x_publish_range_max],

    
        },
      }

      Plotly.restyle("timeseries", "x", [published], { responsive: true });

      Plotly.relayout("timeseries", layout);

      document.getElementById("normalize").innerHTML = "Normalize";

    }
  

    else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider == 1){

      update = {
        'xaxis.range': [x_range_min,number_videos], 
        'xaxis.rangeslider': {range: [x_publish_range_min, x_publish_range_max]},
        'xaxis.title' :    {text: 'Upload #'},
  
      };

      Plotly.restyle("timeseries", "x", [normalize], { responsive: true });

      Plotly.relayout("timeseries", update);

      document.getElementById("normalize").innerHTML = "Denormalize";

    
  }

  else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider == 0){

    layout = {

      xaxis: {
        title: 'Upload #',
        range:[x_range_min,number_videos],

  
      },
    }

    Plotly.restyle("timeseries", "x", [normalize], { responsive: true });

    Plotly.relayout("timeseries", layout);

    document.getElementById("normalize").innerHTML = "Denormalize";

  }

  }

  else{

    if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider == 1){
      console.log("this is broken");
      if (perf_views.length < 50){

        var x_perf_min = perf_views[0]
        console.log(`perf min ${x_perf_min}`);
      }
      else{
        var x_perf_min = perf_views[perf_views.length-50]
        console.log(`perf min ${x_perf_min}`);
      }
      
      update = {
        'xaxis.range': [perf_views[0],perf_views[perf_views.length-1]], 
        'xaxis.rangeslider': {range: [x_perf_min, perf_views[perf_views.length-1]]},
        'xaxis.title' :    {text: 'Views (Count)'},
  
      };

      Plotly.restyle("timeseries", "x", [perf_views], { responsive: true });

      Plotly.relayout("timeseries", update);
  
      document.getElementById("normalize").innerHTML = "Normalize";
  
      }

      else if (document.getElementById("normalize").innerHTML === "Denormalize" && rangeslider == 0 ){
      console.log("rangeslider is fucked");
        if (perf_views.length < 50){
  
          x_perf_min = perf_views[0]
          console.log(`perf min ${x_perf_min}`);
        }
        else{
          x_perf_min = perf_views[perf_views.length-50]
          console.log(`perf min ${x_perf_min}`);
        }
        
        layout = {

          xaxis: {
            title: 'Views (Count)',
            range:[perf_views[0],perf_views[perf_views.length-1]], 
 
    
      
          },
        }
  
        Plotly.restyle("timeseries", "x", [perf_views], { responsive: true });
  
        Plotly.relayout("timeseries", layout);
    
        document.getElementById("normalize").innerHTML = "Normalize";
    
        }   

      else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 0){
        console.log("normalize no rangeslider");
        // update = {
        //   'xaxis.range': [x_range_min,number_videos], 
        //   'xaxis.rangeslider': {range: [1, normalize.length]},
        //   'xaxis.title' :    {text: 'Views (Increasing)'},
    
        // };
        

        layout = {

          xaxis: {
            title: 'Views (Increasing)',
            range:[x_range_min,number_videos],
            
    
      
          },
        }

        Plotly.restyle("timeseries", "x", [normalize_ordered], { responsive: true });

        Plotly.relayout("timeseries", layout);
  
        document.getElementById("normalize").innerHTML = "Denormalize";
  
      }

      else if (document.getElementById("normalize").innerHTML === "Normalize" && rangeslider === 1){
        
        update = {
          'xaxis.range': [x_range_min,number_videos], 
          'xaxis.rangeslider': {range: [1, normalize.length]},
          'xaxis.title' :    {text: 'Views (Increasing)'},
    
        };
        Plotly.restyle("timeseries", "x", [normalize_ordered], { responsive: true });

        Plotly.relayout("timeseries", update);
  
        document.getElementById("normalize").innerHTML = "Denormalize";
  
      }

  }

}

// function normalize_option(){

//   if (document.getElementById("normalize").innerHTML === "Denormalize"){

//     Plotly.restyle("timeseries", "x", [published], { responsive: true });
  
//     }
  
//     // else if (document.getElementById("normalize").innerHTML === "Normalize"){
  
//     //   Plotly.restyle("timeseries", "x", [normalize], { responsive: true });
  
//     // }

// }


function expand(){

if (document.getElementById("hide-me").style.display !== "none"){

    document.getElementById("hide-me").style.display = "none";

    document.getElementById("plot-resize").classList.remove("col-7");

    document.getElementById("plot-resize").classList.add("col-9");

    document.getElementById("plot-resize").classList.add("ml-5");

    document.getElementById("plot-resize").classList.remove("mr-2");

    document.getElementById("plot-resize").classList.add("mr-3");

    document.getElementById("expand").innerHTML =  "Collapse";

    // Plotly.relayout('timeseries', {
    //   width: 1015,
    //   height: 450,
    // });

    // Plotly.restyle('timeseries', {
    //   responsive:true,
    // })
    update = {
      responsive: true,

    };

    // Plotly.relayout("timeseries", update);
    switch_data(which_data);

}

else{

    document.getElementById("hide-me").style.display = "block";

    document.getElementById("plot-resize").classList.remove("col-9");

    document.getElementById("plot-resize").classList.add("col-7");

    document.getElementById("plot-resize").classList.remove("ml-5");

    document.getElementById("plot-resize").classList.remove("mr-3");

    document.getElementById("plot-resize").classList.add("mr-2");

    document.getElementById("expand").innerHTML =  "Expand";

    // Plotly.relayout('timeseries', {
    //   width: 780,
    //   height: 450,
    // })

    // Plotly.restyle('timeseries', {
    //   responsive:true,
    // })

    update = {
      responsive: true,

    };

    //Plotly.relayout("timeseries", update);
    switch_data(which_data);

}

}

function likeViewRatio(views,likeview_ratio){

perf_views = views.slice();
perf_ratio = likeview_ratio.slice();

//1) combine the arrays:
list = [];
for (var j = 0; j < perf_views.length; j++) 
    list.push({'perf_views': perf_views[j], 'perf_ratio': perf_ratio[j]});

//2) sort:
list.sort(function(a, b) {
    return ((a.perf_views < b.perf_views) ? -1 : ((a.perf_views == b.perf_views) ? 0 : 1));
    //Sort could be modified to, for example, sort on the age 
    // if the name is the same.
});

//3) separate them back out:
for (var k = 0; k < list.length; k++) {
    perf_views[k] = list[k].perf_views;
    perf_ratio[k] = list[k].perf_ratio;
}

}

function subscribers(subs){


  if (subs === "0"){

    // document.getElementById("subscribers").innerHTML = "N/A";

    document.getElementById('subscribers-tab').style.display = "none";

  }


}

function emptyBug() {
  var x;
  x = document.getElementById("message-text").value.trim();
  // console.log(x)
  if (x == "") {
   
      return false;
  };
}


function resizeTimeseries(){

  update = {
    responsive: true,

  };

  Plotly.relayout("timeseries", update);

}


function removeRangeslider(){

  if (current_graph === "views_timeseries" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Denormalize"){
    layout = {
      title: 'Views Time Series',

      xaxis: {
            text: video_info,
        title: 'Upload #',
        range:[x_range_min,number_videos],
        type: 'linear',
    
    
      },
    
      yaxis: {
        title: 'Views',
        autorange: true,
        type: 'linear'
      }
    
    };
  Plotly.relayout("timeseries", layout);
  rangeslider = 0;}

  else if (current_graph === "views_timeseries" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Normalize"){
    layout = {

      xaxis: {
        title: 'Date',
        range:[x_publish_range_min,x_publish_range_max],

      },
    }


    Plotly.relayout("timeseries", layout);
    rangeslider = 0;   
}

else if (current_graph === "views_timeseries" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Normalize"){
  layout = {

    xaxis: {
      title: 'Date',
      range:[x_publish_range_min,x_publish_range_max],
      rangeslider: {range: [published[0], published[published.length]]},

    },
  }


  Plotly.relayout("timeseries", layout);
  rangeslider = 1;   
}
  

  else if (current_graph === "views_timeseries" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Denormalize"){
    layout = {
      title: 'Views Time Series',

      xaxis: {
            text: video_info,
        title: 'Upload #',
        range:[x_range_min,number_videos],
        rangeslider: {range: [1, normalize.length]},
        type: 'linear',
    
    
      },
    
      yaxis: {
        title: 'Views',
        autorange: true,
        type: 'linear'
      }
    
    };
    rangeslider = 1;
  Plotly.relayout("timeseries", layout);}

  
  
  else if (current_graph === "duration_timeseries" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Denormalize"){

    layout = {
      title: 'Duration Time Series',
      // updatemenus:updatemenus,
      xaxis: {
        title: 'Upload #',
        range:[x_range_min,number_videos],
        // range: [0,normalize.length],
        // rangeselector: {buttons: [
        //     {
        //       count: 1,
        //       label: '1m',
        //       step: 'month',
        //       stepmode: 'backward'
        //     },
        //     {
        //       count: 6,
        //       label: '6m',
        //       step: 'month',
        //       stepmode: 'backward'
        //     },
        //     {step: 'all'}
        //   ]},
        type: 'linear',
    
    
      },
    
      yaxis: {
        title: 'Duration (mins)',
        autorange: true,
        // range: [Math.min(...views),Math.max(...views)],
        type: 'linear'
      }
    };
  rangeslider = 0;
  Plotly.relayout("timeseries", layout);
   }

   else if (current_graph === "duration_timeseries" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Normalize"){
    layout = {
  
      xaxis: {
        title: 'Date',
        range:[x_publish_range_min,x_publish_range_max],
  
      },
    }
  
  
    Plotly.relayout("timeseries", layout);
    rangeslider = 0;   
  }

  else if (current_graph === "duration_timeseries" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Normalize"){
    layout = {
  
      xaxis: {
        title: 'Date',
        range:[x_publish_range_min,x_publish_range_max],
        rangeslider: {range: [published[0], published[published.length]]},
  
      },
    }
  
  
    Plotly.relayout("timeseries", layout);
    rangeslider = 1;   
  }

   else if (current_graph === "duration_timeseries" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Denormalize"){

      layout = {
        title: 'Duration Time Series',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Upload #',
          range:[x_range_min,number_videos],
          // range: [0,normalize.length],
          // rangeselector: {buttons: [
          //     {
          //       count: 1,
          //       label: '1m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {
          //       count: 6,
          //       label: '6m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {step: 'all'}
          //   ]},
          rangeslider: {range: [1, normalize.length]},
          type: 'linear',
      
      
        },
      
        yaxis: {
          title: 'Duration (mins)',
          autorange: true,
          // range: [Math.min(...views),Math.max(...views)],
          type: 'linear'
        }
      };
    rangeslider = 1;
    Plotly.relayout("timeseries", layout);}

    else if (current_graph === "likes_timeseries" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Normalize"){
      layout = {
    
        xaxis: {
          title: 'Date',
          range:[x_publish_range_min,x_publish_range_max],
    
        },
      }
    
    
      Plotly.relayout("timeseries", layout);
      rangeslider = 0;   
    }
  
    else if (current_graph === "likes_timeseries" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Normalize"){
      layout = {
    
        xaxis: {
          title: 'Date',
          range:[x_publish_range_min,x_publish_range_max],
          rangeslider: {range: [published[0], published[published.length]]},
    
        },
      }
    
    
      Plotly.relayout("timeseries", layout);
      rangeslider = 1;   
    }
    
    
    else if (current_graph === "likes_timeseries" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Denormalize"){
      layout = {
        title: 'Likes Time Series',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Upload #',
          range:[x_range_min,number_videos],
          // range: [0,normalize.length],
          // rangeselector: {buttons: [
          //     {
          //       count: 1,
          //       label: '1m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {
          //       count: 6,
          //       label: '6m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {step: 'all'}
          //   ]},
          type: 'linear',
      
      
        },
      
        yaxis: {
          title: 'Likes',
          autorange: true,
          // range: [Math.min(...views),Math.max(...views)],
          type: 'linear'
        }
      };
    rangeslider = 0;
    Plotly.relayout("timeseries", layout);
    }


    else if (current_graph === "likes_timeseries" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Denormalize"){
      layout = {
        title: 'Likes Time Series',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Upload #',
          range:[x_range_min,number_videos],
          // range: [0,normalize.length],
          // rangeselector: {buttons: [
          //     {
          //       count: 1,
          //       label: '1m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {
          //       count: 6,
          //       label: '6m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {step: 'all'}
          //   ]},
          rangeslider: {range: [1, normalize.length]},
          type: 'linear',
      
      
        },
      
        yaxis: {
          title: 'Likes',
          autorange: true,
          // range: [Math.min(...views),Math.max(...views)],
          type: 'linear'
        }
      };
    rangeslider = 1;
    Plotly.relayout("timeseries", layout);
    }

    else if (current_graph === "bubble" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Denormalize"){

      layout = {
        title: 'Views Time Series w/ Likes',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Upload #',
          range:[x_range_min,number_videos],
          // range: [0,normalize.length],
          // rangeselector: {buttons: [
          //     {
          //       count: 1,
          //       label: '1m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {
          //       count: 6,
          //       label: '6m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {step: 'all'}
          //   ]},
          type: 'linear',
      
      
        },
      
        yaxis: {
          title: 'Views',
          autorange: true,
          // range: [Math.min(...views),Math.max(...views)],
          type: 'linear'
        }
      };
      rangeslider = 0;
      Plotly.relayout("timeseries", layout);

    } 
    
    
    else if (current_graph === "bubble" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Normalize"){
      layout = {
    
        xaxis: {
          title: 'Date',
          range:[x_publish_range_min,x_publish_range_max],
    
        },
      }
    
    
      Plotly.relayout("timeseries", layout);
      rangeslider = 0;   
    }
  
    else if (current_graph === "bubble" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Normalize"){
      layout = {
    
        xaxis: {
          title: 'Date',
          range:[x_publish_range_min,x_publish_range_max],
          rangeslider: {range: [published[0], published[published.length]]},
    
        },
      }
    
    
      Plotly.relayout("timeseries", layout);
      rangeslider = 1;   
    }
    

    else if (current_graph === "bubble" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Denormalize"){

      layout = {
        title: 'Views Time Series with Likes',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Upload #',
          range:[x_range_min,number_videos],
          // range: [0,normalize.length],
          // rangeselector: {buttons: [
          //     {
          //       count: 1,
          //       label: '1m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {
          //       count: 6,
          //       label: '6m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {step: 'all'}
          //   ]},
          rangeslider: {range: [1, normalize.length]},
          type: 'linear',
      
      
        },
      
        yaxis: {
          title: 'Views (Count)',
          autorange: true,
          // range: [Math.min(...views),Math.max(...views)],
          type: 'linear'
        }
      };
      rangeslider = 1;
      Plotly.relayout("timeseries", layout);

    } 
    

    else if (current_graph === "likeview_ratio" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Normalize"){
      layout = {
    
        xaxis: {
          title: 'Views (Count)',
          range: [perf_views[0],perf_views[perf_views.length-1]]
    
        },
      }

      Plotly.relayout("timeseries", layout);
      rangeslider = 0;   
    }
  
    else if (current_graph === "likeview_ratio" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Normalize"){
      layout = {
    
        xaxis: {
          title: 'Views (Count)',
          range: [perf_views[0],perf_views[perf_views.length-1]],
          rangeslider: {range: [x_perf_min, perf_views[perf_views.length-1]]},
    
        },
      }
    
    
      Plotly.relayout("timeseries", layout);
      rangeslider = 1;   
    }
    
    
    else if (current_graph === "likeview_ratio" && rangeslider === 1 && document.getElementById("normalize").innerHTML === "Denormalize"){
      layout = {
        title: 'Likes/View Ratio vs Views',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Views (Increasing)',
          range:[x_range_min,number_videos],
          // range: [0,normalize.length],
          // rangeselector: {buttons: [
          //     {
          //       count: 1,
          //       label: '1m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {
          //       count: 6,
          //       label: '6m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {step: 'all'}
          //   ]},
          type: 'linear',
      
      
        },
      
        yaxis: {
          title: 'Likes/1,000 Views',
          autorange: true,
          // range: [Math.min(...views),Math.max(...views)],
          type: 'linear'
        }
        
    
      };
      rangeslider = 0;
      Plotly.relayout("timeseries", layout);

    }
    else if (current_graph === "likeview_ratio" && rangeslider === 0 && document.getElementById("normalize").innerHTML === "Denormalize"){
      layout = {
        title: 'Likes/View Ratio vs Views',
        // updatemenus:updatemenus,
        xaxis: {
          title: 'Views (Increasing)',
          range:[x_range_min,number_videos],
          // range: [0,normalize.length],
          // rangeselector: {buttons: [
          //     {
          //       count: 1,
          //       label: '1m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {
          //       count: 6,
          //       label: '6m',
          //       step: 'month',
          //       stepmode: 'backward'
          //     },
          //     {step: 'all'}
          //   ]},
          rangeslider: {range: [1, normalize.length]},
          type: 'linear',
      
      
        },
      
        yaxis: {
          title: 'Likes/1,000 Views',
          autorange: true,
          // range: [Math.min(...views),Math.max(...views)],
          type: 'linear'
        }
        
    
      };
      rangeslider = 1;
      Plotly.relayout("timeseries", layout);

    }
  }



 



