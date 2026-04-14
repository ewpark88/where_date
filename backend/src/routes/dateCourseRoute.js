const express = require('express');
const router = express.Router();
const dateCourseController = require('../controllers/dateCourseController');

// GET /date-course?lat=&lon=&location=&mood=
router.get('/', dateCourseController.getDateCourse);

module.exports = router;
