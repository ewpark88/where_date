import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getHistory } from '../services/api';
import AdPlaceholder from '../components/AdPlaceholder';

const MOOD_EMOJI = { normal: '😊', romantic: '💝', activity: '🎯' };

function formatDate(isoString) {
  const d = new Date(isoString);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hour}:${min}`;
}

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error('[HistoryScreen] 로드 실패:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('Result', {
          course: item.course,
          location: item.location,
          mood: item.mood,
        })
      }
    >
      {/* 카드 헤더 */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
        {item.location && (
          <Text style={styles.cardLocation} numberOfLines={1}>
            📍 {item.location}
          </Text>
        )}
        <Text style={styles.cardMoodEmoji}>
          {MOOD_EMOJI[item.mood] || '😊'}
        </Text>
      </View>

      {/* 코스 목록 (최대 3개) */}
      <View style={styles.placeList}>
        {item.course.slice(0, 3).map((place, i) => (
          <Text key={i} style={styles.placeName} numberOfLines={1}>
            <Text style={styles.placeOrder}>{i + 1}. </Text>
            {place.name}
            <Text style={styles.placeCategory}> · {place.category}</Text>
          </Text>
        ))}
      </View>

      <Text style={styles.viewMore}>자세히 보기 →</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 데이트 히스토리</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 데이트 히스토리</Text>
        <Text style={styles.headerSub}>이전에 저장된 코스 {history.length}개</Text>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B9D']}
            tintColor="#FF6B9D"
          />
        }
        ListHeaderComponent={<AdPlaceholder type="banner_history" />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>저장된 히스토리가 없어요</Text>
            <Text style={styles.emptySub}>
              데이트 코스를 추천받고{'\n'}히스토리에 저장해보세요!
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
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
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    color: '#FFE4EE',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#bbb',
    fontWeight: '500',
  },
  cardLocation: {
    fontSize: 13,
    color: '#FF6B9D',
    fontWeight: '600',
    flex: 1,
  },
  cardMoodEmoji: {
    fontSize: 20,
  },
  placeList: {
    gap: 5,
    marginBottom: 12,
  },
  placeName: {
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
  },
  placeOrder: {
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
  placeCategory: {
    color: '#bbb',
    fontSize: 12,
  },
  viewMore: {
    fontSize: 13,
    color: '#FF6B9D',
    fontWeight: '600',
    textAlign: 'right',
  },
  separator: {
    height: 12,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#aaa',
  },
  emptyWrap: {
    paddingTop: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
  },
  emptySub: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 21,
  },
});
