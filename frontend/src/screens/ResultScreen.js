import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import CourseCard from '../components/CourseCard';
import AdPlaceholder from '../components/AdPlaceholder';
import { saveHistory } from '../services/api';
import { AD_UNIT_IDS } from '../config/adConfig';

// ─── 전면 광고 인스턴스 생성 ──────────────────────────────────────
const interstitialUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : AD_UNIT_IDS.INTERSTITIAL;

const interstitial = InterstitialAd.createForAdRequest(interstitialUnitId, {
  requestNonPersonalizedAdsOnly: false,
});

const MOOD_LABELS = {
  normal:   '😊 일반',
  romantic: '💝 로맨틱',
  activity: '🎯 액티비티',
};

export default function ResultScreen({ navigation, route }) {
  const { course = [], location, mood = 'normal', lat, lon } = route.params || {};
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const interstitialLoaded = useRef(false);

  // ─── 전면 광고 로드 & 표시 ──────────────────────────────────────
  useEffect(() => {
    // 광고 로드
    const unsubLoad = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoaded.current = true;
    });

    const unsubClose = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialLoaded.current = false;
      // 닫힌 후 다음 광고 미리 로드
      interstitial.load();
    });

    const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, (e) => {
      console.warn('[AdMob][Interstitial] 오류:', e.message);
      interstitialLoaded.current = false;
    });

    interstitial.load();

    // 광고 표시 (500ms 딜레이 후 — 화면 전환 완료 후)
    const timer = setTimeout(() => {
      if (interstitialLoaded.current) {
        interstitial.show().catch((e) =>
          console.warn('[AdMob][Interstitial] show 실패:', e.message),
        );
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      unsubLoad();
      unsubClose();
      unsubError();
    };
  }, []);

  // ─── 히스토리 저장 ───────────────────────────────────────────
  const handleSave = async () => {
    if (saved || saving) return;
    setSaving(true);
    try {
      await saveHistory({ course, location, mood });
      setSaved(true);
      Alert.alert('저장 완료 📋', '히스토리에 저장되었습니다!');
    } catch {
      Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  // ─── 카카오맵 열기 ───────────────────────────────────────────
  const handleMapOpen = (place) => {
    const kakaoScheme = `kakaomap://look?p=${place.lat},${place.lon}`;
    const webFallback = `https://map.kakao.com/link/map/${encodeURIComponent(place.name)},${place.lat},${place.lon}`;

    Linking.canOpenURL(kakaoScheme)
      .then((supported) => Linking.openURL(supported ? kakaoScheme : webFallback))
      .catch(() => Linking.openURL(webFallback));
  };

  // ─── 빈 결과 처리 ────────────────────────────────────────────
  if (!course.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>😢</Text>
          <Text style={styles.emptyTitle}>추천 코스를 찾지 못했어요</Text>
          <Text style={styles.emptySub}>다른 지역이나 시간대에 다시 시도해보세요</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryBtnText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const locationLabel = location ? `📍 ${location}` : lat ? '📍 현재 위치' : '';
  const moodLabel = MOOD_LABELS[mood] || '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← 뒤로</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>오늘의 데이트 코스 💕</Text>
          {(locationLabel || moodLabel) ? (
            <Text style={styles.headerSub}>
              {[locationLabel, moodLabel].filter(Boolean).join('  |  ')}
            </Text>
          ) : null}
        </View>

        {/* 코스 카드 목록 */}
        <View style={styles.cardList}>
          {course.map((place, index) => (
            <React.Fragment key={`${place.name}_${index}`}>
              <CourseCard
                place={place}
                order={index + 1}
                onMapOpen={() => handleMapOpen(place)}
              />
              {/* 2번 카드 아래 인라인 광고 (300×250 Medium Rectangle) */}
              {index === 1 && course.length > 2 && (
                <AdPlaceholder type="inline" />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.saveBtn, (saved || saving) && styles.saveBtnDone]}
            onPress={handleSave}
            disabled={saved || saving}
          >
            <Text style={styles.saveBtnText}>
              {saved ? '✅ 저장 완료!' : saving ? '저장 중...' : '📋 히스토리에 저장'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryBtnText}>🎲 다른 코스 추천받기</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 배너 광고 (320×50) */}
        <AdPlaceholder type="banner_result" />

        <View style={{ height: 24 }} />
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
    paddingBottom: 16,
  },
  header: {
    backgroundColor: '#FF6B9D',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backBtn: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: '#FFE4EE',
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSub: {
    fontSize: 13,
    color: '#FFE4EE',
  },
  cardList: {
    padding: 16,
  },
  actions: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnDone: {
    backgroundColor: '#bbb',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryBtn: {
    backgroundColor: '#fff',
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  retryBtnText: {
    color: '#FF6B9D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#444',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
