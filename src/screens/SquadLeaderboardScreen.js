import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { getSquadLeaderboard } from '../api/squads';
import { getCategories } from '../api/categories';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

const SquadLeaderboardScreen = ({ navigation }) => {
  const [squads, setSquads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategoryId]);

  const loadData = async () => {
    try {
      const catRes = await getCategories();
      setCategories(catRes.data || []);
      await fetchLeaderboard();
    } catch (err) {
      console.error('Error loading leaderboard data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await getSquadLeaderboard(selectedCategoryId);
      setSquads(res.data || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Rankings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Squad Leaderboard</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Category Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabContent}>
        <TouchableOpacity
          style={[styles.tab, !selectedCategoryId && styles.tabActive]}
          onPress={() => setSelectedCategoryId(null)}
        >
          <Text style={[styles.tabText, !selectedCategoryId && styles.tabTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat._id}
            style={[styles.tab, selectedCategoryId === cat._id && { backgroundColor: cat.color, borderColor: cat.color }]}
            onPress={() => setSelectedCategoryId(cat._id)}
          >
            <Ionicons name={cat.icon || 'star'} size={14} color={selectedCategoryId === cat._id ? '#FFF' : cat.color} />
            <Text style={[styles.tabText, selectedCategoryId === cat._id && styles.tabTextActive]}> {cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {squads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No squads found.</Text>
            <Text style={styles.emptySubtext}>Create a squad and start earning XP!</Text>
          </View>
        ) : (
          squads.map((squad, index) => (
            <View key={squad._id} style={[styles.squadRow, index === 0 && styles.firstPlace]}>
              <View style={styles.rankBadge}>
                {index < 3 ? (
                  <Ionicons name="trophy" size={22} color={MEDAL_COLORS[index]} />
                ) : (
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                )}
              </View>

              <View style={[styles.categoryDot, { backgroundColor: squad.categoryId?.color || colors.primary }]} />

              <View style={styles.squadInfo}>
                <Text style={[styles.squadName, index === 0 && styles.firstPlaceName]}>{squad.name}</Text>
                <Text style={styles.squadMeta}>
                  {squad.categoryId?.name} • {squad.members?.length || 0} members
                </Text>
              </View>

              <View style={styles.xpBadge}>
                <Ionicons name="flash" size={14} color={colors.accent} />
                <Text style={styles.xpText}>{squad.totalXP}</Text>
                <Text style={styles.xpLabel}> XP</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: colors.text.secondary, fontSize: 16 },
  header: {
    backgroundColor: colors.background.secondary, paddingTop: 50, paddingBottom: 16,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border.light,
    elevation: 2, shadowColor: colors.shadow.light, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 2,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.primary },
  tabRow: { maxHeight: 56, backgroundColor: colors.background.secondary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
  tabContent: { paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' },
  tab: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border.light,
    backgroundColor: colors.background.primary, marginRight: 8,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  tabTextActive: { color: '#FFF' },
  content: { flex: 1, padding: 16 },
  squadRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background.secondary, borderRadius: 14, padding: 14,
    marginBottom: 10, shadowColor: colors.shadow.light, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  firstPlace: {
    backgroundColor: colors.background.secondary, borderWidth: 2, borderColor: '#FFD700',
    shadowColor: '#FFD700', shadowOpacity: 0.2, elevation: 4,
  },
  rankBadge: { width: 32, alignItems: 'center', marginRight: 10 },
  rankNumber: { fontSize: 15, fontWeight: 'bold', color: colors.text.tertiary },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  squadInfo: { flex: 1 },
  squadName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  firstPlaceName: { fontWeight: 'bold', color: colors.primary },
  squadMeta: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  xpText: { fontSize: 16, fontWeight: 'bold', color: colors.accent },
  xpLabel: { fontSize: 11, color: colors.text.tertiary },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: colors.text.secondary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: colors.text.tertiary, marginTop: 8, textAlign: 'center' },
});

export default SquadLeaderboardScreen;
