// ///<reference path= "typings/index.d.ts"/>
// var endLocation;
// var startLocation;
// var map;
// var routeLayer;
// var directions;
// var startMarker;
// var endMarker = null;
// var routeLayer;

// //--------------
// var email;
// var remember;
// var client = new Paho.MQTT.Client(
//   "localhost",
//   9001,
//   "myclientid_" + parseInt(Math.random() * 100, 10)
// );

// //--------------
// window.onload = function () {
//   //------------1- connect to mqtt broker-------------
//   var options = {
//     timeout: 3,
//     onSuccess: function () {
//       console.log("mqtt connected");
//     },
//     onFailure: function (message) {
//       console.log("Connection failed: " + message.errorMessage);
//     },
//   };
//   client.connect(options);

//   //------get session details--------------
//   $.ajax({
//     type: "get",
//     url: "http://localhost:8089/session_details",

//     success: function (session_data) {
//       console.log(session_data);
//       user_info = session_data;
//       console.log(user_info);

//       // if email not found means user not logged in
//       if (!user_info.email) {
//         // window.location.href = "Error.html";
//       } else {
//         if (user_info.first_login) {
//           $("#name").text(user_info.name);
//         } else {
//           var info = "Welcome Back" + user_info.name;
//           $("#name").text(info);
//           info = "Last Access Time: " + user_info.last_access_time;
//           $("#time").text(info);
//         }
//       }
//     },
//     dataType: "json",
//     error: function () {
//       console.log("error");
//     },
//   });

//   //------------- Load Map----------------------
// };

// map = new L.map("map", {
//   layers: [new MQ.mapLayer()],
//   center: [0, 0],
//   zoom: 12,
// });
// //------------------get initial current location------------------
// var currentLocationOptions = {
//   enableHighAccuracy: true,
//   timeout: 1000, //1second
//   maximumAge: 0, // dont need cache, retrieve on the spot
// };

// function logCurrentPostionError(err) {
//   console.warn(`ERROR(${err.code}): ${err.message}`);
// }

// navigator.geolocation.getCurrentPosition(
//   getCurrentLocation,
//   logCurrentPostionError,
//   currentLocationOptions
// );

// function getCurrentLocation(position) {
//   window.startLocation = {
//     latitude: position.coords.latitude,
//     longitude: position.coords.longitude,
//   };
//   window.startMarker = new L.marker(
//     [
//       startLocation.latitude,
//       startLocation.longitude,
//     ] /*,
//     { draggable: true }*/
//   );
//   window.startMarker.bindPopup("You are here!");
//   map.addLayer(window.startMarker);
//   map.setView([window.startLocation.latitude, window.startLocation.longitude]);

//   console.log("latitude= " + window.startLocation.latitude);
//   console.log("longitude= " + window.startLocation.longitude);
// }

// //------------------------------watch Location-----------------------------------
// map.locate({ setView: true, watch: true });
// map.on("locationfound", function (coords) {
//   postNewLocation(coords);
// });

// //------------------jquery publish location to express server-----------------------

// //  click to set destination
// map.on("click", function (e) {
//   var currentLocation = [e.latlng.lat, e.latlng.lng];
//   // move the marker

//   var notAdded = window.endMarker === null;
//   if (notAdded) {
//     window.endMarker = new L.marker(currentLocation);
//     map.addLayer(window.endMarker);
//   }
//   // setdestination
//   else {
//     window.endMarker.setLatLng(currentLocation);
//   }
//   // update route
//   updateRouteLayer();

//   // post initial Location
//   postInitialLocation();

//   // start posting change in Location
//   navigator.geolocation.watchPosition(
//     function (pos) {
//       console.log("I am being callled ..." + pos);
//     },
//     function error(err) {
//       console.warn("ERROR(" + err.code + "): " + err.message);
//     }
//   );
// });
// //---------------calculate and show Route on map--------------------------------
// function updateRouteLayer() {
//   if (routeLayer != null && map.hasLayer(routeLayer)) {
//     map.removeLayer(routeLayer);
//   }
//   directions = MQ.routing.directions();
//   window.directions.route({
//     locations: [
//       {
//         latLng: {
//           lat: window.startMarker._latlng.lat,
//           lng: window.startMarker._latlng.lng,
//         },
//       },
//       {
//         latLng: {
//           lat: window.endMarker._latlng.lat,
//           lng: window.endMarker._latlng.lng,
//         },
//       },
//     ],
//   });

//   routeLayer = MQ.routing.routeLayer({
//     directions: directions,
//     fitBounds: true,
//   });
//   map.addLayer(routeLayer);
// }

// //------------------jquery publish location to express server-----------------------
// function postInitialLocation() {
//   if (window.endMarker != null && window.startMarker != null) {
//     url = "http://localhost:8089";

//     // mqtt message
//     message = new Paho.MQTT.Message(
//       JSON.stringify({
//         Email: email,
//         sLat: window.startMarker._latlng.lat,
//         sLng: window.startMarker._latlng.lng,
//         eLat: lat,
//         eLng: lng,
//       })
//     );
//     message.destinationName = "IOThw3/loc";
//     client.send(message);
//   }
// }

// function postNewLocation(currentCoordinates) {
//   lat = currentCoordinates.latitude;
//   lng = currentCoordinates.longitude;
//   if (window.endMarker != null && window.startMarker != null) {
//     if (
//       lat != window.startMarker._latlng.lat &&
//       lng != window.startMarker._latlng.lng
//     ) {
//       // mqtt message
//       message = new Paho.MQTT.Message(
//         JSON.stringify({
//           Email: email,
//           sLat: window.startMarker._latlng.lat,
//           sLng: window.startMarker._latlng.lng,
//           eLat: lat,
//           eLng: lng,
//         })
//       );
//       message.destinationName = "IOThw3/loc";
//       client.send(message);
//     } else {
//       console.log("Same Position");
//     }
//   }
// }

// //------------------------------------------------------------------------

var endCoords = null;
var startCoords = null;

var map;
var dir;

var currentLayer;
var startMarker, endMarker;

var remember;
var email;

var wsbroker = "localhost"; //mqtt websocket enabled broker
var wsport = 9001; // port for above
var client = new Paho.MQTT.Client(
  wsbroker,
  wsport,
  "myclientid_" + parseInt(Math.random() * 100, 10)
);

window.onload = function () {
  //---------connect to paho----
  var options = {
    timeout: 3,
    onSuccess: function () {
      console.log("mqtt connected");
    },
    onFailure: function (message) {
      console.log("Connection failed: " + message.errorMessage);
    },
  };
  client.connect(options);

  //-------get session----------
  $.get("http://www.localhost:8089/session_details", function (data) {
    var user_info = data;
    console.log("received: " + JSON.stringify(user_info));

    //even without cookie consent, we store their email for essential function
    if (!user_info.email) {
      //  window.location.href = "Error.html";
    } else {
      //will be null without cookie consent
      if (user_info.first_login) {
        $("#name").text(user_info.name);
      } else {
        if (user_info.name) {
          $("#name").text("Welcome back " + user_info.name);
          $("#time").text("Last visited: " + user_info.visit_time);
        }
      }
      remember = user_info.remember;
      email = user_info.email;
    }
  });

  map = L.map("map", {
    layers: MQ.mapLayer(),
    center: [25.264, -55.2887],
    zoom: 10,
  });

  dir = MQ.routing.directions();

  map.locate({
    setView: true,
    maxZoom: 10,
    watch: true,
  });

  map.on("locationfound", function (e) {
    if (startMarker == null) {
      startMarker = new L.Marker(e.latlng);
      startMarker.bindPopup("Current Location").openPopup();
      map.addLayer(startMarker);
    } else {
      startMarker.setLatLng(e.latlng);
    }

    startCoords = e.latlng;
    if (endCoords != null) {
      updateRoute();
    }
  });

  map.on("click", function (e) {
    //alert("Lat, Lon : " + e.latlng.lat + ", " + e.latlng.lng)

    endCoords = e.latlng;

    if (endMarker == null) {
      endMarker = new L.Marker(e.latlng);
      endMarker.bindPopup("Destination").openPopup();
      map.addLayer(endMarker);
    } else {
      endMarker.setLatLng(e.latlng);
    }

    updateRoute();
  });
};

function updateRoute() {
  if (currentLayer != null && map.hasLayer(currentLayer)) {
    map.removeLayer(currentLayer);
  }
  dir.route({
    locations: [{ latLng: startCoords }, { latLng: endCoords }],
  });
  currentLayer = MQ.routing.routeLayer({
    directions: dir,
    fitBounds: true,
  });
  map.addLayer(currentLayer);

  // mqtt message
  message = new Paho.MQTT.Message(
    JSON.stringify({
      Email: email,
      sLat: startCoords.lat,
      sLng: startCoords.lng,
      eLat: endCoords.lat,
      eLng: endCoords.lng,
    })
  );
  message.destinationName = "IOThw3/loc";
  client.send(message);

  client.send(message);
}

window.addEventListener("beforeunload", function (e) {
  if (!remember) {
    $.get("http://localhost:8089/logout");
  }
});

//MQTT Below
client.onConnectionLost = function (responseObject) {
  console.log("connection lost: " + responseObject.errorMessage);
};
