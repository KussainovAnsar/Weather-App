const express = require("express");
const https = require("https");
const path = require("path");
const app = express();
const port = 3000;
const apiKey = "0e6b9a1893a47c1f2fd8c3d909372714";
const googleMapKey = 'AIzaSyDIcyq7D-vsf4_rPxnuGiZUDwtk4pKxTSc';
const timeZoneApiKey = 'QU8YLVHYKXH6'

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "public/index.html");
  res.sendFile(indexPath);
});

app.get("/weather", (req, res) => {
  const cityName = req.query.city;
  if (!cityName) {
    return res.status(400).json({ error: "City parameter is required" });
  }

  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

  https.get(weatherURL, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
  
    response.on('end', () => {
      try {
        const weatherData = JSON.parse(data);
        if (
          weatherData &&
          weatherData.main &&
          weatherData.main.temp &&
          weatherData.weather &&
          weatherData.weather[0] &&
          weatherData.weather[0].description &&
          weatherData.weather[0].icon &&
          weatherData.coord &&
          weatherData.main.feels_like &&
          weatherData.main.humidity &&
          weatherData.main.pressure &&
          weatherData.wind &&
          weatherData.wind.speed &&
          weatherData.sys &&
          weatherData.sys.country
        ) {
          const celsiusTemperature = (weatherData.main.temp - 273.15).toFixed(1);
          res.json({
            city: weatherData.name,
            temperature: { celsius: celsiusTemperature },
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon,
            coordinates: weatherData.coord,
            feelsLike: (weatherData.main.feels_like - 273.15).toFixed(1),
            humidity: weatherData.main.humidity,
            pressure: weatherData.main.pressure,
            windSpeed: weatherData.wind.speed,
            countryCode: weatherData.sys.country,
            rainVolume: weatherData.rain ? weatherData.rain['1h'] : 0,
          });
        } else {
          console.error('Error parsing weather data: Response format is not as expected.');
          res.status(500).json({ error: 'Internal Server Error' });
        }
      } catch (error) {
        console.error('Error parsing weather data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  });
  
});

app.post('/', (req, res) => {
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
