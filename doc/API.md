# 📡 API — 백엔드 REST API 명세서

**Base URL:** `http://localhost:3000` (개발) / `https://your-domain.com` (배포)

---

## 공통 응답 형식

### 성공

```json
HTTP 200 OK
{
  "데이터키": "값"
}
```

### 실패

```json
HTTP 4xx / 5xx
{
  "error": "오류 메시지"
}
```

---

## 1. 헬스 체크

### `GET /health`

서버 실행 상태 확인용

**응답 예시**
```json
HTTP 200
{
  "status": "ok",
  "message": "데이트 뭐하지 서버 실행 중 💕"
}
```

---

## 2. 데이트 코스 추천

### `GET /date-course`

날씨 + 위치 + 분위기를 기반으로 데이트 코스 3개를 추천합니다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| lat | number | ⚠️ 선택 | 위도 (예: 37.4979) |
| lon | number | ⚠️ 선택 | 경도 (예: 127.0276) |
| location | string | ⚠️ 선택 | 지역명 (예: 강남, 홍대) |
| mood | string | 선택 | 분위기 (normal / romantic / activity) |

> ⚠️ `lat + lon` 또는 `location` 중 하나는 반드시 입력해야 합니다.
> 둘 다 없으면 400 에러 반환.

**mood 값 설명**

| 값 | 설명 | 추가 키워드 |
|----|------|-----------|
| `normal` | 일반 (기본값) | 맛집, food 카테고리 |
| `romantic` | 로맨틱 | 루프탑 카페, 와인바, 오마카세 |
| `activity` | 액티비티 | 방탈출, 볼링장, VR 체험 |

**요청 예시**

```bash
# GPS 위치 기반 + 로맨틱
GET /date-course?lat=37.4979&lon=127.0276&mood=romantic

# 지역명 기반 + 액티비티
GET /date-course?location=홍대&mood=activity

# 기본 (지역명만)
GET /date-course?location=강남
```

**성공 응답 (200)**

```json
{
  "course": [
    {
      "name": "루프탑카페 서울뷰",
      "address": "서울 강남구 테헤란로 123",
      "lat": 37.4991,
      "lon": 127.0289,
      "category": "루프탑 카페",
      "phone": "02-1234-5678",
      "categoryGroup": "음식점 > 카페"
    },
    {
      "name": "와인바 라쁘띠",
      "address": "서울 강남구 역삼로 45",
      "lat": 37.4975,
      "lon": 127.0301,
      "category": "와인바",
      "phone": "02-9876-5432",
      "categoryGroup": "음식점 > 주점"
    },
    {
      "name": "강남 야경 전망대",
      "address": "서울 강남구 영동대로 517",
      "lat": 37.5069,
      "lon": 127.0572,
      "category": "야경 명소",
      "phone": "",
      "categoryGroup": "관광명소"
    }
  ]
}
```

**오류 응답**

```json
// 400 - 위치 파라미터 없음
{
  "error": "위치 정보(lat/lon) 또는 지역명(location)이 필요합니다."
}

// 500 - 서버 내부 오류
{
  "error": "데이트 코스 추천 중 오류가 발생했습니다."
}
```

**처리 순서 (내부)**

```
1. lat/lon or location 파라미터 검증
2. location만 있으면 → getCoordsFromLocation()으로 좌표 변환
3. weatherService.getWeather(lat, lon) → OpenWeather API 호출
4. buildKeywords(condition, mood) → 키워드 3개 선택
5. kakaoService.searchPlaces("지역명 키워드", lat, lon) × 3 병렬 실행
6. 각 결과에서 랜덤 1개 선택
7. { course: [...] } 응답
```

---

## 3. 히스토리 저장

### `POST /history`

마음에 드는 데이트 코스를 히스토리에 저장합니다.

**Request Body (JSON)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| course | Array | ✅ 필수 | 저장할 코스 배열 (1개 이상) |
| location | string | 선택 | 지역명 |
| mood | string | 선택 | 분위기 |

**요청 예시**

```bash
POST /history
Content-Type: application/json

{
  "course": [
    {
      "name": "루프탑카페 서울뷰",
      "address": "서울 강남구 테헤란로 123",
      "lat": 37.4991,
      "lon": 127.0289,
      "category": "루프탑 카페",
      "phone": "02-1234-5678"
    }
  ],
  "location": "강남",
  "mood": "romantic"
}
```

**성공 응답 (201)**

```json
{
  "success": true,
  "history": {
    "id": "1700000000000_ab12c",
    "course": [...],
    "location": "강남",
    "mood": "romantic",
    "createdAt": "2024-01-15T14:30:00.000Z"
  }
}
```

**오류 응답**

```json
// 400 - 잘못된 course 데이터
{
  "error": "유효한 코스 데이터가 필요합니다."
}
```

---

## 4. 히스토리 조회

### `GET /history`

저장된 히스토리 전체를 최신순으로 반환합니다.

**요청 예시**

```bash
GET /history
```

**성공 응답 (200)**

```json
{
  "history": [
    {
      "id": "1700000000001_xy99z",
      "course": [
        {
          "name": "루프탑카페 서울뷰",
          "address": "서울 강남구 테헤란로 123",
          "lat": 37.4991,
          "lon": 127.0289,
          "category": "루프탑 카페",
          "phone": "02-1234-5678",
          "categoryGroup": "음식점 > 카페"
        }
      ],
      "location": "강남",
      "mood": "romantic",
      "createdAt": "2024-01-15T15:00:00.000Z"
    },
    {
      "id": "1700000000000_ab12c",
      "course": [...],
      "location": "홍대",
      "mood": "activity",
      "createdAt": "2024-01-15T14:30:00.000Z"
    }
  ]
}
```

> 최대 100개까지 보관 (초과 시 가장 오래된 항목 자동 삭제)

---

## 5. 외부 API 연동 명세

### 5-1. Kakao Local API — 키워드 장소 검색

**요청 (kakaoService.js 내부)**

```
GET https://dapi.kakao.com/v2/local/search/keyword.json
Headers:
  Authorization: KakaoAK {KAKAO_API_KEY}
Params:
  query: "강남 루프탑 카페"
  x: 127.0276         (경도, 있을 때만)
  y: 37.4979          (위도, 있을 때만)
  radius: 5000        (반경 5km)
  sort: "distance"
  size: 10
```

**응답 데이터 활용 필드**

```json
{
  "documents": [
    {
      "place_name": "장소명",
      "road_address_name": "도로명 주소",
      "address_name": "지번 주소",
      "x": "127.0276",        ← 경도 (문자열, parseFloat 변환 필요)
      "y": "37.4979",         ← 위도 (문자열, parseFloat 변환 필요)
      "phone": "02-1234-5678",
      "category_name": "음식점 > 카페"
    }
  ]
}
```

### 5-2. OpenWeatherMap — 현재 날씨

**요청 (weatherService.js 내부)**

```
GET https://api.openweathermap.org/data/2.5/weather
Params:
  lat: 37.4979
  lon: 127.0276
  appid: {OPENWEATHER_API_KEY}
  units: "metric"     (섭씨 온도)
  lang: "kr"          (한국어 설명)
```

**날씨 코드 → condition 변환 규칙**

| 날씨 코드 범위 | condition 값 |
|--------------|-------------|
| 200 ~ 299 | thunderstorm |
| 300 ~ 599 | rain |
| 600 ~ 699 | snow |
| 800 | clear |
| 801 ~ 804 | cloudy |
| 나머지 | normal |

---

## 6. API 테스트 curl 명령어 모음

```bash
# 서버 상태 확인
curl http://localhost:3000/health

# 강남 일반 추천
curl "http://localhost:3000/date-course?location=강남"

# 홍대 로맨틱 추천
curl "http://localhost:3000/date-course?location=홍대&mood=romantic"

# GPS 좌표 액티비티 추천
curl "http://localhost:3000/date-course?lat=37.5563&lon=126.9233&mood=activity"

# 히스토리 저장
curl -X POST http://localhost:3000/history \
  -H "Content-Type: application/json" \
  -d '{"course":[{"name":"테스트카페","address":"서울 마포구","lat":37.5563,"lon":126.9233,"category":"감성 카페","phone":""}],"location":"홍대","mood":"normal"}'

# 히스토리 조회
curl http://localhost:3000/history
```
