var search_button = d3.select("#button");
var i = 0;
var no_results = d3.select(".no_results");
var row_count =0;
var results = d3.select(".results");
var date_convert = "";
var dropdown = d3.select("#dropdown");
var dropdown_value = "";
var input = "";
var scrape_data = "";

// Get JSON Data from Flask
function getData(data) {
    if (scrape_data.length > 0 ){
    scrape_data = JSON.parse(data);
    }
}

//Get Data Function
function get_data_results(artist_name) {
    var search_results = [];
    for(i=0;i<scrape_data.length;i++)

    {
        if (artist_name.toUpperCase() === scrape_data[i]["ARTIST"].toUpperCase())
        {
            search_results.push(scrape_data[i]);
        }
    }
     return search_results;
  }

// Clear Rows before returning search results
  function deleteRows(rows){

    if (rows!=0)
    {
        for(counter=0;counter<rows;counter++)
        {
            document.getElementById("table_results").deleteRow(rows-counter);
        }
    }
}

//Search function
function search(input) {
    deleteRows(row_count);

    //dropdown_value = document.getElementById("dropdown").value;

    var search_results = get_data_results(input);


    // if(dropdown_value === "Artist")

    // {
    //     format(input);
    //     var search_results = get_date_results(input);
    // }
    
    // else if(dropdown_value === "State")

    // {
    //     var search_results = get_state_results(input);
    // }

    // else if(dropdown_value === "Country")

    // {
    //     var search_results = get_country_results(input);
    // }

    
    var counter = 0;
    row_count = search_results.length;

    if (row_count === 1)

    {
        results.text(`Returned ${row_count} row`);
    }

    else
    {
        results.text(`Returned ${row_count} rows`);
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
            
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3)
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);          
            var cell7 = row.insertCell(6); 
            var cell8 = row.insertCell(7);
            var cell9 = row.insertCell(8);
            var cell10 = row.insertCell(9);
            var cell11 = row.insertCell(10);
            var cell12 = row.insertCell(11);  
            var cell13 = row.insertCell(12);  
            var cell14 = row.insertCell(13);  
            var cell15 = row.insertCell(14);    
            var cell16 = row.insertCell(15);
            
            cell1.innerHTML = search_results[counter]["ARTIST"];
            cell2.innerHTML = search_results[counter]["SCRAPE_DATE"];
            cell3.innerHTML = search_results[counter]["SEARCH_NAME"];
            cell4.innerHTML = search_results[counter]["JOINED"];
            cell5.innerHTML = search_results[counter]["SUBSCRIBERS"];
            cell6.innerHTML = search_results[counter]["TOTAL_VIEWS"];
            cell7.innerHTML = search_results[counter]["PUBLISHED"];
            cell8.innerHTML = search_results[counter]["TITLE"];
            cell9.innerHTML = search_results[counter]["CATEGORY"];
            cell10.innerHTML = search_results[counter]["DURATION"];
            cell11.innerHTML = search_results[counter]["VIEWS"];
            cell12.innerHTML = search_results[counter]["LIKES"];
            cell13.innerHTML = search_results[counter]["DISLIKES"];
            cell14.innerHTML = search_results[counter]["PAID"];
            cell15.innerHTML = search_results[counter]["FAMILY_FRIENDLY"];
            cell16.innerHTML = search_results[counter]["URL"];

            no_results.text("");
        }
    }
  }

function country()
{

    search_button.attr("placeholder","Enter Country");
    // search_button.transition().placeholder("Country");
    console.log("Country value selected");

}

function state()
{

    search_button.attr("placeholder","Enter State");
    // search_button.transition().placeholder("Country");
    console.log("State value selected");

}

function artist()
{

    search_button.attr("placeholder","Enter Artist");
    // search_button.transition().placeholder("Country");
    console.log("Date value selected");

}

function checked()
{

    dropdown_value = document.getElementById("dropdown").value;
    if (dropdown_value === "State")
    {
        console.log("dropdown is State");
        state();
    }

    else if (dropdown_value === "Artist")
    {
        console.log("dropdown is Date");
        date();
    }

    else if (dropdown_value === "Country")
    {
        console.log("dropdown is Country");
        country();
    }

}

function generateURL(){
    input = d3.event.target.value;
    url = "/query?name=" + input;
    document.getElementById("link_button").href=url; 
}


search_button.on("keyup", generateURL);

if (d3.event !== null){
input = d3.event.target.value;    
search_button.on("change", search(input));
}

dropdown.on("change", checked);
// country_dropdown.on("keyup", country);
// state_dropdown.on("keyup", state);
// date_dropdown.on("change", date);