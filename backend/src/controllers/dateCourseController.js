const dateCourseService = require('../services/dateCourseService');

/**
 * GET /date-course
 * Query: lat, lon, location, mood
 */
const getDateCourse = async (req, res) => {
  try {
    const { lat, lon, location, mood } = req.query;

    if (!lat && !lon && !location) {
      return res.status(400).json({
        error: '위치 정보(lat/lon) 또는 지역명(location)이 필요합니다.',
      });
    }

    const course = await dateCourseService.generateDateCourse({
      lat: lat ? parseFloat(lat) : null,
      lon: lon ? parseFloat(lon) : null,
      location: location || null,
      mood: mood || 'normal',
    });

    res.json({ course });
  } catch (error) {
    console.error('[dateCourseController] 오류:', error.message);
    res.status(500).json({ error: '데이트 코스 추천 중 오류가 발생했습니다.' });
  }
};

module.exports = { getDateCourse };
