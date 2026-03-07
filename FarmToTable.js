
//GEOG 572 Lab 4
// Mackenzie Karnstein

//Note: ChatGTP was used to guide code development/editing [including for explaining javascript and Leaflet logistics, editing, and troubleshooting.]
//Load the data
function jsAjax(){
    //use Fetch to retrieve data
    
    fetch('FarmsRanch')
        .then(conversion) //convert data to usable form
        .then(callback) //send retrieved data to a callback function
    };

function add_second_layer(){
    fetch('Seafood')
        .then(conversion1)
        .then(callback1)    
    };

//declare global map variables
var map;
var geojson;
var geojson_2;

//define conversion function
function conversion(response){
  //convert data to usable form
  return response.json();
}

//define callback function
function callback(response2){

    console.log(response2);
    //create map element
    map = L.map('map').setView([44.0, -120.5], 7);
    //add tile layer
    var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Add features to map
    geojson = L.geoJson(response2).addTo(map);

    //start function for loading second layer
    add_second_layer();
}

//define conversion1 function
function conversion1(response_second){
  //convert data to usable form
  return response_second.json();
}

//define callback1 function
function callback1(response_second2){
    console.log(response_second2);

    //Add second set of features to map
     geojson_2 = L.geoJson(response_second2).addTo(map);

}
window.onload = jsAjax;

