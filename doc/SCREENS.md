# 📱 SCREENS — 화면별 상세 설명

---

## 화면 목록

| 화면 | 파일 | 역할 |
|------|------|------|
| IntroScreen | `src/screens/IntroScreen.js` | 위치 권한 안내 + 지역 설정 |
| HomeScreen | `src/screens/HomeScreen.js` | 분위기 선택 + 추천 실행 |
| ResultScreen | `src/screens/ResultScreen.js` | 코스 결과 표시 + 저장 |
| HistoryScreen | `src/screens/HistoryScreen.js` | 저장된 히스토리 목록 |

---

## 1. IntroScreen (인트로 화면)

**파일:** `src/screens/IntroScreen.js`

### 역할

- 앱 최초 진입 시 표시
- 위치 권한 안내 문구 표시 후 버튼 클릭 시에만 권한 요청
- 권한 거부 or "지역 직접 입력" 선택 시 → 텍스트 입력 UI 전환

### UI 구성

```
┌─────────────────────────────┐
│                             │
│         💕 (로고)            │
│      데이트 뭐하지           │
│  오늘의 완벽한 데이트 코스를  │
│     찾아드릴게요 ✨           │
│                             │
│  ┌─────────────────────┐   │
│  │ 📍                  │   │
│  │ 근처 데이트 코스를    │   │
│  │ 추천하려면 위치 정보가 │   │
│  │ 필요합니다 😊        │   │
│  └─────────────────────┘   │
│                             │
│  [📍 위치 기반 추천 시작]    │
│                             │
│  ─────────── 또는 ─────────  │
│                             │
│  [✏️ 지역 직접 입력]        │
│                             │
└─────────────────────────────┘
```

### 지역 직접 입력 전환 후

```
┌─────────────────────────────┐
│  어디서 데이트할 예정인가요?  │
│                             │
│  [강남] [홍대] [건대]        │
│  [이태원] [신촌] [성수]      │
│  [합정] [잠실]               │
│                             │
│  ┌─────────────────────┐   │
│  │ 예: 강남, 홍대, 건대...│  │
│  └─────────────────────┘   │
│                             │
│  [🗺️ 데이트 코스 찾기]      │
│  [← 이전으로]               │
└─────────────────────────────┘
```

### 핵심 로직

```js
// 위치 권한 요청 버튼 클릭 시
const handleLocationPermission = async () => {
  const granted = await requestLocationPermission();

  if (!granted) {
    setShowLocationInput(true);  // 지역 입력 화면으로 전환
    return;
  }

  Geolocation.getCurrentPosition(
    (position) => {
      navigation.replace('Main', {
        screen: 'Home',
        params: { lat, lon, useGPS: true }
      });
    },
    (error) => {
      setShowLocationInput(true);  // GPS 실패 시에도 지역 입력으로
    }
  );
};
```

### 빠른 선택 지역 목록

`강남 / 홍대 / 건대 / 이태원 / 신촌 / 성수 / 합정 / 잠실`

### 다음 화면으로 이동

```js
// GPS 사용
navigation.replace('Main', {
  screen: 'Home',
  params: { lat: 37.4979, lon: 127.0276, useGPS: true }
});

// 지역명 사용
navigation.replace('Main', {
  screen: 'Home',
  params: { location: '홍대', useGPS: false }
});
```

---

## 2. HomeScreen (홈 화면)

**파일:** `src/screens/HomeScreen.js`

### 역할

- 앱의 메인 화면 (하단 탭 ① 번)
- 최초 마운트 시 자동으로 데이트 코스 추천 API 호출
- 분위기(mood) 선택 후 다시 추천 받기 가능

### UI 구성

```
┌─────────────────────────────┐
│ 💕 데이트 뭐하지             │ ← 헤더 (분홍)
│ 📍 강남 기준                │
├─────────────────────────────┤
│ 📢 광고 배너 (banner_home)  │ ← AdMob 배너
├─────────────────────────────┤
│ 오늘의 분위기는? ✨           │
│                             │
│ [😊 일반] [💝 로맨틱] [🎯 액티비티] │ ← 선택 버튼
│                             │
├─────────────────────────────┤
│                             │
│   🎲                        │
│   랜덤 데이트 추천!           │ ← 메인 CTA 버튼
│   클릭할 때마다 새로운 코스   │
│                             │
├─────────────────────────────┤
│ 추천 코스 구성               │
│                             │
│ [☕카페] [🍽️맛집] [🌿야외]  │
│ [🎨실내] [🎯액티비티] [🌃야경] │
│                             │
├─────────────────────────────┤
│ [📍 지역 변경하기]           │
└─────────────────────────────┘
```

### 핵심 로직

```js
// 최초 1회만 자동 추천 (didAutoFetch ref로 중복 방지)
const didAutoFetch = useRef(false);

useEffect(() => {
  if (didAutoFetch.current) return;
  didAutoFetch.current = true;
  fetchCourse('normal');
}, []);

// 추천 실행
const fetchCourse = async (mood) => {
  const course = await getDateCourse({ lat, lon, location, mood });
  navigation.navigate('Result', { course, location, mood, lat, lon });
};
```

### 분위기 옵션

| 값 | 라벨 | 색상 |
|----|------|------|
| normal | 😊 일반 | #74B9FF |
| romantic | 💝 로맨틱 | #FF6B9D |
| activity | 🎯 액티비티 | #00B894 |

### 광고 위치

- **상단**: `<AdPlaceholder type="banner_home" />` — 320×50 배너

---

## 3. ResultScreen (결과 화면)

**파일:** `src/screens/ResultScreen.js`

### 역할

- API에서 받은 코스 3개를 카드 형태로 표시
- 진입 시 전면 광고(Interstitial) 표시
- 카드별 카카오맵 연동 버튼
- 히스토리 저장 기능

### UI 구성

```
┌─────────────────────────────┐
│ ← 뒤로                      │ ← 헤더 (분홍)
│ 오늘의 데이트 코스 💕         │
│ 📍 강남  |  💝 로맨틱        │
├─────────────────────────────┤
│ ╔═══════════════════════╗   │
│ ║ 1️⃣ 첫 번째 코스       ║   │ ← CourseCard #1
│ ║ 루프탑카페 서울뷰      ║   │   (핑크 왼쪽 테두리)
│ ║ 📌 서울 강남구 테헤란로 ║   │
│ ║ [🗺️ 카카오맵으로 보기]║   │
│ ╚═══════════════════════╝   │
│ ╔═══════════════════════╗   │
│ ║ 2️⃣ 두 번째 코스       ║   │ ← CourseCard #2
│ ║ 와인바 라쁘띠          ║   │   (주황 왼쪽 테두리)
│ ╚═══════════════════════╝   │
│ ┌───────────────────────┐   │
│ │ 🎁 스폰서 광고 (inline)│   │ ← 인라인 광고 300×250
│ └───────────────────────┘   │
│ ╔═══════════════════════╗   │
│ ║ 3️⃣ 세 번째 코스       ║   │ ← CourseCard #3
│ ║ 강남 야경 전망대        ║   │   (초록 왼쪽 테두리)
│ ╚═══════════════════════╝   │
├─────────────────────────────┤
│ [📋 히스토리에 저장]         │
│ [🎲 다른 코스 추천받기]      │
├─────────────────────────────┤
│ 📢 하단 배너 광고           │ ← 320×50 배너
└─────────────────────────────┘
```

### 전면 광고 로직

```js
useEffect(() => {
  const unsubLoad = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitialLoaded.current = true;
  });

  interstitial.load();

  // 화면 전환 완료 후 500ms 딜레이
  const timer = setTimeout(() => {
    if (interstitialLoaded.current) {
      interstitial.show();
    }
  }, 500);

  return () => {
    clearTimeout(timer);
    unsubLoad();
    // ...
  };
}, []);
```

### 카카오맵 연동

```js
// 카카오맵 앱 설치되어 있으면 앱 실행, 없으면 웹으로 폴백
const kakaoScheme = `kakaomap://look?p=${place.lat},${place.lon}`;
const webFallback = `https://map.kakao.com/link/map/${name},${lat},${lon}`;

Linking.canOpenURL(kakaoScheme)
  .then(supported => Linking.openURL(supported ? kakaoScheme : webFallback));
```

### 광고 위치

| 위치 | type | 사이즈 |
|------|------|--------|
| 카드 2번 아래 | `inline` | 300×250 |
| 액션 버튼 아래 | `banner_result` | 320×50 |
| 진입 시 자동 | Interstitial | 전체 화면 |

---

## 4. HistoryScreen (히스토리 화면)

**파일:** `src/screens/HistoryScreen.js`

### 역할

- 하단 탭 ② 번 화면
- 저장된 코스를 최신순 FlatList로 표시
- 당겨서 새로고침(RefreshControl) 지원
- 항목 클릭 시 → ResultScreen으로 이동 (재열람)

### UI 구성

```
┌─────────────────────────────┐
│ 📋 데이트 히스토리           │ ← 헤더
│ 이전에 저장된 코스 3개       │
├─────────────────────────────┤
│ 📢 광고 배너 (banner_history)│ ← FlatList 헤더 광고
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 1/15 14:30  📍강남  💝  │ │ ← 히스토리 카드
│ │ 1. 루프탑카페 서울뷰 · ...│ │
│ │ 2. 와인바 라쁘띠 · ...   │ │
│ │ 3. 강남 야경 전망대 · ...│ │
│ │              자세히 보기 →│ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 1/15 10:00  📍홍대  🎯  │ │
│ │ ...                      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

### 히스토리 카드 정보

| 항목 | 설명 |
|------|------|
| 날짜/시간 | `M/D HH:MM` 형식 |
| 지역 | `📍 강남` (GPS 사용 시 미표시) |
| 분위기 이모지 | 😊 / 💝 / 🎯 |
| 코스 목록 | 장소명 + 카테고리 (최대 3개) |

### 클릭 시 동작

```js
navigation.navigate('Result', {
  course: item.course,
  location: item.location,
  mood: item.mood,
});
// ResultScreen에서 재열람 (저장 버튼은 이미 saved 상태 아님)
```

---

## 5. 컴포넌트 상세

### CourseCard (`src/components/CourseCard.js`)

**Props**

| prop | 타입 | 설명 |
|------|------|------|
| place | object | 장소 데이터 |
| order | number | 순서 (1, 2, 3) |
| onMapOpen | function | 지도 버튼 클릭 콜백 |

**place 객체 구조**

```js
{
  name: "루프탑카페 서울뷰",
  address: "서울 강남구 테헤란로 123",
  lat: 37.4991,
  lon: 127.0289,
  category: "루프탑 카페",
  phone: "02-1234-5678",      // 없으면 ""
  categoryGroup: "음식점 > 카페" // 없으면 ""
}
```

**순서별 색상**

| order | 색상 |
|-------|------|
| 1 | #FF6B9D (핑크) |
| 2 | #FF8E53 (주황) |
| 3 | #00B894 (민트) |

### AdPlaceholder (`src/components/AdPlaceholder.js`)

**type 별 동작**

| type | 광고 ID | 사이즈 | 화면 |
|------|--------|--------|------|
| `banner_home` | HOME_BANNER | 320×50 | HomeScreen |
| `banner_result` | RESULT_BOTTOM_BANNER | 320×50 | ResultScreen |
| `banner_history` | HISTORY_BANNER | 320×50 | HistoryScreen |
| `inline` | RESULT_INLINE | 300×250 | ResultScreen |

**개발 중 자동 테스트 광고 전환**

```js
// __DEV__ = true (개발) → TestIds.BANNER 사용
// __DEV__ = false (릴리즈) → 실제 AdMob ID 사용
const unitId = __DEV__ ? TestIds.BANNER : AD_UNIT_IDS.HOME_BANNER;
```

---

## 6. 색상 & 디자인 시스템

### 주요 색상

| 이름 | HEX | 용도 |
|------|-----|------|
| 메인 핑크 | `#FF6B9D` | 버튼, 헤더, 강조 |
| 배경 | `#FFF0F5` | 전체 배경 |
| 연핑크 | `#FFE4EE` | 정보 박스, 보조 텍스트 |
| 핑크 테두리 | `#FFB3CC` | 입력창, 버튼 테두리 |
| 주황 | `#FF8E53` | 카드 2번 색상 |
| 민트 | `#00B894` | 카드 3번, activity 버튼 |
| 파랑 | `#74B9FF` | normal 버튼 |

### 폰트 크기

| 용도 | 크기 |
|------|------|
| 제목 | 26~34px |
| 본문 | 15~18px |
| 보조 | 12~14px |
| 배지 | 11~12px |

### 공통 스타일 패턴

```js
// 카드 그림자 (iOS + Android)
shadowColor: '#FF6B9D',
shadowOffset: { width: 0, height: 4 },
shadowOpacity: 0.3,
shadowRadius: 8,
elevation: 5,  // Android 전용

// 버튼 기본
borderRadius: 14~16,
paddingVertical: 16~18,
alignItems: 'center',
```
