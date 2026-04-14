const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// POST /history - 히스토리 저장
router.post('/', historyController.saveHistory);

// GET /history - 히스토리 조회
router.get('/', historyController.getHistory);

module.exports = router;
