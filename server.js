'use strict';

//Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

//Load env vars
require('dotenv').config();

const PORT = process.env.PORT || 3000;


//app
const app = express();

app.use(cors());

//Routes;

app.get('/location', getLocation);

app.get('/weather', getWeather);

app.get('/movies', getMovies);

app.get('/yelp', getYelp);

//Handlers
function getLocation(req, res){
  return searchToLatLong(req.query)
    .then(location => {
      res.send(location);
    });
}

function getWeather(req, res){
  return searchForWeather(req.query)
    .then( weatherData => {
      res.send(weatherData);
    });
}

function getMovies(req, res){
  return searchForMovies(req.query)
    .then( movieData => {
      res.send(movieData);
    });
}

function getYelp (req, res) {
  return searchForYelp (req.query)
    .then (yelpData => {
      res.send(yelpData);
    });  
} 

//Constructor
function Location(city, location){
  this.city = city;
  this.formatted_query = location.formatted_address;
  this.latitude = location.geometry.location.lat;
  this.longitude = location.geometry.location.lng;
}

function Weather(weather) {
  this.forecast = weather.summary;
  this.time = new Date(weather.time * 1000).toDateString();
}

function Movies(flicks){
  this.title = flicks.title;
  this.overview = flicks.overview;
  this.average_votes = flicks.vote_average;
  this.total_votes = flicks.vote_count;
  this.popularity = flicks.popularity;
  this.image_url = `https://image.tmdb.org/t/p/w185/${flicks.poster_path}`;
  this.released_on = flicks.release_date;
}



//Search for Resources
function searchToLatLong(query){
  const city = encodeURIComponent(query.data);
  const url = (`https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.GEOCODE_API_KEY}`);
  return superagent.get(url)
    .then(geoData => {
      const location = new Location(query.data, geoData.body.results[0]);
      return location;
    })
    .catch(err => console.error(err));
}

function searchForWeather(query){
  const url = (`https://api.darksky.net/forecast/${process.env.DARKSKYS_API_KEY}/${query.data.latitude},${query.data.longitude}`);
  return superagent.get(url)
    .then(weatherData => {
      let dailyForecast = [];
      weatherData.body.daily.data.map(weather => dailyForecast.push(new Weather(weather)));
      return dailyForecast;
    })
    .catch(err => console.error(err));
}

function searchForMovies(query){
  const url = (`https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIES_DB_API_KEY}&query=${query.data.city}`);
  return superagent.get(url)
    .then(movieData => {
      let flicks = [];
      movieData.body.results.forEach(movies => flicks.push(new Movies(movies)));
      return flicks;
    })
    .catch(err => console.error(err));
}

function searchForYelp (query) {
  console.log('line 118', query);
  const url = (`https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${query.data.lat}&longitude=${query.data.long}&limit=20`);
  return superagent.get(url)
    .set('Authorization', `Bearer ${process.env.YelpAPIKeyd}`)
    .then(yelpData => {
      yelpData =  JSON.parse(yelpData.text);
      console.log('aaaaaaa',yelpData);
      // console.log('line 123',yelpData);
      //   let restaurantsYelp = [];


    });
}

//Give error message if incorrect
app.get('/*', function(req, res){
  res.status(404).send('you are in the wrong place');
});

//THIS must be at bottom of code!!!
app.listen(PORT, () => {
  console.log(`app is up at port: ${PORT}.`);
});