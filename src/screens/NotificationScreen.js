import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { getNotifications, markAsRead } from '../api/notificationApi';
import socketService from '../api/socket';

const NotificationScreen = ({ navigation }) => {
    const { getAuthToken } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadNotifications();
        setupSocket();

        return () => {
            socketService.off('new_notification');
        };
    }, []);

    const setupSocket = async () => {
        const token = await getAuthToken();
        socketService.connect(process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.11:5000', token);
        
        socketService.on('new_notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
        });
    };

    const loadNotifications = async () => {
        try {
            const data = await getNotifications();
            if (data?.success) {
                setNotifications(data.notifications);
            }
        } catch (error) {
            console.error('Failed to load notifications', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const handleNotificationPress = async (item) => {
        if (!item.isRead) {
            try {
                await markAsRead(item._id);
                setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error('Failed to mark as read', error);
            }
        }

        // Navigate based on type
        if (item.type === 'chat' && item.relatedEntity) {
            // E.g. open chat
            // navigation.navigate('Chat', { targetUserId: item.relatedEntity });
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.iconText}>
                    {item.type === 'rival_alert' ? '⚔️' : item.type === 'chat' ? '💬' : '🔔'}
                </Text>
            </View>
            <View style={styles.contentContainer}>
                <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={{ fontSize: 24, color: '#333' }}>{'←'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No notifications yet.</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#eee',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    listContainer: { padding: 16 },
    notificationCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    unreadCard: { backgroundColor: '#f0f7ff', borderColor: '#007bff', borderWidth: 1 },
    iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f1f1', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    iconText: { fontSize: 20 },
    contentContainer: { flex: 1 },
    title: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
    unreadText: { color: '#000', fontWeight: 'bold' },
    message: { fontSize: 14, color: '#666', marginBottom: 6 },
    time: { fontSize: 12, color: '#999' },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007bff', marginLeft: 8 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 }
});

export default NotificationScreen;
