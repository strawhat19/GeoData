// Weather App
console.log('Weather App!');

var apiKey = 'ce5300e7acaa327ad655b8a21d5130d8';
var cityName = '';
var searchInput = $('#search');
var searchButton = $('.searchButton');
var citiesList = $('.locationList');
var cities = JSON.parse(localStorage.getItem("Cities History")) || [];
var cityNameText = $('.cityName');
var cardContainer = $('.cardContainer');
var temperature = $('.temperature');
var humidity = $('.humidity');
var condition = $('.conditionImage');
var wind = $('.wind');
var uvIndex = $('.UV-Index');
var cardDate = $('.date');
var cardIcon = $('.icon');
var cardDayText = $('.dayText');
var cardTemperature = $('.cardTemperature');
var cardWind = $('cardWind');
var cardHumidity = $('.cardHumidity');

// When User Clicks Search Button
searchButton.on('click',function(event) {
    event.preventDefault();
    var searchInputValue = searchInput.val();
    cities.push(searchInputValue);
    cities.splice(13);
    // if (cities.length === 13) {
    //     var oldCity = cities.length-1;
    //     cities[oldCity].remove();
    // }
    localStorage.setItem('Cities History', JSON.stringify(cities));
    var requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${searchInputValue}&appid=${apiKey}`;
    // Fetch
    fetch(requestURL)
    .then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
        var fahrenheit = Math.floor((data.main.temp - 273.15)* 1.8 + 32.00);
        cityNameText.html(data.name);
        temperature.html(fahrenheit + '° F');
        humidity.html(data.main.humidity);
        wind.html(data.wind.speed);

        var lat = data.coord.lat;
        var lon = data.coord.lon;
        var latlonLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        fetch(latlonLink).then(function(response) {
            return response.json();
        }).then(function(data) {
            uvIndex.html(data.current.uvi);
            console.log(data);
            var currentTime = moment.unix(data.current.dt).format('dddd, MMMM Do YYYY, h:mm a');
            var currentTimeEl = $(`<span class="currentTime"> - ${currentTime} </span>`);
            cityNameText.append(currentTimeEl);
            cardContainer.html('');
            for (var i = 1; i < 6; i++) {
                var fullDates = moment.unix(data.daily[i].dt).format('MMMM Do');
                var day = moment.unix(data.daily[i].dt).format('dddd');
                var mainIcon = data.daily[0].weather[0].icon;
                var mainIconLink = `https://openweathermap.org/img/wn/${mainIcon}@2x.png`;
                condition.attr('src',mainIconLink);
                var icon = data.daily[i].weather[0].icon;
                var iconLink = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                var foreCastCards = $(`
                <div class="card">
                  <div class="dateIcon"><h4 class="date">${fullDates}</h4><img class="icon" src="${iconLink}"></div>
                    <h3 class="dayText">${day}</h3>
                    <div class="spanContainer">
                        <div class="stat">Temperature: 
                            <span class="cardTemperature">${Math.floor((data.daily[i].temp.max - 273.15)* 1.8 + 32.00)} ° F</span>
                        </div>
                        <div class="stat">Wind Speed: 
                            <span class="cardWind">${data.daily[i].wind_speed}</span>
                        </div>
                        <div class="stat">Humidity: 
                            <span class="cardHumidity">${data.daily[i].humidity}</span>
                        </div>
                    </div>
                </div>`);
                cardContainer.append(foreCastCards);
            }
        })
    })
    // location.reload(true);
})

// Creating Buttons for each City Stored in Cities Array
cities.forEach((city,index) => {
    var locationButton = $(`<button class="locationButton" id="${index}" data-location="${city}">${city}</button>`);
    citiesList.append(locationButton);
})

var locationButtons = $('.locationButton');
locationButtons.on('click',function(event) {
    var location = $(event.target).html();
    var requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;
    // Repeating Fetch
    fetch(requestURL)
    .then(function(response) {
        return response.json();
    }).then(function(data) {
        console.log(data);
        var fahrenheit = Math.floor((data.main.temp - 273.15)* 1.8 + 32.00);
        cityNameText.html(data.name);
        temperature.html(fahrenheit + '° F');
        humidity.html(data.main.humidity);
        wind.html(data.wind.speed);

        var lat = data.coord.lat;
        var lon = data.coord.lon;
        var latlonLink = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        fetch(latlonLink).then(function(response) {
            return response.json();
        }).then(function(data) {
            uvIndex.html(data.current.uvi);
            console.log(data);
            var currentTime = moment.unix(data.current.dt).format('dddd, MMMM Do YYYY, h:mm a');
            var currentTimeEl = $(`<span class="currentTime"> - ${currentTime}</span>`);
            cityNameText.append(currentTimeEl);
            cardContainer.html('');
            for (var i = 1; i < 6; i++) {
                var fullDates = moment.unix(data.daily[i].dt).format('MMMM Do');
                var day = moment.unix(data.daily[i].dt).format('dddd');
                var mainIcon = data.daily[0].weather[0].icon;
                var mainIconLink = `https://openweathermap.org/img/wn/${mainIcon}@2x.png`;
                condition.addClass('conditionImageInverted');
                condition.attr('src',mainIconLink);
                var icon = data.daily[i].weather[0].icon;
                var iconLink = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                var foreCastCards = $(`
                <div class="card">
                  <div class="dateIcon"><h4 class="date">${fullDates}</h4><img class="icon" src="${iconLink}"></div>
                    <h3 class="dayText">${day}</h3>
                    <div class="spanContainer">
                        <div class="stat">Temperature: 
                            <span class="cardTemperature">${Math.floor((data.daily[i].temp.max - 273.15)* 1.8 + 32.00)} ° F</span>
                        </div>
                        <div class="stat">Wind Speed: 
                            <span class="cardWind">${data.daily[i].wind_speed}</span>
                        </div>
                        <div class="stat">Humidity: 
                            <span class="cardHumidity">${data.daily[i].humidity}</span>
                        </div>
                    </div>
                </div>`);
                cardContainer.append(foreCastCards);
            }
        })
    })
})