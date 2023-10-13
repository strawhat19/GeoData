// Weather App
console.log(`Weather App`);

const wind = $(`.wind`);
const cardDate = $(`.date`);
const cardIcon = $(`.icon`);
const uvIndex = $(`.UV-Index`);
const cardWind = $(`cardWind`);
const humidity = $(`.humidity`);
const searchInput = $(`#search`);
const coordinates = $(`.coords`);
const cardDayText = $(`.dayText`);
const cityNameText = $(`.cityName`);
const citiesData = $(`.citiesData`);
const citiesList = $(`.locationList`);
const clearCities = $(`.clearCities`);
const temperature = $(`.temperature`);
const condition = $(`.conditionImage`);
const searchButton = $(`.searchButton`);
const conditionDiv = $(`.conditionDiv`);
const cardHumidity = $(`.cardHumidity`);
const cardContainer = $(`.cardContainer`);
const conditionText = $(`.conditionText`);
const buttonContainer = $(`.buttonContainer`);
const cardTemperature = $(`.cardTemperature`);
const openWeatherAPIKey = `ce5300e7acaa327ad655b8a21d5130d8`;

let cityName = ``;
let cities = JSON.parse(localStorage.getItem(`Cities History`)) || [];
cities.splice(10);
let uniqueCities = [...new Set(cities)];
if (cities.length === 0) citiesData.hide();

const generateMap = (coordinates, type = `API`) => {
    let { latitude, longitude } = coordinates;
    if (type == `API`) {
        let options = { zoom: 1, center: { lat: latitude, lng: longitude } };
        let map = new google.maps.Map(document.getElementById(`map`), options);
        return map;
    }
}

const isValid = (item) => {
    if (typeof item == `string`) {
        if (!item || item == `` || item.trim() == `` || item == undefined || item == null) {
            return false;
        } else {
            return true;
        }
    } else if (typeof item == `number`) {
        if (isNaN(item) || item == undefined || item == null) {
            return false;
        } else {
            return true;
        }
    } else if (typeof item == `object`) {
        if (Object.keys(item).length == 0 || item == undefined || item == null) {
            return false;
        } else {
            return true;
        }
    } else {
        if (item == undefined || item == null) {
            return false;
        } else {
            return true;
        }
    }
}

const setCurrentWeatherDataFromCityName = (currentWeatherData, cityName) => {
    if (currentWeatherData.cod == 404) {
        alert(`City Not Found.`);
        return;
    } else {
        cities.push(cityName);
        cities.splice(10);
        let uniqueCities = [...new Set(cities)];
        localStorage.setItem(`Cities History`, JSON.stringify(uniqueCities));
        uniqueCities = JSON.parse(localStorage.getItem(`Cities History`));
        uniqueCities = [...new Set(uniqueCities)];

        let buttonContainer = $(`.buttonContainer`);
        buttonContainer.html(``);
        createButtons(uniqueCities);
        citiesData.show();
        searchInput.val(``);

        // Converting Temperature from Kelvin to Fahrenheit
        let fahrenheit = Math.floor((currentWeatherData.main.temp - 273.15)* 1.8 + 32.00);
        cityNameText.html(currentWeatherData.name + `, ` + currentWeatherData.sys.country);
        temperature.html(fahrenheit + `° F`);
        humidity.html(currentWeatherData.main.humidity);
        wind.html(currentWeatherData.wind.speed);
        coordinates.html(Math.floor(currentWeatherData.coord.lat) + `, ` + Math.floor(currentWeatherData.coord.lon));

        let latitude = currentWeatherData.coord.lat;
        let longitude = currentWeatherData.coord.lon;
        // let coordinatesOfWeatherLocation = { latitude, longitude };
        // generateMap(coordinatesOfWeatherLocation);

        // Fetching 2nd dataset with new Lat Lon and OneCall API
        let openWeatherOneCallFromCoordinatesQuery = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherAPIKey}`;
        fetch(openWeatherOneCallFromCoordinatesQuery).then(function(response) {
            return response.json();
        }).then(function(data) {

            uvIndex.html(data.current.uvi);
            let currentTime = moment.unix(data.current.dt).format(`dddd, MMMM Do YYYY, h:mm a`);
            let currentTimeEl = $(`<span class="currentTime"> - ${currentTime} </span>`);
            cityNameText.append(currentTimeEl);
            cardContainer.html(``);
            conditionText.html(data.daily[0].weather[0].main);

            // 5 day forecast
            for (let i = 1; i < 6; i++) {
                let fullDates = moment.unix(data.daily[i].dt).format(`MMMM Do`);
                let day = moment.unix(data.daily[i].dt).format(`dddd`);
                let mainIcon = data.daily[0].weather[0].icon;
                let mainIconLink = `https://openweathermap.org/img/wn/${mainIcon}@2x.png`;
                condition.addClass(`conditionImageInverted`);
                condition.attr(`src`, mainIconLink);
                let icon = data.daily[i].weather[0].icon;
                let iconLink = `https://openweathermap.org/img/wn/${icon}@2x.png`;

                // Creating Forecast Cards
                let foreCastCards = $(`
                    <div class="card">
                        <div class="dateIcon"><h4 class="date">${fullDates}</h4><img class="icon" src="${iconLink}"></div>
                        <h3 class="dayText">${day}</h3>
                        <div class="spanContainer">
                            <div class="stat">Temperature: 
                                <span class="cardTemperature">${Math.floor((data.daily[i].temp.max - 273.15)* 1.8 + 32.00)}° F</span>
                            </div>
                            <div class="stat">Wind Speed: 
                                <span class="cardWind">${data.daily[i].wind_speed}</span>
                            </div>
                            <div class="stat">Humidity: 
                                <span class="cardHumidity">${data.daily[i].humidity}</span>
                            </div>
                        </div>
                    </div>
                `);

                cardContainer.append(foreCastCards);
            }
        })
    }

    return currentWeatherData;
}

const getCurrentWeatherDataFromCityName = async (cityName) => {
    try {
        let openWeatherCityNameQuery = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${openWeatherAPIKey}`;
        let openWeatherCityNameResponse = await fetch(openWeatherCityNameQuery);
        if (openWeatherCityNameResponse.ok == true) {
            let openWeatherCityNameData = await openWeatherCityNameResponse.json();
            if (isValid(openWeatherCityNameData)) {
                return setCurrentWeatherDataFromCityName(openWeatherCityNameData, cityName);
            }
        } else {
            console.log(`Error Fetching Weather Data for City Name`);
            return;
        }
    } catch (error) {
        console.log(`Error Fetching Weather Data for City Name`, error.message, error);
        return error.message;
    }
} 

searchButton.on(`click`, (searchButtonClickEvent) => {
    searchButtonClickEvent.preventDefault();
    let cityNameToCheckWeatherFor = searchInput.val();
    if (isValid(cityNameToCheckWeatherFor) == false) {
        alert(`Please Enter Valid Location.`);
        return;
    } else {
        getCurrentWeatherDataFromCityName(cityNameToCheckWeatherFor);
    }
})

const createButtons = (uniqueCities) => {
    uniqueCities.forEach((city,index) => {
        let locationButton = $(`
            <div class="locationElement">
                <button class="locationButton" id="${index}" data-location="${city}">${city}</button>
                <button class="removeCityButton" id="${index}">X</button>
            </div>
        `);
        let buttonContainer = $(`.buttonContainer`);
        buttonContainer.append(locationButton);
    })
}

let locationButtons = $(`.locationButton`);
buttonContainer.on(`click`, `.locationButton`, (event) => {
    let location = $(event.target).html();
    let requestURL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${openWeatherAPIKey}`;
    // Repeating Fetch of 1st dataset
    fetch(requestURL).then(function(response) {
        return response.json();
    }).then(function(data) {
        let fahrenheit = Math.floor((data.main.temp - 273.15) * 1.8 + 32.00);
        cityNameText.html(data.name + `, ` + data.sys.country);
        temperature.html(fahrenheit + `° F`);
        humidity.html(data.main.humidity);
        wind.html(data.wind.speed);
        coordinates.html(Math.floor(data.coord.lat) + `, ` + Math.floor(data.coord.lon));

        let latitude = data.coord.lat;
        let longitude = data.coord.lon;
        // let coordinatesOfWeatherLocation = { latitude, longitude };
        // generateMap(coordinatesOfWeatherLocation);

        let openWeatherOneCallFromCoordinatesQuery = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherAPIKey}`;
        fetch(openWeatherOneCallFromCoordinatesQuery).then((response) => {
            return response.json();
        }).then(function(data) {

            uvIndex.html(data.current.uvi);
            let currentTime = moment.unix(data.current.dt).format(`dddd, MMMM Do YYYY, h:mm a`);
            let currentTimeEl = $(`<span class="currentTime"> - ${currentTime}</span>`);
            cityNameText.append(currentTimeEl);
            cardContainer.html(``);
            conditionText.html(data.daily[0].weather[0].main);

            // 5 day forecast
            for (let i = 1; i < 6; i++) {
                let fullDates = moment.unix(data.daily[i].dt).format(`MMMM Do`);
                let day = moment.unix(data.daily[i].dt).format(`dddd`);
                let mainIcon = data.daily[0].weather[0].icon;
                let mainIconLink = `https://openweathermap.org/img/wn/${mainIcon}@2x.png`;
                condition.addClass(`conditionImageInverted`);
                condition.attr(`src`, mainIconLink);
                let icon = data.daily[i].weather[0].icon;
                let iconLink = `https://openweathermap.org/img/wn/${icon}@2x.png`;
                // Creating forecast cards
                let foreCastCards = $(`
                <div class="card">
                  <div class="dateIcon"><h4 class="date">${fullDates}</h4><img class="icon" src="${iconLink}"></div>
                    <h3 class="dayText">${day}</h3>
                    <div class="spanContainer">
                        <div class="stat">Temperature: 
                            <span class="cardTemperature">${Math.floor((data.daily[i].temp.max - 273.15)* 1.8 + 32.00)}° F</span>
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

clearCities.on(`click`, () => {
    localStorage.clear();
    location.reload(true);
});

// Remove City from DOM & Local Storage
let removeCityButton = buttonContainer.find(`.locationElement`).find(`.removeCityButton`);
buttonContainer.on(`click`, `.removeCityButton`, (event) => {
    $(event.target).parent().remove();
    cities = JSON.parse(localStorage.getItem(`Cities History`));
    let cityToRemoveIndex = $(event.target).attr(`id`);
    cities.splice(cityToRemoveIndex,1);
    localStorage.setItem(`Cities History`, JSON.stringify(cities));
    if (cities.length === 0) citiesData.hide();
})

// let initialCoordinatesForMap = { latitude: 30, longitude: 0 };
// generateMap(initialCoordinatesForMap);

// Invoking Create Buttons Function on Page Load
createButtons(uniqueCities);