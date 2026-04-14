/**
 * AdMob 광고 컴포넌트
 *
 * 배너 유형
 *  - 'banner'  : 320×50  (표준 배너)
 *  - 'inline'  : 300×250 (Medium Rectangle, 리스트 중간)
 *
 * 전면 광고는 별도 훅(useInterstitialAd)으로 처리 → ResultScreen 참고
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../config/adConfig';

// ─── 광고 유닛 ID 선택 (개발 중엔 TestIds 사용) ──────────────────
const UNIT_IDS = {
  banner_home:    __DEV__ ? TestIds.BANNER : AD_UNIT_IDS.HOME_BANNER,
  banner_result:  __DEV__ ? TestIds.BANNER : AD_UNIT_IDS.RESULT_BOTTOM_BANNER,
  banner_history: __DEV__ ? TestIds.BANNER : AD_UNIT_IDS.HISTORY_BANNER,
  inline:         __DEV__ ? TestIds.BANNER : AD_UNIT_IDS.RESULT_INLINE,
};

// ─── 광고 사이즈 맵핑 ────────────────────────────────────────────
const AD_SIZES = {
  banner_home:    BannerAdSize.BANNER,           // 320×50
  banner_result:  BannerAdSize.BANNER,           // 320×50
  banner_history: BannerAdSize.BANNER,           // 320×50
  inline:         BannerAdSize.MEDIUM_RECTANGLE, // 300×250
};

/**
 * @param {'banner_home' | 'banner_result' | 'banner_history' | 'inline'} type
 */
export default function AdPlaceholder({ type = 'banner_home', style }) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  const unitId  = UNIT_IDS[type];
  const adSize  = AD_SIZES[type];
  const isInline = type === 'inline';

  if (!unitId) return null;

  return (
    <View style={[styles.wrapper, isInline && styles.wrapperInline, style]}>
      {/* 로딩 중 또는 실패 시 fallback */}
      {!adLoaded && !adFailed && (
        <View style={[styles.fallback, isInline && styles.fallbackInline]}>
          <Text style={styles.fallbackText}>📢</Text>
          <Text style={styles.fallbackSub}>광고 로딩 중...</Text>
        </View>
      )}

      {adFailed && (
        <View style={[styles.fallback, isInline && styles.fallbackInline]}>
          <Text style={styles.fallbackText}>📢</Text>
          <Text style={styles.fallbackSub}>광고를 불러올 수 없습니다</Text>
        </View>
      )}

      {/* 실제 AdMob 배너 */}
      <BannerAd
        unitId={unitId}
        size={adSize}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => {
          setAdLoaded(true);
          setAdFailed(false);
        }}
        onAdFailedToLoad={(error) => {
          console.warn(`[AdMob][${type}] 로드 실패:`, error.message);
          setAdFailed(true);
          setAdLoaded(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 8,
    minHeight: 52,
  },
  wrapperInline: {
    minHeight: 260,
    marginVertical: 12,
  },
  fallback: {
    position: 'absolute',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  fallbackInline: {
    height: 250,
  },
  fallbackText: {
    fontSize: 16,
  },
  fallbackSub: {
    fontSize: 12,
    color: '#bbb',
  },
});
