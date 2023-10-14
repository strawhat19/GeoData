// Weather App
let cityName = ``;
let dynamicTimer = null;
let cities = JSON.parse(localStorage.getItem(`Cities History`)) || [];
let uniqueCities = [...new Set(cities)];

const map = $(`.map`);
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
const currentTime = $(`.currentTime`);
const citiesList = $(`.locationList`);
const clearCities = $(`.clearCities`);
const temperature = $(`.temperature`);
const condition = $(`.conditionImage`);
const searchButton = $(`.searchButton`);
const conditionDiv = $(`.conditionDiv`);
const cardHumidity = $(`.cardHumidity`);
const cardContainer = $(`.cardContainer`);
const conditionText = $(`.conditionText`);
const copyrightYear = $(`.copyrightYear`);
const locationButtons = $(`.locationButton`);
const buttonContainer = $(`.buttonContainer`);
const cardTemperature = $(`.cardTemperature`);
const enableDefaultZoom = `!1m14!1m12!1m3!1d132`;
const openWeatherAPIKey = `ce5300e7acaa327ad655b8a21d5130d8`;
const googleMapsEmbedURL = `https://www.google.com/maps/embed`;
const openWeatherAPIURL = `https://api.openweathermap.org/data/2.5`;
const convertFromMSToMPH = (speedInMS) => Math.floor(speedInMS * 2.237);
const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const googleMapsEmbedOptions = `!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0`;
const browserTimezoneContinent = browserTimezone.split(`/`)[0].replace(/_/g, ` `);
const browserTimezoneCityOrRegion = browserTimezone.split(`/`)[1].replace(/_/g, ` `);
const removeCityButton = buttonContainer.find(`.locationElement`).find(`.removeCityButton`);
const convertFromKelvinToFahrenheit = (tempInKelvin) => ((tempInKelvin - 273.15) * (9/5) + 32);

const googleMapZoomLevels = {
    world: ``,
    street: enableDefaultZoom + ``,
    neighborhood : enableDefaultZoom + `4`,
    city: enableDefaultZoom + `44`,
    region: enableDefaultZoom + `444`,
    state: enableDefaultZoom + `4444`,
    coast: enableDefaultZoom + `44444`,
    x300: enableDefaultZoom + `444444`,
}

const setDynamicTimer = (timezone) => {
    copyrightYear.html(moment().tz(timezone).format(`YYYY`));
    if (dynamicTimer != null) clearInterval(dynamicTimer);
    dynamicTimer = setInterval(async () => {
        currentTime.html(moment().tz(timezone).format(`dddd, MMMM Do, h:mm:ss a`));
    }, 1000);
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

const generateMap = (coordinates) => {

    let { latitude, longitude } = coordinates;
    let zoomLevel = googleMapZoomLevels.region;
    let generatedMap = document.querySelector(`.generatedMap`);
    let googleMapsIframeSource = `${googleMapsEmbedURL}?pb=${zoomLevel}!2d${longitude}!3d${latitude}${googleMapsEmbedOptions}`;
    
    // if (isValid(google)) generatedMap = new google.maps.Map(map, { zoom: 1, center: { lat: latitude, lng: longitude } });

    if (generatedMap) {
        generatedMap.src = googleMapsIframeSource;
    } else {
        generatedMap = document.createElement(`iframe`);
        generatedMap.loading = `lazy`;
        generatedMap.allowFullscreen = true;
        generatedMap.src = googleMapsIframeSource;
        generatedMap.classList.add(`generatedMap`);
        generatedMap.referrerPolicy = `no-referrer-when-downgrade`;

        if (map) {
            if (map.children.length > 0) map.html(``);
            map.append(generatedMap);
        }
    }

    return generatedMap;
}

const setOneCallFiveDayForecastData = (oneCallFiveDayForecastData) => {

    console.log(`One Call Data From Open Weather API`, oneCallFiveDayForecastData);

    let timezone = oneCallFiveDayForecastData.timezone;
    setDynamicTimer(timezone);
    
    let firstDay = oneCallFiveDayForecastData.daily[0];
    let uvi = oneCallFiveDayForecastData.current.uvi;
    let currentDaysCondition = firstDay.weather[0].main;
    
    uvIndex.html(uvi);
    cardContainer.html(``);
    conditionText.html(currentDaysCondition);

    for (let i = 1; i < 6; i++) {
        let thisDay = oneCallFiveDayForecastData.daily[i];
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

    return oneCallFiveDayForecastData;
}

const getOneCallFiveDayForecastDataForCoordinates = async (coordinates) => {
    let { latitude, longitude } = coordinates;
    try {
        let openWeatherOneCallForLatLonURL = `${openWeatherAPIURL}/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherAPIKey}`;
        let openWeatherOneCallForLatLonResponse = await fetch(openWeatherOneCallForLatLonURL);
        if (openWeatherOneCallForLatLonResponse.ok == true) {
            let openWeatherOneCallForLatLonData = await openWeatherOneCallForLatLonResponse.json();
            if (isValid(openWeatherOneCallForLatLonData)) {
                return setOneCallFiveDayForecastData(openWeatherOneCallForLatLonData);
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

        console.log(`Current Weather Data From Open Weather API`, currentWeatherData);

        if (searched == true) {
            cities.push(cityName);
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
        let coordinatesOfWeatherLocation = { latitude, longitude };
        let locationHumidity = `${currentWeatherData.main.humidity} %`;
        let tempInFahrenheit = convertFromKelvinToFahrenheit(tempInKelvin).toFixed(1);
        let locationWindSpeed = `${convertFromMSToMPH(currentWeatherData.wind.speed)} mph`;

        cityNameText.html(cityNameOfWeather + `, ` + countryCodeOfWeather);
        temperature.html(tempInFahrenheit + `° F`);
        humidity.html(locationHumidity);
        wind.html(locationWindSpeed);
        coordinates.html(Math.floor(latitude) + `, ` + Math.floor(longitude));

        generateMap(coordinatesOfWeatherLocation);
        getOneCallFiveDayForecastDataForCoordinates(coordinatesOfWeatherLocation);
    }

    return currentWeatherData;
}

const getCurrentWeatherForLocation = async (location, searched) => {
    try {
        let openWeatherForCityNameURL = `${openWeatherAPIURL}/weather?q=${location}&appid=${openWeatherAPIKey}`;
        let openWeatherLocationNameResponse = await fetch(openWeatherForCityNameURL);
        if (openWeatherLocationNameResponse.ok == true) {
            let openWeatherLocationNameData = await openWeatherLocationNameResponse.json();
            if (isValid(openWeatherLocationNameData)) {
                return setCurrentWeatherDataFromLocationName(openWeatherLocationNameData, location, searched);
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

buttonContainer.on(`click`, `.locationButton`, (event) => {
    let locationName = $(event.target).html();
    getCurrentWeatherForLocation(locationName, false);
})

buttonContainer.on(`click`, `.removeCityButton`, (event) => {
    $(event.target).parent().remove();
    cities = JSON.parse(localStorage.getItem(`Cities History`));
    let cityToRemoveIndex = $(event.target).attr(`id`);
    cities.splice(cityToRemoveIndex, 1);
    localStorage.setItem(`Cities History`, JSON.stringify(cities));
    if (cities.length === 0) citiesData.hide();
})

searchButton.on(`click`, (searchButtonClickEvent) => {
    searchButtonClickEvent.preventDefault();
    let locationName = searchInput.val();
    if (isValid(locationName) == false) {
        alert(`Please Enter Valid Location.`);
        return;
    } else {
        if (locationName.length < 3) {
            alert(`Please Enter Valid Location with more than 3 Characters.`);
            return;
        } else {
            getCurrentWeatherForLocation(locationName);
        }
    }
})

const initializeWeatherApp = () => {
    if (cities.length === 0) citiesData.hide();
    getCurrentWeatherForLocation(browserTimezoneCityOrRegion);
    createButtons(uniqueCities);
}

initializeWeatherApp();