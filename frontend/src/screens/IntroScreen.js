import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { requestLocationPermission } from '../utils/permissions';

const QUICK_LOCATIONS = ['강남', '홍대', '건대', '이태원', '신촌', '성수', '합정', '잠실'];

export default function IntroScreen({ navigation }) {
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── 위치 권한 요청 후 GPS 취득 ──────────────────────────────
  const handleLocationPermission = async () => {
    setLoading(true);
    try {
      const granted = await requestLocationPermission();

      if (!granted) {
        // 권한 거부 → 직접 입력으로 전환
        setShowLocationInput(true);
        setLoading(false);
        return;
      }

      // 권한 허용 → GPS 위치 취득
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLoading(false);
          navigation.replace('Main', {
            screen: 'Home',
            params: { lat: latitude, lon: longitude, useGPS: true },
          });
        },
        (error) => {
          console.warn('[IntroScreen] GPS 오류:', error.code, error.message);
          setLoading(false);
          Alert.alert(
            'GPS 오류',
            '위치를 가져올 수 없어요.\n지역을 직접 입력해주세요.',
            [{ text: '확인', onPress: () => setShowLocationInput(true) }],
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
        },
      );
    } catch (e) {
      setLoading(false);
      Alert.alert('오류', '위치 권한 요청 중 오류가 발생했습니다.');
    }
  };

  // ─── 지역 입력 완료 ──────────────────────────────────────────
  const handleSubmitLocation = () => {
    const trimmed = locationText.trim();
    if (!trimmed) {
      Alert.alert('알림', '지역명을 입력하거나 위에서 선택해주세요.');
      return;
    }
    navigation.replace('Main', {
      screen: 'Home',
      params: { location: trimmed, useGPS: false },
    });
  };

  // ─── 렌더링 ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 로고 */}
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>💕</Text>
          <Text style={styles.title}>데이트 뭐하지</Text>
          <Text style={styles.subtitle}>
            오늘의 완벽한 데이트 코스를{'\n'}찾아드릴게요 ✨
          </Text>
        </View>

        {!showLocationInput ? (
          /* ── 초기 화면 ── */
          <View style={styles.section}>
            <View style={styles.infoBox}>
              <Text style={styles.infoEmoji}>📍</Text>
              <Text style={styles.infoText}>
                근처 데이트 코스를 추천하려면{'\n'}위치 정보가 필요합니다 😊
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLocationPermission}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>📍 위치 기반 추천 시작</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowLocationInput(true)}
            >
              <Text style={styles.secondaryButtonText}>✏️ 지역 직접 입력</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── 지역 입력 화면 ── */
          <View style={styles.section}>
            <Text style={styles.inputLabel}>어디서 데이트할 예정인가요?</Text>

            {/* 빠른 선택 버튼들 */}
            <View style={styles.quickButtonGrid}>
              {QUICK_LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.quickButton,
                    locationText === loc && styles.quickButtonActive,
                  ]}
                  onPress={() => setLocationText(loc)}
                >
                  <Text
                    style={[
                      styles.quickButtonText,
                      locationText === loc && styles.quickButtonTextActive,
                    ]}
                  >
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="예: 강남, 홍대, 건대, 판교..."
              placeholderTextColor="#bbb"
              value={locationText}
              onChangeText={setLocationText}
              onSubmitEditing={handleSubmitLocation}
              returnKeyType="search"
              autoFocus
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmitLocation}
            >
              <Text style={styles.primaryButtonText}>🗺️ 데이트 코스 찾기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setShowLocationInput(false);
                setLocationText('');
              }}
            >
              <Text style={styles.backButtonText}>← 이전으로</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoEmoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FF6B9D',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    gap: 14,
  },
  infoBox: {
    backgroundColor: '#FFE4EE',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoEmoji: {
    fontSize: 28,
  },
  infoText: {
    fontSize: 15,
    color: '#E91E63',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#FFCCE0',
  },
  dividerText: {
    color: '#bbb',
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  secondaryButtonText: {
    color: '#FF6B9D',
    fontSize: 17,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  quickButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#FFAAC8',
  },
  quickButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  quickButtonText: {
    color: '#FF6B9D',
    fontSize: 14,
    fontWeight: '600',
  },
  quickButtonTextActive: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#FFB3CC',
    color: '#333',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#bbb',
    fontSize: 15,
  },
});
