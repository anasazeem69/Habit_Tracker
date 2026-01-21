import axios from 'axios';


const API_Base = process.env.EXPO_PUBLIC_API_BASE_URL;

const getHeaders = async (token) => {
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const getHabits = async (token) => {
    try {
        const response = await axios.get(`${API_Base}/v1/habits`, {
            headers: await getHeaders(token),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message);
    }
};

export const createHabit = async (token, habitData) => {
    try {
        const response = await axios.post(`${API_Base}/v1/habits`, habitData, {
            headers: await getHeaders(token),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message);
    }
};

export const checkInHabit = async (token, habitId) => {
    try {
        const response = await axios.post(`${API_Base}/v1/habits/${habitId}/check-in`, {}, {
            headers: await getHeaders(token),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message);
    }
};

export const deleteHabit = async (token, habitId) => {
    try {
        const response = await axios.delete(`${API_Base}/v1/habits/${habitId}`, {
            headers: await getHeaders(token),
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || error.message);
    }
};
