import React, { useCallback, useContext, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../config/colors';
import {
  chatWithCoach,
  getAIInsights,
  getCoachNotifications,
  markCoachNotificationRead,
} from '../api/coaching';
import { AuthContext } from '../context/AuthContext';

const SectionCard = ({ icon, iconColor, title, expanded, onToggle, children }) => (
  <View style={styles.card}>
    <TouchableOpacity style={styles.cardHeader} onPress={onToggle} activeOpacity={0.8}>
      <View style={styles.cardHeaderLeft}>
        <Ionicons name={icon} size={22} color={iconColor} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={colors.text.secondary}
      />
    </TouchableOpacity>
    {expanded ? <View style={styles.cardBody}>{children}</View> : null}
  </View>
);

const CoachScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const chatScrollRef = useRef(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey! I am your habit coach. Tell me what you are struggling with today.',
    },
  ]);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({
    performance: true,
    growth: true,
    suggestions: true,
  });

  const fetchInsights = useCallback(async ({ forceFresh = false, showLoader = false } = {}) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      if (!user?.aiConsent) {
        setError('AI Coaching is disabled. Please enable it from the Home screen.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const data = await getAIInsights({ forceFresh });
      if (data.success) {
        setInsights(data.data);
      } else {
        setError('Failed to load insights.');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch AI insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.aiConsent]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.aiConsent) return;
    try {
      const response = await getCoachNotifications(15);
      if (response.success) {
        setNotifications(response.data || []);
      }
    } catch (notificationError) {
      console.log('Failed to load coach notifications:', notificationError.message);
    }
  }, [user?.aiConsent]);

  // Call LLM every time this screen opens/focuses.
  useFocusEffect(
    useCallback(() => {
      fetchInsights({ forceFresh: true, showLoader: true });
      fetchNotifications();
    }, [fetchInsights, fetchNotifications])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInsights({ forceFresh: true });
  };

  const handleSendChat = async () => {
    const message = chatInput.trim();
    if (!message || chatSending) return;

    const nextMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(nextMessages);
    setChatInput('');
    setChatSending(true);

    try {
      const data = await chatWithCoach(message, nextMessages.slice(-8));
      const reply = data?.data?.reply || 'Let us break this into one small, winnable step.';
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      requestAnimationFrame(() => {
        chatScrollRef.current?.scrollToEnd({ animated: true });
      });
    } catch (chatError) {
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I could not respond right now. Try again in a moment and we will continue.",
        },
      ]);
    } finally {
      setChatSending(false);
    }
  };

  const handleMarkRead = async notificationId => {
    try {
      await markCoachNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(item => (item._id === notificationId ? { ...item, status: 'read' } : item))
      );
    } catch (markError) {
      console.log('Failed to mark notification read:', markError.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing your progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Coach</Text>
        <View style={{ width: 24 }} />
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
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchInsights({ forceFresh: true, showLoader: true })}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : insights ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroHeader}>
                <View style={styles.heroTitleRow}>
                  <Ionicons name="sparkles" size={20} color={colors.accent} />
                  <Text style={styles.heroTitle}>Coach Note</Text>
                </View>
              </View>
              <Text style={styles.heroMessage}>{insights.widgetMessage}</Text>
            </View>

            <SectionCard
              icon="bar-chart"
              iconColor={colors.primary}
              title="Performance Report"
              expanded={expanded.performance}
              onToggle={() => setExpanded(prev => ({ ...prev, performance: !prev.performance }))}
            >
              <Text style={styles.cardText}>{insights.performanceReport}</Text>
            </SectionCard>

            <SectionCard
              icon="trending-up"
              iconColor={colors.success}
              title="Growth Insights"
              expanded={expanded.growth}
              onToggle={() => setExpanded(prev => ({ ...prev, growth: !prev.growth }))}
            >
              <Text style={styles.cardText}>{insights.growthInsights}</Text>
            </SectionCard>

            <SectionCard
              icon="list"
              iconColor={colors.accent}
              title="Actionable Suggestions"
              expanded={expanded.suggestions}
              onToggle={() => setExpanded(prev => ({ ...prev, suggestions: !prev.suggestions }))}
            >
              {insights.suggestions?.map((suggestion, index) => (
                <View key={index} style={styles.suggestionRow}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={colors.primary}
                    style={styles.suggestionIcon}
                  />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </SectionCard>

            <View style={styles.notificationsCard}>
              <View style={styles.chatHeader}>
                <Ionicons name="notifications" size={20} color={colors.accent} />
                <Text style={styles.chatTitle}>Coach Alerts & Reminders</Text>
              </View>
              {notifications.length === 0 ? (
                <Text style={styles.emptyNotificationText}>
                  No active alerts right now. Keep your streaks warm.
                </Text>
              ) : (
                notifications.map(item => (
                  <TouchableOpacity
                    key={item._id}
                    style={[
                      styles.notificationItem,
                      item.status === 'unread' && styles.notificationUnread,
                    ]}
                    onPress={() => item.status === 'unread' && handleMarkRead(item._id)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.notificationRow}>
                      <Text style={styles.notificationTitle}>{item.title}</Text>
                      {item.status === 'unread' ? (
                        <View style={styles.unreadDot} />
                      ) : (
                        <Ionicons name="checkmark-done" size={16} color={colors.success} />
                      )}
                    </View>
                    <Text style={styles.notificationText}>{item.message}</Text>
                    <Text style={styles.notificationMeta}>
                      Risk Score: {item.riskScore || 0} · {item.type?.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>

            <View style={styles.chatCard}>
              <View style={styles.chatHeader}>
                <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
                <Text style={styles.chatTitle}>Chat with Coach</Text>
              </View>

              <ScrollView
                ref={chatScrollRef}
                style={styles.chatMessages}
                showsVerticalScrollIndicator={false}
              >
                {chatMessages.map((message, index) => (
                  <View
                    key={`${message.role}-${index}`}
                    style={[
                      styles.chatBubble,
                      message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatText,
                        message.role === 'user' ? styles.userBubbleText : styles.assistantBubbleText,
                      ]}
                    >
                      {message.content}
                    </Text>
                  </View>
                ))}
                {chatSending ? (
                  <View style={[styles.chatBubble, styles.assistantBubble]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null}
              </ScrollView>

              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Ask your coach anything..."
                  placeholderTextColor={colors.text.tertiary}
                  value={chatInput}
                  onChangeText={setChatInput}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendButton, (!chatInput.trim() || chatSending) && styles.sendButtonDisabled]}
                  onPress={handleSendChat}
                  disabled={!chatInput.trim() || chatSending}
                >
                  <Ionicons name="send" size={17} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No insights available yet.</Text>
          </View>
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
    marginTop: 12,
    color: colors.text.secondary,
    fontSize: 16,
  },
  header: {
    backgroundColor: colors.background.secondary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    elevation: 2,
    shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    elevation: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitle: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
  },
  heroMessage: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 23,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBody: {
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginLeft: 8,
  },
  cardText: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  suggestionIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  chatCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyNotificationText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  notificationItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.primary,
    padding: 12,
    marginBottom: 8,
  },
  notificationUnread: {
    borderColor: colors.accent,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationTitle: {
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  notificationText: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  notificationMeta: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginTop: 8,
    textTransform: 'capitalize',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    marginLeft: 8,
  },
  chatMessages: {
    maxHeight: 260,
    marginBottom: 12,
  },
  chatBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '88%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userBubbleText: {
    color: '#FFF',
  },
  assistantBubbleText: {
    color: colors.text.primary,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  chatInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 96,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
    marginRight: 8,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
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
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default CoachScreen;
