'use strict';

var idcodes;

//saved to make html strings shorter
var APIid = '44db6a862fba0b067b1930da0d769e98';

$(function ()  {
  loadFromLocalStorage();
  $('#addZip').click(addZip);
  $('#refresh').click(refresh);
  $('.cards').on('click', '.remove', removeCard);
  $('.cards').on('click', '.show', forecast);
});

function loadFromLocalStorage() {//checks for localStorage and makes cards for existing
  if (localStorage.idcodes === undefined) {
    localStorage.idcodes = '[]';
  }

  idcodes = JSON.parse(localStorage.idcodes);

  idcodes.forEach(function (oneid) {
    findWeather(oneid);
  });
}

function refresh() { //resend ajax requests for current cards
  $('.cards').empty();
  loadFromLocalStorage();

}

function addZip(e) {//pushes the zipcode to the findNewWeather ajax function
  e.preventDefault();
  var newZip = $('#zipcode').val();
  $('#zipcode').val('');
  findNewWeather(newZip);
}

function saveToLocalStorage() {//push new city idcode to localStorage
  localStorage.idcodes = JSON.stringify(idcodes);
}

function findNewWeather(zip) {
  //find weather for location just searched for, and push the idcode

  $.ajax({
    method:'GET',
    url:`http://api.openweathermap.org/data/2.5/weather?zip=${zip}&units=imperial&appid=${APIid}`,
    success: function (data) {
      if (data.cod !== 200) {
        $('.noResults').css('display', 'inherit');
      } else {
        $('.noResults').css('display', 'none');
        $('.cards').append(makeWeatherCard(data));
        idcodes.push(data.id);
        saveToLocalStorage();
      };
    },

    error: function (err) {
      console.log('ERR', err);
    },
  });
}

function findWeather(id) {
  //for loading weather from localStorage of ID numbers
  $.ajax({
    method:'GET',
    url:`http://api.openweathermap.org/data/2.5/weather?id=${id}&units=imperial&appid=${APIid}`,
    success: function (data) {
      $('.cards').append(makeWeatherCard(data));
    },

    error: function () {
      setTimeout(findWeather(id), 1500);
    },
  });
}

function makeWeatherCard(data) {//for making each new weather card, cloned from template
  var $card = $('#template').clone();
  $card.removeAttr('id').addClass('cardResults');
  $card.find('.city').text(data.name);
  $card.find('.temperature').text(Math.round(data.main.temp) +  '°F');
  $card.find('.weatherImage').attr('src', 'http://openweathermap.org/img/w/' + data.weather[0].icon + '.png');
  $card.find('.weatherDescription').text(data.weather[0].description);
  var timeConverted = new Date(data.dt * 1000); //convert to readable time
  $card.find('.timeStamp').text(timeConverted.toLocaleString());
  $card.find('.idcode').text(data.id);

  return $card;
}

function removeCard() {//removes card on click of X
  var code = parseInt($(this).parent().find('.idcode').text());

  var index = idcodes.indexOf(code);
  idcodes.splice(index, 1);
  saveToLocalStorage();
  $(this).closest('.card').remove();
}

function forecast() {//ajax request for 3 day forecast data
  var $thisCard = $(this).siblings('.forecast');
  $(this).siblings('.forecast').toggle();  //toggle hidden or show
  var id = $(this).siblings('.idcode').text();

  $.ajax({
    method:'GET',
    url:`http://api.openweathermap.org/data/2.5/forecast/daily?id=${id}cnt=3&units=imperial&appid=${APIid}`,
    success: function (data) {
      makeForecast(data, $thisCard);
    },

    error: function () {
      console.log('error');
    },
  });
}

function makeForecast(data, $this) { //shows hidden forecast area and appends data
//days temps of max / min, rounded
  $this.find('.day1 span').text(Math.round(data.list[0].temp.max) + ' / ' + Math.round(data.list[0].temp.min) + ' °F');
  $this.find('.day2 span').text(Math.round(data.list[1].temp.max) + ' / ' + Math.round(data.list[1].temp.min) + ' °F');
  $this.find('.day3 span').text(Math.round(data.list[2].temp.max) + ' / ' + Math.round(data.list[2].temp.min) + ' °F');

//days icon image for weather (like rainy or cloudy)
  $this.find('.day1 img').attr('src', 'http://openweathermap.org/img/w/' + data.list[0].weather[0].icon + '.png');
  $this.find('.day2 img').attr('src', 'http://openweathermap.org/img/w/' + data.list[1].weather[0].icon + '.png');
  $this.find('.day3 img').attr('src', 'http://openweathermap.org/img/w/' + data.list[2].weather[0].icon + '.png');
}
