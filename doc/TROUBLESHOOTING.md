# 🔧 TROUBLESHOOTING — 오류 해결 모음

> 자주 발생하는 오류와 해결 방법을 정리합니다.

---

## 백엔드 오류

---

### ❌ `Cannot GET /date-course` (404)

**원인:** 서버가 실행 안 됨 또는 URL 오타

**해결:**
```bash
# 서버 실행 확인
cd backend
npm run dev

# 헬스 체크
curl http://localhost:3000/health
```

---

### ❌ `위치 정보(lat/lon) 또는 지역명(location)이 필요합니다` (400)

**원인:** API 호출 시 위치 파라미터 누락

**해결:**
```bash
# 지역명 필수 포함
curl "http://localhost:3000/date-course?location=강남"

# 또는 좌표 포함
curl "http://localhost:3000/date-course?lat=37.4979&lon=127.0276"
```

---

### ❌ Kakao API 오류: `401 Unauthorized`

**원인:** KAKAO_API_KEY가 잘못됨 또는 .env 파일 미설정

**해결:**
```bash
# .env 파일 확인
cat backend/.env

# 키 형식 확인 (REST API 키 사용 - 앱 키 아님)
KAKAO_API_KEY=abc123def456...  # 32자리 영소문자+숫자
```

```
카카오 개발자 콘솔 → 내 애플리케이션 → 앱 키
→ "REST API 키" 사용 (JavaScript 키 X, Native 앱 키 X)
```

---

### ❌ Kakao API 오류: `403 Forbidden`

**원인:** 카카오 앱에 플랫폼 등록 미완료

**해결:**
```
카카오 개발자 콘솔 → 내 애플리케이션 → 플랫폼
→ Android 플랫폼 추가
→ 패키지명: com.datewhatodo (또는 실제 앱 패키지명)
→ 저장
```

---

### ❌ OpenWeather API 오류: `401 Invalid API key`

**원인:** API 키 미설정 또는 아직 활성화 안 됨

**해결:**
```
1. openweathermap.org 로그인 → API Keys 확인
2. 발급 직후 10~30분 대기 (즉시 사용 불가)
3. .env 파일에 정확히 입력됐는지 확인

OPENWEATHER_API_KEY=a1b2c3d4e5f6...  # 32자리
```

> API 키 없어도 백엔드가 죽지 않음: `{ condition: 'normal' }` 기본값 반환

---

### ❌ 서버 재시작 시 히스토리 사라짐

**원인:** 현재 인메모리 저장 방식 사용 (배열)

**해결 (임시):** 서버를 재시작하지 말 것 (`nodemon` 파일 변경 감지로만 재시작)

**해결 (영구):** DB 연동 — `backend/src/services/historyService.js` 수정

```bash
# MongoDB 연동 예시
npm install mongoose

# historyService.js의 save()/getAll() 함수를
# mongoose 모델 쿼리로 교체
```

---

## 프론트엔드 오류

---

### ❌ Metro 번들러 오류: `Unable to resolve module`

**원인:** 패키지 설치 누락 또는 캐시 문제

**해결:**
```bash
# 패키지 재설치
cd frontend
rm -rf node_modules
npm install

# Metro 캐시 초기화 후 재시작
npx react-native start --reset-cache
```

---

### ❌ Android 빌드 오류: `Duplicate class kotlin.collections`

**원인:** kotlin 버전 충돌

**해결:** `android/build.gradle`에 추가:
```gradle
configurations.all {
    resolutionStrategy {
        force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.0'
    }
}
```

---

### ❌ `Network request failed` (API 통신 실패)

**원인 1:** 서버 주소 설정 오류

**해결:**
```js
// frontend/src/services/api.js 에서 BASE_URL 확인

// Android 에뮬레이터
const BASE_URL = 'http://10.0.2.2:3000';  // ✅

// 실제 기기 (같은 WiFi)
const BASE_URL = 'http://192.168.0.10:3000';  // PC의 실제 IP 입력

// localhost는 에뮬레이터에서 동작 안 함 ❌
const BASE_URL = 'http://localhost:3000';
```

**내 컴퓨터 IP 확인:**
```bash
# Windows
ipconfig
# → 192.168.x.x 확인

# macOS/Linux
ifconfig | grep inet
```

**원인 2:** HTTP cleartext 미허용

**해결:** `AndroidManifest.xml` 확인:
```xml
<application
    android:usesCleartextTraffic="true"  ← 이 줄 있는지 확인
    ...>
```

---

### ❌ 위치 권한 요청이 표시 안 됨

**원인 1:** `react-native-permissions` 설정 누락

**해결:**
```bash
npm install react-native-permissions
npx react-native run-android  # 재빌드 필요
```

**원인 2:** AndroidManifest.xml 권한 선언 누락

**해결:** `AndroidManifest.xml` 확인:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

---

### ❌ GPS 위치를 가져오지 못함 (에뮬레이터)

**원인:** 에뮬레이터에 위치가 설정되지 않음

**해결:**
```
Android Studio → 에뮬레이터 실행
→ 오른쪽 점 3개 메뉴(⋮) → Location
→ 위도: 37.4979, 경도: 127.0276
→ Set Location 클릭
```

---

### ❌ `AdMob` 앱 크래시: `The Google Mobile Ads SDK was initialized incorrectly`

**원인:** AndroidManifest.xml에 AdMob 앱 ID 누락

**해결:** `AndroidManifest.xml`의 `<application>` 안에 추가:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-8353634332299342~4400283778" />
```

---

### ❌ AdMob 광고가 표시 안 됨 (개발 중)

**원인:** 개발 환경에서 실제 광고 ID로 테스트 시 정책 위반 감지

**해결:**
```js
// __DEV__ = true일 때 자동으로 TestIds 사용 중인지 확인
// AdPlaceholder.js
const unitId = __DEV__ ? TestIds.BANNER : AD_UNIT_IDS.HOME_BANNER;
```

실제 기기에서 테스트하려면:
```js
// App.js에 추가
import mobileAds from 'react-native-google-mobile-ads';

mobileAds().setRequestConfiguration({
  testDeviceIdentifiers: ['기기_ID'],
});
```

---

### ❌ 전면 광고(Interstitial)가 표시 안 됨

**원인 1:** 광고 로드 전 show() 호출

```js
// 현재 로직: 500ms 딜레이 후 로드 완료 여부 확인
// 네트워크 느린 경우 로드가 500ms 안에 안 될 수 있음

// 해결: 딜레이를 늘리거나 LOADED 이벤트에서 바로 show()
const unsubLoad = interstitial.addAdEventListener(AdEventType.LOADED, () => {
  interstitial.show();  // 로드 즉시 표시
});
```

**원인 2:** 같은 Interstitial 인스턴스 재사용 문제

```js
// ResultScreen.js - 모듈 레벨에서 인스턴스 생성됨
const interstitial = InterstitialAd.createForAdRequest(unitId);
// CLOSED 이벤트 후 interstitial.load() 재호출로 해결 (이미 구현됨)
```

---

### ❌ 카카오맵 링크가 작동 안 함

**원인 1:** 카카오맵 앱 미설치 → 웹 폴백으로 자동 전환됨 (정상)

**원인 2:** Android 11+ 패키지 가시성 정책

**해결:** `AndroidManifest.xml`에 추가:
```xml
<queries>
    <package android:name="net.daum.android.map" />
</queries>
```

---

### ❌ React Navigation 오류: `The action 'NAVIGATE' was not handled`

**원인:** 네비게이션 스택에 없는 화면명 사용

**해결:**
```js
// AppNavigator.js의 화면 이름 확인
Stack: 'Intro', 'Main', 'Result'
Tab:   'Home', 'History'

// 올바른 네비게이션 방법
navigation.navigate('Result', { ... })    // ✅ Stack 화면
navigation.navigate('History')            // ✅ Tab 화면 (Main 내에서)
navigation.replace('Main', {              // ✅ Intro → Main 전환
  screen: 'Home',
  params: { ... }
})
```

---

## 개발 환경 오류

---

### ❌ `SDK location not found` (Android 빌드 실패)

**해결:**
```
# Windows: 환경변수 확인
ANDROID_HOME = C:\Users\[유저명]\AppData\Local\Android\Sdk

# 또는 local.properties 파일 생성
echo "sdk.dir=C:/Users/[유저명]/AppData/Local/Android/Sdk" > android/local.properties
```

---

### ❌ `Gradle build failed` (다양한 이유)

**해결 순서:**
```bash
# 1. Gradle 캐시 초기화
cd android
./gradlew clean

# 2. 다시 빌드
npx react-native run-android

# 3. 그래도 안 되면 전체 초기화
cd ..
rm -rf android/.gradle
rm -rf android/app/build
rm -rf node_modules
npm install
npx react-native run-android
```

---

### ❌ `adb: command not found`

**해결:**
```bash
# Windows Path에 추가
%ANDROID_HOME%\platform-tools

# 확인
adb version
```

---

## 체크리스트 (새 환경 세팅 시)

```
□ Node.js 18+ 설치 확인
□ JDK 17+ 설치 & JAVA_HOME 설정
□ Android Studio + SDK 설치 & ANDROID_HOME 설정
□ backend/.env 파일 생성 (API 키 입력)
□ backend npm install 완료
□ frontend npm install 완료
□ android/local.properties SDK 경로 확인
□ AndroidManifest.xml AdMob 앱 ID 확인
□ api.js BASE_URL 환경에 맞게 수정
□ 에뮬레이터 또는 실기기 연결 확인 (adb devices)
□ 백엔드 서버 실행 확인 (curl /health)
□ 앱 실행 (npx react-native run-android)
```
