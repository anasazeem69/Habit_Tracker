import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getSquadMessages, getDirectMessages, sendMessage, addReaction } from '../api/chatApi';
import socketService from '../api/socket';

const EMOJI_LIST = ['👍', '❤️', '🔥', '😂', '👏'];

const ChatScreen = ({ route, navigation }) => {
    const { user, getAuthToken } = useContext(AuthContext);
    const { squadId, targetUserId, title } = route.params || {};
    
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef();

    useEffect(() => {
        navigation.setOptions({ title: title || (squadId ? 'Squad Chat' : 'Chat') });
        loadMessages();
        setupSocket();

        return () => {
            if (squadId) {
                socketService.emit('leave_squad', squadId);
            }
            socketService.off('new_message');
            socketService.off('message_updated');
        };
    }, [squadId, targetUserId]);

    const setupSocket = async () => {
        const token = await getAuthToken();
        // Assume process.env.EXPO_PUBLIC_API_BASE_URL is available
        socketService.connect(process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.11:5000', token);

        if (squadId) {
            socketService.emit('join_squad', squadId);
        }

        socketService.on('new_message', (message) => {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });

        socketService.on('message_updated', (updatedMessage) => {
            setMessages(prev => prev.map(msg => msg._id === updatedMessage._id ? updatedMessage : msg));
        });
    };

    const loadMessages = async () => {
        try {
            setLoading(true);
            let data;
            if (squadId) {
                data = await getSquadMessages(squadId);
            } else if (targetUserId) {
                data = await getDirectMessages(targetUserId);
            }
            if (data?.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Failed to load messages', error);
        } finally {
            setLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;
        
        try {
            await sendMessage({
                squadId,
                receiverId: targetUserId,
                content: newMessage.trim(),
                messageType: 'text'
            });
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleReaction = async (messageId, emoji) => {
        try {
            await addReaction(messageId, emoji);
        } catch (error) {
            console.error('Failed to add reaction', error);
        }
    };

    const scrollToBottom = () => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    const renderMessage = ({ item }) => {
        const isMine = item.sender?._id === user.id || item.sender === user.id;
        
        return (
            <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
                {!isMine && <Text style={styles.senderName}>{item.sender?.fullName || 'User'}</Text>}
                <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
                    <Text style={[styles.messageText, isMine ? styles.myMessageText : null]}>{item.content}</Text>
                </View>
                
                <View style={styles.reactionContainer}>
                    {item.reactions && item.reactions.length > 0 && (
                        <View style={styles.reactionPills}>
                            {item.reactions.map((r, i) => (
                                <Text key={i} style={styles.reactionEmoji}>{r.emoji}</Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Quick Reaction Bar */}
                {!isMine && (
                    <View style={styles.quickReactions}>
                        {EMOJI_LIST.map(emoji => (
                            <TouchableOpacity key={emoji} onPress={() => handleReaction(item._id, emoji)}>
                                <Text style={styles.quickEmoji}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{title || (squadId ? 'Squad Chat' : 'Chat')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.listContainer}
                    onContentSizeChange={scrollToBottom}
                />
                
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!newMessage.trim()}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
    listContainer: { padding: 16, paddingBottom: 32 },
    messageWrapper: { marginBottom: 16, maxWidth: '80%' },
    myMessageWrapper: { alignSelf: 'flex-end' },
    theirMessageWrapper: { alignSelf: 'flex-start' },
    senderName: { fontSize: 12, color: '#666', marginBottom: 4, marginLeft: 4 },
    messageBubble: { padding: 12, borderRadius: 16 },
    myMessage: { backgroundColor: '#007bff', borderBottomRightRadius: 4 },
    theirMessage: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#eee' },
    messageText: { fontSize: 15, color: '#333' },
    myMessageText: { color: '#fff' },
    reactionContainer: { flexDirection: 'row', marginTop: 4 },
    reactionPills: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
    reactionEmoji: { fontSize: 12, marginHorizontal: 2 },
    quickReactions: { flexDirection: 'row', marginTop: 4, padding: 4, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12 },
    quickEmoji: { fontSize: 16, marginHorizontal: 4 },
    inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#f1f1f1', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
    sendButton: { marginLeft: 12, backgroundColor: '#007bff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
    sendButtonText: { color: '#fff', fontWeight: 'bold' }
});

export default ChatScreen;
