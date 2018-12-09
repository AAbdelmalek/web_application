var tableData = data;
var search_button = d3.select("#button");
var i = 0;
var no_results = d3.select(".no_results");
var row_count =0;
var results = d3.select(".results");
var date_convert = "";
var dropdown = d3.select("#dropdown");
var dropdown_value = "";
var input = "";

//Get Data Function
function get_date_results(date) {
    var search_results = [];
    for(i=0;i<data.length;i++)

    {
        if (date === data[i]["datetime"])
        {
            search_results.push(data[i]);
        }
    }
     return search_results;
  }

  //Get State Function
function get_state_results(state) {
    var search_results = [];
    for(i=0;i<data.length;i++)

    {
        if (state === data[i]["state"])
        {
            search_results.push(data[i]);
        }
    }
     return search_results;
  }

  //Get Country Function
function get_country_results(country) {
    var search_results = [];
    for(i=0;i<data.length;i++)

    {
        if (country === data[i]["country"])
        {
            search_results.push(data[i]);
        }
    }
     return search_results;
  }

//Delete Function
function deleteRows(rows){
    if (rows!=0)
    {
        for(counter=0;counter<rows;counter++)
        {
            document.getElementById("UFO-table").deleteRow(rows-counter);
        }
    }
}

//Convert Date Function
function format(date)
{
    var slashes = 0;
    for(var i = 0;i<date.length;i++)
    {
        if (date[i] === "/")
        {
            slashes = slashes + 1;
            if (slashes === 1)
            {         
                month = date.slice(0,i);
                month_orig = month;
                if (month_orig[0] === "0")
                {
                    month = month_orig[1];
                }
            }
            else if (slashes === 2)
            {
                day = date.slice(month_orig.length+1,i)
                day_orig = day;
                if (day_orig[0] === "0")
                {
                    day = day_orig[1];
                }       
            }
        }
    }
    if (slashes > 0)
    {
    year = date.slice(date.length-4,date.length);
    }
    else
    {
        return date_convert = "null";
    }
    date_convert = month + "/" + day + "/" + year;
    input = date_convert;
}

//Search function
function search() {
    deleteRows(row_count);
    
    input = d3.event.target.value;
    dropdown_value = document.getElementById("dropdown").value;

    if(dropdown_value === "Date")

    {
        format(input);
        var search_results = get_date_results(input);
    }
    
    else if(dropdown_value === "State")

    {
        var search_results = get_state_results(input);
    }

    else if(dropdown_value === "Country")

    {
        var search_results = get_country_results(input);
    }

    
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
            
            var table = document.getElementById("UFO-table");
            var row = table.insertRow(counter+1);
            
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3)
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);          
            var cell7 = row.insertCell(6);   
            
            cell1.innerHTML = search_results[counter]["datetime"];
            cell2.innerHTML = search_results[counter]["city"];
            cell3.innerHTML = search_results[counter]["state"];
            cell4.innerHTML = search_results[counter]["country"];
            cell5.innerHTML = search_results[counter]["shape"];
            cell6.innerHTML = search_results[counter]["durationMinutes"];
            cell7.innerHTML = search_results[counter]["comments"];

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

function date()
{

    search_button.attr("placeholder","Enter Date (MM/DD/YYYY)");
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

    else if (dropdown_value === "Date")
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

search_button.on("keyup", search);
dropdown.on("change", checked);
// country_dropdown.on("keyup", country);
// state_dropdown.on("keyup", state);
// date_dropdown.on("change", date);