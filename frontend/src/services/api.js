import axios from 'axios';

/**
 * 서버 주소 설정
 *
 * Android 에뮬레이터 → 10.0.2.2:3000 (로컬호스트 대체)
 * iOS 시뮬레이터     → localhost:3000
 * 실제 기기          → 컴퓨터의 로컬 IP (예: 192.168.0.10:3000)
 * 배포 서버          → https://your-domain.com
 */
const BASE_URL = 'http://10.0.2.2:3000'; // Android 에뮬레이터 기본값

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── 요청 인터셉터 ────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data || '');
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── 응답 인터셉터 ────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.error || error.message || '알 수 없는 오류';
    console.error(`[API] 오류: ${msg}`);
    return Promise.reject(new Error(msg));
  },
);

// ─── API 함수들 ───────────────────────────────────────────────

/**
 * 데이트 코스 조회
 * @param {{ lat, lon, location, mood }} params
 * @returns {Promise<Array>} course 배열
 */
export const getDateCourse = async ({ lat, lon, location, mood }) => {
  const params = {};
  if (lat)      params.lat      = lat;
  if (lon)      params.lon      = lon;
  if (location) params.location = location;
  if (mood)     params.mood     = mood;

  const response = await api.get('/date-course', { params });
  return response.data.course || [];
};

/**
 * 히스토리 저장
 * @param {{ course, location, mood }} data
 */
export const saveHistory = async ({ course, location, mood }) => {
  const response = await api.post('/history', { course, location, mood });
  return response.data;
};

/**
 * 히스토리 전체 조회
 * @returns {Promise<Array>}
 */
export const getHistory = async () => {
  const response = await api.get('/history');
  return response.data.history || [];
};
