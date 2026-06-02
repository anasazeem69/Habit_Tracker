import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/colors';
import { getMySquad, createSquad, joinSquad, leaveSquad } from '../api/squads';
import { getCategories } from '../api/categories';

const SquadScreen = ({ navigation }) => {
  const [squad, setSquad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [squadName, setSquadName] = useState('');
  const [squadDesc, setSquadDesc] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [creating, setCreating] = useState(false);

  // Join state
  const [inviteCode, setInviteCode] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [squadRes, catRes] = await Promise.all([getMySquad(), getCategories()]);
      setSquad(squadRes.data);
      setCategories(catRes.data || []);
    } catch (err) {
      console.error('Squad fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!squadName.trim()) return Alert.alert('Error', 'Please enter a squad name.');
    if (!selectedCategory) return Alert.alert('Error', 'Please select a focus category.');
    try {
      setCreating(true);
      const res = await createSquad({ name: squadName.trim(), description: squadDesc.trim(), categoryId: selectedCategory._id });
      setSquad(res.data);
      setShowCreateModal(false);
      setSquadName(''); setSquadDesc(''); setSelectedCategory(null);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim() || inviteCode.length < 6) return Alert.alert('Error', 'Please enter a valid 6-character invite code.');
    try {
      setJoining(true);
      const res = await joinSquad(inviteCode.trim());
      setSquad(res.data);
      setInviteCode('');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave Squad', 'Are you sure you want to leave this squad?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive', onPress: async () => {
          try {
            await leaveSquad();
            setSquad(null);
          } catch (err) {
            Alert.alert('Error', err.message);
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Squad...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Squad System</Text>
        <Text style={styles.headerSubtitle}>Team up & dominate together</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {squad ? (
          // --- In a Squad View ---
          <>
            <View style={[styles.squadCard, { borderTopColor: squad.categoryId?.color || colors.primary }]}>
              <View style={styles.squadCardHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: squad.categoryId?.color || colors.primary }]}>
                  <Ionicons name={squad.categoryId?.icon || 'star'} size={16} color="#FFF" />
                  <Text style={styles.categoryBadgeText}>{squad.categoryId?.name}</Text>
                </View>
                <TouchableOpacity onPress={handleLeave} style={styles.leaveBtn}>
                  <Ionicons name="exit-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>

              <Text style={styles.squadName}>{squad.name}</Text>
              {squad.description ? <Text style={styles.squadDesc}>{squad.description}</Text> : null}

              <View style={styles.xpRow}>
                <Ionicons name="flash" size={20} color={colors.accent} />
                <Text style={styles.xpText}>{squad.totalXP} Squad XP</Text>
              </View>

              <View style={styles.inviteRow}>
                <Ionicons name="key-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.inviteLabel}>Invite Code: </Text>
                <Text style={styles.inviteCode}>{squad.inviteCode}</Text>
              </View>
            </View>

            {/* Member List */}
            <Text style={styles.sectionTitle}>Members ({squad.members?.length || 0}/10)</Text>
            {[...(squad.members || [])]
              .sort((a, b) => (b.squadContribution || 0) - (a.squadContribution || 0))
              .map((member, index) => (
              <View key={member._id} style={[styles.memberRow, index === 0 && styles.topContributorRow]}>
                <View style={styles.memberRank}>
                  <Text style={[styles.memberRankText, index === 0 && { color: '#FFD700', fontSize: 18 }]}>
                    {index === 0 ? '👑' : `#${index + 1}`}
                  </Text>
                </View>
                <Ionicons name="person-circle" size={36} color={index === 0 ? colors.accent : colors.primary} style={{ marginRight: 12 }} />
                <View style={styles.memberInfo}>
                  <Text style={[styles.memberName, index === 0 && { color: colors.primary, fontWeight: 'bold' }]}>{member.fullName}</Text>
                  <Text style={styles.memberStats}>Level {member.level} • {member.totalXP} Total XP</Text>
                </View>
                <View style={styles.contribBadge}>
                  <Ionicons name="flash" size={12} color={colors.accent} />
                  <Text style={styles.contribText}>{member.squadContribution || 0}</Text>
                  <Text style={styles.contribLabel}> Squad XP</Text>
                </View>
              </View>
            ))}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity style={[styles.leaderboardBtn, { flex: 1, marginRight: 8 }]} onPress={() => navigation.navigate('SquadLeaderboard')}>
                <Ionicons name="trophy" size={20} color="#FFF" />
                <Text style={styles.leaderboardBtnText}>Leaderboard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.leaderboardBtn, { flex: 1, marginLeft: 8, backgroundColor: '#28a745' }]} onPress={() => navigation.navigate('Chat', { squadId: squad._id, title: squad.name })}>
                <Ionicons name="chatbubbles" size={20} color="#FFF" />
                <Text style={styles.leaderboardBtnText}>Squad Chat</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // --- No Squad View ---
          <>
            <View style={styles.emptyState}>
              <Ionicons name="people" size={72} color={colors.text.tertiary} />
              <Text style={styles.emptyTitle}>You're not in a squad</Text>
              <Text style={styles.emptySubtitle}>Create a squad or join one using an invite code.</Text>
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
              <Ionicons name="add-circle" size={22} color="#FFF" />
              <Text style={styles.createBtnText}>Create a Squad</Text>
            </TouchableOpacity>

            <Text style={styles.orDivider}>— OR JOIN WITH CODE —</Text>

            <View style={styles.joinRow}>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter 6-character code"
                placeholderTextColor={colors.text.tertiary}
                value={inviteCode}
                onChangeText={t => setInviteCode(t.toUpperCase())}
                placeholderTextColor="#A0AEC0"
                autoCapitalize="characters"
                maxLength={20}/>
              <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} disabled={joining}>
                {joining ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.joinBtnText}>Join</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.leaderboardBtnOutline} onPress={() => navigation.navigate('SquadLeaderboard')}>
              <Ionicons name="trophy-outline" size={20} color={colors.primary} />
              <Text style={styles.leaderboardBtnOutlineText}>Browse Leaderboard</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Create Squad Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Squad</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Squad Name" placeholderTextColor={colors.text.tertiary} value={squadName} onChangeText={setSquadName} maxLength={50} />
            <TextInput style={[styles.input, { height: 80 }]} placeholder="Description (optional)" placeholderTextColor={colors.text.tertiary} value={squadDesc} onChangeText={setSquadDesc} multiline maxLength={200} />

            <Text style={styles.categoryLabel}>Focus Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat._id}
                  style={[styles.categoryChip, selectedCategory?._id === cat._id && { backgroundColor: cat.color, borderColor: cat.color }]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Ionicons name={cat.icon || 'star'} size={14} color={selectedCategory?._id === cat._id ? '#FFF' : cat.color} />
                  <Text style={[styles.categoryChipText, selectedCategory?._id === cat._id && { color: '#FFF' }]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} disabled={creating}>
              {creating ? <ActivityIndicator size="small" color="#FFF" /> : (
                <>
                  <Ionicons name="people" size={20} color="#FFF" />
                  <Text style={styles.createBtnText}>Create Squad</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: colors.text.secondary, fontSize: 16 },
  header: {
    backgroundColor: colors.background.secondary,
    paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border.light,
    elevation: 2, shadowColor: colors.shadow.light,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
  headerSubtitle: { fontSize: 14, color: colors.text.secondary, marginTop: 4 },
  content: { flex: 1, padding: 16 },
  squadCard: {
    backgroundColor: colors.background.secondary, borderRadius: 16, padding: 20,
    marginBottom: 20, borderTopWidth: 4,
    shadowColor: colors.shadow.medium, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  squadCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryBadgeText: { color: '#FFF', fontWeight: 'bold', marginLeft: 4, fontSize: 13 },
  leaveBtn: { padding: 4 },
  squadName: { fontSize: 22, fontWeight: 'bold', color: colors.text.primary, marginBottom: 4 },
  squadDesc: { fontSize: 14, color: colors.text.secondary, marginBottom: 12 },
  xpRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  xpText: { fontSize: 18, fontWeight: 'bold', color: colors.accent, marginLeft: 6 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.primary, borderRadius: 8, padding: 10 },
  inviteLabel: { fontSize: 14, color: colors.text.secondary, marginLeft: 4 },
  inviteCode: { fontSize: 16, fontWeight: 'bold', color: colors.primary, letterSpacing: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text.primary, marginBottom: 12 },
  memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary, borderRadius: 12, padding: 12, marginBottom: 8 },
  memberRank: { width: 28, alignItems: 'center' },
  memberRankText: { fontWeight: 'bold', color: colors.text.tertiary },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
  memberStats: { fontSize: 12, color: colors.text.secondary, marginTop: 2 },
  topContributorRow: {
    borderWidth: 1.5,
    borderColor: '#FFD700',
    backgroundColor: colors.background.secondary,
  },
  contribBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.background.primary, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  contribText: { fontSize: 14, fontWeight: 'bold', color: colors.accent, marginLeft: 2 },
  contribLabel: { fontSize: 10, color: colors.text.tertiary },
  leaderboardBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 12, padding: 14, marginTop: 16 },
  leaderboardBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  leaderboardBtnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary, borderRadius: 12, padding: 14, marginTop: 12 },
  leaderboardBtnOutlineText: { color: colors.primary, fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.secondary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.text.tertiary, marginTop: 8, textAlign: 'center' },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 12, padding: 16, marginBottom: 20 },
  createBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  orDivider: { textAlign: 'center', color: colors.text.tertiary, fontSize: 13, marginBottom: 16, letterSpacing: 1 },
  joinRow: { flexDirection: 'row', marginBottom: 16 },
  codeInput: {
    flex: 1, backgroundColor: colors.background.secondary, borderRadius: 12, padding: 14,
    fontSize: 18, fontWeight: 'bold', letterSpacing: 4, color: colors.text.primary,
    borderWidth: 1, borderColor: colors.border.light, marginRight: 8,
  },
  joinBtn: { backgroundColor: colors.secondary, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  joinBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: colors.background.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.primary },
  input: {
    backgroundColor: colors.background.secondary, borderRadius: 12, padding: 14,
    fontSize: 15, color: colors.text.primary, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border.light,
  },
  categoryLabel: { fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 10 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: colors.border.light,
    backgroundColor: colors.background.secondary, marginRight: 8, marginBottom: 8,
  },
  categoryChipText: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginLeft: 4 },
});

export default SquadScreen;
