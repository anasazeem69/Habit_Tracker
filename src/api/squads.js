import client from './client';

export const createSquad = async (squadData) => {
  try {
    const response = await client.post('/v1/squads', squadData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create squad');
  }
};

export const joinSquad = async (inviteCode) => {
  try {
    const response = await client.post('/v1/squads/join', { inviteCode });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to join squad');
  }
};

export const leaveSquad = async () => {
  try {
    const response = await client.post('/v1/squads/leave');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to leave squad');
  }
};

export const getMySquad = async () => {
  try {
    const response = await client.get('/v1/squads/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch squad');
  }
};

export const getSquadLeaderboard = async (categoryId) => {
  try {
    const params = categoryId ? { categoryId } : {};
    const response = await client.get('/v1/squads/leaderboard', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch leaderboard');
  }
};
