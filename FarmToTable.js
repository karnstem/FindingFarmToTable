
//GEOG 572 FINAL PROJECT
// Mackenzie Karnstein

//Note: ChatGTP was used to guide code development/editing [including for explaining javascript and Leaflet logistics, editing, and troubleshooting.]
//Load the data
function jsAjax(){
    //use Fetch to retrieve data
    
    fetch('FarmsRanch.json')
        .then(conversion) //convert data to usable form
        .then(callback) //send retrieved data to a callback function
    };

function add_second_layer(){
    fetch('Seafood.json')
        .then(conversion1)
        .then(callback1)    
    };

//declare global map variables
var map;
var geojson;
var geojson_2;
var rad_movableSymbol;

//load icons
var farm_icon = L.icon({
    iconUrl: 'FarmMapSymbol.png',
    iconSize:[16,18.5],
    iconAnchor:[16,37],
    popupAnchor:[0,-28]

});

var farm_icon2 = L.icon({
    iconUrl: 'FarmMapSymbol.png',
    iconSize:[32,37],
    iconAnchor:[16,37],
    popupAnchor:[0,-28]

});

var fish_icon = L.icon({
    iconUrl: 'FishSymbol.png',
    iconSize:[16,18.5],
    iconAnchor:[16,37],
    popupAnchor:[0,-28]

});

var fish_icon2 = L.icon({
    iconUrl: 'FishSymbol.png',
    iconSize:[32,37],
    iconAnchor:[16,37],
    popupAnchor:[0,-28]

});

var my_home = L.icon({
    iconUrl: 'HouseSymbol.png',
    iconSize:[32,37],
    iconAnchor:[16,37],
    popupAnchor:[0,-28]

});



//define conversion function
function conversion(response){
  //convert data to usable form
  return response.json();
}

//define callback function
function callback(response2){

    console.log(response2);
    //create map element
    map = L.map('map').setView([44.0, -120.5], 6);
    //add tile layer
    
    var tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
    }).addTo(map);
    
    
    
    
  //  var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //      maxZoom: 19,
  //      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  //  }).addTo(map);

    //Add features to map
    geojson = L.geoJson(response2,{
        pointToLayer: function(feature,latlng){
            return L.marker(latlng,{icon:farm_icon})
        }
    }).addTo(map);

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
     geojson_2 = L.geoJson(response_second2,{
        pointToLayer: function(feature,latlng){
            return L.marker(latlng,{icon:fish_icon})
        }
    }).addTo(map);

    rad_movableSymbol = L.circle([44.0,-120.5],{
        radius: 80000,
        fillColor:'#8eb0a3',
        fillOpacity: 0.3,
        color:'#8eb0a3'
    }).addTo(map);

    var movableSymbol = L.marker([44.0, -120.5],{
        icon: my_home,
        draggable: true
    }).addTo(map);

    movableSymbol.on('drag', function(e){
        rad_movableSymbol.setLatLng(e.target.getLatLng());
        ModifyIcons();
    });

    var slide = document.getElementById('radiusSlide');

    slide.addEventListener('input', function(){
        rad_movableSymbol.setRadius(Number(slide.value));
        ModifyIcons();
    });

     extras()
}

function extras(extras_response){
    var Combined_Point_Layers = {
    "Farms": geojson,
    "Fish": geojson_2
    };
    L.control.layers(null, Combined_Point_Layers, { collapsed: false}).addTo(map);
    
    ModifyIcons();
    map.on('overlayadd', ModifyIcons);
    map.on('overlayremove', ModifyIcons);
};

function FindRadius(){
    let location = rad_movableSymbol.getLatLng();
    return turf.circle(
        [location.lng, location.lat],
        rad_movableSymbol.getRadius(),
        {steps: 64, units: 'meters'}
    );
}

function ModifyIcons(){
    if (!rad_movableSymbol) return;
    let turf_circle_radius = FindRadius();

    let farmInfo = [];
    let fishInfo = [];

    geojson.eachLayer(function(layer){
        let point = turf.point([layer.getLatLng().lng, layer.getLatLng().lat]);
        if(!map.hasLayer(layer)) return;
        if (turf.booleanPointInPolygon(point, turf_circle_radius)){
            layer.setIcon(farm_icon2);
            farmInfo.push(layer.feature.properties.name);
        } else {
            layer.setIcon(farm_icon)
            };
    });


    geojson_2.eachLayer(function(layer){
        let point = turf.point([layer.getLatLng().lng, layer.getLatLng().lat]);
        if(!map.hasLayer(layer)) return;
        if (turf.booleanPointInPolygon(point, turf_circle_radius)){
            layer.setIcon(fish_icon2);
            fishInfo.push(layer.feature.properties.name);
        } else {
            layer.setIcon(fish_icon)
            };
    });

    let HTML_List = document.getElementById('displayAttributes');
    HTML_List.innerHTML = '';
    let all_info = farmInfo.concat(fishInfo);
    all_info.forEach(name =>{
        let li = document.createElement('li');
        li.textContent = name;
        HTML_List.appendChild(li);
    });
    
}
window.onload = jsAjax;

