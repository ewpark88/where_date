import { Platform } from 'react-native';

/**
 * AdMob 광고 ID 설정
 *
 * 앱 ID: ca-app-pub-8353634332299342~4400283778
 *
 * [개발 중 테스트 ID 사용법]
 * import { TestIds } from 'react-native-google-mobile-ads';
 * unitId={__DEV__ ? TestIds.BANNER : AD_UNIT_IDS.HOME_BANNER}
 */

export const APP_ID = 'ca-app-pub-8353634332299342~4400283778';

export const AD_UNIT_IDS = {
  /** HomeScreen 상단 배너 (320×50) */
  HOME_BANNER: 'ca-app-pub-8353634332299342/2184137790',

  /** ResultScreen 카드 사이 중간 광고 (300×250 Medium Rectangle) */
  RESULT_INLINE: 'ca-app-pub-8353634332299342/5358142228',

  /** ResultScreen 하단 배너 (320×50) */
  RESULT_BOTTOM_BANNER: 'ca-app-pub-8353634332299342/9290257182',

  /** HistoryScreen 상단 배너 (320×50) */
  HISTORY_BANNER: 'ca-app-pub-8353634332299342/2184137790',

  /** ResultScreen 진입 시 전면 광고 (Interstitial) */
  INTERSTITIAL: 'ca-app-pub-8353634332299342/9864972250',
};
