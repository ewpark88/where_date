const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// 주요 지역명 → 좌표 매핑
const LOCATION_COORDS = {
  강남: { lat: 37.4979, lon: 127.0276 },
  홍대: { lat: 37.5563, lon: 126.9233 },
  건대: { lat: 37.5403, lon: 127.0694 },
  이태원: { lat: 37.5344, lon: 126.9942 },
  신촌: { lat: 37.5596, lon: 126.9368 },
  인사동: { lat: 37.5741, lon: 126.9855 },
  여의도: { lat: 37.5219, lon: 126.9245 },
  명동: { lat: 37.5636, lon: 126.9827 },
  잠실: { lat: 37.5133, lon: 127.1029 },
  종로: { lat: 37.5704, lon: 126.9921 },
  압구정: { lat: 37.5271, lon: 127.0286 },
  성수: { lat: 37.5447, lon: 127.0564 },
  합정: { lat: 37.5498, lon: 126.9137 },
  연남: { lat: 37.5598, lon: 126.9260 },
  서울숲: { lat: 37.5444, lon: 127.0375 },
};

/**
 * 날씨 조회 (위도/경도 기반)
 * @returns {{ condition: string, description: string, temp: number }}
 */
const getWeather = async (lat, lon) => {
  try {
    if (!OPENWEATHER_API_KEY) {
      console.warn('[weatherService] OPENWEATHER_API_KEY 미설정 → 기본값 사용');
      return { condition: 'normal', description: '날씨 정보 없음', temp: 20 };
    }

    const response = await axios.get(BASE_URL, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
        lang: 'kr',
      },
      timeout: 5000,
    });

    const weatherId = response.data.weather[0].id;
    const description = response.data.weather[0].description;
    const temp = Math.round(response.data.main.temp);

    let condition;
    if (weatherId >= 200 && weatherId < 300) condition = 'thunderstorm';
    else if (weatherId >= 300 && weatherId < 600) condition = 'rain';
    else if (weatherId >= 600 && weatherId < 700) condition = 'snow';
    else if (weatherId === 800) condition = 'clear';
    else if (weatherId > 800) condition = 'cloudy';
    else condition = 'normal';

    return { condition, description, temp };
  } catch (error) {
    console.error('[weatherService] 날씨 API 오류:', error.message);
    return { condition: 'normal', description: '날씨 정보 없음', temp: 20 };
  }
};

/**
 * 지역명으로 날씨 조회
 */
const getWeatherByLocation = async (locationName) => {
  const coords = LOCATION_COORDS[locationName];
  if (coords) {
    return getWeather(coords.lat, coords.lon);
  }
  // 기본값: 서울 시청
  return getWeather(37.5665, 126.978);
};

/**
 * 지역명 → 좌표 반환
 */
const getCoordsFromLocation = (locationName) => {
  return LOCATION_COORDS[locationName] || { lat: 37.5665, lon: 126.978 };
};

module.exports = { getWeather, getWeatherByLocation, getCoordsFromLocation };
