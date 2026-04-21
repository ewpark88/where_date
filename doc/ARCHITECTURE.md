# 🏗️ ARCHITECTURE — 시스템 아키텍처

---

## 1. 전체 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                     사용자 스마트폰                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Native 앱 (Frontend)               │  │
│  │                                                      │  │
│  │  IntroScreen → HomeScreen → ResultScreen             │  │
│  │                          ↘ HistoryScreen             │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │ HTTP (axios)                          │
└─────────────────────┼───────────────────────────────────────┘
                      │
          ┌───────────▼───────────┐
          │  Node.js + Express    │
          │    (Backend Server)   │
          │    localhost:3000     │
          └─────┬─────────┬──────┘
                │         │
    ┌───────────▼──┐  ┌───▼────────────────┐
    │  OpenWeather │  │   Kakao Local API  │
    │     API      │  │  (장소 키워드 검색) │
    │  (날씨 조회) │  └────────────────────┘
    └──────────────┘

         ┌──────────────────┐
         │  Google AdMob    │
         │  (광고 SDK)      │
         │  앱 내 직접 연결 │
         └──────────────────┘
```

---

## 2. 데이터 흐름 (코스 추천)

```
사용자 → 위치 선택 (GPS or 지역명 입력)
         ↓
HomeScreen → api.getDateCourse({ lat, lon, location, mood })
         ↓
[GET] /date-course?lat=&lon=&location=&mood=
         ↓
dateCourseController → dateCourseService.generateDateCourse()
         ↓
    ┌────┴────────────────────────────────┐
    │                                     │
    ▼                                     ▼
weatherService.getWeather()        (좌표 없으면)
→ OpenWeather API 호출             weatherService.getCoordsFromLocation()
→ condition 반환                   → 하드코딩 좌표 반환
(rain/snow/clear/cloudy/normal)
    │
    ▼
dateCourseService.buildKeywords(condition, mood)
→ 날씨 + mood + 시간대 기반 키워드 풀 구성
→ 중복 제거 후 랜덤 3개 선택
    │
    ▼
kakaoService.searchPlaces("지역명 키워드", lat, lon)
→ 키워드 3개 병렬 검색 (Promise.allSettled)
→ 각 결과에서 상위 5개 중 랜덤 1개 선택
    │
    ▼
응답: { course: [ {name, address, lat, lon, category, phone} × 3 ] }
    │
    ▼
ResultScreen → CourseCard 3개 렌더링
→ 전면 광고 표시 (500ms 딜레이)
→ 저장 버튼 → POST /history
```

---

## 3. 네비게이션 구조

```
AppNavigator (Stack Navigator)
├── Intro (IntroScreen)          ← 최초 진입 화면
│     ↓ navigation.replace('Main', { screen: 'Home', params })
├── Main (Bottom Tab Navigator)
│   ├── Home (HomeScreen)        ← 메인 탭 ①
│   └── History (HistoryScreen)  ← 메인 탭 ②
│         ↓ navigation.navigate('Result')
└── Result (ResultScreen)        ← 코스 결과 화면
      ↓ navigation.goBack()
    [Home으로 돌아감]
```

### 화면 전환 파라미터

```
Intro → Main
  params: { lat, lon, useGPS: true }         ← GPS 사용
  params: { location: '홍대', useGPS: false } ← 지역명 사용

Home → Result
  params: { course[], location, mood, lat, lon }

History → Result
  params: { course[], location, mood }        ← 저장된 코스 재열람
```

---

## 4. 기술 스택 상세

### 백엔드

| 기술 | 버전 | 역할 |
|------|------|------|
| Node.js | 18+ LTS | 런타임 |
| Express | 4.18.x | HTTP 프레임워크 |
| axios | 1.6.x | 외부 API HTTP 클라이언트 |
| cors | 2.8.x | Cross-Origin 허용 |
| dotenv | 16.x | 환경변수 관리 |
| nodemon | 3.x | 개발용 핫 리로드 |

### 프론트엔드

| 기술 | 버전 | 역할 |
|------|------|------|
| React Native | 0.75.4 | 앱 프레임워크 |
| React | 18.3.1 | UI 라이브러리 |
| @react-navigation | 6.x | 화면 네비게이션 |
| react-native-permissions | 4.x | 위치 권한 요청 |
| react-native-geolocation-service | 5.x | GPS 위치 취득 |
| react-native-google-mobile-ads | 13.x | AdMob 광고 SDK |
| axios | 1.7.x | API 통신 |

### 외부 서비스

| 서비스 | 용도 | 비용 |
|--------|------|------|
| Kakao Local API | 키워드 장소 검색 | 무료 (월 300,000건) |
| OpenWeatherMap | 현재 날씨 조회 | 무료 (월 1,000,000건) |
| Google AdMob | 광고 수익화 | 수익 쉐어 |

---

## 5. 키워드 추천 알고리즘

### 카테고리 키워드 풀

```js
const KEYWORD_POOL = {
  cafe:     ['감성 카페', '루프탑 카페', '디저트 카페', '북카페', '브런치 카페'],
  food:     ['맛집', '분위기 좋은 식당', '이탈리안 레스토랑', '파인다이닝', '오마카세'],
  outdoor:  ['공원', '산책로', '야경 명소', '드라이브 코스', '한강 공원'],
  indoor:   ['전시회', '미술관', '쇼핑몰', '영화관', '아쿼리엄'],
  activity: ['방탈출', '볼링장', 'VR 체험', '보드게임카페', '클라이밍', '당구장'],
  night:    ['루프탑 바', '와인바', '칵테일 바', '야경 카페'],
  snow:     ['온천', '찜질방', '실내 수영장', '독서실 카페'],
};
```

### 날씨별 키워드 선택 규칙

| 날씨 | 선택 카테고리 |
|------|-------------|
| 비 / 천둥 | indoor + activity |
| 눈 | snow + indoor |
| 맑음 | outdoor + cafe |
| 흐림 / 기타 | cafe + food + indoor |

### mood별 추가 키워드

| mood | 추가 키워드 |
|------|-----------|
| romantic | 루프탑 카페, 와인바, 오마카세, 파인다이닝, 야경 명소 |
| activity | activity 카테고리 전체 추가 |
| normal | food 카테고리 추가 |

### 시간대 보정

| 시간 | 추가 |
|------|------|
| 18:00 ~ 06:00 (야간) | night 카테고리 추가 |

### 최종 키워드 선정

```
전체 pool → 중복 제거(Set) → 랜덤 셔플 → 앞 3개 선택
```

---

## 6. 지역명 → 좌표 매핑 테이블

`weatherService.js`의 `LOCATION_COORDS`에 하드코딩된 좌표:

| 지역명 | 위도(lat) | 경도(lon) |
|--------|----------|----------|
| 강남 | 37.4979 | 127.0276 |
| 홍대 | 37.5563 | 126.9233 |
| 건대 | 37.5403 | 127.0694 |
| 이태원 | 37.5344 | 126.9942 |
| 신촌 | 37.5596 | 126.9368 |
| 인사동 | 37.5741 | 126.9855 |
| 여의도 | 37.5219 | 126.9245 |
| 명동 | 37.5636 | 126.9827 |
| 잠실 | 37.5133 | 127.1029 |
| 종로 | 37.5704 | 126.9921 |
| 압구정 | 37.5271 | 127.0286 |
| 성수 | 37.5447 | 127.0564 |
| 합정 | 37.5498 | 126.9137 |
| 연남 | 37.5598 | 126.9260 |
| 서울숲 | 37.5444 | 127.0375 |

> 목록에 없는 지역명 입력 시 서울 시청(37.5665, 126.978)을 기본값으로 사용

> 지역 추가 방법: `backend/src/services/weatherService.js`의 `LOCATION_COORDS` 객체에 추가

---

## 7. 히스토리 저장 구조

현재는 **인메모리(서버 변수)** 저장 → 서버 재시작 시 초기화됨

```js
// historyService.js 데이터 구조
{
  id: "1700000000000_ab12c",     // timestamp_random
  course: [
    {
      name: "카페 이름",
      address: "서울 강남구 ...",
      lat: 37.4979,
      lon: 127.0276,
      category: "루프탑 카페",
      phone: "02-1234-5678",
      categoryGroup: "음식점 > 카페"
    },
    // ... 최대 3개
  ],
  location: "강남",              // null이면 GPS 사용
  mood: "romantic",
  createdAt: "2024-01-15T14:30:00.000Z"
}
```

### DB 전환 시 수정 파일

실서비스에서는 MongoDB 또는 SQLite로 전환 권장:

```
backend/src/services/historyService.js
→ save() / getAll() 함수를 DB 쿼리로 교체
```

---

## 8. 권한 처리 흐름

```
앱 시작
    ↓
IntroScreen 표시 (설명 화면)
    ↓
사용자가 "위치 기반 추천 시작" 클릭
    ↓
requestLocationPermission() 호출
    ↓
    ├── GRANTED → Geolocation.getCurrentPosition()
    │       ↓
    │   GPS 성공 → navigation.replace('Main', { lat, lon })
    │       ↓
    │   GPS 실패 → Alert → 지역 직접 입력 화면으로
    │
    ├── DENIED (첫 거부) → 지역 직접 입력 화면으로
    │
    └── BLOCKED (영구 거부) → Alert + 설정 앱으로 이동 유도
```
