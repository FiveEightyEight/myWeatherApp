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

// Unsplash: https://source.unsplash.com/collection/boat/300x200

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
const locx = new Storage('loc');
const cityGif = new Storage('cityGif');

// Global  Selectors // 
const input = document.querySelector('.js-input-main');
const inputBtn = document.querySelector('.js-search-btn');
const weatherContainer = document.querySelector('.js-forecast');


// API Calls //

// OpenWeather
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


// Giphy API
const getGifs = (search, mainCb) => {
    const api_key = 'siIyo4w5mg0REENX76Sr57QTgkt3BWvY';
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${search}&limit=1`;

    GETRequest(url, cb => {
        mainCb(cb);
    });

}



// Helper Functions // 

const checkLocHist = (loc, notFound = true) => {

    // check if any cities are stored in locations array in state obj
    if (state.locations.length > 0) {
        // if true, then
        // loop through locations array in state obj
        for (let i = 0; i < state.locations.length; i++) {

            // store the name of city in variable
            const cityName = state.locations[i].city.trim().toLowerCase();

            // does cityName at current index match the loc entered?
            if (loc === cityName) {

                //loc is found, no need to call the weather APIs
                notFound = false;
                // if there is a match, move city to first index
                const currentCity = state.locations[i];
                const firstPart = state.locations.slice(0, i);
                const lastPart = state.locations.slice(i + 1)

                state.locations = [currentCity].concat(firstPart.concat(lastPart));

                render(state);
                locx.save(state.locations);
                return true;
            }

        }


    } // More Code Below //


    // loc NOT found in state.locations Checks loc_History to see if it exist in openWeather memory
    // if not in openWeather, do API call to get lat & lon
    if (notFound) {
        for (let i = 0; i < state.loc_hist.length; i++) {

            const city = state.loc_hist[i].city.toLowerCase();
            if (loc === city) {
                const lat = state.loc_hist[i].lat;
                const lon = state.loc_hist[i].lon;
                darkSky(lat, lon, d => {
                    // THIS IS WHERE DARKSKY RETURNS DATA
                    // Parse darkSky text
                    const drkSky = JSON.parse(d.res.text);
                    buildForecast(state.loc_hist[i], drkSky, cb => {
                        state.locations.unshift(cb);
                        console.log(`${cb.city} added using loc_hist`)
                        render(state);
                        locx.save(state.locations);
                    });
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
                buildForecast(cb, drkSky, city => {
                    state.locations.unshift(city);
                    console.log(`${city.city} added from scratch`)
                    render(state);
                    locx.save(state.locations);
                })
                // console.log(d.res.text);
            })
        })
        return false;

    }
    // render(state);
}
const updateLocation = (index) => {
    const city = state.locations[index];
    console.log(`${city.city} to be Updated!`)
    

    darkSky(city.lat, city.lon, d => {

        // Parse darkSky text
        const drkSky = JSON.parse(d.res.text);

        buildForecast(city, drkSky, cityU => {
            removeCity(index, cityU);
        })

    })


}


// API caller // Needs a URL, data received passed through a callback
const GETRequest = (url, cb) => {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('load', response => {
        const data = JSON.parse(response.currentTarget.response);

        cb(data);
    });
    request.send();
}

const buildForecast = (openWeather, darkSky, cb) => {

    console.log('IN BUILDER FUNCTION')
    // console.log(openWeather);
    console.log(darkSky);
    console.log('~*~*~*~**~*~*~*~*~*~')


    // construct an empty city object 
    const nuCity = {};

    // manually assign keys with the corresponding value from the respective API
    nuCity.city = openWeather.city;
    nuCity.lat = openWeather.lat;
    nuCity.lon = openWeather.lon;
    nuCity.lastUpdated = darkSky.currently.time;

    // create an empty array to hold forecast objects for the next five days
    nuCity.forecast = [];

    // loop through the first five forecast
    for (let i = 0; i < 5; i++) {
        let currentDay = darkSky.daily.data[i];

        // check gify KEY object in state to see if the ICON for the CURRENT forecast day exist
        if (!state.gifs[currentDay.icon]) { // NOTE: this if statement evalutes to TRUE if 
            // state.gifs[currentDay.icon]  evaluates to undefined

            // if it does NOT exist, do an API call to giphy
            getGifs(currentDay.icon, cb => {
                state.gifs[currentDay.icon] = cb.data[0].images.original.url;
                console.log(`giphy at i = ${i}`)

                // giphy was updated so RENDER the state
                // this will also update icons onces they have loaded (API call is received)
                render(state);
                cityGif.save(state.gifs);
            });
        }
        // manually assign keys with the corresponding value from the darkSky API
        const day = {};
        day.time = currentDay.time;
        day.icon = currentDay.icon;
        day.high = currentDay.temperatureHigh;
        day.low = currentDay.temperatureLow;
        day.summary = currentDay.summary;
        nuCity.forecast.push(day);
    };

    // city is now passed via cb, to make function more flexible

    cb(nuCity);


    /*
    // place the nuCity object at the start of the state.locations array.
    state.locations.unshift(nuCity);
    console.log(`main`)
    render(state);
    locx.save(state.locations);
     */

};

// Remove City from State

const removeCity = (index, replacement = null) => {
    /*
    const firstPart = state.locations.slice(0, index);
    const lastPart = state.locations.slice(index + 1)

    state.locations = firstPart.concat(lastPart);
    */
   if (replacement === null){
    state.locations.splice(index, 1);
    render(state);
    locx.save(state.locations);
   } else {
    state.locations.splice(index, 1, replacement);
            console.log(`city at index ${index} replaced with ${replacement.city}`)
            render(state);
            locx.save(state.locations);
   }
    
}


// State

const state = {
    locations: [],

    gifs: {
        'not-loaded': 'https://media1.giphy.com/media/3o7bu3XilJ5BOiSGic/giphy.gif',
    },

    loc_hist: [],

};



// Events

input.addEventListener('keydown', e => {

    // Location Listener / Search when ENTER key is pressed down
    if (e.keyCode === 13) {
        const search = e.target.value.trim().toLowerCase();
        if (search === "" || search.trim() === "") {
            e.target.value = '';
            return;
        }

        console.log(`${search} found in memory? ${checkLocHist(search)}`)
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

});

weatherContainer.addEventListener('click', e => {
    if (e.target.matches('.js-delete-btn')) {
        const index = e.target.getAttribute('data-index');
        removeCity(index);
    }
});




// RENDER HELPERS

const getDayName = (datetime) => {
    const day = new Date(datetime * 1000).getDay();
    const days = ["Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"]
    return days[day] + "day";
}

const renderForecastItem = (forecastItem, state, seconds, minutes, hours) => {
    const day = getDayName(forecastItem.time);


    let iconURL = state.gifs[forecastItem.icon];
    if (typeof iconURL === "undefined") {
        iconURL = state.gifs['not-loaded']
    }


    let timestamp = '';
    if (seconds === 0) {
        timestamp = `<small class="text-muted">Just updated</small>`;
    } else if (minutes <= 0) {
        timestamp = `<small class="text-muted">Last updated ${seconds} seconds ago</small>`;
    } else if (hours >= 1) {
        timestamp = `<small class="text-muted">Last updated ${hours} hour ago</small>`;
    } else {

        timestamp = `<small class="text-muted">Last updated ${minutes} mins ago</small>`;
    }

    return `<div class="card btn-outline-dark">
    <img class="card-img-top"  src="${iconURL}" alt="Card image cap">
    <div class="card-body">
        <h5 class="card-title">${Math.floor(forecastItem.high)} &deg; F / ${Math.floor(forecastItem.low)} &deg; F</h5>
        <span class="text-muted">${day}</span>
        <p class="card-text"> ${forecastItem.summary}</p>
    </div>
    <div class="card-footer">
        ${timestamp}
    </div>
    </div>`;

    /*`<div class="column">
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
    </div>`*/

}



// RENDER 
const render = state => {

    const weatherContainer = document.querySelector('.js-forecast');
    let html = '';
    // for (let location of state.locations) {
    for (let x = 0; x < state.locations.length; x++) {
        let forecastHTML = '';
        let location = state.locations[x];

        for (let i = 0; i < 5; i++) {

            let forecastItem = location.forecast[i]; // forecast per day

            //***   MOVING DATE AND TIME OUT OF FORECAST RENDER ***


            let timeNow = new Date();
            let timeDate = location.lastUpdated


            timeDate *= 1000;
            timeNow = timeNow.getTime();
            // console.log(`timenow  = ` + timeNow);
            // console.log(`timeDate = ` + timeDate);

            // timeNow = timeNow.getTime()/1000;


            let difference = timeNow - timeDate;
            // to Milliseconds
            // console.log(`difference in milliseconds = ${difference}`);

            /*
          difference_ms = difference_ms/1000;
        
          var seconds = Math.floor(difference_ms % 60);
        
          difference_ms = difference_ms/60; 
          var minutes = Math.floor(difference_ms % 60);
        
          difference_ms = difference_ms/60; 
          var hours = Math.floor(difference_ms % 24);  
        
          var days = Math.floor(difference_ms/24);
           */
            difference /= 1000;
            // console.log(`milliseconds = ${difference}`);

            // to seconds
            const seconds = Math.floor(difference % 60);
            // console.log(`seconds = ${seconds}`);
            // console.log(difference);

            // to minutes
            difference = difference / 60;
            const minutes = Math.floor(difference % 60);
            // console.log(`minutes = ${minutes}`);

            // to hours
            difference = difference / 60;
            const hours = Math.floor(difference % 24);
            // console.log(`hours = ${hours}`);

            // to days 
            // const days = Math.floor(difference / 24);

            if (hours > 1) {
                updateLocation(x);
                break;
            }

            forecastHTML += renderForecastItem(forecastItem, state, seconds, minutes, hours);
        }

        // `<div class="ui five column grid centered">


        html += `
            <div class='btn-secondary rounded my-2'> 
            <div class='row text-center  p-3'> 
            <div class='col-12 text-right'><button type="button" class="close" aria-label="Close">
            <span aria-hidden="true" class='js-delete-btn' data-index=${x} >&times;</span>
          </button></div>
            <p class='font-weight-bold h1 col-12'>${location.city}</p>
            <p class='text-warning col-12'>${location.lat}, ${location.lon}</p>
            </div>
            <div class="card-group pb-5 px-5">
            ${forecastHTML}
            </div>
            </div>`;
        // </div>`
        // <a class='btn btn-danger text-white h5 js-delete-btn' data-index=${x}>X</a>
        ////border-top border-dark
        // <h1 style="width:100%;">${location.city}</h1>
        // <h3 style="width:100%;">${location.lat}, ${location.lon}</h3>
    }

    weatherContainer.innerHTML = html;
}



// Check Storage


if (loc_hist.getStorage()) {
    // If there is then apply that to my state in Memory ///
    state.loc_hist = loc_hist.getStorage();
}

if (locx.getStorage()) {
    state.locations = locx.getStorage();
}

if (cityGif.getStorage()) {
    state.gifs = cityGif.getStorage();
}

render(state)


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


// getGifs test
// getGifs('sun', cb => {
//     console.log(cb.data[0].images.original.url);

// })