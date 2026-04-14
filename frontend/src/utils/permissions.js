import { Platform, Alert, Linking } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  openSettings,
} from 'react-native-permissions';

/**
 * 플랫폼별 위치 권한 상수
 */
const LOCATION_PERMISSION = Platform.select({
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
});

/**
 * 위치 권한 현재 상태 확인
 * @returns {Promise<boolean>}
 */
export const checkLocationPermission = async () => {
  try {
    const result = await check(LOCATION_PERMISSION);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('[permissions] check 오류:', error);
    return false;
  }
};

/**
 * 위치 권한 요청
 * @returns {Promise<boolean>} 권한 허용 여부
 */
export const requestLocationPermission = async () => {
  try {
    const result = await request(LOCATION_PERMISSION);

    switch (result) {
      case RESULTS.GRANTED:
        return true;

      case RESULTS.DENIED:
        // 첫 거부 - 다음 요청 시 다시 물어볼 수 있음
        return false;

      case RESULTS.BLOCKED:
        // 영구 거부 - 설정으로 이동 안내
        Alert.alert(
          '위치 권한 필요',
          '위치 기반 추천을 사용하려면\n설정에서 위치 권한을 허용해주세요.',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '설정으로 이동',
              onPress: openSettings,
            },
          ],
        );
        return false;

      case RESULTS.UNAVAILABLE:
        // 기기에서 지원하지 않음 (에뮬레이터 등)
        Alert.alert('알림', '이 기기에서는 위치 서비스를 사용할 수 없습니다.');
        return false;

      default:
        return false;
    }
  } catch (error) {
    console.error('[permissions] request 오류:', error);
    return false;
  }
};
