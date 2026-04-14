import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ORDER_COLORS  = ['#FF6B9D', '#FF8E53', '#00B894', '#6C5CE7', '#FDCB6E'];
const ORDER_LABELS  = ['첫 번째', '두 번째', '세 번째', '네 번째', '다섯 번째'];
const ORDER_EMOJIS  = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

export default function CourseCard({ place, order, onMapOpen }) {
  if (!place) return null;

  const idx   = (order - 1) % ORDER_COLORS.length;
  const color = ORDER_COLORS[idx];
  const label = ORDER_LABELS[idx];
  const emoji = ORDER_EMOJIS[idx];

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      {/* 카드 헤더 */}
      <View style={styles.cardTop}>
        <Text style={styles.orderEmoji}>{emoji}</Text>

        <View style={styles.titleArea}>
          <Text style={styles.orderLabel}>{label} 코스</Text>
          <Text style={styles.placeName} numberOfLines={2}>
            {place.name}
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>{place.category}</Text>
        </View>
      </View>

      {/* 주소 */}
      <View style={styles.row}>
        <Text style={styles.rowIcon}>📌</Text>
        <Text style={styles.addressText} numberOfLines={2}>
          {place.address || '주소 정보 없음'}
        </Text>
      </View>

      {/* 전화번호 */}
      {!!place.phone && (
        <View style={styles.row}>
          <Text style={styles.rowIcon}>📞</Text>
          <Text style={styles.phoneText}>{place.phone}</Text>
        </View>
      )}

      {/* 카테고리 그룹 */}
      {!!place.categoryGroup && (
        <View style={styles.row}>
          <Text style={styles.rowIcon}>🏷️</Text>
          <Text style={styles.categoryGroupText} numberOfLines={1}>
            {place.categoryGroup}
          </Text>
        </View>
      )}

      {/* 지도 버튼 */}
      <TouchableOpacity
        style={[styles.mapBtn, { backgroundColor: color }]}
        onPress={onMapOpen}
        activeOpacity={0.8}
      >
        <Text style={styles.mapBtnText}>🗺️ 카카오맵으로 보기</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  orderEmoji: {
    fontSize: 26,
    marginTop: 2,
  },
  titleArea: {
    flex: 1,
    gap: 3,
  },
  orderLabel: {
    fontSize: 11,
    color: '#bbb',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  rowIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },
  phoneText: {
    fontSize: 13,
    color: '#888',
  },
  categoryGroupText: {
    flex: 1,
    fontSize: 12,
    color: '#aaa',
  },
  mapBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  mapBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
});
