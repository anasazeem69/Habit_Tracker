import apiClient from './client';

export const getNotifications = async () => {
    const response = await apiClient.get('/v1/notifications');
    return response.data;
};

export const markAsRead = async (notificationId) => {
    const response = await apiClient.put(`/v1/notifications/${notificationId}/read`);
    return response.data;
};
