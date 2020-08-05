// var APIKey = "0df21c98a0faf830fca56b4a59a1c375"
// var cityState = ""

// var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" +
// cityState + "&appid=" + APIKey;

$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();

    // clear input box
    $("#search-value").val("");
    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=0df21c98a0faf830fca56b4a59a1c375",
      dataType: "json",
      success: function(data) {
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content
        $('#today').empty();

        var unixTime = data.dt;
        var milliseconds = unixTime * 1000;
        var dateConv = new Date(milliseconds);
        var fixedDate = dateConv.toLocaleDateString();

        // create html content for current weather
        var cityName = $("<h3>").text(data.name + " (" + fixedDate + ")");
        var iconNum = data.weather[0].icon;
        var iconURL = "http://openweathermap.org/img/wn/" + iconNum + "@2x.png";
        var weatherIcon = $("<img>").attr("src", iconURL);        
        cityName.append(weatherIcon);

        var temp = $("<p>").html("Temperature: " + data.main.temp + "&#8457;");
        var humidity = $("<p>").text("Humidity: " + data.main.humidity + "%");
        var wind = $("<p>").text("Wind Speed: " + data.wind.speed + "MPH");

        // merge and add to page
        $("#today").append(cityName, temp, humidity, wind);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=0df21c98a0faf830fca56b4a59a1c375",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $('#forecast').empty();
        var title = $("<h3>").text("5 Day Forecast:");
        var newRow = $("<div>").attr("class", "row").attr("id", "card-row");
        $("#forecast").append(title, newRow);

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            
            var currentDay = data.list[i];

            // Convert time data to date
            var unixTime = currentDay.dt;
            var milliseconds = unixTime * 1000;
            var dateConv = new Date(milliseconds);
            var fixedDate = dateConv.toLocaleDateString();


            // create html elements for a bootstrap card
            var card = $("<div>").attr("class", "card-body");
            var date = $("<h4>").text(fixedDate);
            var iconNum = currentDay.weather[0].icon;
            var iconURL = "http://openweathermap.org/img/wn/" + iconNum + "@2x.png";
            var iconCard = $("<img>").attr("src", iconURL); 
            var humidCard = $("<p>").text("Humidity: " + currentDay.main.humidity + "%");
            var tempCard = $("<p>").html("Temp: " + currentDay.main.temp + "&#8457;");

            // merge together and put on page
            card.append(date, iconCard, tempCard, humidCard);
            $("#card-row").append(card);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly,daily&appid=0df21c98a0faf830fca56b4a59a1c375",
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        

        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
