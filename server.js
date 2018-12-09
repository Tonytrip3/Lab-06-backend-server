'use strict';

//Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent')

//Load env vars
require('dotenv').config();

const PORT = process.env.PORT || 3000;

//app
const app = express();

app.use(cors());

//Routes;

app.get('/location', getLocation)

app.get('/weather', getWeather)


//Handlers
function getLocation(req, res){
  return searchToLatLong(req.query)
  .then(location => {
    res.send(location);
  })
}

function getWeather(req, res){
  return searchForWeather(req.query)
  .then( weatherData => {
    res.send(weatherData);
  })
}

function getMovies(req, res){
  return searchForMovies(req.query)
  .then( movieData => {
    res.send(movieData);
  })
}

//Constructor
function Location(location){
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}

function Weather(weather) {
  this.forecast = weather.summary;
  this.time = new Date(weather.time * 1000).toDateString();
}

// function Movies(){
  // this. =;
  // this. =;
  // this. =;
// }

//Search for Resources
function searchToLatLong(query){
  const url = (`https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`)
  return superagent.get(url)
  .then(geoData => {
    const location = new Location(geoData.body.results[0]);
    return location;
  })
  .catch(err => console.error(err));
}

function searchForWeather(query){
  const url = (`https://api.darksky.net/forecast/${process.env.DARKSKYS_API_KEY}/${query.data.latitude},${query.data.longitude}`)
  return superagent.get(url)
  .then(weatherData => {
    let dailyForecast = [];
    weatherData.body.daily.data.forEach(weather => dailyForecast.push(new Weather(weather)));
    return dailyForecast;
  })
  .catch(err => console.error(err));
}

function searchForMovies(query){
const url = (`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIES_DB_API_KEY}&query=${query}`)
  return superagent.get(url)
  .then(movieData => {
    return ;
  })
  .catch(err => console.error(err));
}

//Give error message if incorrect
app.get('/*', function(req, res){
  res.status(404).send('you are in the wrong place');
})

//THIS must be at bottom of code!!!
app.listen(PORT, () => {
  console.log(`app is up at port: ${PORT}.`)
})