import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getDateCourse } from '../services/api';
import AdPlaceholder from '../components/AdPlaceholder';

const MOODS = [
  { id: 'normal',   label: '😊 일반',    color: '#74B9FF' },
  { id: 'romantic', label: '💝 로맨틱',  color: '#FF6B9D' },
  { id: 'activity', label: '🎯 액티비티', color: '#00B894' },
];

const CATEGORIES = [
  { emoji: '☕', name: '카페'     },
  { emoji: '🍽️', name: '맛집'    },
  { emoji: '🌿', name: '야외'     },
  { emoji: '🎨', name: '실내'     },
  { emoji: '🎯', name: '액티비티' },
  { emoji: '🌃', name: '야경/바'  },
];

export default function HomeScreen({ navigation, route }) {
  const params = route.params || {};
  const [selectedMood, setSelectedMood] = useState('normal');
  const [loading, setLoading] = useState(false);
  const didAutoFetch = useRef(false);

  // 최초 마운트 시 자동 추천 1회 실행
  useEffect(() => {
    if (didAutoFetch.current) return;
    didAutoFetch.current = true;
    fetchCourse('normal');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCourse = async (mood) => {
    if (loading) return;
    setLoading(true);

    try {
      const course = await getDateCourse({
        lat: params.lat,
        lon: params.lon,
        location: params.location,
        mood: mood || selectedMood,
      });

      navigation.navigate('Result', {
        course,
        location: params.location,
        mood: mood || selectedMood,
        lat: params.lat,
        lon: params.lon,
      });
    } catch (error) {
      Alert.alert(
        '오류',
        '데이트 코스를 가져오는데 실패했습니다.\n서버 연결을 확인해주세요.',
        [{ text: '확인' }],
      );
    } finally {
      setLoading(false);
    }
  };

  const locationLabel = params.location
    ? `📍 ${params.location} 기준`
    : params.lat
    ? '📍 현재 위치 기준'
    : '';

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>💕</Text>
        <Text style={styles.headerTitle}>데이트 뭐하지</Text>
        {locationLabel ? (
          <Text style={styles.headerSub}>{locationLabel}</Text>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 배너 광고 (320×50) */}
        <AdPlaceholder type="banner_home" />

        {/* 분위기 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 분위기는? ✨</Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood) => {
              const active = selectedMood === mood.id;
              return (
                <TouchableOpacity
                  key={mood.id}
                  style={[
                    styles.moodButton,
                    { borderColor: mood.color },
                    active && { backgroundColor: mood.color },
                  ]}
                  onPress={() => setSelectedMood(mood.id)}
                >
                  <Text
                    style={[
                      styles.moodButtonText,
                      { color: active ? '#fff' : mood.color },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 랜덤 추천 버튼 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.randomButton}
            onPress={() => fetchCourse(selectedMood)}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.randomButtonSub}>코스 찾는 중...</Text>
              </>
            ) : (
              <>
                <Text style={styles.randomButtonEmoji}>🎲</Text>
                <Text style={styles.randomButtonText}>랜덤 데이트 추천!</Text>
                <Text style={styles.randomButtonSub}>클릭할 때마다 새로운 코스</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 카테고리 안내 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>추천 코스 구성</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <View key={cat.name} style={styles.categoryItem}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 지역 변경 */}
        <TouchableOpacity
          style={styles.changeLocationBtn}
          onPress={() => navigation.navigate('Intro')}
        >
          <Text style={styles.changeLocationText}>📍 지역 변경하기</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    backgroundColor: '#FF6B9D',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    color: '#FFE4EE',
    marginTop: 4,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  moodButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  moodButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  randomButton: {
    backgroundColor: '#FF6B9D',
    borderRadius: 22,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
    minHeight: 130,
    justifyContent: 'center',
  },
  randomButtonEmoji: {
    fontSize: 44,
  },
  randomButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  randomButtonSub: {
    color: '#FFE4EE',
    fontSize: 13,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryName: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  changeLocationBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFB3CC',
  },
  changeLocationText: {
    color: '#FF6B9D',
    fontSize: 15,
    fontWeight: '600',
  },
});
