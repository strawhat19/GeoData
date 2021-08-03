// Weather App
console.log('Weather App!');

var apiKey = 'ce5300e7acaa327ad655b8a21d5130d8';
var cityName = '';
var searchInput = $('#search');
var searchButton = $('.searchButton');
var citiesList = $('.locationList');
var cities = JSON.parse(localStorage.getItem("Cities History")) || [];
var cityNameText = $('.cityName');
var temperature = $('.temperature');
var humidity = $('.humidity');
var wind = $('.wind');
var uvIndex = $('.UV-Index');

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
        cityNameText.html(' ' + data.name);
        temperature.html(' ' + data.main.temp);
        humidity.html(' ' + data.main.humidity);
        wind.html(' ' + data.wind.speed);
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
        cityNameText.html(' ' + data.name);
        temperature.html(' ' + data.main.temp);
        humidity.html(' ' + data.main.humidity);
        wind.html(' ' + data.wind.speed);
    })
})