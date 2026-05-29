import client from './client';

export const getValidationStats = async () => {
  try {
    const response = await client.get('/v1/validation/stats');
    return response.data;
  } catch (error) {
    console.error('❌ getValidationStats Error:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch validation stats');
  }
};

export const getMyValidationLogs = async (status, limit = 20) => {
  try {
    const response = await client.get('/v1/validation/my-logs', {
      params: { status, limit },
    });
    return response.data;
  } catch (error) {
    console.error('❌ getMyValidationLogs Error:', error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch validation logs');
  }
};
