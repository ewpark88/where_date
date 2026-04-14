const historyService = require('../services/historyService');

/**
 * POST /history
 * Body: { course, location, mood }
 */
const saveHistory = async (req, res) => {
  try {
    const { course, location, mood } = req.body;

    if (!course || !Array.isArray(course) || course.length === 0) {
      return res.status(400).json({ error: '유효한 코스 데이터가 필요합니다.' });
    }

    const saved = historyService.save({ course, location, mood });
    res.status(201).json({ success: true, history: saved });
  } catch (error) {
    console.error('[historyController] 저장 오류:', error.message);
    res.status(500).json({ error: '히스토리 저장 중 오류가 발생했습니다.' });
  }
};

/**
 * GET /history
 */
const getHistory = async (req, res) => {
  try {
    const history = historyService.getAll();
    res.json({ history });
  } catch (error) {
    console.error('[historyController] 조회 오류:', error.message);
    res.status(500).json({ error: '히스토리 조회 중 오류가 발생했습니다.' });
  }
};

module.exports = { saveHistory, getHistory };
