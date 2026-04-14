/**
 * 히스토리 서비스 (인메모리 저장)
 * 실제 서비스에서는 MongoDB, MySQL 등 DB로 교체 권장
 */

const historyStore = [];
const MAX_HISTORY = 100;

/**
 * 히스토리 저장
 * @param {{ course, location, mood }} data
 */
const save = ({ course, location, mood }) => {
  const entry = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    course,
    location: location || null,
    mood: mood || 'normal',
    createdAt: new Date().toISOString(),
  };

  historyStore.unshift(entry); // 최신 항목을 앞에 추가

  // 최대 100개 보관
  if (historyStore.length > MAX_HISTORY) {
    historyStore.pop();
  }

  return entry;
};

/**
 * 전체 히스토리 반환 (최신순)
 */
const getAll = () => [...historyStore];

/**
 * ID로 단일 조회
 */
const getById = (id) => historyStore.find((item) => item.id === id) || null;

module.exports = { save, getAll, getById };
