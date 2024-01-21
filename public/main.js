document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('city-input');
  const searchButton = document.getElementById('search-button');

  loadGoogleMapsScript('initMap');

  searchButton.addEventListener('click', function () {
    const city = searchInput.value;
    fetchWeatherData(city);
  });
});

let map;

async function fetchWeatherData(city) {
  try {
    const response = await fetch(`http://localhost:3000/weather?city=${city}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (
      data.coordinates &&
      typeof data.coordinates.lat === 'number' &&
      typeof data.coordinates.lon === 'number' &&
      !isNaN(data.coordinates.lat) &&
      !isNaN(data.coordinates.lon)
    ) {
      updateWeatherUI(data);
      initMap(data.coordinates);
      const timeZone = await getTimeZone(data.coordinates.lat, data.coordinates.lon);
      if (timeZone) {
        displayLocalTime(timeZone);
      }
    } else {
      console.error('Invalid coordinates in the API response:', data.coordinates);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
}

function updateWeatherUI(weatherData) {
  const weatherContainer = document.getElementById('weather-container');
  weatherContainer.innerHTML = ''; 

  const cityName = createWeatherElement('h2', `City: ${weatherData.city}`);
  const temperature = createWeatherElement('p', `Temperature: ${weatherData.temperature.celsius}°C`);
  const description = createWeatherElement('p', `Description: ${weatherData.description}`);
  const icon = createWeatherImage(`http://openweathermap.org/img/w/${weatherData.icon}.png`, 'Weather Icon');
  const coordinates = createWeatherElement('p', `Coordinates: Lat ${weatherData.coordinates.lat}, Lon ${weatherData.coordinates.lon}`);
  const feelsLike = createWeatherElement('p', `Feels Like: ${weatherData.feelsLike}°C`);
  const humidity = createWeatherElement('p', `Humidity: ${weatherData.humidity}%`);
  const pressure = createWeatherElement('p', `Pressure: ${weatherData.pressure} hPa`);
  const windSpeed = createWeatherElement('p', `Wind Speed: ${weatherData.windSpeed} m/s`);
  const countryCode = createWeatherElement('p', `Country Code: ${weatherData.countryCode}`);
  const rainVolume = createWeatherElement('p', `Rain Volume (last 3 hours): ${weatherData.rainVolume} mm`);

  appendElements(weatherContainer, [cityName, temperature, description, icon, coordinates, feelsLike, humidity, pressure, windSpeed, countryCode, rainVolume]);
}

function createWeatherElement(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function createWeatherImage(src, alt) {
  const image = document.createElement('img');
  image.src = src;
  image.alt = alt;
  return image;
}

function appendElements(container, elements) {
  elements.forEach(element => container.appendChild(element));
}

function loadGoogleMapsScript(callback) {
  if (!window.google || !window.google.maps) {
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDIcyq7D-vsf4_rPxnuGiZUDwtk4pKxTSc&callback=${callback}`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;

    window.initMap = window[callback];

    document.head.appendChild(googleMapsScript);
  } else {
    window[callback]();
  }
}

function initMap(coordinates) {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found.');
    return;
  }
  if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lon === 'number') {
    map = new google.maps.Map(mapContainer, {
      center: new google.maps.LatLng(coordinates.lat, coordinates.lon),
      zoom: 10,
    });

    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(coordinates.lat, coordinates.lon),
      map: map,
      title: 'Weather Location',
    });
  } else {
    map = new google.maps.Map(mapContainer, {
      center: new google.maps.LatLng(0, 0),
      zoom: 2,
    });
  }
}

async function getTimeZone(lat, lon) {
  try {
    const response = await fetch(`http://api.timezonedb.com/v2.1/get-time-zone?key=QU8YLVHYKXH6&format=json&by=position&lat=${lat}&lng=${lon}`);
    const data = await response.json();
    if (data.status === 'OK') {
      return data.zoneName;
    } else {
      console.error('Error fetching time zone information:', data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching time zone information:', error.message);
    return null;
  }
}
function displayLocalTime(timeZone) {
  const localTimeContainer = document.getElementById('local-time');
  const localTime = new Date().toLocaleString('en-US', { timeZone: timeZone });
  localTimeContainer.textContent = `Local Time: ${localTime}`;
}

