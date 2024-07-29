document.addEventListener('DOMContentLoaded', () => {
  const latitude = -33.9258;
  const longitude = 18.4232;
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Africa/Johannesburg`;

  const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      updateCurrentWeather(data.current);
      updateDailyForecast(data.daily, data.hourly);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const updateCurrentWeather = (current) => {
    document.getElementById('current-temperature').textContent = `${current.temperature_2m} °C`;
    document.getElementById('current-wind-speed').textContent = `${current.wind_speed_10m} km/h`;

    const weatherDescription = getWeatherDescription(current.weathercode);
    const currentWeatherDiv = document.getElementById('current-weather');

    currentWeatherDiv.innerHTML = `
      <i class="${weatherDescription.icon}"></i>
      <p>${weatherDescription.description}</p>
    `;
  };

  const updateDailyForecast = (daily, hourly) => {
    const dailyList = document.getElementById('daily-list');
    dailyList.innerHTML = '';

    daily.temperature_2m_max.forEach((maxTemp, i) => {
      const listItem = document.createElement('li');
      const weatherDescription = getWeatherDescription(daily.weathercode[i]);

      const weatherIcon = `<i class="${weatherDescription.icon}"></i>`;

      const date = new Date();
      date.setDate(date.getDate() + i);
      const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };

      listItem.innerHTML = `
        <h3>${date.toLocaleDateString(undefined, options)}</h3>
        <p>Max Temp: ${maxTemp} °C</p>
        <p>Min Temp: ${daily.temperature_2m_min[i]} °C</p>
        <p>Weather: ${weatherIcon} ${weatherDescription.description}</p>
        <button class="expand-btn">Show Hourly Details</button>
        <div class="hourly-details" style="display: none;">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Temperature (°C)</th>
                <th>Humidity (%)</th>
                <th>Wind Speed (km/h)</th>
              </tr>
            </thead>
            <tbody>
              <!-- Hourly data will be added here -->
            </tbody>
          </table>
        </div>
      `;
      dailyList.appendChild(listItem);

      listItem.querySelector('.expand-btn').addEventListener('click', () => {
        const hourlyDetailsDiv = listItem.querySelector('.hourly-details');
        const tbody = hourlyDetailsDiv.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing data

        const selectedDate = new Date();
        selectedDate.setDate(selectedDate.getDate() + i);

        hourly.time.forEach((time, index) => {
          const hourlyDate = new Date(time);
          if (hourlyDate.toDateString() === selectedDate.toDateString()) {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${time}</td>
              <td>${hourly.temperature_2m[index]}</td>
              <td>${hourly.relative_humidity_2m[index]}</td>
              <td>${hourly.wind_speed_10m[index]}</td>
            `;
            tbody.appendChild(row);
          }
        });

        // Toggle visibility of hourly details
        hourlyDetailsDiv.style.display = hourlyDetailsDiv.style.display === 'none' ? 'block' : 'none';
      });
    });
  };

  function getWeatherDescription(code) {
    switch (code) {
      case 0: return { description: "Clear sky", icon: "fas fa-sun" };
      case 1: return { description: "Mainly clear", icon: "fas fa-sun" };
      case 2: return { description: "Partly cloudy", icon: "fas fa-cloud-sun" };
      case 3: return { description: "Overcast", icon: "fas fa-cloud" };
      case 45: return { description: "Fog", icon: "fas fa-smog" };
      case 48: return { description: "Depositing rime fog", icon: "fas fa-smog" };
      case 51: return { description: "Light drizzle", icon: "fas fa-cloud-rain" };
      case 53: return { description: "Moderate drizzle", icon: "fas fa-cloud-rain" };
      case 55: return { description: "Dense drizzle", icon: "fas fa-cloud-rain" };
      case 56: return { description: "Light freezing drizzle", icon: "fas fa-cloud-meatball" };
      case 57: return { description: "Dense freezing drizzle", icon: "fas fa-cloud-meatball" };
      case 61: return { description: "Slight rain", icon: "fas fa-cloud-showers-alt" };
      case 63: return { description: "Moderate rain", icon: "fas fa-cloud-showers-alt" };
      case 65: return { description: "Heavy rain", icon: "fas fa-cloud-showers-alt" };
      case 66: return { description: "Light freezing rain", icon: "fas fa-snowflake" };
      case 67: return { description: "Heavy freezing rain", icon: "fas fa-snowflake" };
      case 71: return { description: "Slight snow fall", icon: "fas fa-snowflake" };
      case 73: return { description: "Moderate snow fall", icon: "fas fa-snowflake" };
      case 75: return { description: "Heavy snow fall", icon: "fas fa-snowflake" };
      case 77: return { description: "Snow grains", icon: "fas fa-snowflake" };
      case 80: return { description: "Slight rain showers", icon: "fas fa-cloud-showers-heavy" };
      case 81: return { description: "Moderate rain showers", icon: "fas fa-cloud-showers-heavy" };
      case 82: return { description: "Violent rain showers", icon: "fas fa-cloud-showers-heavy" };
      case 85: return { description: "Slight snow showers", icon: "fas fa-snowflake" };
      case 86: return { description: "Heavy snow showers", icon: "fas fa-snowflake" };
      case 95: return { description: "Thunderstorm", icon: "fas fa-bolt" };
      case 96: return { description: "Thunderstorm with slight hail", icon: "fas fa-bolt" };
      case 99: return { description: "Thunderstorm with heavy hail", icon: "fas fa-bolt" };
      default: return { description: "Unknown weather", icon: "fas fa-question" };
    }
  }

  fetchData(apiUrl);
});
