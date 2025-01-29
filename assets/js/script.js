// GeoData API
let cityName = ``;
let locations = [];
let dynamicTimer = null;
let uniqueLocations = [];

const map = $(`.map`);
const wind = $(`.wind`);
const cardDate = $(`.date`);
const region = $(`.region`);
const cardIcon = $(`.icon`);
const address = $(`.address`);
const uvIndex = $(`.UV-Index`);
const cardWind = $(`cardWind`);
const humidity = $(`.humidity`);
const searchInput = $(`#search`);
const coordinates = $(`.coords`);
const cardDayText = $(`.dayText`);
const population = $(`.population`);
const searchForm = $(`.searchForm`);
const cityNameText = $(`.cityName`);
const currentTime = $(`.currentTime`);
const citiesList = $(`.locationList`);
const temperature = $(`.temperature`);
const condition = $(`.conditionImage`);
const locationsData = $(`.citiesData`);
const searchButton = $(`.searchButton`);
const conditionDiv = $(`.conditionDiv`);
const cardHumidity = $(`.cardHumidity`);
const timezoneDBAPIKey = `5YKEXHYSRTXY`;
const clearLocations = $(`.clearCities`);
const cardContainer = $(`.cardContainer`);
const conditionText = $(`.conditionText`);
const copyrightYear = $(`.copyrightYear`);
const locationsDatabaseName = `locations`;
const locationButtons = $(`.locationButton`);
const buttonContainer = $(`.buttonContainer`);
const cardTemperature = $(`.cardTemperature`);
const enableDefaultZoom = `!1m14!1m12!1m3!1d132`;
const coordsDirectional = $(`.coordsDirectional`);
const currentLocationButton = $(`.currentLocationButton`);
const openWeatherAPIKey = `ce5300e7acaa327ad655b8a21d5130d8`;
const googleMapsEmbedURL = `https://www.google.com/maps/embed`;
const openWeatherAPIURL = `https://api.openweathermap.org/data/2.5`;
const convertFromMSToMPH = (speedInMS) => Math.floor(speedInMS * 2.237);
const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const googleMapsEmbedOptions = `!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0`;
const browserTimezoneContinent = browserTimezone.split(`/`)[0].replace(/_/g, ` `);
const openStreetMapsNominatimAPIURL = `https://nominatim.openstreetmap.org/search`;
const browserTimezoneCityOrRegion = browserTimezone.split(`/`)[1].replace(/_/g, ` `);
const removeCityButton = buttonContainer.find(`.locationElement`).find(`.removeCityButton`);
const convertFromKelvinToFahrenheit = (tempInKelvin) => ((tempInKelvin - 273.15) * (9/5) + 32);

const capWords = (str) => {
    return str.replace(/\b\w/g, (match) => {
        return match.toUpperCase();
    });
}

const checkOverflow = (element) => {
    if ($(element)[0].scrollWidth > $(element).innerWidth()) $(element).addClass(`overflowingX`);
    else if ($(element).hasClass(`overflowingX`)) $(element).removeClass(`overflowingX`);

    if ($(element)[0].scrollHeight > $(element).innerHeight()) $(element).addClass(`overflowingY`);
    else if ($(element).hasClass(`overflowingY`)) $(element).removeClass(`overflowingY`);
}

const momentTimezoneFormats = {
    smallDateTime: `ddd, M/D, h:mm a`,
    extraSmallDateTime: `M/D, h:mm:ss a`,
    mediumDateTime: `ddd, MMM Do, h:mm a`,
    fullDateTime: `dddd, MMMM Do, h:mm:ss a`,
}

const setDynamicTimer = (timezone) => {
    copyrightYear.html(moment().tz(timezone).format(`YYYY`));
    if (dynamicTimer != null) clearInterval(dynamicTimer);
    dynamicTimer = setInterval(async () => {
        let format;
        if (window.innerWidth < 768) {
            if (window.innerWidth < 500) {
                if (window.innerWidth < 455) {
                    format = momentTimezoneFormats.extraSmallDateTime;
                } else {
                    format = momentTimezoneFormats.smallDateTime;
                }
            } else {
                format = momentTimezoneFormats.mediumDateTime;
            }
        } else {
            format = momentTimezoneFormats.fullDateTime;
        }
        currentTime.html(moment().tz(timezone).format(format));
    }, 1000);
}

const createButtons = (uniqueLocations) => {
    uniqueLocations.reverse().forEach((city,index) => {
        let locationButton = $(`
            <div class="locationElement">
                <button class="locationButton" id="${index}" data-location="${city}">${city}</button>
                <button class="removeCityButton" id="${index}">X</button>
            </div>
        `);
        buttonContainer.append(locationButton);
    })
    if (uniqueLocations.length >= 9) checkOverflow(buttonContainer);
}

const convertLatLonToDMSDirectionFromCoordinates = (coordinate, latOrLon) => {
    const absoluteCoord = Math.abs(coordinate);
    const degrees = Math.floor(absoluteCoord);
    const minutesFloat = (absoluteCoord - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = Math.round((minutesFloat - minutes) * 60);
    const direction = (latOrLon == `lat` ? (coordinate >= 0 ? `N` : `S`) : (coordinate >= 0 ? `E` : `W`));
    return `${degrees}°${minutes}'${seconds}"${direction}`;
}

const getCoordinatesFromCurrentLocation = () => {
    if (navigator.geolocation) {
        toastr.info(`Getting Coordinates`, `Loading...`, { ...toastrOptions, timeOut: 4000 });
        navigator.geolocation.getCurrentPosition((position) => {
            let location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
            getCurrentWeatherForLocation(location);
        }, (error) => {
            console.log(`Error obtaining geolocation:`, error.message);
        });
    } else {
        console.log(`Geolocation is not supported by this browser.`);
    }      
}

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

const toastrOptions =  {
    debug: false,
    onclick: null,
    timeOut: `2000`,
    newestOnTop: true,
    progressBar: true,
    closeButton: false,
    showDuration: `300`,
    showEasing: `swing`,
    hideDuration: `1000`,
    hideEasing: `linear`,
    showMethod: `fadeIn`,
    hideMethod: `fadeOut`,
    extendedTimeOut: `1000`,
    preventDuplicates: false,
    positionClass: `toast-top-right`,
};

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
    } else if (typeof item == `object` && item != undefined && item != null) {
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

const generateMapFromCoordinates = (coordinates) => {

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

    return {generatedMap, googleMapsIframeSource};
}

const setOneCallFiveDayForecastData = (oneCallFiveDayForecastData) => {
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
        let daysMaxTemp = convertFromKelvinToFahrenheit(thisDay.temp.max);
        let iconLink = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        let daysWindSpeed = `${convertFromMSToMPH(thisDay.wind_speed)} mph`;
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
                    <div class="stat">Wind: 
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

const getOneCallFiveDayForecastDataForCoordinates = async (coordinates, geoLocationData) => {
    let { latitude, longitude, location } = coordinates;
    try {
        let openWeatherOneCallForLatLonURL = `${openWeatherAPIURL}/onecall?lat=${latitude}&lon=${longitude}&appid=${openWeatherAPIKey}`;
        let openWeatherOneCallForLatLonResponse = await fetch(openWeatherOneCallForLatLonURL);
        if (openWeatherOneCallForLatLonResponse.ok == true) {
            let openWeatherOneCallForLatLonData = await openWeatherOneCallForLatLonResponse.json();
            if (isValid(openWeatherOneCallForLatLonData)) {
                geoLocationData = {
                    ...geoLocationData,
                    oneCallLocation: location,
                    openWeatherOneCallForLatLonData
                }
                console.log(`GeoData for ${capWords(geoLocationData.locationToAdd)}`, geoLocationData);
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

const getLocationDateTimeDataFromCoordinates = async (coordinates) => {
    try {
        let { latitude, longitude } = coordinates;
        let timezoneResponse = await fetch(`https://api.timezonedb.com/v2.1/get-time-zone?key=${timezoneDBAPIKey}&format=json&by=position&lat=${latitude}&lng=${longitude}`);
        if (timezoneResponse.ok == true) {
            let timezoneData = await timezoneResponse.json();
            if (isValid(timezoneData)) {
                return timezoneData;
            }
        } else {
            console.log(`Error Fetching Timezone Data`, timezoneResponse);
        }
    } catch (error) {
        console.log(`Error Fetching Timezone Data`, error);
    }
}

const setCurrentWeatherDataFromLocation = async (currentWeatherData, location, searched = true, openStreetMapsData = null) => {
    if (currentWeatherData.cod == 404) {
        alert(`City Not Found.`);
        return;
    } else {

        let latitude = currentWeatherData.coord.lat;
        let longitude = currentWeatherData.coord.lon;
        let tempInKelvin = currentWeatherData.main.temp;
        let countryCodeOfWeather = currentWeatherData.sys.country;
        let locationHumidity = `${currentWeatherData.main.humidity} %`;
        let coordinatesOfWeatherLocation = { latitude, longitude, location };

        let tempInFahrenheit = convertFromKelvinToFahrenheit(tempInKelvin).toFixed(1);
        let generatedMapData = generateMapFromCoordinates(coordinatesOfWeatherLocation);
        let locationWindSpeed = `${convertFromMSToMPH(currentWeatherData.wind.speed)} mph`;
        let locationQuery = typeof location == `string` ? location : currentWeatherData.name;
        let timezoneAndLocationData = await getLocationDateTimeDataFromCoordinates(coordinatesOfWeatherLocation);

        openStreetMapsData = isValid(openStreetMapsData) ? openStreetMapsData : await getLocationDataFromOpenStreetMapsNominatimAPI(locationQuery, searched, false);
        let locationToAdd = searched == true && isValid(searchInput.val()) ? searchInput.val() : typeof location == `string` ? location : openStreetMapsData[0]?.name && isValid(openStreetMapsData[0]?.name) ? openStreetMapsData[0]?.name : currentWeatherData.name;

        if (searched == true) {
            locations.push(locationToAdd);
            uniqueLocations = [...new Set(locations)];
            localStorage.setItem(locationsDatabaseName, JSON.stringify(uniqueLocations));
            uniqueLocations = JSON.parse(localStorage.getItem(locationsDatabaseName));
            uniqueLocations = [...new Set(uniqueLocations)];

            buttonContainer.html(``);
            createButtons(uniqueLocations);
            locationsData.show();
            searchInput.val(``);
        }

        let openStreetMapsCountry = openStreetMapsData[0].address.country;
        let country = openStreetMapsCountry || countryCodeOfWeather;

        let openStreetMapsCityCountry = openStreetMapsData[0].display_name.split(`,`).slice(0, 2).join(`,`);
        let openStreetMapsRegion = openStreetMapsData[0].display_name.split(`,`).slice(2, openStreetMapsData[0].display_name.split(`,`).length).join(`,`);

        let timezoneAPIZoneForLocation = timezoneAndLocationData.zoneName;
        let timezoneAPIContinentForLocation = timezoneAPIZoneForLocation.split(`/`)[0].replace(/_/g, ` `);

        setDynamicTimer(timezoneAPIZoneForLocation);

        cityNameText.html(locationToAdd + `, ` + country);

        address.html(openStreetMapsCityCountry);
        region.html(openStreetMapsRegion || timezoneAPIContinentForLocation || browserTimezoneContinent);

        coordinates.html(Math.floor(latitude) + `, ` + Math.floor(longitude));
        coordsDirectional.html(convertLatLonToDMSDirectionFromCoordinates(latitude, `lat`) + `, ` + convertLatLonToDMSDirectionFromCoordinates(longitude, `lon`));

        temperature.html(tempInFahrenheit + `° F`);
        humidity.html(locationHumidity);
        wind.html(locationWindSpeed);

        let populations = [];
        openStreetMapsData.forEach(dataPoint => {
            if (dataPoint?.extratags?.population) {
                populations.push(parseFloat(dataPoint?.extratags?.population));
            }
        });

        if (populations.length > 0) {
            // let populationsSorted = populations.sort((a, b) => b - a);
            let totalPopulation = populations.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            population.html(totalPopulation.toLocaleString());
        } else {
            population.html(`---`);
        }

        let geoLocationData = {
            location,
            locationToAdd,
            generatedMapData,
            openStreetMapsData,
            currentWeatherData,
            timezoneAndLocationData,
        }

        getOneCallFiveDayForecastDataForCoordinates(coordinatesOfWeatherLocation, geoLocationData);
    }

    return currentWeatherData;
}

const getLocationDataFromOpenStreetMapsNominatimAPI = async (location, searched, firstFire = true) => {
    try {
        let locationQuery = location.includes(`,`) ? location.replace(/,/g, ``) : location;
        locationQuery = location.split(` `).length > 1 ? capWords(location.replace(`?q=`, ``)).replace(/ /g, `%20`) : location;
        let openStreetMapsNominatimLocationQuery = `${openStreetMapsNominatimAPIURL}?addressdetails=1&extratags=1&namedetails=1&q=${locationQuery}&format=json`;
        let openStreetMapsNominatimLocationResponse = await fetch(openStreetMapsNominatimLocationQuery);
        if (openStreetMapsNominatimLocationResponse.ok == true) {
            let openStreetMapsNominatimLocationData = await openStreetMapsNominatimLocationResponse.json();
            if (isValid(openStreetMapsNominatimLocationData)) {
                let firstLocationFound = openStreetMapsNominatimLocationData[0];
                let latitude = parseFloat(firstLocationFound.lat);
                let longitude = parseFloat(firstLocationFound.lon);
                let coordinates = { latitude, longitude, location };
                if (firstFire == true) getCurrentWeatherForLocation(coordinates, searched, openStreetMapsNominatimLocationData);
                setTimeout(() => {
                    toastr.clear();
                }, 2500);
                return openStreetMapsNominatimLocationData;
            } else {
                setTimeout(() => {
                    toastr.clear();
                    toastr.error(`Couldn't find that location`, `Location Not Found`, toastrOptions);
                }, 2500);
                console.log(`Error Getting Location`, {openStreetMapsNominatimLocationResponse, openStreetMapsNominatimLocationData});
                return;
            }
        } else {
            console.log(`Error Getting Location`, openStreetMapsNominatimLocationResponse);
            return;
        }
    } catch (error) {
        console.log(`Error Getting Location`);
        return;
    }
}

const getCurrentWeatherForLocation = async (location, searched, openStreetMapsData = null) => {
    const latt = convertLatLonToDMSDirectionFromCoordinates(location.latitude, `lat`);
    const long = convertLatLonToDMSDirectionFromCoordinates(location.longitude, `lon`);
    const coordinatePoint = `${latt}, ${long};`
    const location_name = typeof location == `string` ? capWords(location) : coordinatePoint;
    try {
        toastr.info(`Getting GeoData for ${location_name}`, `Loading...`, toastrOptions);
        let locationQuery = typeof location == `string` ? `?q=${location}` : `?lat=${location.latitude}&lon=${location.longitude}`;
        let openWeatherForLocationURL = `${openWeatherAPIURL}/weather${locationQuery}&appid=${openWeatherAPIKey}`;
        let openWeatherLocationNameResponse = await fetch(openWeatherForLocationURL);
        if (openWeatherLocationNameResponse.ok == true) {
            let openWeatherLocationNameData = await openWeatherLocationNameResponse.json();
            if (isValid(openWeatherLocationNameData)) {
                setTimeout(() => {
                    toastr.success(`GeoData for ${location_name}`, `Got GeoData`, toastrOptions);
                }, 500);
                return setCurrentWeatherDataFromLocation(openWeatherLocationNameData, location, searched, openStreetMapsData);
            }
        } else {
            toastr.warning(`Checking if ${location_name} is valid...`, `Validating...`, toastrOptions);
            setTimeout(() => {
                toastr.info(`Doing an Extensive Search...`, `Searching...`, { ...toastrOptions, timeOut: 3000 });
            }, 250);
            return getLocationDataFromOpenStreetMapsNominatimAPI(location, searched);
        }
    } catch (error) {
        setTimeout(() => {
            toastr.error(`Couldn't Get GeoData for ${location_name}`, `GeoData Down`, toastrOptions);
        }, 500);
        console.log(`Error Getting GeoData for ${location_name}`, error.message, error);
        return error.message;
    }
}

currentLocationButton.on(`click`, () => {
    getCoordinatesFromCurrentLocation();
})

clearLocations.on(`click`, () => {
    localStorage.clear();
    location.reload(true);
});

buttonContainer.on(`click`, `.locationButton`, (event) => {
    let locationName = $(event.target).html();
    getCurrentWeatherForLocation(locationName, false);
})

buttonContainer.on(`click`, `.removeCityButton`, (event) => {
    $(event.target).parent().remove();
    locations = JSON.parse(localStorage.getItem(locationsDatabaseName));
    let cityToRemoveIndex = $(event.target).attr(`id`);
    locations.splice(cityToRemoveIndex, 1);
    localStorage.setItem(locationsDatabaseName, JSON.stringify(locations));
    if (locations.length === 0) locationsData.hide();
    if (uniqueLocations.length >= 9) checkOverflow(buttonContainer);
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
    locations = JSON.parse(localStorage.getItem(locationsDatabaseName)) || [];
    uniqueLocations = [...new Set(locations)];
    if (locations.length === 0) locationsData.hide();
    getCurrentWeatherForLocation(browserTimezoneCityOrRegion);
    createButtons(uniqueLocations);
}

initializeWeatherApp();