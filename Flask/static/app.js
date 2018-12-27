// Setting up variables
var search_button = d3.select("#button");
var progress_bar = document.getElementById("load-bar");
var analytics_loader = document.getElementsByClassName("analytics_load_button");
var search_loader = document.getElementById("loader_search")
var link_button = document.getElementById("search");
var i = 0;
var no_results = d3.select(".no_results");
var row_count = 0;
var results = d3.select(".results");
var date_convert = "";
var dropdown = d3.select("#dropdown");
var dropdown_value = "";
var input = "";
var scrape_data = "";
var url = "";
var var_url = "";
// var loading_warning = document.getElementById("loading");
var search_results = "";
var button_url = "";
var deck_2 = document.getElementById("deck-2");
var deck_3 = document.getElementById("deck-3");
var deck_4 = document.getElementById("deck-4");
var counter = 4;
//window.scrollTo(0,document.body.scrollHeight);
var new_deck = document.getElementById(`deck-${counter}`);
var infinite = document.getElementById("infinite_scroll");



function logo(){
    if(document.getElementById("DS").innerHTML === "DS"){

        document.getElementById("DS").innerHTML = 'Data Scraper';

    }
    
    else{

    document.getElementById("DS").innerHTML = 'DS';
    }

}



if (new_deck !== null){
new_deck.style.display = "none";
}

// if (deck_4 !== null){
//     deck_4.style.display = "none";  
//     }

progress_bar.style.visibility = "hidden";
// loading_warning.style.visibility = "hidden";

// Get JSON Data from Flask
function getData(data) {
    if (data.length > 0 ){
    scrape_data = JSON.parse(data);
    search(scrape_data);
    }
}

// Clear Rows before returning search results
  function deleteRows(rows){
    if (rows!==0)
    {
        for(counter=0;counter<rows;counter++)
        {
            document.getElementById("table_results").deleteRow(rows-counter);
        }
    }
}

//Search function
function search(json) {
   
    deleteRows(row_count);

    search_results = json;
    var counter = 0;
    row_count = search_results.length;

    if (row_count === 1)
    {
        results.text(`${row_count} Video`);
    }

    else
    {
        results.text(`${row_count} Videos`);
    }

    if (search_results.length === 0)
    {
        row_count = 0;
    }

    else if (document.getElementById("table_results") !== null)
    {
        for(counter=0;counter<search_results.length;counter++)

        {
            
            var table = document.getElementById("table_results");
            var row = table.insertRow(counter+1);
            
            // var cell1 = row.insertCell(0);
            // var cell2 = row.insertCell(1);
            // var cell3 = row.insertCell(2);
            // var cell4 = row.insertCell(3)
            // var cell5 = row.insertCell(4);
            // var cell6 = row.insertCell(5);          
            var cell1 = row.insertCell(0); 
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);  
            var cell7 = row.insertCell(6);  
            // var cell14 = row.insertCell(13);  
            // var cell15 = row.insertCell(14);    
            var cell8 = row.insertCell(7);
            
            // cell1.innerHTML = search_results[counter]["ARTIST"];
            // cell2.innerHTML = search_results[counter]["SCRAPE_DATE"];
            // cell3.innerHTML = search_results[counter]["SEARCH_NAME"];
            // cell4.innerHTML = search_results[counter]["JOINED"];
            // cell5.innerHTML = search_results[counter]["SUBSCRIBERS"];
            // cell6.innerHTML = search_results[counter]["TOTAL_VIEWS"];
            cell1.innerHTML = search_results[counter]["PUBLISHED_STR"];
            cell2.innerHTML = search_results[counter]["TITLE"];
            cell3.innerHTML = search_results[counter]["CATEGORY"];
            cell4.innerHTML = search_results[counter]["DURATION"];
            cell5.innerHTML = search_results[counter]["VIEWS"];
            cell6.innerHTML = search_results[counter]["LIKES"];
            cell7.innerHTML = search_results[counter]["DISLIKES"];
            // cell14.innerHTML = search_results[counter]["PAID"];
            // cell15.innerHTML = search_results[counter]["FAMILY_FRIENDLY"];
            cell8.innerHTML = search_results[counter]["URL"];
            no_results.text("");
        }      
    }
  }

function analytics_load(){
    // if (analytics_loader.getAttribute("href") !== "#"){

        progress_bar.style.visibility = "visible";   
    // }
}

function search_progress_bar(){
    if (search_loader.getAttribute("href") !== "#"){

        progress_bar.style.visibility = "visible";   
    }
}

function load_bar(){
  if (loader_search.getAttribute("href") !== "#"){

            progress_bar.style.visibility = "visible"; 
            // loading_warning.style.visibility = "visible";

            window.location.href = url;
  }   
}

function generateURL(){
    input = d3.event.target.value;
    url = "/query?name=" + input.trim();
    // button_url = url + "&analytics=home";
    
    if(url === "/query?name="){
        url = "#";
     
    }

    search_loader.href=url;
    // document.getElementById("analytics_home_link").href =  button_url;

    if (event.keyCode === 13 && input !== "") {
        load_bar();
    }
}

// window.onscroll = function(ev) {
//     if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
//         setInterval(function(){
//             deck_3.style.display = "block";},250);
//     }
// };


window.onscroll = function(ev) {
    new_deck = document.getElementById(`deck-${counter}`);
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            // url = url + "/page?=2";
            // window.location.href = url + "/page?=2";
            // window.scrollTo(window.innerHeight + window.scrollY);
            // deck_4.style.display = "block";

            //Good
            // new_deck.style.display = "block";
            // counter = counter + 1;
            // more_decks();

        }
}


function more_decks(){
// var new_deck = document.getElementById(`deck-${counter}`);
new_deck.style.display = "block";
counter = counter + 1;
new_deck = document.getElementById(`deck-${counter}`);
deck_number = `deck-${counter+1}`;
// new_deck.innerHTML = `<p>SUCCESS!!!</p><br><div id="${deck_number}"></div>`;
//html_new_deck =`<div id=${deck_number}>` + '<div class="container-fluid"><br><br><!-- Deck 4 --><div class="row"> <div class="col-8 mx-auto"> <!-- Card 1 --> <div class="card-deck"> <div class="card"> <img class="card-img-top" src="{{ url_for("static", filename="profile.jpg") }}" alt="Card image cap"> <div class="card-body"> <h5 class="card-title">Content Creator</h5> <p class="card-text"> <h6 class="h6-font">Videos</h6> <h6 class="h6-font">Subscribers</h6> <h6 class="h6-font">All-Time Views</h6> <h6 class="h6-font">Joined</h6> </p> <div class="text-center"> <a href="#" class="btn btn-sm btn-primary">Shuffle</a> </div> </div> <div class="card-footer text-center"> <small class="text-muted">Last retrieved</small> </div> </div> <!-- Card 2 --> <div class="card"> <img class="card-img-top" src="{{artist_image}}" alt="Card image cap"> <div class="card-body"> <h5 class="card-title">{{artist_name}}</h5> <p class="card-text"> <h6 class="h6-font">{{total_videos}}</h6> <h6 class="h6-font">{{subscribers}}</h6> <h6 class="h6-font">{{total_views}}</h6> <h6 class="h6-font">{{joined}}</h6> </p> <div class="text-center"> <a href="{{analytics_base_url}}" class="btn btn-sm btn-primary" id="analytics_load_button data_1" onclick="analytics_load()">Analytics</a> </div> </div> <div class="card-footer text-center"> <small class="text-muted">Last retrieved <br> {{cache}}</small> </div> </div> <!-- Card 3 --> <div class="card"> <img class="card-img-top" src="{{artist_image_1}}" alt="Card image cap"> <div class="card-body"> <h5 class="card-title">{{artist_name_1}}</h5> <p class="card-text"> <h6 class="h6-font">{{total_videos_1}}</h6> <h6 class="h6-font">{{subscribers_1}}</h6> <h6 class="h6-font">{{total_views_1}}</h6> <h6 class="h6-font">{{joined_1}}</h6> </p> <div class="text-center"> <a href="{{analytics_base_url_1}}" class="btn btn-sm btn-primary" id="analytics_load_button" onclick="analytics_load()">Analytics</a> </div> </div> <div class="card-footer text-center"> <small class="text-muted">Last retrieved <br> {{cache_1}}</small> </div> </div> <!-- Card 4 --> <div class="card"> <img class="card-img-top" src="{{artist_image_2}}" alt="Card image cap"> <div class="card-body"> <h5 class="card-title">{{artist_name_2}}</h5> <p class="card-text"> <h6 class="h6-font">{{total_videos_2}}</h6> <h6 class="h6-font">{{subscribers_2}}</h6> <h6 class="h6-font">{{total_views_2}}</h6> <h6 class="h6-font">{{joined_2}}</h6> </p> <div class="text-center"> <a href="{{analytics_base_url_2}}" class="btn btn-sm btn-primary" id="analytics_load_button" onclick="analytics_load()">Analytics</a> </div> </div> <div class="card-footer text-center"> <small class="text-muted">Last retrieved <br> {{cache_2}}</small> </div> </div> </div> </div></div></div>';
infinite.innerHTML += html_new_deck;

window.scrollTo(0,document.body.offsetHeight);




}


search_button.on("keyup", generateURL);

if (d3.event !== null){
input = d3.event.target.value;   
search_button.on("change", search(input));
}

// if (window.history.replaceState) {
//     window.history.replaceState( null, null, window.location.href);
// }

function cacheData(id){
id_orig = id;
scrape_date = document.getElementById(`${id}`).innerHTML.split(" ")[3];
id = id.split("_")[1];
analytics_url = document.getElementById(id).href;
update_url = "/update?name=" + analytics_url.split("=")[1].split("&")[0];
pull_url = "/pull?name=" + analytics_url.split("=")[1].split("&")[0];

scrape_date_object = new Date(scrape_date + "Z");
today_date_object = Date.now();

staleness = (Math.abs(today_date_object - scrape_date_object))/(1000*60*60*24);
days = Math.round(staleness);

// console.log(scrape_date_object);
// console.log(today_date_object);
// console.log(staleness);
// console.log(days);

document.getElementById("modal-body-text").innerHTML
= `The data for this content creator was retrieved ${days} 
days ago. Do you want to initiate an update request?`
// = `The data for ${raw_name} is from ${scrape_date}. 
// Do you want to initiate a new scrape request?`;

getPullURL(update_url, days, id_orig);
}

function getPullURL(update_url, days, id_orig){

    last_retrieved_link = document.getElementById(id_orig);

    if (days < 0){
        
        last_retrieved_link.setAttribute("data-target", ""); 
        last_retrieved_link.classList.add("retrieved-link");
        // last_retrieved_link.remove();
    }

    else {

       last_retrieved_link.setAttribute("data-target", "#initiatePull");  

    }

    document.getElementById("pull-href").href = update_url;
}

function justLoad(){

    progress_bar.style.visibility = "visible"; 

}

function newScrape(not_found_in_db, youtube_code){

    if (not_found_in_db === 0){
        $("#new-scrape").modal("hide");
    }

    else{

        $("#new-scrape").modal("show");
        document.getElementById("new-scrape-href").href = "/pull?name=" + youtube_code;


    }

}