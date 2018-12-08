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
  return searchToLatLong(req.query.data)
  .then(locationData => {
    res.send(locationData);
  })
}

function getWeather(req, res){
  const weatherData = searchForWeather(req.query);
  res.send(weatherData);
}

//Constructor
function Weather(weather) {
  this.forecast = weather.summary;
  this.time = new Date(weather.time * 1000).toDateString();
}

function Location(location){
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}

//Search for Resources
function searchToLatLong(query){
  const url = (`https://maps.googleapis.com/maps/api.geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`)
  return superagent.get(url)
  .then(geoData => {
    const location = new Location(geoData.results[0]);
    return location;
  })
  .catch(err => console.error(err));
}

function searchForWeather(query){
  const url = (`https://api..darksky.net/forecast/key=${process.env.DARKSKYS_API_KEY}/${locationData}`)
  return superagent.get(url)
  .then(weatherData => {
    let dailyForecast = [];
    weatherData.daily.data.forEach(weather => dailyForecast.push(new Weather(weather)));
    return dailyForecast;
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