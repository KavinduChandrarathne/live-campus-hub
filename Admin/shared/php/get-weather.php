<?php
header('Content-Type: application/json');

require_once __DIR__ . '/env.php';
loadEnv();

// OpenWeather API Configuration
$apiKey = getenv('OPENWEATHER_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'OpenWeather API key not configured']);
    exit;
}
define('OPENWEATHER_API_KEY', $apiKey);
define('OPENWEATHER_BASE_URL', 'https://api.openweathermap.org/data/2.5');

// Get location from request
$lat = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
$lon = isset($_GET['lon']) ? floatval($_GET['lon']) : null;
$city = isset($_GET['city']) ? trim($_GET['city']) : null;

// If coordinates not provided, try to get from city name or use default
if (!$lat || !$lon) {
    if ($city) {
        // Geocode city name to coordinates
        $coords = geocodeCity($city);
        if ($coords) {
            $lat = $coords['lat'];
            $lon = $coords['lon'];
            $city = $coords['city'];
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'City not found']);
            exit;
        }
    } else {
        // Try to get coordinates from IP
        $ipGeoLocation = getLocationFromIP();
        if ($ipGeoLocation) {
            $lat = $ipGeoLocation['lat'];
            $lon = $ipGeoLocation['lon'];
            $city = $ipGeoLocation['city'];
        } else {
            // Fallback to a default location 
            $lat = 6.9271;
            $lon = 80.7789;
            $city = 'Sri Lanka';
        }
    }
}

try {
    // Fetch current weather and forecast
    $weatherData = fetchWeatherData($lat, $lon, $city);
    
    if ($weatherData) {
        echo json_encode($weatherData);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to fetch weather data']);
    }
} catch (Exception $e) {
    $message = $e->getMessage();
    $code = 500;
    if (strpos($message, '401') !== false || stripos($message, 'Invalid API key') !== false) {
        $code = 401;
    } elseif (strpos($message, '403') !== false || strpos($message, '404') !== false) {
        $code = 502;
    }
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $message]);
}

/**
 * Fetch weather data from OpenWeather API
 */
function fetchWeatherData($lat, $lon, $city) {
    // Get current weather
    $currentUrl = OPENWEATHER_BASE_URL . '/weather?lat=' . $lat . '&lon=' . $lon . 
                  '&appid=' . OPENWEATHER_API_KEY . '&units=metric';
    
    // Get 5 day forecast
    $forecastUrl = OPENWEATHER_BASE_URL . '/forecast?lat=' . $lat . '&lon=' . $lon . 
                   '&appid=' . OPENWEATHER_API_KEY . '&units=metric';
    
    $currentResponse = fetchUrl($currentUrl);
    $forecastResponse = fetchUrl($forecastUrl);

    if (!$currentResponse['success']) {
        throw new Exception('Weather current fetch failed: ' . $currentResponse['error']);
    }
    if (!$forecastResponse['success']) {
        throw new Exception('Weather forecast fetch failed: ' . $forecastResponse['error']);
    }

    $current = json_decode($currentResponse['body'], true);
    $forecast = json_decode($forecastResponse['body'], true);

    if (!$current || !$forecast) {
        throw new Exception('Weather decode failed: current=' . var_export($current, true) . ' forecast=' . var_export($forecast, true));
    }

    if (isset($current['cod']) && strval($current['cod']) !== '200') {
        throw new Exception('OpenWeather current error: ' . ($current['message'] ?? 'unknown'));
    }
    if (isset($forecast['cod']) && strval($forecast['cod']) !== '200') {
        throw new Exception('OpenWeather forecast error: ' . ($forecast['message'] ?? 'unknown'));
    }

    // Parse current weather
    $currentWeather = [
        'temp' => round($current['main']['temp']),
        'description' => ucfirst($current['weather'][0]['main']),
        'icon' => mapWeatherIcon($current['weather'][0]['main'], $current['weather'][0]['icon']),
        'humidity' => $current['main']['humidity'],
        'windSpeed' => round($current['wind']['speed'], 1),
        'feelsLike' => round($current['main']['feels_like']),
        'location' => $city ?: ($current['name'] . (isset($current['sys']['country']) ? ', ' . $current['sys']['country'] : ''))
    ];
    
    // Parse 5-day forecast (one entry per day at noon)
    $forecastDays = [];
    $processedDates = [];
    
    foreach ($forecast['list'] as $item) {
        $date = date('Y-m-d', $item['dt']);
        $hour = date('H', $item['dt']);
        
        // Get forecast around noon (12:00)
        if (!in_array($date, $processedDates) && ($hour >= 11 && $hour <= 14 || count($processedDates) == 0)) {
            $forecastDays[] = [
                'date' => $date,
                'day' => date('D', $item['dt']),
                'dayFull' => date('l', $item['dt']),
                'temp' => round($item['main']['temp']),
                'tempMax' => round($item['main']['temp_max']),
                'tempMin' => round($item['main']['temp_min']),
                'description' => ucfirst($item['weather'][0]['main']),
                'icon' => mapWeatherIcon($item['weather'][0]['main'], $item['weather'][0]['icon']),
                'humidity' => $item['main']['humidity'],
                'windSpeed' => round($item['wind']['speed'], 1)
            ];
            $processedDates[] = $date;
            
            if (count($forecastDays) >= 5) {
                break;
            }
        }
    }
    
    // If we don't have 5 days, fill gaps
    if (count($forecastDays) < 5) {
        foreach ($forecast['list'] as $item) {
            $date = date('Y-m-d', $item['dt']);
            if (!in_array($date, $processedDates)) {
                $forecastDays[] = [
                    'date' => $date,
                    'day' => date('D', $item['dt']),
                    'dayFull' => date('l', $item['dt']),
                    'temp' => round($item['main']['temp']),
                    'tempMax' => round($item['main']['temp_max']),
                    'tempMin' => round($item['main']['temp_min']),
                    'description' => ucfirst($item['weather'][0]['main']),
                    'icon' => mapWeatherIcon($item['weather'][0]['main'], $item['weather'][0]['icon']),
                    'humidity' => $item['main']['humidity'],
                    'windSpeed' => round($item['wind']['speed'], 1)
                ];
                $processedDates[] = $date;
                
                if (count($forecastDays) >= 5) {
                    break;
                }
            }
        }
    }
    
    return [
        'success' => true,
        'current' => $currentWeather,
        'forecast' => array_slice($forecastDays, 0, 5),
        'location' => $currentWeather['location'],
        'timestamp' => time()
    ];
}

/**
 * Fetch URL with HTTP error handling
 */
function fetchUrl($url) {
    $options = [
        'http' => [
            'method' => 'GET',
            'timeout' => 10,
            'header' => "User-Agent: CampusHubWeather/1.0\r\n"
        ]
    ];
    $context = stream_context_create($options);
    $body = @file_get_contents($url, false, $context);

    $status = null;
    if (!empty($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('#^HTTP/\d+\.\d+\s+(\d+)#i', $header, $matches)) {
                $status = intval($matches[1]);
                break;
            }
        }
    }

    if ($body === false) {
        $error = 'Unknown error';
        if (!empty($http_response_header) && is_array($http_response_header)) {
            $error = implode(' | ', $http_response_header);
        }
        return ['success' => false, 'error' => $error, 'status' => $status];
    }
    return ['success' => true, 'body' => $body, 'status' => $status];
}

/**
 * Map OpenWeather icons to Font Awesome icons
 */
function mapWeatherIcon($weatherMain, $icon) {
    $iconMap = [
        'Clear' => 'fa-sun',
        'Clouds' => 'fa-cloud',
        'Rain' => 'fa-cloud-rain',
        'Drizzle' => 'fa-cloud-rain',
        'Thunderstorm' => 'fa-bolt',
        'Snow' => 'fa-snowflake',
        'Mist' => 'fa-smog',
        'Smoke' => 'fa-smog',
        'Haze' => 'fa-smog',
        'Dust' => 'fa-smog',
        'Fog' => 'fa-smog',
        'Sand' => 'fa-smog',
        'Ash' => 'fa-smog',
        'Squall' => 'fa-wind',
        'Tornado' => 'fa-tornado'
    ];
    
    return isset($iconMap[$weatherMain]) ? $iconMap[$weatherMain] : 'fa-cloud';
}

/**
 * Get location from IP address
 */
function getLocationFromIP() {
    try {
        $ip = getClientIP();
        
        // Skip if no valid IP
        if (!$ip || $ip === '::1') {
            return null;
        }
        
        
        $url = 'http://ip-api.com/json/' . $ip . '?fields=status,lat,lon,city,countryCode';
        $response = @file_get_contents($url);
        
        if ($response) {
            $data = json_decode($response, true);
            if ($data && isset($data['status']) && $data['status'] === 'success') {
                return [
                    'lat' => $data['lat'],
                    'lon' => $data['lon'],
                    'city' => $data['city'] . ', ' . $data['countryCode']
                ];
            }
        }
        
        // Fallback to ipinfo.io
        $url = 'https://ipinfo.io/' . $ip . '/json?token='; // Add your ipinfo token if available
        $response = @file_get_contents($url);
        
        if ($response) {
            $data = json_decode($response, true);
            if ($data && isset($data['loc'])) {
                list($lat, $lon) = explode(',', $data['loc']);
                return [
                    'lat' => floatval($lat),
                    'lon' => floatval($lon),
                    'city' => (isset($data['city']) ? $data['city'] : 'Unknown') . ', ' . (isset($data['country']) ? $data['country'] : 'Unknown')
                ];
            }
        }
    } catch (Exception $e) {
        // Fail silently and return null
    }
    
    return null;
}

/**
 * Geocode city name to coordinates
 */
function geocodeCity($cityName) {
    try {
        $url = OPENWEATHER_BASE_URL . '/find?q=' . urlencode($cityName) . 
               '&appid=' . OPENWEATHER_API_KEY . '&units=metric';
        
        $response = @file_get_contents($url);
        if ($response) {
            $data = json_decode($response, true);
            if ($data && isset($data['list']) && count($data['list']) > 0) {
                $city = $data['list'][0];
                return [
                    'lat' => $city['coord']['lat'],
                    'lon' => $city['coord']['lon'],
                    'city' => $city['name'] . ', ' . $city['sys']['country']
                ];
            }
        }
    } catch (Exception $e) {
        // Fail silently
    }
    
    return null;
}

/**
 * Get client IP address
 */
function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
        $ip = $_SERVER['REMOTE_ADDR'];
    } else {
        return null;
    }
    
    return trim($ip);
}
?>
