# ⚙️ SETUP — 개발 환경 설정 가이드

> 새 PC에서 처음 작업할 때 이 문서를 순서대로 따라하세요.

---

## 1. 사전 요구사항

### 필수 설치 목록

| 도구 | 최소 버전 | 설치 주소 |
|------|----------|----------|
| Node.js | 18.x LTS 이상 | https://nodejs.org |
| JDK | 17 이상 | https://adoptium.net |
| Android Studio | 최신 | https://developer.android.com/studio |
| Git | 최신 | https://git-scm.com |

### 환경변수 확인 (Windows 기준)

```
JAVA_HOME   = C:\Program Files\Eclipse Adoptium\jdk-17...
ANDROID_HOME = C:\Users\[유저명]\AppData\Local\Android\Sdk
```

`Path`에 아래 항목 추가:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

### 설치 확인 명령어

```bash
node -v          # v18.x 이상
npm -v           # 9.x 이상
java -version    # 17 이상
adb version      # Android Debug Bridge
```

---

## 2. API 키 발급

### 2-1. Kakao REST API 키

1. https://developers.kakao.com 접속 → 로그인
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 이름: `데이트뭐하지`, 사업자명: 개인
4. **앱 키** 탭 → **REST API 키** 복사
5. **플랫폼** → Android 플랫폼 추가 → 패키지명 입력: `com.datewhatodo`

### 2-2. OpenWeatherMap API 키

1. https://openweathermap.org 접속 → 회원가입
2. **API Keys** 메뉴 → 기본 키 복사 (또는 새 키 생성)
3. ⚠️ 발급 직후 10~30분 후 활성화됨 (즉시 사용 불가)

### 2-3. Google AdMob

- 앱 ID: `ca-app-pub-8353634332299342~4400283778` ← 이미 설정됨
- 광고 Unit ID: `src/config/adConfig.js`에 이미 설정됨

---

## 3. 백엔드 설정

### 3-1. 패키지 설치

```bash
cd D:/ad/workspace/where_date/backend
npm install
```

설치되는 패키지:
| 패키지 | 버전 | 용도 |
|--------|------|------|
| express | ^4.18.2 | HTTP 서버 |
| axios | ^1.6.0 | 외부 API 호출 |
| cors | ^2.8.5 | CORS 허용 |
| dotenv | ^16.3.1 | 환경변수 로드 |
| nodemon | ^3.0.2 | 개발용 자동 재시작 |

### 3-2. 환경변수 파일 생성

```bash
# .env.example 복사
cp .env.example .env
```

`.env` 파일 내용:
```env
PORT=3000
KAKAO_API_KEY=여기에_카카오_REST_API_키_입력
OPENWEATHER_API_KEY=여기에_오픈웨더_API_키_입력
```

### 3-3. 서버 실행

```bash
# 개발 모드 (파일 변경 시 자동 재시작)
npm run dev

# 일반 실행
npm start
```

### 3-4. 서버 동작 확인

```bash
# 헬스 체크
curl http://localhost:3000/health
# 응답: {"status":"ok","message":"데이트 뭐하지 서버 실행 중 💕"}

# 지역 기반 테스트
curl "http://localhost:3000/date-course?location=홍대&mood=romantic"

# GPS 기반 테스트
curl "http://localhost:3000/date-course?lat=37.4979&lon=127.0276&mood=activity"
```

---

## 4. 프론트엔드 설정

### 4-1. React Native 프로젝트 초기화 (처음 한 번만)

```bash
# 새 폴더에서 RN 프로젝트 생성
npx react-native@latest init DateWhatToDo --version 0.75.4

# 생성된 폴더 이름을 frontend로 변경하거나
# 이미 있는 frontend 폴더의 파일들을 복사
```

> ⚠️ 기존 `where_date/frontend/` 폴더의 소스 파일들을 RN 프로젝트에 복사해야 함

### 4-2. 패키지 설치

```bash
cd D:/ad/workspace/where_date/frontend
npm install
```

설치되는 핵심 패키지:

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @react-navigation/native | ^6.1.18 | 네비게이션 |
| @react-navigation/native-stack | ^6.11.0 | 스택 화면 전환 |
| @react-navigation/bottom-tabs | ^6.6.1 | 하단 탭 |
| react-native-screens | ^3.34.0 | 네비게이션 최적화 |
| react-native-safe-area-context | ^4.11.0 | 노치 대응 |
| react-native-permissions | ^4.1.5 | 위치 권한 |
| react-native-geolocation-service | ^5.3.1 | GPS |
| react-native-google-mobile-ads | ^13.1.0 | AdMob 광고 |
| axios | ^1.7.7 | API 통신 |

### 4-3. Android 네이티브 추가 설정

#### `android/app/build.gradle` 수정

```gradle
android {
    defaultConfig {
        minSdkVersion 24        // 21 → 24로 변경 권장
        targetSdkVersion 34
    }
}

dependencies {
    // Google Play Services Location (GPS용)
    implementation 'com.google.android.gms:play-services-location:21.0.1'

    // AdMob (react-native-google-mobile-ads 자동 포함되지만 명시 권장)
    implementation 'com.google.android.gms:play-services-ads:23.0.0'
}
```

#### `android/build.gradle` 수정

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.1'
    }
}
```

#### `android/app/build.gradle` 하단에 추가

```gradle
apply plugin: 'com.google.gms.google-services'
```

#### `android/gradle.properties` 확인

```properties
android.useAndroidX=true
android.enableJetifier=true
```

### 4-4. react-native-permissions Android 설정

`android/app/build.gradle`의 `defaultConfig` 안에 추가:

```gradle
defaultConfig {
    // ... 기존 코드 ...
    missingDimensionStrategy 'react-native-camera', 'general'
}
```

### 4-5. API 서버 주소 설정

`src/services/api.js`의 `BASE_URL` 수정:

```js
// 상황별 주소
const BASE_URL = 'http://10.0.2.2:3000';     // Android 에뮬레이터 ✅ 기본값
const BASE_URL = 'http://localhost:3000';      // iOS 시뮬레이터
const BASE_URL = 'http://192.168.0.10:3000';  // 실제 기기 (컴퓨터 IP 확인)
const BASE_URL = 'https://api.myserver.com';   // 배포 서버
```

**내 컴퓨터 IP 확인 방법 (Windows):**
```bash
ipconfig
# → IPv4 주소 확인 (예: 192.168.0.10)
```

### 4-6. 앱 실행

```bash
# Metro 번들러 시작 (별도 터미널)
npx react-native start

# Android 실행 (별도 터미널)
npx react-native run-android

# 또는 package.json 스크립트 사용
npm run android
```

---

## 5. 에뮬레이터 설정

### Android Studio 에뮬레이터 생성

1. Android Studio → **Device Manager** → **Create Device**
2. 권장 기기: **Pixel 7** (API 34)
3. System Image: **Android 14 (x86_64)**
4. RAM: 2GB 이상 권장

### 에뮬레이터 위치 설정 (GPS 테스트용)

```
에뮬레이터 실행 → 오른쪽 점 3개 메뉴(⋮) → Location
→ 위도: 37.4979, 경도: 127.0276 (강남) 입력 → Set Location
```

---

## 6. 개발 중 주의사항

### API 키 보안

```
✅ .env 파일은 절대 Git에 커밋하지 말 것
✅ .gitignore에 .env 포함 확인
❌ 카카오/날씨 API 키를 소스코드에 직접 입력 금지
```

### 광고 테스트

```
개발 중(__DEV__ = true)엔 자동으로 구글 테스트 광고 ID 사용
→ 실제 광고를 클릭해도 어뷰징 처리 안됨
릴리즈 빌드에서만 실제 AdMob ID 적용됨
```

### HTTP 통신 (개발 중)

```
android:usesCleartextTraffic="true" 설정 완료 (AndroidManifest.xml)
→ 개발 환경에서 http:// 주소 사용 가능
배포 시에는 반드시 https:// 서버로 전환 후 해당 설정 제거
```

---

## 7. 빌드 & 배포

### Debug APK 생성

```bash
cd android
./gradlew assembleDebug

# 결과물: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK 생성

```bash
# 1. 키스토어 생성 (최초 1회)
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 2. android/gradle.properties에 키스토어 정보 추가
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=비밀번호
MYAPP_RELEASE_KEY_PASSWORD=비밀번호

# 3. 릴리즈 빌드
cd android
./gradlew assembleRelease

# 결과물: android/app/build/outputs/apk/release/app-release.apk
```
