const axios = require('axios');

const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
const KEYWORD_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

/**
 * 카카오 로컬 키워드 검색
 * @param {string} query - 검색어 (예: "강남 루프탑 카페")
 * @param {number|null} lat - 위도 (근처 검색 시)
 * @param {number|null} lon - 경도 (근처 검색 시)
 * @returns {Array} 장소 목록
 */
const searchPlaces = async (query, lat = null, lon = null) => {
  try {
    if (!KAKAO_API_KEY) {
      console.warn('[kakaoService] KAKAO_API_KEY 미설정 → 목업 데이터 반환');
      return getMockPlaces(query);
    }

    const params = {
      query,
      size: 10,
    };

    if (lat && lon) {
      params.x = lon; // 경도
      params.y = lat; // 위도
      params.radius = 5000; // 반경 5km
      params.sort = 'distance';
    }

    const response = await axios.get(KEYWORD_SEARCH_URL, {
      headers: {
        Authorization: `KakaoAK ${KAKAO_API_KEY}`,
      },
      params,
      timeout: 5000,
    });

    return response.data.documents || [];
  } catch (error) {
    console.error('[kakaoService] API 오류:', error.message);
    return getMockPlaces(query);
  }
};

/**
 * 장소 목록에서 랜덤 1개 선택 (상위 5개 중)
 */
const getRandomPlace = (places) => {
  if (!places.length) return null;
  const pool = places.slice(0, Math.min(5, places.length));
  return pool[Math.floor(Math.random() * pool.length)];
};

/**
 * API 키 없을 때 목업 데이터 (개발/테스트용)
 */
const getMockPlaces = (query) => {
  const mockData = [
    {
      place_name: `${query} 샘플 장소`,
      road_address_name: '서울특별시 강남구 테헤란로 123',
      address_name: '서울 강남구 역삼동 123',
      x: '127.0276',
      y: '37.4979',
      phone: '02-1234-5678',
      category_name: '음식점',
    },
    {
      place_name: `${query} 추천 스팟`,
      road_address_name: '서울특별시 마포구 홍익로 45',
      address_name: '서울 마포구 서교동 45',
      x: '126.9233',
      y: '37.5563',
      phone: '02-9876-5432',
      category_name: '카페',
    },
  ];
  return mockData;
};

module.exports = { searchPlaces, getRandomPlace };
