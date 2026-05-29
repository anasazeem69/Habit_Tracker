import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { getCoachNotifications } from '../api/coaching';

const FloatingCoachAgent = ({ onOpenCoach }) => {
  const [expanded, setExpanded] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const dragDistance = useRef(0);

  const checkUnreadAlerts = async () => {
    try {
      console.log('FloatingCoachAgent: Checking for unread alerts...');
      const response = await getCoachNotifications(5);
      console.log('FloatingCoachAgent Response:', response);
      if (response.success && response.data) {
        const hasUnreadAlerts = response.data.some(n => n.status === 'unread');
        console.log('FloatingCoachAgent hasUnread:', hasUnreadAlerts);
        setHasUnread(hasUnreadAlerts);
      }
    } catch (e) {
      console.error('FloatingCoachAgent Fetch Error:', e);
    }
  };

  useEffect(() => {
    checkUnreadAlerts();
    const interval = setInterval(checkUnreadAlerts, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleBubblePress = () => {
    setExpanded(prev => {
      if (!prev) checkUnreadAlerts();
      return !prev;
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 15 || Math.abs(gestureState.dy) > 15,
        onPanResponderGrant: () => {
          position.setOffset({
            x: position.x.__getValue(),
            y: position.y.__getValue(),
          });
          position.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: (_, gestureState) => {
          position.setValue({ x: gestureState.dx, y: gestureState.dy });
        },
        onPanResponderRelease: () => {
          position.flattenOffset();
        },
        onPanResponderTerminationRequest: () => true,
      }),
    [position]
  );

  return (
    <Animated.View
      style={[styles.container, { transform: position.getTranslateTransform() }]}
      pointerEvents="box-none"
    >
      <View style={styles.contentWrap}>
        {expanded ? (
          <View style={styles.popup}>
            <View style={styles.popupHeader}>
              <Ionicons name="sparkles" size={16} color={colors.accent} />
              <Text style={styles.popupTitle}>Coach Agent</Text>
            </View>
            <Text style={styles.popupText}>
              I am here. Want a quick habit check or motivation?
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setExpanded(false)}>
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => {
                  setExpanded(false);
                  onOpenCoach?.();
                }}
              >
                <Text style={styles.primaryBtnText}>Chat with Coach</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <Animated.View {...panResponder.panHandlers}>
          <TouchableOpacity
            style={styles.bubble}
            activeOpacity={0.85}
            onPress={handleBubblePress}
          >
            <Ionicons name="person" size={24} color="#fff" />
            {hasUnread && <View style={styles.badge} />}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 18,
    bottom: 26,
    zIndex: 9998,
  },
  contentWrap: {
    alignItems: 'flex-end',
  },
  bubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.danger || '#FF3B30',
    borderWidth: 2,
    borderColor: colors.background.primary || '#FFFFFF',
  },
  popup: {
    width: 260,
    borderRadius: 14,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 12,
    marginBottom: 10,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  popupTitle: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  popupText: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  secondaryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
  },
  secondaryBtnText: {
    color: colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default FloatingCoachAgent;
