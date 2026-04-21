# 💕 데이트 뭐하지 (Where Date)

> 날씨 · 위치 · 분위기를 기반으로 오늘의 데이트 코스를 자동 추천해주는 모바일 앱

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 앱 이름 | 데이트 뭐하지 |
| 플랫폼 | Android (React Native) |
| 백엔드 | Node.js + Express |
| 외부 API | Kakao Local API, OpenWeatherMap API, Google AdMob |
| 광고 SDK | react-native-google-mobile-ads |
| 저장소 위치 | `D:/ad/workspace/where_date/` |

---

## 🗂️ 전체 폴더 구조

```
where_date/
├── backend/                        ← Node.js + Express API 서버
│   ├── src/
│   │   ├── app.js                  ← 서버 진입점
│   │   ├── routes/
│   │   │   ├── dateCourseRoute.js
│   │   │   └── historyRoute.js
│   │   ├── controllers/
│   │   │   ├── dateCourseController.js
│   │   │   └── historyController.js
│   │   └── services/
│   │       ├── dateCourseService.js  ← 핵심 추천 로직
│   │       ├── kakaoService.js       ← Kakao Local API
│   │       ├── weatherService.js     ← OpenWeather API
│   │       └── historyService.js     ← 인메모리 히스토리
│   ├── .env                        ← 실제 API 키 (Git 제외)
│   ├── .env.example                ← 키 템플릿
│   └── package.json
│
├── frontend/                       ← React Native 앱
│   ├── App.js                      ← 루트 컴포넌트
│   ├── package.json
│   ├── android/
│   │   └── app/src/main/
│   │       └── AndroidManifest.xml ← 권한 + AdMob 앱 ID
│   └── src/
│       ├── config/
│       │   └── adConfig.js         ← AdMob 광고 ID 전체 관리
│       ├── navigation/
│       │   └── AppNavigator.js     ← Stack + BottomTab 네비게이션
│       ├── screens/
│       │   ├── IntroScreen.js      ← 위치 권한 안내 + 지역 입력
│       │   ├── HomeScreen.js       ← 분위기 선택 + 추천 버튼
│       │   ├── ResultScreen.js     ← 코스 카드 + 전면광고
│       │   └── HistoryScreen.js    ← 저장된 히스토리
│       ├── components/
│       │   ├── CourseCard.js       ← 장소 카드 UI
│       │   └── AdPlaceholder.js    ← AdMob 배너/인라인 광고
│       ├── services/
│       │   └── api.js              ← axios 기반 API 통신
│       └── utils/
│           └── permissions.js      ← 위치 권한 처리
│
└── doc/                            ← 📖 프로젝트 문서 (현재 위치)
    ├── README.md                   ← 이 파일
    ├── SETUP.md                    ← 환경 설정 & 실행 가이드
    ├── ARCHITECTURE.md             ← 아키텍처 & 데이터 흐름
    ├── API.md                      ← 백엔드 API 명세서
    ├── SCREENS.md                  ← 화면별 상세 설명
    ├── AD_CONFIG.md                ← AdMob 광고 설정 가이드
    └── TROUBLESHOOTING.md          ← 오류 해결 모음
```

---

## ⚡ 5분 빠른 시작

```bash
# 1. 백엔드
cd where_date/backend
cp .env.example .env          # API 키 입력 필요
npm install && npm run dev

# 2. 프론트엔드 (새 터미널)
cd where_date/frontend
npm install
npx react-native run-android
```

> 상세 내용은 **[SETUP.md](./SETUP.md)** 참고

---

## 🔑 필요한 API 키

| 서비스 | 발급 주소 | 용도 |
|--------|----------|------|
| Kakao REST API | https://developers.kakao.com | 장소 검색 |
| OpenWeatherMap | https://openweathermap.org/api | 날씨 조회 |
| Google AdMob | https://admob.google.com | 광고 수익화 |

---

## 📱 핵심 기능 요약

- **자동 추천**: 앱 진입 시 현재 위치 + 날씨 기반으로 코스 자동 생성
- **랜덤 추천**: 버튼 클릭마다 새로운 코스 3개 제공
- **분위기 선택**: 일반 / 로맨틱 / 액티비티
- **히스토리 저장**: 마음에 드는 코스 저장 후 재열람
- **카카오맵 연동**: 장소 클릭 시 카카오맵 앱으로 바로 이동
- **광고 수익화**: 배너 3개 + 인라인 1개 + 전면 1개

---

## 📄 문서 목록

| 파일 | 내용 |
|------|------|
| [SETUP.md](./SETUP.md) | 개발 환경 설정, 패키지 설치, 실행 방법 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 시스템 아키텍처, 데이터 흐름도, 기술 스택 |
| [API.md](./API.md) | REST API 명세, 요청/응답 예시 |
| [SCREENS.md](./SCREENS.md) | 4개 화면 상세 설명, 컴포넌트 구조 |
| [AD_CONFIG.md](./AD_CONFIG.md) | AdMob 광고 ID, 위치, 연동 방법 |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | 자주 발생하는 오류 및 해결 방법 |
