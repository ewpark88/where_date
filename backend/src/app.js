require('dotenv').config();
const express = require('express');
const cors = require('cors');

const dateCourseRoute = require('./routes/dateCourseRoute');
const historyRoute = require('./routes/historyRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/date-course', dateCourseRoute);
app.use('/history', historyRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '데이트 뭐하지 서버 실행 중 💕' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: '존재하지 않는 API입니다.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('서버 오류:', err.message);
  res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`💕 데이트 뭐하지 서버 실행 중: http://localhost:${PORT}`);
});

module.exports = app;
