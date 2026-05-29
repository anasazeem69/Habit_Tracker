import client from './client';

export const updateAIConsent = async (consent) => {
  try {
    const response = await client.post('/v1/coaching/consent', { consent });
    return response.data;
  } catch (error) {
    console.error('❌ Update AI Consent Error:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to update AI consent');
  }
};

export const getAIInsights = async (options = {}) => {
  try {
    const { forceFresh = false } = options;
    const response = await client.get('/v1/coaching/insight', {
      params: { forceFresh },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get AI Insights Error:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch AI insights');
  }
};

export const chatWithCoach = async (message, history = []) => {
  try {
    const response = await client.post('/v1/coaching/chat', {
      message,
      history,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Chat With Coach Error:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to chat with coach');
  }
};

export const getCoachNotifications = async (limit = 20) => {
  try {
    const response = await client.get('/v1/coaching/notifications', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get Coach Notifications Error:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to load coach notifications');
  }
};

export const markCoachNotificationRead = async notificationId => {
  try {
    const response = await client.patch(`/v1/coaching/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('❌ Mark Coach Notification Read Error:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to update notification');
  }
};
