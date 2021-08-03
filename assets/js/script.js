// Weather App
console.log('Weather App!');

var apiKey = 'ce5300e7acaa327ad655b8a21d5130d8';
var cityName = 'Atlanta';

var requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

var searchInput = $('#search');
var searchButton = $('.searchButton');
var citiesList = $('.locationList');
var cities = JSON.parse(localStorage.getItem("Cities History")) || [];

searchButton.on('click',function(event) {
    event.preventDefault();
    var searchInputValue = searchInput.val();
    cities.push(searchInputValue);
    localStorage.setItem('Cities History', JSON.stringify(cities));
    location.reload(true);
})

cities.forEach((city,index) => {
    var locationButton = $(`<button class="locationButton" id="${index}" data-location="${city}">${city}</button>`);
    citiesList.append(locationButton);
})

fetch(requestURL).then(function(response) {
    return response.json();
})


