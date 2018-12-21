// Setting up variables
var search_button = d3.select("#button");
var progress_bar = document.getElementById("load-bar");
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
var loading_warning = document.getElementById("loading");
var search_results = "";

progress_bar.style.visibility = "hidden";
loading_warning.style.visibility = "hidden";

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

    else
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

function load_bar(){
    if (d3.event !== null){
            input = d3.event.target.value;   
    
            search_button.on("change", search(input));

            progress_bar.style.visibility = "visible"; 
            loading_warning.style.visibility = "visible";
            window.location.href = url;
    }
}

function generateURL(){
    input = d3.event.target.value;
    url = "/query?name=" + input.trim();

    if(url === "/query?name="){
        url = "#";
     
    }

    document.getElementById("link_button").href=url;
    if (event.keyCode === 13) {
        load_bar();
    }
}

search_button.on("keyup", generateURL);

if (d3.event !== null){
input = d3.event.target.value;   
search_button.on("change", search(input));
}

if (window.history.replaceState) {
    window.history.replaceState( null, null, window.location.href);
}