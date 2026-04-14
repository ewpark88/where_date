/**
 * 광고 플레이스홀더 컴포넌트
 *
 * 실제 광고 연동 시:
 *  - AdMob: react-native-google-mobile-ads
 *  - Kakao AdFit: react-native-kakao-adfit
 *  - Naver GFA: 별도 웹뷰 방식
 *
 * type:
 *  - 'banner'       : 하단/상단 배너 (320x50 ~ 320x100)
 *  - 'inline'       : 리스트 중간 광고 (300x250)
 *  - 'interstitial' : 전면 광고 (별도 SDK 처리)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AD_CONFIGS = {
  banner: {
    height: 62,
    icon: '📢',
    title: '광고 배너',
    sub: 'AdMob / Kakao AdFit 연동 가능',
    bgColor: '#F8F0FF',
    borderColor: '#D7B9F5',
    textColor: '#8E44AD',
  },
  inline: {
    height: 110,
    icon: '🎁',
    title: '스폰서 광고',
    sub: '인라인 광고 영역 (300x250)',
    bgColor: '#FFF8EE',
    borderColor: '#FFD3A5',
    textColor: '#E67E22',
  },
};

export default function AdPlaceholder({ type = 'banner', style }) {
  // 전면 광고는 컴포넌트 렌더링 없이 처리
  if (type === 'interstitial') return null;

  const config = AD_CONFIGS[type] || AD_CONFIGS.banner;

  return (
    <View
      style={[
        styles.container,
        {
          height: config.height,
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <View>
        <Text style={[styles.title, { color: config.textColor }]}>{config.title}</Text>
        <Text style={[styles.sub, { color: config.textColor }]}>{config.sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 22,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  sub: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.75,
  },
});
