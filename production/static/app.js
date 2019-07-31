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
var scroller = 0;
var counter = 0;
var infinite_counter = 0;
var artist_db_name;
var days;
var scroller = 0.5;
var sleeper;
var end_page = 0;
var global_youtube_code = "";
var global_update_code = "";
var job_key = "";
var kill = 0;


if (search_loader !== null){
    search_loader.href = "#";}

if(document.getElementById("update-scrape-load") !==null){


    document.getElementById("update-scrape-load").style.display = "none";
}

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
//   if (window.location.href.includes("old") == false && window.location.href.includes("analytics")== false){
        if(document.getElementById("button").value.trim() != ""){

            if (progress_bar !== null ){
                progress_bar.style.visibility = "visible";  
            }
            
            if (progress_bar_3 !== null ){
                progress_bar_3.style.visibility = "visible";  
            }

            // loading_warning.style.visibility = "visible";
            document.getElementById("DS").href = "#";
            //window.location.href = url;
            d3.json(url).then(function(data){
                //console.log(data);

                var in_db = data["IN_DB"];
                //console.log(`in db?: ${in_db}`);
                var youtube_code_new = data["YOUTUBE_CODE"];
                global_youtube_code = youtube_code_new;
                var artist_name_new_scrape = data["ARTIST_NAME"];
                var subscribers_int_new_scrape = data["SUBSCRIBERS"] + " Subscribers";
                var total_views_int_new_scrape = data["TOTAL_VIEWS"] + " All-Time Views";
                var joined_convert_new_scrape = "Joined " + data["JOINED"];
                var image_url_new = data["IMAGE_URL"];
                var error = data["ERROR"];

                if (in_db === 1){

                    window.location.href = "/query?name=" + youtube_code_new + "&analytics=base";
                }
                
                else if (error === 1){
                    window.location.href = "/error";
                }
                
                else{
                    document.getElementById("artist-new").innerHTML = artist_name_new_scrape;
                    document.getElementById("subscribers-new").innerHTML = subscribers_int_new_scrape;
                    document.getElementById("total_views_new").innerHTML = total_views_int_new_scrape;
                    document.getElementById("joined-new").innerHTML = joined_convert_new_scrape;
                    document.getElementById("image-url-new").src = image_url_new;

                    if (progress_bar !== null ){
                    progress_bar.style.visibility = "hidden";}

                    if (progress_bar_3 !== null ){
                        progress_bar_3.style.visibility = "hidden"; 
                    }
                    
                    $("#new-scrape").modal({
                        keyboard : false,
                        backdrop : "static",
                      });
                      
                    //$("#new-scrape").modal("show");
                }


            })
        
        
        
        }
//   }   


//   else if (search_loader.getAttribute("href") === "#"){

//     //console.log("the link is #")
//     window.location.href = "#";
//   }

  else {

    if(document.getElementById("button").value.trim() != ""){
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
days = string(Math.round(staleness));

// //console.log(scrape_date_object);
// //console.log(today_date_object);
// //console.log(staleness);
// //console.log(days);

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
    global_youtube_code = youtube_code;
    //console.log(`youtube code: ${global_youtube_code}`);
    if ((not_found_in_db === "0" || not_found_in_db === "")){
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
        //document.getElementById("new-scrape-href").href = "/pull?name=" + youtube_code;


    }

}

function resetURL(){

    // $("#new-scrape").modal("hide");
    // $('#new-scrape').data('bs.modal',null); 

    // $("#new-scrape").modal({
    //     keyboard : false,
    //     backdrop : "static",
    //   });
    if (document.getElementById('new-scrape-cancel') !== null){
        document.getElementById('new-scrape-cancel').style.display = "block";
    }    
    progress_bar_2.style.visibility = "visible"; 
    ok_button = document.getElementById("new-scrape-ok-button");
    ok_button.innerHTML = "Getting URLs...";
    ok_button.setAttribute("data-dismiss","");

    ok_link = document.getElementById("new-scrape-href");
    ok_link.style.display = "none";

    document.getElementById("new-scrape-close").style.visibility = "hidden";

    //console.log(`youtube code: ${global_youtube_code}`);
    //progress_bar.style.visibility = "visible"; 


    d3.json("/pull?name=" + global_youtube_code).then(function(data){
        //console.log(data);
        //percentComplete();
        var completeness = data["PERCENT_COMPLETE"]
        var error = data["ERROR"];
        job_key = data["JOB_KEY"];
        //console.log(`pull job key : ${job_key}`)
        //console.log(`completeness: ${completeness}`);
        percentComplete(job_key,error);
       // if (error === 0){
       //     window.location.href = `/query?name=${global_youtube_code.replace("-","_replaced_")}&analytics=base`}
       // else{
       //     window.location.href = "/error";
        //}

        //window.location.hostname + 

    })



}

// function cancelRequest(){

//     $("#new-scrape").modal("hide");
//     $('#new-scrape').data('bs.modal',null); 

//     if (window.location.href.includes("page")){

//         window.location.href = "/cancel?page=3&name=" + window.location.href.split("old=")[1].split("&page=1")[0];
//     }

//     else{
//         window.location.href = "/cancel";}
    

// }

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

function updateData(id, days_since_scraped){
    // //console.log(`scrape date: ${id}`)
    // document.getElementById("profile-scrape-date").innerHTML += `&nbsp;&nbsp;${id}`;
    scrape_date = id;
    id = id.split("_")[1];
    
    // if (document.getElementById(id).href !== null){
    // analytics_url = document.getElementById(id).href;}

    if (window.location.href.includes("reportbug") === false){

    analytics_url = window.location.href.split("name=")[1].split("&")[0];
    
    update_url = "/update?name=" + analytics_url
    pull_url = "/pull?name=" + analytics_url
    
    // scrape_date_object = new Date(scrape_date + "Z");
    // today_date_object = Date.now();

    // staleness = (Math.abs(today_date_object - scrape_date_object))/(1000*60*60*24);
    // days = Math.round(staleness);
    //console.log(days_since_scraped);
    days = parseInt(days_since_scraped);
    //console.log(days);
    // //console.log(scrape_date_object);
    // //console.log(today_date_object);
    // //console.log(staleness);
    // //console.log(days);
    

    getPullURL(update_url, days);}
}

function getPullURL(update_url, days){

    // last_retrieved_link = document.getElementById(id_orig);

    if (days < 2){

        document.getElementById("update-data").style.visibility = "hidden";



        }


    else {
       document.getElementById("update-data").innerHTML = '<button style="position:absolute;right:133px;top:14px;font-weight:100" type="button" class="btn btn-sm btn-secondary" data-toggle="modal" data-target="#initialePull" onclick="showUpdateModal()">Update Data</button>';
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
    //    document.getElementById("pull-href").href = update_url;

       document.getElementById("modal-body-text").innerHTML
       += `The data for this content creator was retrieved ${days} 
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
//     //console.log(event);
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

    // total_views = parseInt(views.split(" ")[0]);
    // //console.log(total_views)

    // if (total_views > 1000000 && total_views < 10000000){

    //     document.getElementById("profile-name").innerHTML += "&nbsp;⭑";

    // }

    // else if (total_views > 10000000 && total_views < 100000000){

    //     document.getElementById("profile-name").innerHTML += "&nbsp;⭑&nbsp;⭑";

    // }

    // else if (total_views > 100000000){

    //     document.getElementById("profile-name").innerHTML += "&nbsp;⭑&nbsp;⭑&nbsp;⭑";

    // }


}

// function cancelFix(){

// if(window.location.href.includes("cancel") && document.referrer.includes("page=1") === false){

//     window.location.href = "/";

// }

// else if (window.location.href.includes("cancel") && document.referrer.includes("query"))
// window.history.go(-3);
// document.getElementById('button').value = '';



// }

function clearSearch(){
    document.getElementById('button').value = '';
    
}


function reportingRedirect(){

    if(window.location.href.includes("page=home")){

        window.location.href = "/"
  }

  else if(window.location.href.includes("reportbug") && window.location.href.includes("page=1")){

    window.location.href = "/query?name=" + window.location.href.split("db=")[1].split("&page=1")[0] + "&analytics=base";
  }

  else if(window.location.href.includes("cancel") && window.location.href.includes("page=3")){

    window.location.href = "/query?name=" + window.location.href.split("name=")[1] + "&analytics=base";
  }
}


$('#bugModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('whatever') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    modal.find('.modal-title').text('Feedback')
    modal.find('.modal-body input').val(recipient)
  })

  function preventEnter(event){

    if (event.keyCode === 13){

        event.preventDefault();

    }


  }

  function channelLink(artist_code_link){

    //var code = window.location.href.split("=")[1].split("&")[0].replace("_replaced_","-").replace("_replaced_","-");

    var new_link = "https://www.youtube.com/channel/" + artist_code_link.replace(/_replaced_/g,"-");

    document.getElementById("channel-link").href = new_link;



  }

function infiniteScroll(){
    // for(var i = 0;i<1*counter;i++){
    infinite_counter = infinite_counter + 1;
    d3.json(`/infiniteScroll?deck=${infinite_counter}`).then(function(data) {
        //console.log(data);
        if (data[0] != undefined && data[1] != undefined && data[2] != undefined && data[3] != undefined && data[4] != undefined && data[5] != undefined && data[6] != undefined && data[7] != undefined && data[8] != undefined && data[9] != undefined && data[10] != undefined && data[11] != undefined){ 
        //First Set
        var analytics_base_url_0 = "/query?name=" + data[0]["artist_code"] + "&analytics=base";
        var analytics_base_url_1 = "/query?name=" + data[1]["artist_code"] + "&analytics=base";
        var analytics_base_url_2 = "/query?name=" + data[2]["artist_code"] + "&analytics=base";
        var analytics_base_url_3 = "/query?name=" + data[3]["artist_code"] + "&analytics=base";

        var artist_name_0 = data[0]["artist"];
        var artist_name_1 = data[1]["artist"];
        var artist_name_2 = data[2]["artist"];
        var artist_name_3 = data[3]["artist"];

        var artist_image_0 = data[0]["artist_image"];
        var artist_image_1 = data[1]["artist_image"];
        var artist_image_2 = data[2]["artist_image"];
        var artist_image_3 = data[3]["artist_image"];

        //Second Set
        var analytics_base_url_4 = "/query?name=" + data[4]["artist_code"] + "&analytics=base";
        var analytics_base_url_5 = "/query?name=" + data[5]["artist_code"] + "&analytics=base";
        var analytics_base_url_6 = "/query?name=" + data[6]["artist_code"] + "&analytics=base";
        var analytics_base_url_7 = "/query?name=" + data[7]["artist_code"] + "&analytics=base";

        var artist_name_4 = data[4]["artist"];
        var artist_name_5 = data[5]["artist"];
        var artist_name_6 = data[6]["artist"];
        var artist_name_7 = data[7]["artist"];

        var artist_image_4 = data[4]["artist_image"];
        var artist_image_5 = data[5]["artist_image"];
        var artist_image_6 = data[6]["artist_image"];
        var artist_image_7 = data[7]["artist_image"];

        //Third Set
        var analytics_base_url_8 = "/query?name=" + data[8]["artist_code"] + "&analytics=base";
        var analytics_base_url_9 = "/query?name=" + data[9]["artist_code"] + "&analytics=base";
        var analytics_base_url_10 = "/query?name=" + data[10]["artist_code"] + "&analytics=base";
        var analytics_base_url_11 = "/query?name=" + data[11]["artist_code"] + "&analytics=base";

        var artist_name_8 = data[8]["artist"];
        var artist_name_9 = data[9]["artist"];
        var artist_name_10 = data[10]["artist"];
        var artist_name_11 = data[11]["artist"];

        var artist_image_8 = data[8]["artist_image"];
        var artist_image_9 = data[9]["artist_image"];
        var artist_image_10 = data[10]["artist_image"];
        var artist_image_11 = data[11]["artist_image"];        

    
        var new_deck = `
                        <div class="container-fluid">
                         

                            <div class="row">
                                <div class="col-8 mx-auto">

                                    <!-- Card 1 -->
                                    <div class="card-deck">
                                        <div class="card shadow-sm card-bg ml-3 mb-5">
                                            <div class="zoom">
                                                    <a href="${analytics_base_url_0}">
                                                    <img class="card-img-top image" src="${artist_image_0}" alt="Card image cap">
                                                    </a>
                                            </div>

                                            <div class="card-body text-center">
                                                <h5 class="card-title">${artist_name_0}</h5>
                                            </div>

                                        </div>


                                <!-- Card 2 -->
                                <div class="card shadow-sm card-bg ml-3 mb-5">
                                       <div class="zoom">
                                               <a href="${analytics_base_url_1}">
                                               <img class="card-img-top image" src="${artist_image_1}" alt="Card image cap">
                                               </a>
                                       </div>

                                    <div class="card-body text-center">
                                        <h5 class="card-title">${artist_name_1}</h5>

                                    </div>
                                    </div>

                                <!-- Card 3 -->
                                <div class="card shadow-sm card-bg ml-3 mb-5">
                                       <div class="zoom">
                                               <a href="${analytics_base_url_2}">
                                               <img class="card-img-top image" src="${artist_image_2}" alt="Card image cap">
                                               </a>
                                       </div>

                                    <div class="card-body text-center">
                                        <h5 class="card-title">${artist_name_2}</h5>

                                    </div>

                                </div>
                                <!-- Card 4 -->
                                <div class="card shadow-sm card-bg ml-3 mb-5">
                                       <div class="zoom">
                                               <a href="${analytics_base_url_3}">
                                               <img class="card-img-top image" src="${artist_image_3}" alt="Card image cap">
                                               </a>
                                       </div>

                                    <div class="card-body text-center">
                                        <h5 class="card-title">${artist_name_3}</h5>

                                    </div>

                                </div>

                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                <div class="container-fluid">
                         

                <div class="row">
                    <div class="col-8 mx-auto">

                        <!-- Card 1 -->
                        <div class="card-deck">
                            <div class="card shadow-sm card-bg ml-3 mb-5">
                                <div class="zoom">
                                        <a href="${analytics_base_url_4}">
                                        <img class="card-img-top image" src="${artist_image_4}" alt="Card image cap">
                                        </a>
                                </div>

                                <div class="card-body text-center">
                                    <h5 class="card-title">${artist_name_4}</h5>
                                </div>

                            </div>


                    <!-- Card 2 -->
                    <div class="card shadow-sm card-bg ml-3 mb-5">
                           <div class="zoom">
                                   <a href="${analytics_base_url_5}">
                                   <img class="card-img-top image" src="${artist_image_5}" alt="Card image cap">
                                   </a>
                           </div>

                        <div class="card-body text-center">
                            <h5 class="card-title">${artist_name_5}</h5>

                        </div>
                        </div>

                    <!-- Card 3 -->
                    <div class="card shadow-sm card-bg ml-3 mb-5">
                           <div class="zoom">
                                   <a href="${analytics_base_url_6}">
                                   <img class="card-img-top image" src="${artist_image_6}" alt="Card image cap">
                                   </a>
                           </div>

                        <div class="card-body text-center">
                            <h5 class="card-title">${artist_name_6}</h5>

                        </div>

                    </div>
                    <!-- Card 4 -->
                    <div class="card shadow-sm card-bg ml-3 mb-5">
                           <div class="zoom">
                                   <a href="${analytics_base_url_7}">
                                   <img class="card-img-top image" src="${artist_image_7}" alt="Card image cap">
                                   </a>
                           </div>

                        <div class="card-body text-center">
                            <h5 class="card-title">${artist_name_7}</h5>

                        </div>

                    </div>

                </div>
            </div>
            </div>
        </div>
    </div>
 
    <div class="container-fluid">
                         

    <div class="row">
        <div class="col-8 mx-auto">

            <!-- Card 1 -->
            <div class="card-deck">
                <div class="card shadow-sm card-bg ml-3 mb-5">
                    <div class="zoom">
                            <a href="${analytics_base_url_8}">
                            <img class="card-img-top image" src="${artist_image_8}" alt="Card image cap">
                            </a>
                    </div>

                    <div class="card-body text-center">
                        <h5 class="card-title">${artist_name_8}</h5>
                    </div>

                </div>


        <!-- Card 2 -->
        <div class="card shadow-sm card-bg ml-3 mb-5">
               <div class="zoom">
                       <a href="${analytics_base_url_9}">
                       <img class="card-img-top image" src="${artist_image_9}" alt="Card image cap">
                       </a>
               </div>

            <div class="card-body text-center">
                <h5 class="card-title">${artist_name_9}</h5>

            </div>
            </div>

        <!-- Card 3 -->
        <div class="card shadow-sm card-bg ml-3 mb-5">
               <div class="zoom">
                       <a href="${analytics_base_url_10}">
                       <img class="card-img-top image" src="${artist_image_10}" alt="Card image cap">
                       </a>
               </div>

            <div class="card-body text-center">
                <h5 class="card-title">${artist_name_10}</h5>

            </div>

        </div>
        <!-- Card 4 -->
        <div class="card shadow-sm card-bg ml-3 mb-5">
               <div class="zoom">
                       <a href="${analytics_base_url_11}">
                       <img class="card-img-top image" src="${artist_image_11}" alt="Card image cap">
                       </a>
               </div>

            <div class="card-body text-center">
                <h5 class="card-title">${artist_name_11}</h5>

            </div>

        </div>

    </div>
</div>
</div>
</div>
</div>
 
    `
    
                //<span id="loader-${counter+1}"><img src="/static/load.gif" height="40" width="auto" style="display: block;margin-left: auto;margin-right: auto;"></span>


            // scrollDelay(new_deck);
                // //console.log(counter);
                // document.getElementById(`loader-${counter}`).style.display = "none";        
                if(document.getElementById('new-deck') != null){
                document.getElementById('new-deck').innerHTML += new_deck; }



    

                    }     
                    else{

                        //console.log("you have reached the end of the database!!!");
                        end_page = 1;
                        var ellipsis = document.getElementById("loading-total");
                        var end = document.getElementById("end");
                        ellipsis.style.display = "none";
                        end.style.display = "block";
                
                    }
      }
      
      
      
      );

    
    //   var end = document.getElementById("end");
    //   var ellipsis = document.getElementById("loading-total");
    //   end.style.display = "block";
    //   ellipsis.style.display = "none";
    // }
  }

// async function scrollDelay(new_deck){
//     await sleep(1000);
//     if(document.getElementById('new-deck') != null){
//         document.getElementById('new-deck').innerHTML += new_deck; }
//     //console.log("sleeping");
 

// }

async function ellipsisLoad(){ 
    var total = document.getElementById("loading-total");
    total.style.display = "none";
    var ellipsis;
    while(1){
        await sleep_2(300);

        ellipsis = document.getElementById("load-ellipsis");

        // await(100);
        if(ellipsis.innerHTML === "..."){

            ellipsis.innerHTML = ".";
            
        }

        else if(ellipsis.innerHMTL = "."){

            ellipsis.innerHTML += ".";
        }

        else if(ellipsis.innerHTML === ".."){

            ellipsis.innerHTML += ".";
        }
    }
}
//   $(window).scroll(function(){
//     var scroll_ratio = (window.pageYOffset/document.documentElement.scrollHeight);

//     if (scroll_ratio >= 0.2+scroller){
//         counter = counter + 1;
//         scroller = 0.01*counter;

//         infiniteScroll();

//     }
  
//   });

// $(window).scroll(function(){
//     var scroll_ratio = (window.pageYOffset/document.documentElement.scrollHeight);
//     //console.log(`ratio${scroll_ratio}`);
//     // //console.log(0.21+scroller);
//     // if (scroll_ratio >= 0.20+scroller){
        
//     //     counter = counter + 0.10;
//     //     scroller = 0.01+counter*counter
        
//     //     infiniteScroll();

//     // }
  
//   });



  $(window).scroll(async function() {
        if (window.location.href.includes("query") == false){opacityNav()};
  // if($(window).scrollTop() + $(window).height() > $(document).height()-250*scroller) {
     if($(window).scrollTop() + $(window).height() > $(document).height()-250*scroller && end_page === 0) {     
        scroller++;
        

        //console.log(scroller);
        //console.log("im calling infinite scroll and there is nothing you can do about it")
        var ellipsis = document.getElementById("loading-total");
        var end = document.getElementById("end");
        ellipsis.style.display = "block";
        end.style.display = "none";
        // await sleep(500);
        infiniteScroll();


    }
 });

//  $(window).scroll(function() {
//     if($(window).scrollTop() + $(window).height() > $(document).height()-25) {
//         //console.log("reached very end")
//         var ellipsis = document.getElementById("loading-total");
//         var end = document.getElementById("end");
//         ellipsis.style.display = "none";
//         end.style.display = "block";
        
//     } 
//  });
 

function showUpdateModal(){


    $('#initiatePull').modal({backdrop:'static',
    keyboard: false,
    });

}


function updateScrape(youtube_code){

document.getElementById("update-scrape-load").style.display = "block";
ok_button = document.getElementById("pull-href");
// ok_button.innerHTML = "Please wait...";
// ok_button.setAttribute("data-dismiss","");
ok_button.style.visibility = "hidden";

document.getElementById("modal-cancel-2").innerHTML += '<button type="button" id="update-wait-button" class="btn btn-sm btn-secondary">Getting URLs...</button>'
document.getElementById("modal-cancel-2").innerHTML += `<button onclick="killUpdateJob()" class="btn btn-sm btn-danger" type="button" class="link_color_2" id="update-scrape-cancel-1" data-dismiss="modal">Cancel</button>            
&nbsp;&nbsp;&nbsp;`;

ok_link = document.getElementById("update-cancel");
ok_link.style.display = "none";

document.getElementById("new-scrape-close-2").style.visibility = "hidden";


  

d3.json(`/update?name=${global_update_code}`).then(function(data){
    //console.log(data);
    query_url = window.location.hostname + `/query?name=${global_update_code.replace("-","_replaced_")}&analytics=base`;
    //console.log(`query url : ${query_url}`);
    job_key = data["JOB_KEY"];
    //console.log(`update job key: ${job_key}`);
    var error = data["ERROR"];
    //window.location.href = `/query?name=${global_update_code.replace("-","_replaced_")}&analytics=base`;
    updatePercentComplete(job_key,error);

})

}


function sleep_2(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  
async function percentComplete(job_key,error){
    var kill = 0;
    for (var i = 0 ; i < 1000; i++){
      
    await sleep(1000);
    if (kill === 0 || kill === undefined){
    d3.json(`/loading?job_key=${job_key}`).then(async function(percent){
        kill = percent["KILL"];
        var too_many = percent["TOO_MANY"];
        //console.log(`kill value in d3 call: ${kill}`);
        var percent_complete = percent["PERCENT_COMPLETE"];
        var error = percent["ERROR"];
        // //console.log(percent);
        global_youtube_code = global_youtube_code.replace("-","_replaced_");
        document.getElementById("scrape-load-bar").style.cssText = `width : ${percent_complete}%`;
        //console.log(percent_complete);

        if (percent_complete == 101 || percent_complete == 100){
            document.getElementById("new-scrape-ok-button").innerHTML = "Getting URLs...";
        }
        

        // else if (percent_complete == 101){

        //     document.getElementById("new-scrape-ok-button").innerHTML = "100%";
        // }    

        else{
            document.getElementById("new-scrape-ok-button").innerHTML = `${percent_complete}%`;
            }

        kill = percent["KILL"];
        // if (kill === 1){
        //    document.getElementById("pull-href").style.visibility = "visible";
        //    document.getElementById("modal-cancel-2").innerHTML = "";
        //    document.getElementById("update-cancel").style.display = "block";
        //    break; 
        // }

        if (percent_complete === 101 && kill != 1){
            window.location.href = `/query?name=${global_youtube_code}&analytics=base`}
        if (error === 1){
            if (too_many == 1){
                window.location.href = "/error?overflow=1";
            }
            
                else{
                window.location.href = "/error"

            }
        }

    })}

    else{
        document.getElementById("new-scrape-ok-button").innerHTML = "Close";
        break;
    }
    }


  }

  async function updatePercentComplete(job_key,error){
    var kill = 0;

    for (var i = 0 ; i < 1000; i++){
      
    await sleep(1000);

    if (kill === 0 || kill === undefined){
    //console.log(`kill value: ${kill}`);
    d3.json(`/loading?job_key=${job_key}`).then(async function(percent){
        kill = percent["KILL"];
        //console.log(`kill value in d3 call: ${kill}`);
        var too_many = percent["TOO_MANY"];
        var percent_complete = percent["PERCENT_COMPLETE"];
        var error = percent["ERROR"];
        // //console.log(percent);
        global_update_code = global_update_code.replace("-","_replaced_");
        document.getElementById("update-scrape-fix").style.cssText = `width : ${percent_complete}%;height:7px`;

        if (percent_complete == 100 || percent_complete == 101){
            document.getElementById("update-wait-button").innerHTML = "Getting URLs...";
        }
        // else if (percent_complete == 101){

        //     document.getElementById("new-scrape-ok-button").innerHTML = "100%";
        // }    

        else{
            document.getElementById("update-wait-button").innerHTML = `${percent_complete}%`;
            }

        if (percent_complete === 101 && kill != 1){
            window.location.href = `/query?name=${global_update_code}&analytics=base`}
        if (error === 1){
            if (too_many == 1){
                window.location.href = "/error?overflow=1";
            }
            
                else{
                window.location.href = "/error"

            }
        }

    })}
    
    
    else{
        // document.getElementById("pull-href").style.visibility = "visible";
        // document.getElementById("modal-cancel-2").innerHTML = "";
        // document.getElementById("update-cancel").style.display = "block";
        // document.getElementById("modal-cancel-2").innerHTML = '<button id = "update-cancel" type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">Close</button><button class="btn btn-sm btn-primary" role="button" class="link_color_2" id="pull-href" onclick="updateScrape()">OK</button>&nbsp;&nbsp;&nbsp;'
        // document.getElementById("update-scrape-load").style.display = "none";
        document.getElementById("new-scrape-ok-button").innerHTML = "Close";
        break; 

    }
    }


  } 

  function setCancelURL(youtube_code){
    global_update_code = youtube_code;
    //console.log(`update code: ${global_update_code}`)
    artist_db_name = youtube_code;

    // //console.log(youtube_code);

    //document.getElementById("new-scrape-cancel").href = "/cancel?name=" + youtube_code + "&page=3";

    

    
  }

  if (document.getElementById('new-scrape-cancel') !== null){
    document.getElementById('new-scrape-cancel').style.display = "none";

  }

//   //console.log(artist_db_name);

// if (window.location.href.includes("page=7")){

// document.getElementById('feedback-success').innerHTML = `<div class="alert alert-primary alert-dismissible fade show" role="alert">
// Feedback submitted
// </div>`
// }

function hideSearch(){
    //document.getElementById("search-hide").style.visibility = "hidden";
}

function opacityNav(){

    document.getElementById("navbar-1-analytics").style.cssText='opacity:0.5;transition:0.3s';

    setTimeout(externalNav,1000);
    

}

function externalNav(){
    document.getElementById("navbar-1-analytics").style.cssText='opacity:1;transition:0.3s';
}

function killNewJob(){



        $('#new-scrape').modal('hide');
  
        document.getElementById('new-scrape-cancel').style.display = "none";
 
        progress_bar_2.style.visibility = "hidden"; 
        ok_button = document.getElementById("new-scrape-ok-button");
        ok_button.innerHTML = "Close";
        ok_button.setAttribute("data-dismiss","modal");
    
        ok_link = document.getElementById("new-scrape-href");
        ok_link.style.display = "block";
    
        document.getElementById("new-scrape-close").style.visibility = "visible";







        //console.log(`killing job ${job_key}`)
        d3.json(`/killJob?job_key=${job_key}`).then(function(data){

            //console.log(`job ${job_key} was killed...`)


        })


}

function killUpdateJob(element){

    $('#initiatePull').modal('hide');
    document.getElementById("modal-cancel-2").innerHTML = '<button id = "update-cancel" type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">Close</button><button class="btn btn-sm btn-primary" role="button" class="link_color_2" id="pull-href" onclick="updateScrape()">OK</button>&nbsp;&nbsp;&nbsp;'
    document.getElementById("update-scrape-load").style.display = "none";
    
    // if (element.id === "new-scrape-cancel"){
        //console.log(`killing job ${job_key}`)
        d3.json(`/killJob?job_key=${job_key}`).then(function(data){

            //console.log(`job ${job_key} was killed...`)


        })
        // kill = 1;
    }

    // else if (element.id === "update-scrape-cancel-1" || element.id === "update-scrape-cancel-2"){
    //     d3.json(`/killJob?job_key=${}`).then(function(data){

    //         //console.log(`job ${job_key} was killed...`)


    //     })}        


// }

function checkJS(){

    document.getElementById("js-fix").style.display = "block";
    

}


function asyncQuery(){




    
}

function hideLogo(){
    if (document.documentElement.clientWidth < 600){
        document.getElementsByClassName("header2")[0].style.visibility = "hidden";
    }
    
    else{
        document.getElementsByClassName("header2")[0].style.visibility = "visible";
    
    }}