//Create color range for the circle diameter 
  function getColor(d){
    return d > 5 ? "#f44941":
    d  > 4 ? "#f48541":
    d > 3 ? "#f4c141":
    d > 2 ? "#f1f441":
    d > 1 ? "#c4f441":
             "#5ef441";
  }

//Create getRadius function for the radius of each circle,adjusted by 25000
  function getRadius(value){
    return value*25000
  }
// Create variables to store API endpoints inside queryURL
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// Perform a GET request to the query URL
d3.json(earthquakeURL, function(data) {
  // get a response=> send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  console.log(earthquakeData);

// Create a GeoJSON layer containing the features array on the earthquakeData object
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    },
    
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,{
        radius: getRadius(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .8,
        stroke: false
    })
  }
  });

// Send earthquakes layer to the createMap function
  createMap(earthquakes);
}


function createMap(earthquakes) {


    // Define outdoors,satellite and darkmap layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoidGJlcnRvbiIsImEiOiJjamRoanlkZXIwenp6MnFuOWVsbGo2cWhtIn0.zX40X0x50dpaN96rKQKarw." +
      "T6YbdDixkOBWH_k9GbS8JQ");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoidGJlcnRvbiIsImEiOiJjamRoanlkZXIwenp6MnFuOWVsbGo2cWhtIn0.zX40X0x50dpaN96rKQKarw." +
      "T6YbdDixkOBWH_k9GbS8JQ");


    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1IjoidGJlcnRvbiIsImEiOiJjamRoanlkZXIwenp6MnFuOWVsbGo2cWhtIn0.zX40X0x50dpaN96rKQKarw." +
      "T6YbdDixkOBWH_k9GbS8JQ");
  
    // Create a baseMaps object to hold base layers
    // Pass in baseMaps 
    var baseMaps = {
      "Outdoors": outdoors,
      "Satellite": satellite,
      "Dark Map": darkmap
    };


    // Create a layer for the tectonic plates
    var tectonicPlates = new L.LayerGroup();


    // Create overlay object to hold overlay layer
    var overlayMaps = {
      "Earthquakes": earthquakes,
      "Tectonic Plates": tectonicPlates
    };


    // Create map object
    var myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 3,
      layers: [outdoors, earthquakes, tectonicPlates]
    }); 


    // Add Fault lines data
    d3.json(tectonicPlatesURL, function(plateData) {
      // Add geoJSON data with style info to the tectonicplates
      // layer.
      L.geoJson(plateData, {
        color: "orange",
        weight: 2
      })
      .addTo(tectonicPlates);
  });

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);


  //Create a legend on the bottom right
  var legend = L.control({position: 'bottomright'});


    legend.onAdd = function(){
      var div = L.DomUtil.create('div', 'legend'),
        mag_level = [0, 1, 2, 3, 4, 5];
        
//Add legend description
        div.innerHTML = '';
  // loop through magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mag_level.length; i++) {
        div.innerHTML += 
            '<i style="background:' + getColor(mag_level[i] + 1) + '"></i> ' +
            mag_level[i] + (mag_level[i + 1] ? '&ndash;' + mag_level[i + 1] + '<br>' : '+');
    }
    return div;
  };


  legend.addTo(myMap);
}
   
