import axios from 'axios';
import { DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

// Create axios instance with default config
console.log('🔧 Creating API client with base URL:', config.API_BASE_URL);
const apiClient = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
    async (config) => {
        // Add auth token if available
        try {
            const sessionData = await AsyncStorage.getItem('user_session');
            if (sessionData) {
                const parsedSession = JSON.parse(sessionData);
                // Extract token depending on structure
                const token = parsedSession?.tokens?.accessToken;

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    // console.log('🔧 Attaching auth token to request:', config.url);
                } else {
                    console.warn('⚠️ No access token found in session data');
                }
            } else {
                console.warn('⚠️ No user session found in storage');
            }
        } catch (error) {
            console.error('Error attaching auth token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            switch (status) {
                case 400:
                    throw new Error(data.error || 'Bad request. Please check your input.');
                case 401:
                    console.warn('🔒 Unauthorized access - clearing session');
                    AsyncStorage.removeItem('user_session').catch(err => console.error('Error clearing session:', err));
                    DeviceEventEmitter.emit('auth.session_expired');
                    throw new Error('Unauthorized. Please check your credentials.');
                case 403:
                    throw new Error('Forbidden. You do not have permission to perform this action.');
                case 404:
                    throw new Error('Resource not found.');
                case 409:
                    throw new Error('Conflict. Resource already exists.');
                case 422:
                    throw new Error(data.error || 'Validation failed. Please check your input.');
                case 429:
                    throw new Error('Too many requests. Please try again later.');
                case 500:
                    throw new Error('Internal server error. Please try again later.');
                default:
                    throw new Error(data.error || `Request failed with status ${status}`);
            }
        } else if (error.request) {
            // Network error
            throw new Error('Network error. Please check your internet connection.');
        } else {
            // Other error
            throw new Error(error.message || 'An unexpected error occurred.');
        }
    }
);

export default apiClient;
