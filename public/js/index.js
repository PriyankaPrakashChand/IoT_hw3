var thita = null;
var angle = 0;
var remember;
var email;

var client = new Paho.MQTT.Client(
  "localhost",
  9001,
  "myclientid_" + parseInt(Math.random() * 100, 10)
);

window.onload = function () {
  //------------1- connect to mqtt broker-------------
  var options = {
    timeout: 3,
    onSuccess: function () {
      console.log("mqtt connected");
      client.subscribe("IOThw3/loc", { qos: 2 });
    },
    onFailure: function (message) {
      console.log("Connection failed: " + message.errorMessage);
    },
  };
  client.connect(options);

  //------get session details--------------
  $.ajax({
    type: "get",
    url: "http://localhost:8089/session_details",

    success: function (session_data) {
      console.log(session_data);
      user_info = session_data;
      console.log(user_info);

      // if email not found means user not logged in
      if (!user_info.email) {
        // window.location.href = "Error.html";
      } else {
        if (user_info.first_login) {
          $("#name").text(user_info.name);
        } else {
          remember = user_info.remember;
          email = user_info.email;
        }
      }
    },
    dataType: "json",
    error: function () {
      console.log("error");
    },
  });

  //------------- Load Map----------------------
};

client.onMessageArrived = function (data) {
  // data = JSON.parse(data);
  window.coords = data;
  d = JSON.parse(data._getPayloadString());
  console.log("cooardinates=");
  console.log(d);
  window.thita = Math.tan((d.eLng - d.sLng) / (d.eLat - d.sLat));
  if (thita < 0) angle = 0;
  else angle = (thita * 180) / Math.PI;
  console.log(angle);

  $(".angle").css("transform", "rotate(" + angle + "deg)");
};

//---------other mqtt---- functions
client.onConnectionLost = function (responseObject) {
  console.log("connection lost: " + responseObject.errorMessage);
};
