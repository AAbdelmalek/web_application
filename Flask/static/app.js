// Setting up variables
var search_button = d3.select("#button");
var progress_bar = document.getElementById("load-bar");
var progress_bar_2 = document.getElementById("load-bar-2");
var progress_bar_3 = document.getElementById("load-bar-3");
var analytics_loader = document.getElementsByClassName("analytics_load_button");
var search_loader = document.getElementById("loader_search");
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
var not_found_in_db;

search_loader.href = "#";

if (progress_bar_2 !== null ){
    progress_bar_2.style.visibility = "hidden"; 
}

// function logo(){
//     if(document.getElementById("DS").innerHTML === "DS"){

//         document.getElementById("DS").innerHTML = 'Data Scraper';

//     }
    
//     else{

//     document.getElementById("DS").innerHTML = 'DS';
//     }

// }

if (new_deck !== null){
new_deck.style.display = "none";
}

// if (deck_4 !== null){
//     deck_4.style.display = "none";  
//     }

if (progress_bar !== null ){
    progress_bar.style.visibility = "hidden"; 
}

if (progress_bar_3 !== null ){
    progress_bar_3.style.visibility = "hidden"; 
}
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

function analytics_load(){
    // if (analytics_loader.getAttribute("href") !== "#"){

        progress_bar.style.visibility = "visible";   
    // }
}

function search_progress_bar(){
    if (search_loader.getAttribute("href") !== "#" && search_loader.getAttribute("href").includes("analytics") == False ){

        progress_bar.style.visibility = "visible";   
    }

    else if (search_loader.getAttribute("href") !== "#" && search_loader.getAttribute("href").includes("analytcs") == True || search_loader.getAttribute("href").includes("old") == True ){

        progress_bar_3.style.visibility = "visible";   
    }


}

function load_bar(){
  if (window.location.href.includes("old") == false && window.location.href.includes("analytics")== false){

            progress_bar.style.visibility = "visible"; 
            // loading_warning.style.visibility = "visible";
            document.getElementById("DS").href = "#";
            window.location.href = url;
  }   


//   else if (search_loader.getAttribute("href") === "#"){

//     console.log("the link is #")
//     window.location.href = "#";
//   }

  else {


    progress_bar_3.style.visibility = "visible"; 

    var first_search = window.location.href.split("name=")[1].split("&")[0]


    if (window.location.href.includes("old") == false && window.location.href.includes("analytics=base") == true){

    window.location.href = url + "&old=" + first_search + "&page=1";
    }

    else if (window.location.href.includes("old") == true) {

        var second_search = window.location.href.split("old=")[1].split("&page=")[0];
         window.location.href = url + "&old=" + second_search + "&page=1";

    }





  }

}

function generateURL(){
    
    input = d3.event.target.value;
    var userText = input.replace(/^\s+/, '').replace(/\s+$/, '');
    url = "/query?name=" + input.trim();
    // button_url = url + "&analytics=home";
    
    
    if(url === "/query?name=" && userText === ''){
        url = "#";
     
    }

    if (window.location.href.includes("/query") == true && userText !== ''){

        var first_search = window.location.href.split("name=")[1].split("&")[0]


        if (window.location.href.includes("old") == false && window.location.href.includes("analytics=base") == true){

        search_loader.href= url + "&old=" + first_search + "&page=1";
        }

        else if (window.location.href.includes("old") == true) {

            var second_search = window.location.href.split("old=")[1].split("&page=")[0];
            search_loader.href= url + "&old=" + second_search + "&page=1";

        }

        else{

            search_loader.href=url; 
        }

    }

    else {

        search_loader.href=url; 

    }
    // document.getElementById("analytics_home_link").href =  button_url;
  
    if (event.keyCode === 13 && userText !== '' ) {
        // text was all whitespace
        load_bar();
    }
        // text has real content, now free of leading/trailing whitespace
    
    // if (event.keyCode === 13 && input !== "" && input.replace("") !== " ") {
    //     load_bar();
    // }
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

// if (d3.event !== null){
// input = d3.event.target.value;   
// search_button.on("change", search(input));
// }

// if (window.history.replaceState) {
//     window.history.replaceState( null, null, window.location.href);
// }

function cacheData(id){
id_orig = id;
scrape_date = document.getElementById(`${id}`).innerHTML.split(" ")[3];
id = id.split("_")[1];

if (document.getElementById(id).href !== null){
analytics_url = document.getElementById(id).href;}

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

// getPullURL(update_url, days, id_orig);
}

// function getPullURL(update_url, days, id_orig){

//     last_retrieved_link = document.getElementById(id_orig);

//     if (days < 100){
        
//         last_retrieved_link.setAttribute("data-target", ""); 
//         last_retrieved_link.classList.add("retrieved-link");
//         // last_retrieved_link.remove();
//     }

//     else {

//        last_retrieved_link.setAttribute("data-target", "#initiatePull");  

//     }

//     document.getElementById("pull-href").href = update_url;
// }

function justLoad(){

    progress_bar.style.visibility = "visible"; 

}

function newScrape(not_found_in_db, youtube_code){

    if (not_found_in_db === "0" || not_found_in_db === "" ){
        $("#new-scrape").modal("hide");
        $('#new-scrape').data('bs.modal',null); 
    }

    else if (not_found_in_db === "2"){ 
        window.location.href = "/";
    }

    else{

        $("#new-scrape").modal({
            keyboard : false,
            backdrop : "static",
          });
        document.getElementById("new-scrape-href").href = "/pull?name=" + youtube_code;


    }

}

function resetURL(){

    // $("#new-scrape").modal("hide");
    // $('#new-scrape').data('bs.modal',null); 

    // $("#new-scrape").modal({
    //     keyboard : false,
    //     backdrop : "static",
    //   });
    
    progress_bar_2.style.visibility = "visible"; 
    ok_button = document.getElementById("new-scrape-ok-button");
    ok_button.innerHTML = "Please wait...";
    ok_button.setAttribute("data-dismiss","");

    document.getElementById("modal-cancel").innerHTML += '<a class="btn btn-sm btn-danger" role="button" href="#" class="link_color_2" id="new-scrape-cancel" onclick="cancelRequest()">Cancel</a>';


    ok_link = document.getElementById("new-scrape-href");
    ok_link.style.display = "none";

    document.getElementById("new-scrape-close").style.visibility = "hidden";


}

function cancelRequest(){

    $("#new-scrape").modal("hide");
    $('#new-scrape').data('bs.modal',null); 

    window.location.href = "/cancel";
    

}

// if (window.location.href === "http://127.0.0.1:5000//cancel"){
//     window.location.href = "/";
// }


if (document.getElementById("header-content") !== null){


// When the user scrolls the page, execute myFunction 
window.onscroll = function() {myFunction()};

// Get the header
var header = document.getElementById("header-content");

// Get the offset position of the navbar
var sticky = header.offsetTop;

// Add the sticky class to the header when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
  if (window.pageYOffset > sticky) {
    header.classList.add("fixed-top");
    var fix = document.getElementById("sticky-header-fix");
    fix.innerHTML = "<br><br>";

  } else {
    header.classList.remove("fixed-top");
    var fix = document.getElementById("sticky-header-fix");
    fix.innerHTML = "";
  }
}
}

function showTimeseries(){

   if (document.getElementById("plot-1").style.display === "none") {
            document.getElementById("plot-1").style.display = "block";
            document.getElementById("select-plot-data").style.display = "block";
            document.getElementById("plot-2").style.display = "none";
            document.getElementById("select-plot-data-2").style.display = "none";
            document.getElementById("plot-3").style.display = "none";
            document.getElementById("select-plot-data-3").style.display = "none";

            // document.getElementById("select-plot-data").style.display = "none";}


    // else {
    //     document.getElementById("plot-1").style.display = "block";
    //     document.getElementById("select-plot-data").style.display = "block";

        // document.getElementById("select-plot-data").scrollIntoView();

        // window.scrollTo(0, document.getElementById('select-plot-data').offsetTop - document.getElementById("time-series").offsetHeight);


        // x = top.pageXOffset;
        // y = top.pageYOffset;
    }

}


// if (document.getElementById("plot-1") !== null){

//     document.getElementById("plot-1").style.display = "none";
   
//     document.getElementById("select-plot-data").style.display = "none";
//     // document.getElementById("select-plot-data").innerHTML += "<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>";

    

    
// }

function moreInfo(){

    document.getElementById("analytics-img").innerHTML += '<span class="text-muted">{{total_views}}</span><span class="text-muted">{{subscribers}}</span><span class="text-muted">{{total_views}}</span><span class="text-muted">{{total_views}}</span>'


}

function updateData(id){
    
    scrape_date = id;
    id = id.split("_")[1];
    
    // if (document.getElementById(id).href !== null){
    // analytics_url = document.getElementById(id).href;}

    analytics_url = window.location.href.split("name=")[1].split("&")[0];
    
    update_url = "/update?name=" + analytics_url
    pull_url = "/pull?name=" + analytics_url
    
    scrape_date_object = new Date(scrape_date + "Z");
    today_date_object = Date.now();
    
    staleness = (Math.abs(today_date_object - scrape_date_object))/(1000*60*60*24);
    days = Math.round(staleness);
    
    // console.log(scrape_date_object);
    // console.log(today_date_object);
    // console.log(staleness);
    // console.log(days);
    

    getPullURL(update_url, days);
}

function getPullURL(update_url, days){

    // last_retrieved_link = document.getElementById(id_orig);

    if (days < 7){

        document.getElementById("update-data").style.visibility = "hidden";



        }


    else {
       document.getElementById("update-data").innerHTML = '<button style="position:absolute;right:133px;top:14px" type="button" class="btn btn-sm btn-secondary" data-toggle="modal" data-target="#initiatePull">Update Data</button>';
    //    document.getElementById("update-data").parentElement.remove();
       //    var el = document.getElementById("update-data");
    //    var newEl = document.createElement('button');
    //    newEl.id = "update-data";
    //    newEl.style='position: absolute; right:132px;';
    //    newEl.type = "buttton";
    //    newEl.class = "btn btn-sm btn-secondary";
    //    newEl.innerHTML="Update Data";
    //    newEl.data-toggle = "modal"
    //    newEl.data-target = "#initiatePull"
    //    el.parentNode.replaceChild(newEl, el);
       //    document.getElementById("update-data").style.visibility = "visible";
       document.getElementById("pull-href").href = update_url;

       document.getElementById("modal-body-text").innerHTML
       = `The data for this content creator was retrieved ${days} 
       days ago. Do you want to initiate an update request?`
       // = `The data for ${raw_name} is from ${scrape_date}. 
       // Do you want to initiate a new scrape request?`;

    }

    
}


function redirect(code){

    code_fix = code.replace("amp;","");

    if (window.location.href.includes(code_fix) == false && window.location.href.includes("page") == false){
    window.location.href = code_fix;

    }

    else if (window.location.href.includes(code_fix) == false && window.location.href.includes("page") == true){
    
        // window.location.href = code_fix
        
    // window.location.href = code_fix + "&old=" + window.location.href.split("old=")[1]

    // window.location.href = window.location.href + "&current=" + code_fix.split("/query?name=")[1];

    // window.location.href = window.location.href.split("&old")[0] + "&old=" + code_fix.split("&")[0].split("/query?name=")[1] + "&page=1"

    // http://127.0.0.1:5000/query?name=UCWOKPH3jOLZhZiKQMjl1Fmg&analytics=baseUCE6acMV3m35znLcf0JGNn7Q&page=1
    // http://127.0.0.1:5000/query?name=diddly%20asmr&old=UCE6acMV3m35znLcf0JGNn7Q&page=1
    }


}
// document.getElementById("button").addEventListener("keyup", enter());

// event = document.getElementById("button").addEventListener("keyup", enter());

// function enter(event){
//     console.log(event);
//     if (event.keyCode === 13) {

//         window.location.href = "poopoo";

//     }
// }

function progressBar1(){


    input = document.getElementById("button").value;

    if (input.trim() !== ""){
    progress_bar.style.visibility = "visible"; };

}

function rating(views){

    total_views = parseInt(views.split(" ")[0]);
    console.log(total_views)

    if (total_views > 1000000 && total_views < 10000000){

        document.getElementById("profile-name").innerHTML += "&nbsp;⭑";

    }

    else if (total_views > 10000000 && total_views < 100000000){

        document.getElementById("profile-name").innerHTML += "&nbsp;⭑&nbsp;⭑";

    }

    else if (total_views > 100000000){

        document.getElementById("profile-name").innerHTML += "&nbsp;⭑&nbsp;⭑&nbsp;⭑";

    }


}

function cancelFix(){

if(window.location.href.includes("cancel") || window.location.href.includes("reportbug")){

    window.location.href = "/";

}


}

$('#bugModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('whatever') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    modal.find('.modal-title').text('Report Bug')
    modal.find('.modal-body input').val(recipient)
  })

  function preventEnter(event){

    if (event.keyCode === 13){

        event.preventDefault();

    }




  }