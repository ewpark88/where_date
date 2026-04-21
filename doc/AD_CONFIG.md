# 📢 AD_CONFIG — AdMob 광고 설정 가이드

---

## 1. AdMob 계정 정보

| 항목 | 값 |
|------|-----|
| 앱 ID | `ca-app-pub-8353634332299342~4400283778` |
| 플랫폼 | Android |
| AdMob 콘솔 | https://admob.google.com |

---

## 2. 광고 Unit ID 전체 목록

| 변수명 | Unit ID | 광고 형태 | 사이즈 | 위치 |
|--------|---------|----------|--------|------|
| HOME_BANNER | `ca-app-pub-8353634332299342/2184137790` | Banner | 320×50 | HomeScreen 상단 |
| RESULT_INLINE | `ca-app-pub-8353634332299342/5358142228` | Banner (Medium Rectangle) | 300×250 | ResultScreen 카드 사이 |
| RESULT_BOTTOM_BANNER | `ca-app-pub-8353634332299342/9290257182` | Banner | 320×50 | ResultScreen 하단 |
| HISTORY_BANNER | `ca-app-pub-8353634332299342/2184137790` | Banner | 320×50 | HistoryScreen 상단 |
| INTERSTITIAL | `ca-app-pub-8353634332299342/9864972250` | Interstitial | 전체 화면 | ResultScreen 진입 시 |

---

## 3. 광고 ID 관리 파일

**파일 경로:** `frontend/src/config/adConfig.js`

```js
export const APP_ID = 'ca-app-pub-8353634332299342~4400283778';

export const AD_UNIT_IDS = {
  HOME_BANNER:          'ca-app-pub-8353634332299342/2184137790',
  RESULT_INLINE:        'ca-app-pub-8353634332299342/5358142228',
  RESULT_BOTTOM_BANNER: 'ca-app-pub-8353634332299342/9290257182',
  HISTORY_BANNER:       'ca-app-pub-8353634332299342/2184137790',
  INTERSTITIAL:         'ca-app-pub-8353634332299342/9864972250',
};
```

> ⚠️ ID 수정이 필요하면 이 파일만 수정하면 됨 (소스 전체 변경 불필요)

---

## 4. 광고 위치 상세 (화면별)

### 4-1. HomeScreen — 상단 배너

```
화면 진입 시 항상 노출
위치: 광고 배너 영역 (분위기 선택 섹션 위)
type: "banner_home"
```

```jsx
// HomeScreen.js 해당 코드
<AdPlaceholder type="banner_home" />
```

### 4-2. ResultScreen — 인라인 광고 (300×250)

```
코스 카드 2번과 3번 사이에 표시
코스가 3개 이상일 때만 표시 (index === 1 && course.length > 2)
type: "inline"
```

```jsx
// ResultScreen.js 해당 코드
{index === 1 && course.length > 2 && (
  <AdPlaceholder type="inline" />
)}
```

### 4-3. ResultScreen — 하단 배너

```
저장/추천 버튼 아래 하단에 항상 노출
type: "banner_result"
```

```jsx
// ResultScreen.js 해당 코드
<AdPlaceholder type="banner_result" />
```

### 4-4. HistoryScreen — 상단 배너

```
FlatList 헤더(ListHeaderComponent)에 위치
히스토리 목록 최상단에 표시
type: "banner_history"
```

```jsx
// HistoryScreen.js 해당 코드
ListHeaderComponent={<AdPlaceholder type="banner_history" />}
```

### 4-5. ResultScreen — 전면 광고 (Interstitial)

```
ResultScreen 마운트 후 500ms 딜레이 후 자동 표시
사용자가 닫으면 다음 방문을 위해 미리 로드
```

```jsx
// ResultScreen.js 전면 광고 흐름
interstitial.load()         // 광고 미리 로드
→ AdEventType.LOADED        // 로드 완료 이벤트
→ setTimeout(500ms)         // 화면 전환 완료 대기
→ interstitial.show()       // 광고 표시
→ AdEventType.CLOSED        // 닫힘 이벤트
→ interstitial.load()       // 다음 광고 미리 로드
```

---

## 5. 광고 SDK 설치 및 설정

### 5-1. 패키지 설치

```bash
npm install react-native-google-mobile-ads
```

### 5-2. AndroidManifest.xml 설정

**파일:** `android/app/src/main/AndroidManifest.xml`

```xml
<application ...>
    <!-- AdMob 앱 ID - 반드시 포함 (없으면 앱 크래시) -->
    <meta-data
        android:name="com.google.android.gms.ads.APPLICATION_ID"
        android:value="ca-app-pub-8353634332299342~4400283778" />
</application>
```

> ⚠️ 이 설정이 없으면 앱이 실행 시 즉시 크래시됩니다.

### 5-3. android/app/build.gradle 설정

```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
}
```

---

## 6. 개발 vs 릴리즈 광고 ID 분리

### 자동 전환 로직 (AdPlaceholder.js)

```js
// __DEV__ 변수: 개발 빌드 true / 릴리즈 빌드 false
const UNIT_IDS = {
  banner_home:    __DEV__ ? TestIds.BANNER       : AD_UNIT_IDS.HOME_BANNER,
  banner_result:  __DEV__ ? TestIds.BANNER       : AD_UNIT_IDS.RESULT_BOTTOM_BANNER,
  banner_history: __DEV__ ? TestIds.BANNER       : AD_UNIT_IDS.HISTORY_BANNER,
  inline:         __DEV__ ? TestIds.BANNER       : AD_UNIT_IDS.RESULT_INLINE,
};

// 전면 광고 (ResultScreen.js)
const interstitialUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : AD_UNIT_IDS.INTERSTITIAL;
```

### 구글 테스트 ID 값

| 형태 | 테스트 ID |
|------|----------|
| Banner | `ca-app-pub-3940256099942544/6300978111` |
| Interstitial | `ca-app-pub-3940256099942544/1033173712` |
| Rewarded | `ca-app-pub-3940256099942544/5224354917` |

---

## 7. 광고 로드 실패 처리

`AdPlaceholder.js`에서 로드 실패 시 자동으로 플레이스홀더 표시:

```js
onAdFailedToLoad={(error) => {
  console.warn(`[AdMob][${type}] 로드 실패:`, error.message);
  setAdFailed(true);
  setAdLoaded(false);
}}
```

실패 시 화면에 표시되는 내용:
```
📢
광고를 불러올 수 없습니다
```

---

## 8. AdMob 정책 주의사항

```
❌ 자기 광고 클릭 금지 (어뷰징 처리 → 계정 정지)
❌ 광고 클릭을 유도하는 문구/UI 금지
❌ 성인 콘텐츠 앱에 일반 광고 표시 금지
✅ 개발 중에는 반드시 TestIds 사용
✅ 실제 기기로 테스트 시 기기 ID를 테스트 기기로 등록
```

### 실제 기기를 테스트 기기로 등록하는 방법

```js
// react-native-google-mobile-ads 설정 (App.js 또는 index.js에 추가)
import mobileAds from 'react-native-google-mobile-ads';

mobileAds()
  .setRequestConfiguration({
    testDeviceIdentifiers: ['여기에_기기_ID_입력'],
  })
  .then(() => {
    console.log('AdMob 초기화 완료');
  });
```

기기 ID 확인 방법:
```
앱 실행 → 로그 확인 → "Use RequestConfiguration.Builder().setTestDeviceIds(Arrays.asList("XXXX"))"
→ XXXX 부분이 기기 ID
```

---

## 9. 수익 최적화 팁

| 전략 | 방법 |
|------|------|
| 전면 광고 빈도 조절 | ResultScreen 진입 횟수가 잦으면 2~3번에 1번만 표시 |
| 배너 갱신 | BannerAd는 자동으로 60초마다 갱신됨 |
| 인라인 광고 | 코스가 3개 이상일 때만 표시 (이미 조건 적용됨) |
| 메디에이션 | AdMob 메디에이션으로 다른 광고 네트워크 추가 가능 |
