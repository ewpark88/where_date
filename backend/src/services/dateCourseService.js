const weatherService = require('./weatherService');
const kakaoService = require('./kakaoService');

// ─── 키워드 풀 ───────────────────────────────────────────────
const KEYWORD_POOL = {
  cafe:     ['감성 카페', '루프탑 카페', '디저트 카페', '북카페', '브런치 카페'],
  food:     ['맛집', '분위기 좋은 식당', '이탈리안 레스토랑', '파인다이닝', '오마카세'],
  outdoor:  ['공원', '산책로', '야경 명소', '드라이브 코스', '한강 공원'],
  indoor:   ['전시회', '미술관', '쇼핑몰', '영화관', '아쿼리엄'],
  activity: ['방탈출', '볼링장', 'VR 체험', '보드게임카페', '클라이밍', '당구장'],
  night:    ['루프탑 바', '와인바', '칵테일 바', '야경 카페'],
  snow:     ['온천', '찜질방', '실내 수영장', '독서실 카페'],
};

// ─── 유틸 ────────────────────────────────────────────────────
const isNightTime = () => {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const pickUnique = (arr, count) => shuffle([...new Set(arr)]).slice(0, count);

/**
 * 날씨 + mood + 시간대 기반 키워드 3개 선택
 */
const buildKeywords = (weatherCondition, mood) => {
  const pool = [];
  const night = isNightTime();

  // 날씨 기반
  switch (weatherCondition) {
    case 'rain':
    case 'thunderstorm':
      pool.push(...KEYWORD_POOL.indoor);
      pool.push(...KEYWORD_POOL.activity);
      break;
    case 'snow':
      pool.push(...KEYWORD_POOL.snow);
      pool.push(...KEYWORD_POOL.indoor);
      break;
    case 'clear':
      pool.push(...KEYWORD_POOL.outdoor);
      pool.push(...KEYWORD_POOL.cafe);
      break;
    default:
      pool.push(...KEYWORD_POOL.cafe);
      pool.push(...KEYWORD_POOL.food);
      pool.push(...KEYWORD_POOL.indoor);
  }

  // mood 기반
  if (mood === 'romantic') {
    pool.push('루프탑 카페', '와인바', '오마카세', '파인다이닝', '야경 명소');
  } else if (mood === 'activity') {
    pool.push(...KEYWORD_POOL.activity);
  } else {
    pool.push(...KEYWORD_POOL.food);
  }

  // 야간 추가
  if (night) {
    pool.push(...KEYWORD_POOL.night);
  }

  return pickUnique(pool, 3);
};

/**
 * 데이트 코스 생성 메인 함수
 * @param {{ lat, lon, location, mood }} options
 * @returns {Array} course 배열
 */
const generateDateCourse = async ({ lat, lon, location, mood }) => {
  let latitude = lat;
  let longitude = lon;
  let searchPrefix = location || '';

  // 지역명으로 좌표 보완
  if (location && (!lat || !lon)) {
    const coords = weatherService.getCoordsFromLocation(location);
    latitude = coords.lat;
    longitude = coords.lon;
  }

  // 1. 날씨 조회
  const weather = await weatherService.getWeather(latitude, longitude);
  console.log(`[dateCourseService] 날씨: ${weather.condition} (${weather.description}), 기온: ${weather.temp}°C`);

  // 2. 키워드 3개 생성
  const keywords = buildKeywords(weather.condition, mood);
  console.log(`[dateCourseService] 선택 키워드:`, keywords);

  // 3. 키워드별 카카오 장소 검색 (병렬)
  const searchResults = await Promise.allSettled(
    keywords.map(async (keyword) => {
      const query = searchPrefix ? `${searchPrefix} ${keyword}` : keyword;
      const places = await kakaoService.searchPlaces(query, latitude, longitude);
      const place = kakaoService.getRandomPlace(places);

      if (!place) return null;

      return {
        name: place.place_name,
        address: place.road_address_name || place.address_name || '주소 정보 없음',
        lat: parseFloat(place.y),
        lon: parseFloat(place.x),
        category: keyword,
        phone: place.phone || '',
        categoryGroup: place.category_name || '',
      };
    })
  );

  // 4. 성공 결과만 필터링
  const course = searchResults
    .filter((r) => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);

  return course;
};

module.exports = { generateDateCourse };
