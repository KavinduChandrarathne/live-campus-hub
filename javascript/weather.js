// Weather Section Script
class WeatherWidget {
    constructor() {
        this.init();
    }

    init() {
        // Mock weather data (in a real app, this would come from an API)
        this.displayWeather();
    }

    displayWeather() {
        // Current weather data
        const currentWeather = {
            temperature: 28,
            description: 'Partly Cloudy',
            icon: 'fa-cloud',
            label: 'Currently'
        };

        // 5-day forecast
        const forecast = [
            { day: 'MON', temp: '29/21', icon: 'fa-sun' },
            { day: 'TUE', temp: '27/19', icon: 'fa-cloud' },
            { day: 'WED', temp: '30/21', icon: 'fa-cloud' },
            { day: 'THU', temp: '30/22', icon: 'fa-cloud-rain' },
            { day: 'FRI', temp: '28/20', icon: 'fa-cloud-rain' }
        ];

        // Update current weather
        document.getElementById('temperature').textContent = currentWeather.temperature;
        document.getElementById('weatherDesc').textContent = currentWeather.description;
        document.getElementById('weatherIcon').className = `fas ${currentWeather.icon}`;

        // Update forecast
        const forecastContainer = document.getElementById('forecastContainer');
        forecastContainer.innerHTML = '';

        forecast.forEach(day => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-icon"><i class="fas ${day.icon}"></i></div>
                <div class="forecast-temp">${day.temp}°</div>
            `;
            forecastContainer.appendChild(forecastItem);
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WeatherWidget();
    });
} else {
    new WeatherWidget();
}
