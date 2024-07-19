// Base URL for the Open-Meteo weather API
const apiURLBase = "https://api.open-meteo.com/v1/forecast";

// Replace this with your actual HERE API key
const HERE_API_KEY = "YOUR_ACTUAL_API_KEY"; // Make sure to replace this with your actual API key

// Set initial API URL for a default location (Cape Town, South Africa)
let apiURL = `${apiURLBase}?latitude=-33.92&longitude=18.42&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;

// Function to fetch weather data from the Open-Meteo API
async function fetchWeatherData() {
  try {
    // Fetch weather data from the API
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();

    // Extract current weather data
    const currentTemperature = data.current.temperature_2m;
    const currentWindSpeed = data.current.wind_speed_10m;

    // Update the current weather section in the DOM
    document.getElementById("current-temperature").textContent =
      currentTemperature.toFixed(1); // Display temperature to one decimal place
    document.getElementById("current-wind-speed").textContent =
      currentWindSpeed.toFixed(1); // Display wind speed to one decimal place

    // Extract hourly weather data for the current day
    const hourlyTimes = data.hourly.time;
    const hourlyTemperatures = data.hourly.temperature_2m;
    const hourlyHumidities = data.hourly.relative_humidity_2m;
    const hourlyWindSpeeds = data.hourly.wind_speed_10m;

    // Get the current time
    const now = new Date();

    // Filter hourly data to only include current and future hours
    const filteredHourlyData = hourlyTimes.map((time, index) => {
      const hour = new Date(time);
      return {
        time,
        temperature: hourlyTemperatures[index],
        humidity: hourlyHumidities[index],
        windSpeed: hourlyWindSpeeds[index]
      };
    }).filter(hourData => new Date(hourData.time) >= now);

    // Populate the hourly forecast table with weather data for the current day
    const tbody = document.querySelector("#hourly-forecast tbody");
    tbody.innerHTML = ""; // Clear any existing content
    filteredHourlyData.forEach(hourData => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${hourData.time}</td>
        <td>${hourData.temperature.toFixed(1)}</td>
        <td>${hourData.humidity}</td>
        <td>${hourData.windSpeed.toFixed(1)}</td>
      `;
      tbody.appendChild(row); // Add the row to the table body
    });

    // Extract daily weather data
    const dailyTimes = data.daily.time;
    const dailyMaxTemps = data.daily.temperature_2m_max;
    const dailyMinTemps = data.daily.temperature_2m_min;
    const dailyPrecipitation = data.daily.precipitation_sum;
    const dailyWeatherCodes = data.daily.weathercode;

    // Populate the 7-day forecast section with weather data
    const dailyList = document.getElementById("daily-list");
    dailyList.innerHTML = ""; // Clear any existing content

    for (let i = 0; i < dailyTimes.length; i++) {
      const date = new Date(dailyTimes[i]); // Create a Date object for the daily weather
      const day = date.toLocaleDateString("en-GB", { weekday: "long" }); // Get the day of the week
      const maxTemp = dailyMaxTemps[i].toFixed(1); // Get the maximum temperature for the day
      const minTemp = dailyMinTemps[i].toFixed(1); // Get the minimum temperature for the day
      const precipitation = dailyPrecipitation[i].toFixed(1); // Get the amount of precipitation for the day
      const weatherCode = dailyWeatherCodes[i]; // Get the weather code for the day

      // Get a textual description and icon class of the weather
      const { description, icon } = getWeatherDescription(weatherCode);

      // Create a list item for the daily forecast
      const listItem = document.createElement("li");
      listItem.classList.add("daily-item");
      listItem.innerHTML = `
        <h3>${day} (${dailyTimes[i]})</h3>
        <p><strong>Max Temp:</strong> ${maxTemp} °C</p>
        <p><strong>Min Temp:</strong> ${minTemp} °C</p>
        <p><strong>Precipitation:</strong> ${precipitation} mm</p>
        <p><strong>Weather:</strong> <i class="${icon}"></i> ${description}</p>
        <button class="expand-btn">Show Hourly Details</button>
        <table class="hourly-details" style="display: none;">
          <thead>
            <tr>
              <th>Time</th>
              <th>Temperature (°C)</th>
              <th>Relative Humidity (%)</th>
              <th>Wind Speed (m/s)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="4">Loading...</td>
            </tr>
          </tbody>
        </table>
      `;

      dailyList.appendChild(listItem); // Add the list item to the daily forecast list
    }

    // Add event listeners to the expand buttons
    document.querySelectorAll('.expand-btn').forEach(button => {
      button.addEventListener('click', async () => {
        const hourlyDetails = button.nextElementSibling;
        if (hourlyDetails.style.display === 'none' || !hourlyDetails.style.display) {
          hourlyDetails.style.display = 'table';
          button.textContent = 'Hide Hourly Details';

          const listItem = button.parentElement;
          const day = listItem.querySelector('h3').textContent.split(' ')[1].replace(/[\(\)]/g, '');

          // Get hourly data for this day
          const dayStartIndex = hourlyTimes.findIndex(time => time.startsWith(day));
          const dailyHourlyData = hourlyTimes.slice(dayStartIndex, dayStartIndex + 24).map((time, index) => ({
            time,
            temperature: hourlyTemperatures[dayStartIndex + index],
            humidity: hourlyHumidities[dayStartIndex + index],
            windSpeed: hourlyWindSpeeds[dayStartIndex + index]
          })).filter(hourData => new Date(hourData.time) >= now);

          const hourlyTbody = hourlyDetails.querySelector('tbody');
          hourlyTbody.innerHTML = '';
          dailyHourlyData.forEach(hourData => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${hourData.time}</td>
              <td>${hourData.temperature.toFixed(1)}</td>
              <td>${hourData.humidity}</td>
              <td>${hourData.windSpeed.toFixed(1)}</td>
            `;
            hourlyTbody.appendChild(row);
          });

        } else {
          hourlyDetails.style.display = 'none';
          button.textContent = 'Show Hourly Details';
        }
      });
    });

    // Fetch and display the location name based on latitude and longitude
    const locationName = await getLocationName(data.latitude, data.longitude);
    document.getElementById("location-name").textContent = locationName; // Display the location name

  } catch (error) {
    // Handle errors that occur during the fetch process
    console.error("Error fetching weather data:", error);
    document.getElementById("current-temperature").textContent = "Error"; // Display an error message in the DOM
    document.getElementById("current-wind-speed").textContent = "Error"; // Display an error message in the DOM
    document.querySelector("#hourly-forecast tbody").innerHTML =
      '<tr><td colspan="4">Failed to load data</td></tr>'; // Show an error message in the hourly forecast table
    document.querySelector("#daily-list").innerHTML =
      "<li>Failed to load data</li>"; // Show an error message in the daily forecast list
    document.getElementById("location-name").textContent = "Error"; // Display an error message for the location name
  }
}

// Function to get a weather description and icon class based on the weather code
function getWeatherDescription(code) {
  switch (code) {
    case 0:
      return { description: "Clear sky", icon: "fas fa-sun" };
    case 1:
      return { description: "Mainly clear", icon: "fas fa-sun" };
    case 2:
      return { description: "Partly cloudy", icon: "fas fa-cloud-sun" };
    case 3:
      return { description: "Overcast", icon: "fas fa-cloud" };
    case 45:
      return { description: "Fog", icon: "fas fa-smog" };
    case 48:
      return { description: "Depositing rime fog", icon: "fas fa-smog" };
    case 51:
      return { description: "Light drizzle", icon: "fas fa-cloud-rain" };
    case 53:
      return { description: "Moderate drizzle", icon: "fas fa-cloud-rain" };
    case 55:
      return { description: "Dense drizzle", icon: "fas fa-cloud-rain" };
    case 56:
      return { description: "Freezing light drizzle", icon: "fas fa-cloud-showers-heavy" };
    case 57:
      return { description: "Freezing dense drizzle", icon: "fas fa-cloud-showers-heavy" };
    case 61:
      return { description: "Slight rain", icon: "fas fa-cloud-rain" };
    case 63:
      return { description: "Moderate rain", icon: "fas fa-cloud-rain" };
    case 65:
      return { description: "Heavy rain", icon: "fas fa-cloud-showers-heavy" };
    case 66:
      return { description: "Freezing light rain", icon: "fas fa-cloud-showers-heavy" };
    case 67:
      return { description: "Freezing heavy rain", icon: "fas fa-cloud-showers-heavy" };
    case 71:
      return { description: "Slight snow fall", icon: "fas fa-snowflake" };
    case 73:
      return { description: "Moderate snow fall", icon: "fas fa-snowflake" };
    case 75:
      return { description: "Heavy snow fall", icon: "fas fa-snowflake" };
    case 77:
      return { description: "Snow grains", icon: "fas fa-snowflake" };
    case 80:
      return { description: "Slight rain showers", icon: "fas fa-cloud-showers-heavy" };
    case 81:
      return { description: "Moderate rain showers", icon: "fas fa-cloud-showers-heavy" };
    case 82:
      return { description: "Violent rain showers", icon: "fas fa-cloud-showers-heavy" };
    case 85:
      return { description: "Slight snow showers", icon: "fas fa-snowflake" };
    case 86:
      return { description: "Heavy snow showers", icon: "fas fa-snowflake" };
    case 95:
      return { description: "Thunderstorm", icon: "fas fa-bolt" };
    case 96:
      return { description: "Thunderstorm with slight hail", icon: "fas fa-bolt" };
    case 99:
      return { description: "Thunderstorm with heavy hail", icon: "fas fa-bolt" };
    default:
      return { description: "Unknown weather", icon: "fas fa-question" };
  }
}

// Function to get location name based on latitude and longitude using HERE API
async function getLocationName(latitude, longitude) {
  try {
    const url = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apikey=${HERE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const locationName = data.items[0]?.address?.label ?? "Unknown location";
    return locationName;
  } catch (error) {
    console.error("Error fetching location name:", error);
    return "Cape Town"; // Default to Cape Town in case of error
  }
}

// Function to handle search and update weather data based on the user's input
async function handleSearch() {
  const city = document.getElementById("search-input").value;
  if (!city) return; // If the input is empty, do nothing

  try {
    // Fetch location data based on the user's input
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(city)}&apikey=${HERE_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    if (data.items.length === 0) throw new Error("City not found");

    const { lat, lng } = data.items[0].position;
    // Update API URL with the new location
    apiURL = `${apiURLBase}?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
    await fetchWeatherData();
  } catch (error) {
    console.error("Error handling search:", error);
    alert("Failed to find city. Please try again.");
  }
}

// Attach event listener to the search button
document.getElementById("search-button").addEventListener("click", handleSearch);

// Fetch initial weather data for the default location
fetchWeatherData();
