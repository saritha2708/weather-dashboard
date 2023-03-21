const API_KEY = "f646cc2088f06a521e91017d5b6688c2";
const inputEl = document.querySelector(".input");
const buttonEl = document.querySelector("#submit");
const clearEl = document.getElementById('clear');
const currentDiv = document.querySelector(".current");
const headingDiv = document.querySelector("#heading");
const citiesDiv = document.getElementById("cities");
const $hidden = document.querySelector(".is-hidden");
let citiesSearched = []; // array to store the city names that are searched
getStorage(); // calls the function when page loads

//gets coordinates of the city that we enter in the search bar
function getCityCoordinates(cityName) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=3&appid=${API_KEY}`;

    fetch(url)
    .then(function(response){
        if(response.status === 200){
            return response.json() 
           .then(function(data){
            console.log(data);
            if(data.length === 0){
                alert('Please spell the city name accurately!!')
            }else{
                let latitude = data[0].lat;
                let longitude = data[0].lon;
                $hidden.setAttribute('class','column');   
                getCurrentWeather(latitude,longitude);
                getForecastData(latitude,longitude);
            }
            })
        }else {
            alert('Error: ' + response.statusText);
        }
    });
}    

//gets current weather if we give latitude and longitude of the city
function getCurrentWeather(lat,lon) {
    let currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
    fetch(currentWeatherURL)
    .then(function(response){
        return response.json();    
    }).then(function(data){
        renderCurrentWeather(data);
    })
}

//gets forecast weather if we give latitude and longitude of the city
function getForecastData(lat,lon) {
    let forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
    fetch(forecastURL)
    .then(function(response){
        return response.json()
    }).then(function(data){
        renderForecastWeather(data);
    })
}

//renders current weather on the screen
function renderCurrentWeather(data) {
    let icon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;   
    headingDiv.children[0].textContent = data.name + ' (' + new Date().toLocaleDateString() + ')';
    headingDiv.children[1].setAttribute('src', icon);
    currentDiv.children[1].textContent = "Temp: " + data.main.temp + "°F";
    currentDiv.children[2].textContent = "Wind: " + data.wind.speed + "MPH";
    currentDiv.children[3].textContent = "Humidity: " + data.main.humidity + "%"; 
    setStorage(data.name);     
}

//renders forecast weather on the screen 
function renderForecastWeather(data) {
    let index = 0;
    let time = "09:00:00";
    //for loop to get the index of weather data for 9am next day
    for(let i=0; i< 10; i++){
        if(time === data.list[i].dt_txt.slice(11)){
            index = i;
            break;
        }
    }

    //for loop to render 5-day forecast at 9am 
    for(let i=index,j=1; i< 40; i +=8,j++){
        let $div = document.getElementById(`day${j}`);
        let icon = `https://openweathermap.org/img/wn/${data.list[i].weather[0].icon.slice(0,2)}d@2x.png`;
        $div.children[0].textContent = data.list[i].dt_txt.slice(0,10);
        $div.children[1].setAttribute('src',icon)
        $div.children[2].textContent = "Temp: " + data.list[i].main.temp + "°F";
        $div.children[3].textContent = "Wind: " + data.list[i].wind.speed + "MPH";
        $div.children[4].textContent = "Humidity: " + data.list[i].main.humidity + "%";
    }
    
}   

//stores the searched city in the local storage
function setStorage(city){
    if(citiesSearched.includes(city)){
        return;
    }else {
        citiesSearched.push(city);
        localStorage.setItem("citiesSearched", JSON.stringify(citiesSearched));
        let $button = document.createElement("button");
            $button.textContent = city;
            $button.setAttribute('class', 'button is-fullwidth is-info city')
            citiesDiv.appendChild($button);
    }
}

//gets the list of searched cities from storage
function getStorage(){
    let dummy = JSON.parse(localStorage.getItem("citiesSearched"));
    if(dummy){
        citiesSearched  = dummy;
        citiesSearched.forEach(element => {
            let $button = document.createElement("button");
            $button.textContent = element;
            $button.setAttribute('class', 'button is-fullwidth is-info city')
            citiesDiv.appendChild($button);
        });
    }else{
        citiesSearched = [];
    }
    
}

//clears search history
function clearHistory() {
    localStorage.clear();
    citiesDiv.textContent = '';
} 

//adds event listener for the search button
buttonEl.addEventListener("click", function(){
    let cityName = inputEl.value;
    getCityCoordinates(cityName);
});

//adds event listener to the clear history botton
clearEl.addEventListener('click', clearHistory);

//adds event listener for cities that are in the search history
citiesDiv.addEventListener("click", function(event){
    let e = event.target;
    if(e.matches(".city")) {
        getCityCoordinates(e.textContent);
    }
});

