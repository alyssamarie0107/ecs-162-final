//------------------------------------------------------------------------------
// user has two options to enter the location
// 1. user can type in the location using the location search box
// --> when user types, a drop down of predicted/suggested places get displayed
// --> when user chooses/clicks on a place from drop down, the map will be
// --> utilizing the Places API Google Place Autocomplete feature
// centered at that place with a red marker
// 2. OR the user can interact with the map by clicking on the place they want
// and maps get centered there with a red marker and the location box will be
// automatically filled with the place they clicked on the map.
// --> utilizing Places API Geocoder feature
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// google 'simple' map & search box
//------------------------------------------------------------------------------

// global variables
var map, marker, google, geocoder, request; // google is defined to avoid errors

// Create the script tag, set the appropriate attributes
var script = document.createElement("script");
script.src =
  "https://maps.googleapis.com/maps/api/js?key=AIzaSyBT_0OJ7q-K8nxhs67RE3NzqZvN1UzSah8&callback=initMap&libraries=places&language=en";
script.defer = true;
script.async = true;

// The location of ucd memorial union
// using this to initialize the center of the map
var ucd_coord = {
  lat: 38.542378,
  lng: -121.749545
};

//------------------------------------------------------------------------------
// make search box for google map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// drop down pick list containing a mix of places and predicted search terms.
//------------------------------------------------------------------------------

window.initMap = function initAutocomplete() {
  // initialize map
  map = new google.maps.Map(document.getElementById("google-map"), {
    center: ucd_coord,
    zoom: 17
  });

  //----------------------------------------------------------------------------
  // option 1) user utilizes the search box by typing in a location. drop down
  // list of suggested/predicted addresses will be displayed
  //----------------------------------------------------------------------------

  // create search box and link it to the UI element (location-input)
  var input = document.getElementById("location-input");

  //.SearchBox creates a new instance of SearchBox that attaches to the
  //specified input text field with the given options
  var searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport.
  // bounds_change is a event fired when the rectangle's bounds are changed
  map.addListener("bounds_changed", function() {
    // setBounds --> sets the bounds of this rectangle
    //getBounds returns the bounds to which predications are biased
    searchBox.setBounds(map.getBounds());
  });

  marker = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  // places_changed is an event fired when the user selects a query, getPlaces
  // should be used to get new places
  searchBox.addListener("places_changed", function() {
    // getPlaces returns the query selected by the user, or null if no places
    // have been found yet, to be used with places_changed event
    var places = searchBox.getPlaces();

    // if no places have been Found
    if (places.length == 0) {
      return;
    }

    // clear out the old markers
    marker.forEach(function(marker) {
      // setMap renders the marker on the specified map. If map is set to null, the marker will be removed
      marker.setMap(null); // setting this to null will remove the marker
    });

    marker = [];

    // For each place, get the name and location.
    //LatLngBounds contructs a rectangle from the points at its south-west and
    // north-east corners
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      // checks to see if place has geometry
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      // Create a marker
      marker.push(
        new google.maps.Marker({
          map: map,
          title: place.name,
          position: place.geometry.location
        })
      );

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  //----------------------------------------------------------------------------
  // option 1) user utilizes the search box by typing in a location
  // referred to Google Maps demo provided by ECS 162
  //----------------------------------------------------------------------------

  // use the geocoder feature on this map
  geocoder = new google.maps.Geocoder();

  // get clicks on the map
  // use the Google Maps Reverse Geocoding feature to get addresses from lat and lng of a click
  map.addListener("click", function(mapsMouseEvent) {
    let clickPt = mapsMouseEvent.latLng;
    // longitude and latitude
    console.log("Lat: " + clickPt.lat(), "Lng: " + clickPt.lng());
    console.log("Reverse Geocoding...");
    let latlng = { lat: clickPt.lat(), lng: clickPt.lng() };
    geocoder.geocode({ location: latlng }, function(results, status) {
      if (status == "OK") {
        if (results[0]) {
          map.setZoom(17);
          // clear out the old markers
          marker.forEach(function(marker) {
            // setMap renders the marker on the specified map. If map is set to null, the marker will be removed
            marker.setMap(null); // setting this to null will remove the marker
          });
          // add marker
          marker.push(
            new google.maps.Marker({
              position: latlng,
              map: map
            })
          );
          console.log("Formatted Address: " + results[0].formatted_address);
          input = document.getElementById("location-input");
          input.innerHTML = results[0].formatted_address;
          // we want to insert the formatted_address to the location box
          document.getElementById("location-input").value =
            results[0].formatted_address;
        } else {
          console.log("no results found");
        }
      } else {
        console.log("geocoder failed due to: " + status);
      }
    });
  });
}; // end of initAutocomplete function

// Append the 'script' element to 'head'
document.head.appendChild(script);
