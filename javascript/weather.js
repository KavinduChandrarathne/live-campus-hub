// Weather Section Script
class WeatherWidget {
    constructor() {
        this.location = null;
        this.locationSource = null;
        this.init();
    }

    init() {
        this.loadWeather();
    }

    async loadWeather() {
        try {
            const coords = await this.getBrowserLocation();
            if (coords) {
                this.location = coords;
                this.locationSource = 'gps';
                await this.fetchWeatherData(coords.lat, coords.lon);
                return;
            }

            throw new Error('GPS location unavailable. Please enable location access.');
        } catch (error) {
            console.error('Weather loading error:', error);
            this.showErrorState('GPS location required for weather forecast');
        }
    }

    async getBrowserLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    async getLocationFromIP() {
        try {
            const response = await fetch('https://ip-api.com/json/?fields=status,lat,lon,city,countryCode');
            const data = await response.json();
            if (data.status === 'success') {
                return {
                    lat: data.lat,
                    lon: data.lon,
                    city: data.city,
                    country: data.countryCode
                };
            }
        } catch (error) {
            console.warn('IP location error:', error);
        }
        return null;
    }

    async fetchWeatherData(lat, lon) {
        try {
            this.showLoadingState();

            const weatherData = await this.fetchOpenWeather(lat, lon);
            if (!weatherData || !weatherData.current || !weatherData.forecast) {
                throw new Error('Incomplete weather response');
            }

            this.displayWeather(weatherData);
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showErrorState('Unable to load weather data');
        }
    }

    async fetchOpenWeather(lat, lon) {
        const apiKey = 'replace the api key here'; 
        const baseUrl = 'https://api.openweathermap.org/data/2.5';
        const currentUrl = `${baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const forecastUrl = `${baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        if (!currentResponse.ok) {
            throw new Error(`OpenWeather current fetch failed: ${currentResponse.status}`);
        }
        if (!forecastResponse.ok) {
            throw new Error(`OpenWeather forecast fetch failed: ${forecastResponse.status}`);
        }

        const current = await currentResponse.json();
        const forecast = await forecastResponse.json();

        if (current.cod !== 200) {
            throw new Error(`OpenWeather current error: ${current.message || 'unknown'}`);
        }
        if (forecast.cod !== '200' && forecast.cod !== 200) {
            throw new Error(`OpenWeather forecast error: ${forecast.message || 'unknown'}`);
        }

        const currentWeather = {
            temp: Math.round(current.main.temp),
            description: current.weather[0].description,
            icon: current.weather[0].icon,
            humidity: current.main.humidity,
            windSpeed: Math.round(current.wind.speed * 10) / 10,
            feelsLike: Math.round(current.main.feels_like),
            location: `${current.name}, ${current.sys.country}`
        };

        const forecastDays = [];
        const processedDates = [];

        forecast.list.forEach((item) => {
            const date = new Date(item.dt * 1000).toISOString().split('T')[0];
            if (processedDates.includes(date)) {
                return;
            }

            if (forecastDays.length < 5) {
                forecastDays.push({
                    date,
                    day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                    temp: Math.round(item.main.temp),
                    tempMax: Math.round(item.main.temp_max),
                    tempMin: Math.round(item.main.temp_min),
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    humidity: item.main.humidity,
                    windSpeed: Math.round(item.wind.speed * 10) / 10
                });
                processedDates.push(date);
            }
        });

        return {
            success: true,
            current: currentWeather,
            forecast: forecastDays,
            location: currentWeather.location,
            timestamp: Date.now()
        };
    }

    displayWeather(weatherData) {
        try {
            if (!weatherData.current || !weatherData.forecast) {
                throw new Error('Unexpected weather data format');
            }

            const temperatureElement = document.getElementById('temperature') || document.getElementById('currentTemp');
            if (temperatureElement) {
                temperatureElement.textContent = `${Math.round(weatherData.current.temp)}°C`;
            }

            const weatherDescElement = document.getElementById('weatherDesc');
            if (weatherDescElement) {
                weatherDescElement.textContent = weatherData.current.description;
            }

            const weatherIconElement = document.getElementById('weatherIcon') || document.querySelector('.weather-icon-wrapper i');
            if (weatherIconElement) {
                weatherIconElement.className = `fas ${this.getWeatherIcon(weatherData.current.icon)}`;
            }

            if (weatherData.location) {
                const locationElement = document.getElementById('weatherLocation');
                if (locationElement) {
                    if (this.locationSource === 'gps') {
                        locationElement.textContent = `${weatherData.location} (GPS)`;
                    } else {
                        locationElement.textContent = 'GPS unavailable';
                    }
                }
            }

            const forecastContainer = document.getElementById('forecastContainer');
            if (forecastContainer && weatherData.forecast) {
                forecastContainer.innerHTML = '';

                weatherData.forecast.slice(0, 5).forEach(day => {
                    const forecastItem = document.createElement('div');
                    forecastItem.className = 'forecast-item';
                    forecastItem.innerHTML = `
                        <div class="forecast-day">${day.day}</div>
                        <div class="forecast-icon"><i class="fas ${this.getWeatherIcon(day.icon)}"></i></div>
                        <div class="forecast-temp">${Math.round(day.tempMax)}/${Math.round(day.tempMin)}°</div>
                    `;
                    forecastContainer.appendChild(forecastItem);
                });
            }

            this.hideLoadingState();
        } catch (error) {
            console.error('Weather display error:', error);
            this.showErrorState('Error displaying weather data');
        }
    }

    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fa-sun',
            '01n': 'fa-moon',
            '02d': 'fa-cloud-sun',
            '02n': 'fa-cloud-moon',
            '03d': 'fa-cloud',
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-rain',
            '09n': 'fa-cloud-rain',
            '10d': 'fa-cloud-sun-rain',
            '10n': 'fa-cloud-moon-rain',
            '11d': 'fa-bolt',
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',
            '50n': 'fa-smog'
        };
        return iconMap[iconCode] || 'fa-cloud';
    }

    showLoadingState() {
        const weatherCard = document.querySelector('.weather-card');
        if (weatherCard) {
            weatherCard.classList.add('loading');
        }
    }

    hideLoadingState() {
        const weatherCard = document.querySelector('.weather-card');
        if (weatherCard) {
            weatherCard.classList.remove('loading');
        }
    }

    showErrorState(message) {
        const weatherCard = document.querySelector('.weather-card');
        if (weatherCard) {
            weatherCard.innerHTML = `
                <div class="weather-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button onclick="weatherWidget.loadWeather()" class="retry-btn">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }
}

let weatherWidget;
document.addEventListener('DOMContentLoaded', () => {
    weatherWidget = new WeatherWidget();
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WeatherWidget();
    });
} else {
    new WeatherWidget();
}
