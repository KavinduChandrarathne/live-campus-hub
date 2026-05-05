// Weather Section Script
class WeatherWidget {
    constructor() {
        this.location = null;
        this.init();
    }

    init() {
        this.loadWeather();
    }

    async loadWeather() {
        try {
            // First try to get location from GPS
            const coords = await this.getBrowserLocation();
            if (coords) {
                this.location = coords;
                await this.fetchWeatherData(coords.lat, coords.lon);
            } else {
                // Fallback: show loading and try IP-based location
                this.showLoadingState();
                await this.fetchWeatherData();
            }
        } catch (error) {
            console.error('Weather loading error:', error);
            this.showErrorState('Unable to load weather data');
        }
    }

    async getBrowserLocation() {
        return new Promise((resolve, reject) => {
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

    async fetchWeatherData(lat, lon) {
        try {
            this.showLoadingState();

            let url = 'Admin/shared/php/get-weather.php';
            if (lat && lon) {
                url += `?lat=${lat}&lon=${lon}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                this.displayWeather(data.weather);
            } else {
                throw new Error(data.message || 'Failed to fetch weather data');
            }
        } catch (error) {
            console.error('Weather fetch error:', error);
            this.showErrorState('Unable to load weather data');
        }
    }

    displayWeather(weatherData) {
        try {
            // Update current weather
            document.getElementById('temperature').textContent = Math.round(weatherData.current.temp);
            document.getElementById('weatherDesc').textContent = weatherData.current.description;
            document.getElementById('weatherIcon').className = `fas ${this.getWeatherIcon(weatherData.current.icon)}`;

            // Update location
            if (weatherData.location) {
                const locationElement = document.getElementById('weatherLocation');
                if (locationElement) {
                    locationElement.textContent = weatherData.location;
                }
            }

            // Update forecast
            const forecastContainer = document.getElementById('forecastContainer');
            if (forecastContainer && weatherData.forecast) {
                forecastContainer.innerHTML = '';

                weatherData.forecast.slice(0, 5).forEach(day => {
                    const forecastItem = document.createElement('div');
                    forecastItem.className = 'forecast-item';
                    forecastItem.innerHTML = `
                        <div class="forecast-day">${day.day}</div>
                        <div class="forecast-icon"><i class="fas ${this.getWeatherIcon(day.icon)}"></i></div>
                        <div class="forecast-temp">${Math.round(day.maxTemp)}/${Math.round(day.minTemp)}°</div>
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
            '01d': 'fa-sun',           // clear sky day
            '01n': 'fa-moon',          // clear sky night
            '02d': 'fa-cloud-sun',     // few clouds day
            '02n': 'fa-cloud-moon',    // few clouds night
            '03d': 'fa-cloud',         // scattered clouds
            '03n': 'fa-cloud',
            '04d': 'fa-cloud',         // broken clouds
            '04n': 'fa-cloud',
            '09d': 'fa-cloud-rain',    // shower rain
            '09n': 'fa-cloud-rain',
            '10d': 'fa-cloud-sun-rain', // rain day
            '10n': 'fa-cloud-moon-rain', // rain night
            '11d': 'fa-bolt',          // thunderstorm
            '11n': 'fa-bolt',
            '13d': 'fa-snowflake',     // snow
            '13n': 'fa-snowflake',
            '50d': 'fa-smog',          // mist
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

// Initialize weather widget when DOM is loaded
let weatherWidget;
document.addEventListener('DOMContentLoaded', () => {
    weatherWidget = new WeatherWidget();
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WeatherWidget();
    });
} else {
    new WeatherWidget();
}
