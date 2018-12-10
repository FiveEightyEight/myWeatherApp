/*

API: Open Weather 
api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=2d3d97dc77ad68ed64beb4e04ea81937

*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*

 API: Dark Sky 
https://api.darksky.net/forecast/2997b4a60f5867d642c137e48b2245b3/37.8267,-122.4233
https://wt-taqqui_karim-gmail_com-0.sandbox.auth0-extend.com/darksky?api_key={API_KEY}&lat={LAT}&lng={LNG}

*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*
API: Giphy 

const getGifs = (search, cb) => {
    if (search === "" || search.trim() === "") {
        return;
    }

    const api_key = 'siIyo4w5mg0REENX76Sr57QTgkt3BWvY';
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${search}`;

    let request = new XMLHttpRequest();
    request.open("GET", url);
    request.addEventListener('load', (response) => {
        const data = JSON.parse(response.currentTarget.response);

        const gifArray = [];
        data.data.forEach(currentGif => {
            const url = currentGif.images.original.url;
            gifArray.push(url);
        });

        cb(gifArray);
    })
    request.send(null);
}

*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*~~~~*

*/

/* 

/[\/[\/[\/[\/[\/[\/[\/[\/[ STORAGE /]\/]\/]\/]\/]\/]\/]\/]\/]

class Storage {
    constructor(key) {
        this.key = key;
    }
    getStorage() {
        const data = window.localStorage.getItem(this.key);
        if (data) {
            return JSON.parse(data);
        }
        return data;
    }
    save(data) {
        window.localStorage.setItem(this.key, JSON.stringify(data))
    }
}

/// Storage KEY  /////
const storage = new Storage('app-state'); 
///             ///// 


vv ///                   Check Local Storage                               //// vv
vv /// Checking if there is anything in the local storage ///  vv

const stored_state = storage.getStorage();
if (stored_state) {
    // If there is then apply that to my state in Memory ///
    state = stored_state;
}

^^ ///                   Check Local Storage                               //// ^^
*/

// Classes

class Storage {
    constructor(key) {
        this.key = key;
    }
    getStorage() {
        const data = window.localStorage.getItem(this.key);
        if (data) {
            return JSON.parse(data);
        }
        return data;
    }
    save(data) {
        window.localStorage.setItem(this.key, JSON.stringify(data))
    }
}


class Location {
    constructor(city, country, latitude, longitude) {
        this.city = city;
        this.country = country;
        this.lat = latitude;
        this.lon = longitude;
    }
}

// class skyLoc {
//     constructor(location, time);
// }



// <<=== Global Variables ===>> //

// {Storage Variables}//
const loc_hist = new Storage('loc-hist');

// Global  Selectors // 
const input = document.querySelector('.js-input-main');
const inputBtn = document.querySelector('.js-search-btn');


// API Calls //

const openWeather = (location, mainCb) => {
    // if (search === "" || search.trim() === "") {
    //     return;
    // }

    const api_key = '2d3d97dc77ad68ed64beb4e04ea81937';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&APPID=${api_key}`;

    GETRequest(url, cb => {

        const locationDate = new Location(cb.name, cb.sys.country, cb.coord.lat, cb.coord.lon)
        state.loc_hist.push(locationDate);
        loc_hist.save(state.loc_hist);
        mainCb(locationDate);

    })
}

// DarkSky

const darkSky = (lat, lon, mainCb) => {

    const api_key = '2997b4a60f5867d642c137e48b2245b3';
    const url = `https://wt-taqqui_karim-gmail_com-0.sandbox.auth0-extend.com/darksky?api_key=${api_key}&lat=${lat}&lng=${lon}`;
    //  needs comments to explain code
    // 
    GETRequest(url, cb => {
        mainCb(cb);
    });


}
// openWeather('Austin,us')


// Helper Functions // 

const checkLocHist = (loc) => {

    // Checks loc_History to see if it exist in memory

    for (let i = 0; i < state.loc_hist.length; i++) {

        const city = state.loc_hist[i].city.toLowerCase();
        if (loc === city) {
            const lat = state.loc_hist[i].lat;
            const lon = state.loc_hist[i].lon;
            darkSky(lat, lon, d => {
                // THIS IS WHERE DARKSKY RETURNS DATA
                // Parse darkSky text
                const drkSky = JSON.parse(d.res.text);
                buildForecast(state.loc_hist[i], drkSky);
                // console.log(d.res.text);

            });
            return true;
        }
    }

    // Was not found, RUN openWeather

    openWeather(loc, cb => {
        console.log(`FALSE: RUNNING OPENING WEATHER ON: ${loc}`);

        darkSky(cb.lat, cb.lon, d => {
            console.log(`RUNNING DARKSKY ON ${loc}`);
            // Parse darkSky text
            const drkSky = JSON.parse(d.res.text);
            // THIS IS WHERE DARKSKY RETURNS DATA
            buildForecast(cb, drkSky)
            // console.log(d.res.text);
        })
    })
    return false;
}



const GETRequest = (url, cb) => {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('load', response => {
        const data = JSON.parse(response.currentTarget.response);

        cb(data);
    });
    request.send();
}

const buildForecast = (openWeather, darkSky) => {

    console.log('IN BUILDER FUNCTION')
    // console.log(openWeather);
    console.log(darkSky);
    console.log('~*~*~*~**~*~*~*~*~*~')

    const testArray = [];

    const nuCity = {};
    nuCity.city = openWeather.city;
    nuCity.lat = openWeather.lat;
    nuCity.lon = openWeather.lon;
    nuCity.lastUpdated = darkSky.currently.time;
    nuCity.forecast = [];
    

    for (let i = 0; i < 5; i ++) {
        let currentDay = darkSky.daily.data[i];
        const day = {};
            day.time = currentDay.time;
            day.icon = currentDay.icon;
            day.high = currentDay.temperatureHigh;
            day.low = currentDay.temperatureLow;
            day.summary = currentDay.summary;
            nuCity.forecast.push(day);
    }

    
    state.locations.unshift(nuCity);
    render(state);

}


// State

const state = {
    locations: [],
  
    gifs: {
        'partly-cloudy': '',
        'not-loaded': 'https://media1.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif',
    },

    loc_hist: [],

}



// Events

input.addEventListener('keydown', e => {

    // Location Listener / Search when ENTER key is pressed down
    if (e.keyCode === 13) {
        const search = e.target.value.trim().toLowerCase();
        if (search === "" || search.trim() === "") {
            e.target.value = '';
            return;
        }

        console.log(`${search} is currently in history? ${checkLocHist(search)}`)
        e.target.value = '';


    }
    // if (e.target.value === )
})

inputBtn.addEventListener('click', e => {
    const search = input.value.trim().toLowerCase();
    if (search === "" || search.trim() === "") {
        input.value = '';
        return;
    }

    console.log(`${search} is currently in history? ${checkLocHist(search)}`)
    input.value = '';

})

const getDayName = (datetime) => {
    const day = new Date(datetime*1000).getDay();
    const days = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"]
    return days[day] + "day";
}

const renderForecastItem = (forecastItem, state) => {
    const day = getDayName(forecastItem.time)
    let iconURL = state.gifs[forecastItem.icon];
    if (typeof iconURL === "undefined") {
        iconURL = state.gifs['not-loaded']
    }
    return `<div class="column">
        <div class="ui card fluid">
            <div class="image">
            <img src="${iconURL}">
            </div>
            <div class="content">
            <a class="header">${Math.floor(forecastItem.high)} &deg; F / ${Math.floor(forecastItem.low)} &deg; F</a>
            <div class="meta">
                <span class="date">${day}</span>
            </div>
            <div class="description">
                ${forecastItem.summary}
            </div>
            </div>
        </div>
    </div>`;
}



// RENDER 
const render = state => {    

    const weatherContainer = document.querySelector('.js-forecast');
    let html = '';
    for (let location of state.locations) {
        let forecastHTML = '';

        for (let i = 0; i < 5; i++) {
            let forecastItem = location.forecast[i];  // forecast per day
            forecastHTML += renderForecastItem(forecastItem, state);
        }
        
        html += `<div class="ui five column grid centered">
           
            
            <div class='row'>
            <p class='font-weight-bold h1 col-12'>${location.city}</p>
            <p class='text-muted col-12'>${location.lat}, ${location.lon}</p>
            </div>

            ${forecastHTML}
        </div>`;
        // <h1 style="width:100%;">${location.city}</h1>
        // <h3 style="width:100%;">${location.lat}, ${location.lon}</h3>
    }

    weatherContainer.innerHTML = html;
}

render(state)

// Check Storage


if (loc_hist.getStorage()) {
    // If there is then apply that to my state in Memory ///
    state.loc_hist = loc_hist.getStorage();
}



// TEST

console.log(state);

/* TODO:
    -Implement input validation
        -split string by commas
        -if split array.length > 2, throw error
        -else, try to coerce each index value to a number
        -store and check if they are numbers
        -if yes
            -it's lat/long
        -if no
            -it's a city
        
*/