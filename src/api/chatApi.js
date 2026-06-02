import apiClient from './client';

export const getSquadMessages = async (squadId) => {
    const response = await apiClient.get(`/v1/chat/squad/${squadId}`);
    return response.data;
};

export const getDirectMessages = async (targetUserId) => {
    const response = await apiClient.get(`/v1/chat/direct/${targetUserId}`);
    return response.data;
};

export const sendMessage = async ({ squadId, receiverId, content, messageType }) => {
    const response = await apiClient.post('/v1/chat/send', {
        squadId,
        receiverId,
        content,
        messageType
    });
    return response.data;
};

export const addReaction = async (messageId, emoji) => {
    const response = await apiClient.post(`/v1/chat/${messageId}/react`, { emoji });
    return response.data;
};
