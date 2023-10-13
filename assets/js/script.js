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
const locationButtons = $(`.locationButton`);
const buttonContainer = $(`.buttonContainer`);
const cardTemperature = $(`.cardTemperature`);
const openWeatherAPIKey = `ce5300e7acaa327ad655b8a21d5130d8`;
const openWeatherAPIURL = `https://api.openweathermap.org/data/2.5`;
const convertFromMSToMPH = (speedInMS) => Math.floor(speedInMS * 2.237);
const removeCityButton = buttonContainer.find(`.locationElement`).find(`.removeCityButton`);
const convertFromKelvinToFahrenheit = (tempInKelvin) => ((tempInKelvin - 273.15) * (9/5) + 32);

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

const createButtons = (uniqueCities) => {
    uniqueCities.forEach((city,index) => {
        let locationButton = $(`
            <div class="locationElement">
                <button class="locationButton" id="${index}" data-location="${city}">${city}</button>
                <button class="removeCityButton" id="${index}">X</button>
            </div>
        `);
        buttonContainer.append(locationButton);
    })
}

const convertLatLonToDMSDirectionFromCoordinates = (coordinate, latOrLon) => {
    const absoluteCoord = Math.abs(coordinate) || `--`;
    const degrees = Math.floor(absoluteCoord) || `--`;
    const minutesFloat = (absoluteCoord - degrees) * 60 || `--`;
    const minutes = Math.floor(minutesFloat) || `--`;
    const seconds = Math.round((minutesFloat - minutes) * 60) || `--`;
    const direction = (latOrLon == `lat` ? (coordinate >= 0 ? `N` : `S`) : (coordinate >= 0 ? `E` : `W`)) || `--`;
    return `${degrees}°${minutes}'${seconds}"${direction}`;
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

const setFiveDayForecastData = (fiveDayForecastData) => {
    let firstDay = fiveDayForecastData.daily[0];
    let uvi = fiveDayForecastData.current.uvi;
    let currentTime = moment.unix(fiveDayForecastData.current.dt).format(`dddd, MMMM Do YYYY, h:mm a`);
    let currentTimeEl = $(`<span class="currentTime"> - ${currentTime} </span>`);
    let currentDaysCondition = firstDay.weather[0].main;
    
    uvIndex.html(uvi);
    cityNameText.append(currentTimeEl);
    cardContainer.html(``);
    conditionText.html(currentDaysCondition);

    for (let i = 1; i < 6; i++) {
        let thisDay = fiveDayForecastData.daily[i];
        let dateTime = thisDay.dt;
        let fullDates = moment.unix(dateTime).format(`MMMM Do`);
        let day = moment.unix(dateTime).format(`dddd`);
        let icon = thisDay.weather[0].icon;
        let mainIcon = firstDay.weather[0].icon;
        let daysHumidity = `${thisDay.humidity} %`;
        let daysWindSpeed = `${convertFromMSToMPH(thisDay.wind_speed)}`;
        let daysMaxTemp = convertFromKelvinToFahrenheit(thisDay.temp.max);
        let iconLink = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        let mainIconLink = `https://openweathermap.org/img/wn/${mainIcon}@2x.png`;

        condition.addClass(`conditionImageInverted`);
        condition.attr(`src`, mainIconLink);

        let foreCastCards = $(`
            <div class="card">
                <div class="dateIcon"><h4 class="date">${fullDates}</h4><img class="icon" src="${iconLink}"></div>
                <h3 class="dayText">${day}</h3>
                <div class="spanContainer">
                    <div class="stat">Temperature: 
                        <span class="cardTemperature">${Math.floor(daysMaxTemp)}° F</span>
                    </div>
                    <div class="stat">Wind Speed: 
                        <span class="cardWind">${daysWindSpeed}</span>
                    </div>
                    <div class="stat">Humidity: 
                        <span class="cardHumidity">${daysHumidity}</span>
                    </div>
                </div>
            </div>
        `);

        cardContainer.append(foreCastCards);
    }

    return fiveDayForecastData;
}

const getFiveDayForecastDataForCoordinates = async (coordinates) => {
    let { latitude, longitude } = coordinates;
    try {
        let openWeatherOneCallForLatLonURL = `${openWeatherAPIURL}/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherAPIKey}`;
        let openWeatherOneCallForLatLonResponse = await fetch(openWeatherOneCallForLatLonURL);
        if (openWeatherOneCallForLatLonResponse.ok == true) {
            let openWeatherOneCallForLatLonData = await openWeatherOneCallForLatLonResponse.json();
            if (isValid(openWeatherOneCallForLatLonData)) {
                return setFiveDayForecastData(openWeatherOneCallForLatLonData);
            }
        } else {
            console.log(`Error Fetching Weather Data for Coordinates`);
            return;
        }
    } catch (error) {
        console.log(`Error Fetching Weather Data for Coordinates`, error.message, error);
        return error.message;
    }
}

const setCurrentWeatherDataFromLocationName = (currentWeatherData, cityName, searched = true) => {
    if (currentWeatherData.cod == 404) {
        alert(`City Not Found.`);
        return;
    } else {

        if (searched == true) {
            cities.push(cityName);
            cities.splice(10);
            let uniqueCities = [...new Set(cities)];
            localStorage.setItem(`Cities History`, JSON.stringify(uniqueCities));
            uniqueCities = JSON.parse(localStorage.getItem(`Cities History`));
            uniqueCities = [...new Set(uniqueCities)];

            buttonContainer.html(``);
            createButtons(uniqueCities);
            citiesData.show();
            searchInput.val(``);
        }

        let latitude = currentWeatherData.coord.lat;
        let longitude = currentWeatherData.coord.lon;
        let cityNameOfWeather = currentWeatherData.name;
        let tempInKelvin = currentWeatherData.main.temp;
        let countryCodeOfWeather = currentWeatherData.sys.country;
        let locationHumidity = `${currentWeatherData.main.humidity} %`;
        let tempInFahrenheit = convertFromKelvinToFahrenheit(tempInKelvin).toFixed(1);
        let locationWindSpeed = `${convertFromMSToMPH(currentWeatherData.wind.speed)} mph`;
        
        // let convertedLatToDirection = convertLatLonToDMSDirectionFromCoordinates(latitude, `lat`);
        // let convertedLonToDirection = convertLatLonToDMSDirectionFromCoordinates(longitude, `lon`);
        // let coordinatesText = convertedLatToDirection + `, ` + convertedLonToDirection;
        let coordinatesOfWeatherLocation = { latitude, longitude };
        // generateMap(coordinatesOfWeatherLocation);

        cityNameText.html(cityNameOfWeather + `, ` + countryCodeOfWeather);
        temperature.html(tempInFahrenheit + `° F`);
        humidity.html(locationHumidity);
        wind.html(locationWindSpeed);
        coordinates.html(Math.floor(latitude) + `, ` + Math.floor(longitude));

        getFiveDayForecastDataForCoordinates(coordinatesOfWeatherLocation);
    }

    return currentWeatherData;
}

const getCurrentWeatherForLocation = async (location) => {
    try {
        let openWeatherForCityNameURL = `${openWeatherAPIURL}/weather?q=${location}&appid=${openWeatherAPIKey}`;
        let openWeatherLocationNameResponse = await fetch(openWeatherForCityNameURL);
        if (openWeatherLocationNameResponse.ok == true) {
            let openWeatherLocationNameData = await openWeatherLocationNameResponse.json();
            if (isValid(openWeatherLocationNameData)) {
                return setCurrentWeatherDataFromLocationName(openWeatherLocationNameData, location);
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

clearCities.on(`click`, () => {
    localStorage.clear();
    location.reload(true);
});

searchButton.on(`click`, (searchButtonClickEvent) => {
    searchButtonClickEvent.preventDefault();
    let locationName = searchInput.val();
    if (isValid(locationName) == false) {
        alert(`Please Enter Valid Location.`);
        return;
    } else {
        getCurrentWeatherForLocation(locationName);
    }
})

buttonContainer.on(`click`, `.locationButton`, (event) => {
    let locationName = $(event.target).html();
    if (isValid(locationName) == false) {
        alert(`Please Enter Valid Location.`);
        return;
    } else {
        getCurrentWeatherForLocation(locationName);
    }
})

buttonContainer.on(`click`, `.removeCityButton`, (event) => {
    $(event.target).parent().remove();
    cities = JSON.parse(localStorage.getItem(`Cities History`));
    let cityToRemoveIndex = $(event.target).attr(`id`);
    cities.splice(cityToRemoveIndex, 1);
    localStorage.setItem(`Cities History`, JSON.stringify(cities));
    if (cities.length === 0) citiesData.hide();
})

// let initialCoordinatesForMap = { latitude: 30, longitude: 0 };
// generateMap(initialCoordinatesForMap);

// Invoking Create Buttons Function on Page Load
createButtons(uniqueCities);