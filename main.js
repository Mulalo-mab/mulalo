// Base URL for the Open-Meteo weather API
const apiURLBase = "https://api.open-meteo.com/v1/forecast";

// Replace this with your actual HERE API key
const HERE_API_KEY = "YOUR_ACTUAL_API_KEY"; // Make sure to replace this with your actual API key

// Set initial API URL for a default location (Cape Town, South Africa)
let apiURL = `${apiURLBase}?latitude=-33.92&longitude=18.42&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;

// Function to fetch weather data from the Open-Meteo API
async function fetchWeatherData() {
  try {
    // Fetch data from the Open-Meteo API
    const response = await fetch(apiURL);
    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    // Parse the JSON response
    const data = await response.json();

    // Extract current weather data
    const currentTemperature = data.current.temperature_2m;
    const currentWindSpeed = data.current.wind_speed_10m;

    // Update the current weather section in the DOM
    document.getElementById("current-temperature").textContent =
      currentTemperature.toFixed(1); // Display temperature to one decimal place
    document.getElementById("current-wind-speed").textContent =
      currentWindSpeed.toFixed(1); // Display wind speed to one decimal place

    // Extract hourly weather data
    const hourlyTimes = data.hourly.time;
    const hourlyTemperatures = data.hourly.temperature_2m;
    const hourlyHumidities = data.hourly.relative_humidity_2m;
    const hourlyWindSpeeds = data.hourly.wind_speed_10m;

    // Populate the hourly forecast table with weather data
    const tbody = document.querySelector("#hourly-forecast tbody");
    tbody.innerHTML = ""; // Clear any existing content
    for (let i = 0; i < hourlyTimes.length; i++) {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>${hourlyTimes[i]}</td>
                <td>${hourlyTemperatures[i].toFixed(1)}</td>
                <td>${hourlyHumidities[i]}</td>
                <td>${hourlyWindSpeeds[i].toFixed(1)}</td>
            `;
      tbody.appendChild(row); // Add the row to the table body
    }

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

      // Get a textual description of the weather
      const weatherDescription = getWeatherDescription(weatherCode);

      // Create a list item for the daily forecast
      const listItem = document.createElement("li");
      listItem.innerHTML = `
                <h3>${day} (${dailyTimes[i]})</h3>
                <p><strong>Max Temp:</strong> ${maxTemp} °C</p>
                <p><strong>Min Temp:</strong> ${minTemp} °C</p>
                <p><strong>Precipitation:</strong> ${precipitation} mm</p>
                <p><strong>Weather:</strong> ${weatherDescription}</p>
            `;
      dailyList.appendChild(listItem); // Add the list item to the daily forecast list
    }

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

// Function to get a weather description based on the weather code
function getWeatherDescription(code) {
  switch (code) {
    case 0:
      return "Clear sky"; // Weather code 0 represents clear sky
    case 1:
      return "Mainly clear"; // Weather code 1 represents mainly clear
    case 2:
      return "Partly cloudy"; // Weather code 2 represents partly cloudy
    case 3:
      return "Overcast"; // Weather code 3 represents overcast
    case 45:
      return "Fog"; // Weather code 45 represents fog
    case 48:
      return "Rime fog"; // Weather code 48 represents rime fog
    case 51:
      return "Drizzle light"; // Weather code 51 represents light drizzle
    case 53:
      return "Drizzle moderate"; // Weather code 53 represents moderate drizzle
    case 55:
      return "Drizzle dense"; // Weather code 55 represents dense drizzle
    case 56:
      return "Freezing drizzle light"; // Weather code 56 represents light freezing drizzle
    case 57:
      return "Freezing drizzle dense"; // Weather code 57 represents dense freezing drizzle
    case 61:
      return "Showers light"; // Weather code 61 represents light showers
    case 63:
      return "Showers moderate"; // Weather code 63 represents moderate showers
    case 65:
      return "Showers heavy"; // Weather code 65 represents heavy showers
    case 66:
      return "Freezing showers light"; // Weather code 66 represents light freezing showers
    case 67:
      return "Freezing showers heavy"; // Weather code 67 represents heavy freezing showers
    case 71:
      return "Snow fall light"; // Weather code 71 represents light snow fall
    case 73:
      return "Snow fall moderate"; // Weather code 73 represents moderate snow fall
    case 75:
      return "Snow fall heavy"; // Weather code 75 represents heavy snow fall
    case 77:
      return "Snow grains"; // Weather code 77 represents snow grains
    case 80:
      return "Showers of rain light"; // Weather code 80 represents light rain showers
    case 81:
      return "Showers of rain moderate"; // Weather code 81 represents moderate rain showers
    case 82:
      return "Showers of rain heavy"; // Weather code 82 represents heavy rain showers
    case 85:
      return "Snow showers light"; // Weather code 85 represents light snow showers
    case 86:
      return "Snow showers heavy"; // Weather code 86 represents heavy snow showers
    case 95:
      return "Thunderstorms light"; // Weather code 95 represents light thunderstorms
    case 96:
      return "Thunderstorms moderate"; // Weather code 96 represents moderate thunderstorms
    case 99:
      return "Thunderstorms severe"; // Weather code 99 represents severe thunderstorms
    default:
      return "Unknown weather"; // Default case for unrecognized weather codes
  }
}

// Fetch weather data when the page loads
window.onload = fetchWeatherData;

// Function to handle the search functionality
document.getElementById("search-button").addEventListener("click", async () => {
  const searchQuery = document.getElementById("search-input").value; // Get the search query from the input field
  try {
    // Fetch coordinates for the location from the HERE API
    const [latitude, longitude] = await getCoordinates(searchQuery);
    // Update the API URL with the new coordinates and fetch the weather data
    apiURL = `${apiURLBase}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
    fetchWeatherData(); // Fetch weather data for the new location
  } catch (error) {
    console.error("Error getting coordinates:", error); // Log any errors
    alert("Failed to get coordinates for the location."); // Alert the user about the failure
  }
});

// Function to handle the current location functionality
document.getElementById("location-button").addEventListener("click", () => {
  // Get the user's current position
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords; // Extract latitude and longitude from the position object
      // Update the API URL with the user's current coordinates and fetch the weather data
      apiURL = `${apiURLBase}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
      fetchWeatherData(); // Fetch weather data for the user's current location
    },
    (error) => {
      console.error("Error getting location:", error); // Log any errors
      alert("Unable to retrieve your location."); // Alert the user about the failure
    }
  );
});

// Function to get coordinates based on a location name using the HERE API
async function getCoordinates(location) {
  try {
    // Fetch geocode data for the location
    const response = await fetch(
      `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
        location
      )}&apiKey=${HERE_API_KEY}`
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    // Return the latitude and longitude from the response
    return [data.items[0].position.lat, data.items[0].position.lng];
  } catch (error) {
    console.error("Error fetching coordinates:", error); // Log any errors
    throw error; // Re-throw the error to be caught in the search functionality
  }
}

// Function to get location name from latitude and longitude using the HERE API
async function getLocationName(latitude, longitude) {
  try {
    // Fetch reverse geocode data for the coordinates
    const response = await fetch(
      `https://geocode.search.hereapi.com/v1/revgeocode?lat=${latitude}&lon=${longitude}&apiKey=${HERE_API_KEY}`
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    // Return the title of the location from the response
    return data.items[0].title;
  } catch (error) {
    console.error("Error fetching location name:", error); // Log any errors
    return "Error retrieving location name"; // Return a default error message
  }
}
