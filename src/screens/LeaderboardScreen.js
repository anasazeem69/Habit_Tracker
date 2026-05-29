import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { LocationContext } from '../context/LocationContext';
import { getLocalLeaderboard } from '../api/territories';

const LeaderboardScreen = () => {
  const { currentLocation, isLoading: locationLoading } = useContext(LocationContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async () => {
    if (!currentLocation) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getLocalLeaderboard(currentLocation.latitude, currentLocation.longitude, 20); // 20km radius
      setLeaderboard(data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentLocation && !locationLoading) {
      fetchLeaderboard();
    }
  }, [currentLocation, locationLoading]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  if (locationLoading || (loading && !refreshing)) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Category Dominance</Text>
        <Text style={styles.headerSubtitle}>Top users in your area</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={40} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchLeaderboard}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyText}>No territories claimed nearby yet.</Text>
            <Text style={styles.emptySubtext}>Be the first to dominate a category!</Text>
          </View>
        ) : (
          leaderboard.map((item) => (
            <View key={item.category._id} style={styles.categoryCard}>
              <View style={[styles.categoryHeader, { backgroundColor: item.category.color }]}>
                <Ionicons name={item.category.icon || 'star'} size={24} color="#FFF" />
                <Text style={styles.categoryName}>{item.category.name}</Text>
              </View>
              
              <View style={styles.leaderboardList}>
                {item.topUsers.map((userObj, index) => (
                  <View key={userObj.user._id} style={[styles.userRow, index === 0 && styles.firstPlaceRow]}>
                    <View style={styles.rankContainer}>
                      <Text style={[styles.rankText, index === 0 && styles.firstPlaceRank]}>
                        #{index + 1}
                      </Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, index === 0 && styles.firstPlaceName]}>
                        {userObj.user.fullName}
                      </Text>
                      <Text style={styles.userStats}>
                        XP: {userObj.user.xp || 0} • Level {userObj.user.level || 1}
                      </Text>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreText}>{userObj.territoryCount}</Text>
                      <Text style={styles.scoreLabel}>Territories</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.text.secondary,
    fontSize: 16,
  },
  header: {
    backgroundColor: colors.background.secondary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    elevation: 2,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    marginTop: 20,
  },
  errorText: {
    color: colors.danger,
    marginTop: 10,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.secondary,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
  },
  categoryCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 10,
  },
  leaderboardList: {
    padding: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  firstPlaceRow: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.tertiary,
  },
  firstPlaceRank: {
    fontSize: 20,
    color: colors.accent,
  },
  userInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  firstPlaceName: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  userStats: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  scoreLabel: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
});

export default LeaderboardScreen;
