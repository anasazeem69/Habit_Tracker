import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useHabits } from '../context/HabitContext';
import { colors } from '../config/colors';
import { getAIInsights, updateAIConsent } from '../api/coaching';
import NotificationBell from '../components/NotificationBell';

const HomeScreen = ({ navigation }) => {
  const { user, logout, updateUserProfile } = useContext(AuthContext);
  const { habits } = useHabits();
  
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (user?.aiConsent) {
      fetchInsights();
    }
  }, [user?.aiConsent]);

  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      const data = await getAIInsights();
      if (data.success) {
        setInsights(data.data);
      }
    } catch (error) {
      console.log('Failed to fetch AI insights:', error.message);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleEnableAI = async () => {
    Alert.alert(
      "Enable AI Coaching",
      "By enabling this, your habit data will be securely analyzed by AI to provide personalized coaching and insights. Do you consent?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "I Consent", 
          onPress: async () => {
            try {
              setLoadingInsights(true);
              await updateAIConsent(true);
              await updateUserProfile({ aiConsent: true });
              fetchInsights();
            } catch (error) {
              Alert.alert("Error", "Failed to enable AI Coaching");
              setLoadingInsights(false);
            }
          }
        }
      ]
    );
  };

  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  const handleLogout = async () => {
    await logout();
    // Navigation will be handled automatically by AppNavigator when user state changes
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.userName}>{user?.fullName || 'User'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <NotificationBell style={{ marginRight: 15 }} />
            <TouchableOpacity
              style={styles.profileButton}
              onPress={handleProfile}
            >
              <Ionicons name="person-circle" size={40} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Welcome to Habit Tracker! 🎯</Text>
            <Text style={styles.welcomeSubtitle}>
              Start building better habits and track your progress every day.
            </Text>
          </View>
          <View style={styles.welcomeIcon}>
            <Ionicons name="trending-up" size={48} color={colors.primary} />
          </View>
        </View>

        {/* Coach's Note Widget */}
        <View style={styles.coachContainer}>
          <Text style={styles.sectionTitle}>Coach's Note</Text>
          <TouchableOpacity 
            style={styles.coachCard}
            onPress={() => navigation.navigate('Coach')}
          >
            <View style={styles.coachHeader}>
              <Ionicons name="bulb" size={24} color={colors.accent} />
              <Text style={styles.coachTitle}>AI Coaching</Text>
            </View>
            {loadingInsights ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : insights ? (
              <Text style={styles.coachMessage}>{insights.widgetMessage}</Text>
            ) : user?.aiConsent ? (
              <Text style={styles.coachMessage}>
                AI Coach is enabled. Open Coach for your latest interactive guidance.
              </Text>
            ) : (
              <View>
                <Text style={styles.coachMessage}>Get real-time personalized insights and risk alerts for your habits.</Text>
                <TouchableOpacity style={styles.consentButton} onPress={handleEnableAI}>
                  <Text style={styles.consentButtonText}>Enable AI Coach</Text>
                </TouchableOpacity>
              </View>
            )}
            {insights && (
              <Text style={styles.coachTapText}>Tap to see detailed insights</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.statNumber}>
                {habits.reduce((acc, h) => acc + (h.totalCompletions || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Habits Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
              <Text style={styles.statNumber}>
                {Math.max(0, ...habits.map(h => h.streak || 0))}
              </Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color={colors.accent} />
              <Text style={styles.statNumber}>
                {habits.filter(h => h.streak >= 7).length}
              </Text>
              <Text style={styles.statLabel}>7+ Day Streaks</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CreateHabit')}
            >
              <Ionicons name="add-circle" size={32} color={colors.primary} />
              <Text style={styles.actionText}>Add Habit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Ionicons name="analytics" size={32} color={colors.secondary} />
              <Text style={styles.actionText}>View Stats</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="settings" size={32} color={colors.text.secondary} />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    backgroundColor: colors.background.secondary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeContent: {
    flex: 1,
    marginRight: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  welcomeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  actionText: {
    fontSize: 12,
    color: colors.text.primary,
    marginTop: 8,
    fontWeight: '600',
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 12,
  },
  coachContainer: {
    marginBottom: 24,
  },
  coachCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  coachTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 8,
  },
  coachMessage: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  coachTapText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  consentButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  consentButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default HomeScreen;
