import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import socketService from '../api/socket';
import { getNotifications } from '../api/notificationApi';
import { colors } from '../config/colors';

const NotificationBell = ({ size = 28, color = colors.primary, style }) => {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isFocused) {
            loadUnreadCount();
        }
    }, [isFocused]);

    useEffect(() => {
        socketService.on('new_notification', handleNewNotification);

        return () => {
            socketService.off('new_notification', handleNewNotification);
        };
    }, []);

    const loadUnreadCount = async () => {
        try {
            const data = await getNotifications();
            if (data?.success) {
                const count = data.notifications.filter(n => !n.isRead).length;
                setUnreadCount(count);
            }
        } catch (error) {
            console.error('Failed to load notifications for bell', error);
        }
    };

    const handleNewNotification = () => {
        setUnreadCount(prev => prev + 1);
    };

    const handlePress = () => {
        setUnreadCount(0); // Optimistic clear
        navigation.navigate('Notifications');
    };

    return (
        <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
            <Ionicons name="notifications-outline" size={size} color={color} />
            {unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFF',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    }
});

export default NotificationBell;
