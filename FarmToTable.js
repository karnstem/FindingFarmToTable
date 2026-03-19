
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

function add_third_layer(){
    fetch('FarmTrails3.json')
        .then(conversion2)
        .then(callback2)
};
//declare global map variables
var map;
var geojson;
var geojson_2;
var geojson_3;
var movableSymbol;
var rad_movableSymbol;
var search;
var provider;

provider = new window.GeoSearch.OpenStreetMapProvider();

//load icons and set two different sizes
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

var second_farm_icon = L.icon({
    iconUrl: 'Second_FarmMapSymbol.png',
    iconSize:[16,18.5],
    iconAnchor:[16,37],
    popupAnchor:[0,-28]

});

var second_farm_icon2 = L.icon({
    iconUrl: 'Second_FarmMapSymbol.png',
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

    //Add features to map
    geojson = L.geoJson(response2,{
        pointToLayer: function(feature,latlng){
            const coords = feature.geometry.coordinates;
            return L.marker([coords[1],coords[0]],{icon:farm_icon})
        },
        onEachFeature: onEachFeature1
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
        },
        onEachFeature: onEachFeature2
    }).addTo(map);

    add_third_layer();
}

//define conversion2 function
function conversion2(response_third){
  //convert data to usable form
  return response_third.json();
}

//define callback2 function
function callback2(response_third2){
    console.log(response_third2);

    //Add second set of features to map
     geojson_3 = L.geoJson(response_third2,
        {
            pointToLayer: function(feature,latlng){
                return L.marker(latlng,{icon:second_farm_icon})
            },
            onEachFeature: onEachFeature3
        }
    ).addTo(map);

    //Create home location and radius of travel (with slide)
    rad_movableSymbol = L.circle([44.0,-120.5],{
        radius: 80000,
        fillColor:'#8eb0a3',
        fillOpacity: 0.3,
        color:'#8eb0a3'
    }).addTo(map);

    movableSymbol = L.marker([44.0, -120.5],{
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
    "Oregon Farms & Ranches": geojson,
    "Oregon Seafood Locator": geojson_2,
    "Farm Trails": geojson_3
    };
    L.control.layers(null, Combined_Point_Layers, { collapsed: false, position: 'bottomleft'}).addTo(map);
    
    ModifyIcons();
    map.on('overlayadd', ModifyIcons);
    map.on('overlayremove', ModifyIcons);


    search = new window.GeoSearch.GeoSearchControl({
        provider: provider,
        style: 'bar',
        showMarker: false,
        retainZoomLevel: true,
    });
    map.addControl(search);

    map.on('geosearch/showlocation', function(result){
        let loc = result.location;

        movableSymbol.setLatLng([loc.y, loc.x]);
        rad_movableSymbol.setLatLng([loc.y, loc.x]);

        map.panTo([loc.y, loc.x]);
        ModifyIcons();
    });
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
    console.log('ModifyIcons called');
    let turf_circle_radius = FindRadius();

    let farmInfo = [];
    let fishInfo = [];
    let second_farmInfo = [];

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

    
    geojson_3.eachLayer(function(layer){
            let point = turf.point([layer.getLatLng().lng, layer.getLatLng().lat]);
            if(!map.hasLayer(layer)) return;

            let listname = layer.feature.properties.Name || layer.feature.properties.name || "Unknown Name";
            if (turf.booleanPointInPolygon(point, turf_circle_radius)){
                layer.setIcon(second_farm_icon2);
                second_farmInfo.push(listname);
                console.log('FarmTrails in radius:', listname);
            } else {
                layer.setIcon(second_farm_icon)
                };
        });

    let HTML_List = document.getElementById('displayAttributes');
    HTML_List.innerHTML = '';
    let all_info = farmInfo.concat(fishInfo);
    let all_info2 = all_info.concat(second_farmInfo)
    all_info2.forEach(name =>{
        let li = document.createElement('li');
        li.textContent = name;
        HTML_List.appendChild(li);
    });
    
}
//Each Feature 1
    function onEachFeature1(feature, layer) {
        popupfunction1(feature,layer);
    }
////
//Each Feature 2
    function onEachFeature2(feature, layer) {
        popupfunction2(feature,layer);
    }
////
//Each Feature 3
    function onEachFeature3(feature, layer) {
        popupfunction3(feature,layer);
    }

//define popup function
async function popupfunction1(feature,layer){
    var popupproperties = feature.properties;
    const popup_latlng = layer.getLatLng();
    var popupContent = " ";

    if (popupproperties.name){
        popupContent += `<p style= 'color: #098a58; font-weight: bold'>${popupproperties.name}</p>`;
    }
    
    if (popupproperties.description){
        var farm_description = (typeof popupproperties.description === "object" && popupproperties.description.value)
        ? popupproperties.description.value
        : popupproperties.description;
        popupContent += `<p style= 'color: #098a58; font-weight: bold'>Description:</p><p style= 'color: #098a58'>${farm_description}</p>`;
    }
        
    layer.bindPopup(popupContent, {maxHeight: 170});
    };

function popupfunction2(feature,layer){
    var popupproperties = feature.properties;
    var popupContent = " ";

    if (popupproperties.name){
        popupContent += `<p style= 'color: #098a58; font-weight: bold;'>${popupproperties.name}</p>`;
    }
    
    if (popupproperties.description){
        const fish_description = (typeof popupproperties.description === "object" && popupproperties.description.value)
        ? popupproperties.description.value
        : popupproperties.description;
        popupContent += `<p style= 'color: #098a58; font-weight: bold'>Contact Info:</p>`;
        popupContent += `<div style= 'color: #098a58;'>${fish_description}</div>`;
    }
    layer.bindPopup(popupContent, {maxHeight: 170});
    };

function popupfunction3(feature,layer){
    var popupproperties = feature.properties;
    var popupContent = " ";

    if (popupproperties.Name){
        popupContent += "<p style= 'color: #098a58; font-weight: bold'>" + popupproperties.Name +"</p>";
    }
    if (popupproperties.Location){
        popupContent += "<p style= 'color: #098a58; font-weight: bold'>Location:<p style= 'color: #098a58'>" + popupproperties.Location +"</p>";
    }
    if (popupproperties.Website){
        popupContent += "<p style= 'color: #098a58; font-weight: bold'>Contact Info:<p style= 'color: #098a58'>" + popupproperties.Website  + "<br>" + popupproperties.Phone +"</p>";
    }
    if (popupproperties.About){
        popupContent += "<p style= 'color: #098a58; font-weight: bold'>Description:<p style= 'color: #098a58'>" + popupproperties.About +"</p>";
    }
    layer.bindPopup(popupContent, {maxHeight: 170});
    };
   

window.onload = jsAjax;

