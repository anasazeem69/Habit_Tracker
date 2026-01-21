import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../config/colors';


import { getTerritoryHistory } from '../../api/territories';

const { width } = Dimensions.get('window');

const TerritoryInfoModal = ({
  visible,
  territory,
  onClose,
  onClaim,
  onRelease,
  isOwnedByUser = false,
  user
}) => {
  const [activeTab, setActiveTab] = React.useState('info');
  const [history, setHistory] = React.useState([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  React.useEffect(() => {
    if (visible && territory?.cellId && activeTab === 'history') {
      fetchHistory();
    }
  }, [visible, territory, activeTab]);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const result = await getTerritoryHistory(territory.cellId);
      setHistory(result.data || []);
    } catch (error) {
      if (error && error.message && error.message.includes('404')) {
        // Territory not found = No history yet. This is expected for unclaimed cells.
        setHistory([]);
      } else {
        console.error('Failed to load history', error);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!territory) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'claimed': return colors.success;
      case 'unclaimed': return colors.gray;
      case 'contested': return colors.warning;
      case 'locked': return colors.error;
      default: return colors.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'claimed': return 'checkmark-circle';
      case 'unclaimed': return 'ellipse-outline';
      case 'contested': return 'warning';
      case 'locked': return 'lock-closed';
      default: return 'ellipse-outline';
    }
  };

  const renderHistoryItem = (item, index) => {
    const isClaim = item.action === 'claim';
    const isLock = item.action === 'lock';
    const isRelease = item.action === 'release';

    let iconName = 'flag';
    let iconColor = colors.primary;

    if (isClaim) { iconName = 'flag'; iconColor = colors.success; }
    if (isLock) { iconName = 'lock-closed'; iconColor = colors.error; }
    if (isRelease) { iconName = 'flag-outline'; iconColor = colors.warning; }

    return (
      <View key={item._id || index} style={styles.historyItem}>
        <View style={[styles.historyIcon, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={iconName} size={16} color={iconColor} />
        </View>
        <View style={styles.historyContent}>
          <Text style={styles.historyAction}>
            {isClaim ? 'Claimed' : isLock ? 'Locked' : 'Released'} by <Text style={{ fontWeight: 'bold' }}>{item.userId?.fullName || 'Unknown'}</Text>
          </Text>
          <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: territory.categoryId?.color || colors.primary }]}>
                <Ionicons
                  name={territory.categoryId?.icon || 'flag'}
                  size={20}
                  color="white"
                />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.territoryTitle}>
                  {territory.categoryId?.name || 'Territory'} Territory
                </Text>
                <Text style={styles.cellId}>Cell: {territory.cellId}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'info' && styles.activeTab]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Info</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === 'info' ? (
              <>
                {/* Status Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Status</Text>
                  <View style={styles.statusRow}>
                    <Ionicons
                      name={getStatusIcon(territory.status)}
                      size={20}
                      color={getStatusColor(territory.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(territory.status) }]}>
                      {territory.status.charAt(0).toUpperCase() + territory.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Owner Section */}
                {territory.status !== 'unclaimed' && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Current Owner</Text>
                    <View style={styles.infoRow}>
                      <Ionicons name="person" size={16} color={colors.text.secondary} />
                      <Text style={styles.infoText}>
                        {territory.claimedBy?.fullName || 'Unknown User'}
                      </Text>
                    </View>
                    {territory.lockedUntil && new Date(territory.lockedUntil) > new Date() && (
                      <View style={styles.infoRow}>
                        <Ionicons name="lock-closed" size={16} color={colors.error} />
                        <Text style={[styles.infoText, { color: colors.error }]}>
                          Locked until {formatDate(territory.lockedUntil)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Activity Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Activity</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="time" size={16} color={colors.text.secondary} />
                    <Text style={styles.infoText}>
                      Last Activity: {formatDate(territory.lastActivity)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="pulse" size={16} color={colors.text.secondary} />
                    <Text style={styles.infoText}>
                      Activity Count: {territory.activityCount || 0}
                    </Text>
                  </View>
                </View>

                {/* Location Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={colors.text.secondary} />
                    <Text style={styles.infoText}>
                      Lat: {territory.coordinates?.coordinates?.[1]?.toFixed(6) || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={colors.text.secondary} />
                    <Text style={styles.infoText}>
                      Lng: {territory.coordinates?.coordinates?.[0]?.toFixed(6) || 'N/A'}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              // History Tab Content
              <View style={styles.historyContainer}>
                {loadingHistory ? (
                  <Text style={styles.loadingText}>Loading battle logs...</Text>
                ) : history.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={48} color={colors.text.tertiary} />
                    <Text style={styles.emptyText}>No history recorded yet.</Text>
                  </View>
                ) : (
                  history.map((item, index) => renderHistoryItem(item, index))
                )}
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {activeTab === 'info' && (
              <>
                {territory.status === 'claimed' && isOwnedByUser ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.releaseButton]}
                    onPress={onRelease}
                  >
                    <Ionicons name="flag-outline" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Release Territory</Text>
                  </TouchableOpacity>
                ) : territory.status === 'unclaimed' ? (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.claimButton]}
                    onPress={onClaim}
                  >
                    <Ionicons name="flag" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Claim Territory</Text>
                  </TouchableOpacity>
                ) : territory.status === 'locked' && !isOwnedByUser ? (
                  <View style={styles.disabledButton}>
                    <Ionicons name="lock-closed" size={20} color={colors.text.secondary} />
                    <Text style={styles.disabledButtonText}>Locked by Owner</Text>
                  </View>
                ) : (
                  <View style={styles.disabledButton}>
                    <Ionicons name="lock-closed" size={20} color={colors.text.secondary} />
                    <Text style={styles.disabledButtonText}>
                      {isOwnedByUser ? 'Already Owned' : 'Cannot Claim'}
                    </Text>
                  </View>
                )}
              </>
            )}
            {activeTab === 'history' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.background.tertiary }]}
                onPress={() => setActiveTab('info')}
              >
                <Text style={[styles.actionButtonText, { color: colors.text.primary }]}>Back to Info</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  territoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  cellId: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  closeButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  claimButton: {
    backgroundColor: colors.success,
  },
  releaseButton: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
    gap: 8,
  },
  disabledButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '500',
  },
  // History Styles
  historyContainer: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: colors.text.tertiary,
  },
});

export default TerritoryInfoModal;
