import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../config/colors';
import { getValidationStats, getMyValidationLogs } from '../api/validation';

const STATUS_CONFIG = {
  verified:   { color: colors.success,         icon: 'shield-checkmark',    label: 'Verified' },
  flagged:    { color: colors.error,            icon: 'warning',             label: 'Flagged'  },
  pending:    { color: colors.warning,          icon: 'time',                label: 'Pending'  },
  passed:     { color: colors.success,          icon: 'checkmark-circle',    label: 'Passed'   },
  failed:     { color: colors.error,            icon: 'close-circle',        label: 'Failed'   },
};

const CHECK_LABELS = {
  gps_validation:    'GPS Validation',
  timer_validation:  'Timer Validation',
  anomaly_detection: 'Anomaly Detection',
  integrity_check:   'Integrity Check',
};

const StatCard = ({ value, label, color, icon }) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <Ionicons name={icon} size={26} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const IntegrityBar = ({ score }) => {
  const barColor = score >= 90 ? colors.success : score >= 60 ? colors.warning : colors.error;
  return (
    <View style={styles.integrityCard}>
      <View style={styles.integrityHeader}>
        <Ionicons name="shield" size={20} color={barColor} />
        <Text style={styles.integrityTitle}>Integrity Score</Text>
        <Text style={[styles.integrityScore, { color: barColor }]}>{score}%</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.integrityHint}>
        {score >= 90
          ? '✅ Excellent – all your check-ins are clean.'
          : score >= 60
          ? '⚠️ Some check-ins were flagged. Review logs below.'
          : '🚨 Multiple flags detected. Leaderboard ranking may be affected.'}
      </Text>
    </View>
  );
};

const LogItem = ({ item }) => {
  const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
  const checkLabel = CHECK_LABELS[item.checkType] || item.checkType;
  return (
    <View style={[styles.logItem, { borderLeftColor: cfg.color }]}>
      <View style={styles.logHeader}>
        <Ionicons name={cfg.icon} size={16} color={cfg.color} />
        <Text style={[styles.logStatus, { color: cfg.color }]}>{cfg.label}</Text>
        <Text style={styles.logCheck}>{checkLabel}</Text>
      </View>
      {item.habitId?.title ? (
        <Text style={styles.logHabit}>📌 {item.habitId.title}</Text>
      ) : null}
      <Text style={styles.logReason}>{item.reason || 'No details available'}</Text>
      <Text style={styles.logTime}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );
};

const ValidationScreen = ({ navigation }) => {
  const [stats, setStats]       = useState(null);
  const [logs, setLogs]         = useState([]);
  const [filter, setFilter]     = useState(null); // null = all
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        getValidationStats(),
        getMyValidationLogs(filter, 30),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (logsRes.success)  setLogs(logsRes.data);
    } catch (err) {
      console.error('ValidationScreen fetch error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing your data integrity...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Validation</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Integrity Score Bar */}
        {stats && <IntegrityBar score={stats.integrityScore ?? 100} />}

        {/* Stats Grid */}
        {stats && (
          <View style={styles.statsGrid}>
            <StatCard value={stats.totalCheckIns} label="Total Check-ins"   color={colors.primary}  icon="calendar" />
            <StatCard value={stats.verified}       label="Verified"           color={colors.success}  icon="shield-checkmark" />
            <StatCard value={stats.flagged}        label="Flagged"            color={colors.error}    icon="warning" />
            <StatCard value={stats.pending}        label="Pending"            color={colors.warning}  icon="time" />
          </View>
        )}

        {/* Sub-system info cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Active Protections</Text>
          {[
            { icon: 'location', color: colors.primary,  title: 'GPS Validation',       desc: 'Validates real-world coordinates and rejects mocked/fake GPS signals.' },
            { icon: 'timer',    color: colors.accent,   title: 'Timer Verification',   desc: 'Ensures timed habits are active for the minimum required duration.' },
            { icon: 'pulse',    color: colors.warning,  title: 'Anomaly Detection',    desc: 'Detects impossible speed between consecutive check-ins.' },
            { icon: 'lock-closed', color: colors.info, title: 'Integrity Audit Trail', desc: 'Every check-in is logged immutably for fair leaderboard ranking.' },
          ].map(item => (
            <View key={item.title} style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>{item.title}</Text>
                <Text style={styles.infoDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Filter Tabs */}
        <Text style={styles.sectionTitle}>Audit Logs</Text>
        <View style={styles.filterRow}>
          {[null, 'flagged', 'passed'].map(f => (
            <TouchableOpacity
              key={String(f)}
              style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
              onPress={() => { setFilter(f); setLoading(true); }}
            >
              <Text style={[styles.filterBtnText, filter === f && styles.filterBtnTextActive]}>
                {f === null ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Log List */}
        {logs.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="checkmark-done-circle" size={48} color={colors.success} />
            <Text style={styles.emptyText}>No validation logs yet.</Text>
            <Text style={styles.emptySubText}>Complete a habit to generate your first integrity check.</Text>
          </View>
        ) : (
          logs.map(item => <LogItem key={item._id} item={item} />)
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: colors.background.primary },
  center:      { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.text.secondary, fontSize: 15 },

  header: {
    backgroundColor: colors.background.card,
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: colors.border.light, elevation: 2,
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  content:     { flex: 1, padding: 16 },

  integrityCard: {
    backgroundColor: colors.background.card,
    borderRadius: 16, padding: 18, marginBottom: 16, elevation: 2,
  },
  integrityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  integrityTitle:  { flex: 1, marginLeft: 8, fontSize: 16, fontWeight: '700', color: colors.text.primary },
  integrityScore:  { fontSize: 22, fontWeight: '800' },
  barTrack:   { height: 10, borderRadius: 5, backgroundColor: colors.border.light, overflow: 'hidden', marginBottom: 10 },
  barFill:    { height: 10, borderRadius: 5 },
  integrityHint:   { fontSize: 13, color: colors.text.secondary, lineHeight: 18 },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16,
  },
  statCard: {
    width: '48%', backgroundColor: colors.background.card,
    borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 10,
    borderTopWidth: 3, elevation: 1,
  },
  statValue: { fontSize: 26, fontWeight: '800', marginTop: 8, marginBottom: 2 },
  statLabel: { fontSize: 12, color: colors.text.secondary, textAlign: 'center' },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text.primary, marginBottom: 12 },

  infoSection: { marginBottom: 20 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: colors.background.card, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1,
  },
  infoIcon:  { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoText:  { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  infoDesc:  { fontSize: 13, color: colors.text.secondary, lineHeight: 18 },

  filterRow: { flexDirection: 'row', marginBottom: 14 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.background.tertiary, marginRight: 8,
  },
  filterBtnActive:    { backgroundColor: colors.primary },
  filterBtnText:      { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  filterBtnTextActive:{ color: '#fff' },

  logItem: {
    backgroundColor: colors.background.card, borderRadius: 12, padding: 14,
    marginBottom: 10, borderLeftWidth: 4, elevation: 1,
  },
  logHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  logStatus: { fontSize: 13, fontWeight: '700', marginLeft: 6 },
  logCheck:  { fontSize: 12, color: colors.text.secondary, marginLeft: 8 },
  logHabit:  { fontSize: 13, color: colors.text.primary, fontWeight: '600', marginBottom: 4 },
  logReason: { fontSize: 13, color: colors.text.secondary, lineHeight: 18, marginBottom: 6 },
  logTime:   { fontSize: 11, color: colors.text.tertiary },

  emptyWrap:    { alignItems: 'center', paddingVertical: 40 },
  emptyText:    { fontSize: 17, fontWeight: '700', color: colors.text.primary, marginTop: 14 },
  emptySubText: { fontSize: 14, color: colors.text.secondary, marginTop: 6, textAlign: 'center', lineHeight: 20 },
});

export default ValidationScreen;
