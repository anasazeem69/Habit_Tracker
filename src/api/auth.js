import apiClient from './client';
import config from '../config';

// Auth API functions with proper error handling
export const register = async (userData) => {
  try {
    if (!userData || typeof userData !== 'object') {
      throw new Error('Invalid user data provided');
    }

    // Validate required fields
    const requiredFields = ['fullName', 'phone', 'email', 'password'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const payload = {
      ...userData,
      role: userData.role || 'standard'
    };

    const response = await apiClient.post('/v1/auth/register', payload);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    // Re-throw with more context if needed
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    console.log('🔐 Login API called with:', { email: credentials.email, password: '***' });

    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Invalid credentials provided');
    }

    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    console.log('📡 Making API request to:', `${config.API_BASE_URL}/v1/auth/login`);

    const response = await apiClient.post('/v1/auth/login', credentials);

    console.log('✅ Login API response:', response.data);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Login API error:', error.message);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new Error('Valid email is required');
    }

    const response = await apiClient.post('/v1/auth/forgot-password', { email: email.trim() });

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestOTP = async (email) => {
  try {
    console.log('📧 Request OTP API called for:', email);

    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new Error('Valid email is required');
    }

    const response = await apiClient.post('/v1/auth/request-otp', { email: email.trim() });

    console.log('✅ Request OTP API response:', response.data);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Request OTP API error:', error.message);
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    console.log('🔍 Verify OTP API called for:', email);

    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new Error('Valid email is required');
    }

    if (!otp || typeof otp !== 'string' || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      throw new Error('Valid 6-digit OTP is required');
    }

    const response = await apiClient.post('/v1/auth/verify-otp', { email: email.trim(), otp });

    console.log('✅ Verify OTP API response:', response.data);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Verify OTP API error:', error.message);
    throw error;
  }
};

export const resetPassword = async ({ email, newPassword, resetToken }) => {
  try {
    console.log('🔄 Reset Password API called for:', email);

    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new Error('Valid email is required');
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!resetToken || typeof resetToken !== 'string') {
      throw new Error('Reset token is required');
    }

    const response = await apiClient.post('/v1/auth/reset-password', {
      email: email.trim(),
      newPassword,
      resetToken
    });

    console.log('✅ Reset Password API response:', response.data);

    if (!response.data) {
      throw new Error('Invalid response from server');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Reset Password API error:', error.message);
    throw error;
  }
};

export const createLinkInvite = async (payload) => {
  const response = await apiClient.post('/v1/auth/links/invite', payload);
  if (!response.data) {
    throw new Error('Invalid response from server');
  }
  return response.data;
};

export const acceptLinkInvite = async (payload) => {
  const response = await apiClient.post('/v1/auth/links/accept', payload);
  if (!response.data) {
    throw new Error('Invalid response from server');
  }
  return response.data;
};

export const revokeLink = async (payload) => {
  const response = await apiClient.post('/v1/auth/links/revoke', payload);
  if (!response.data) {
    throw new Error('Invalid response from server');
  }
  return response.data;
};

export const fetchUserLinks = async (userId) => {
  const response = await apiClient.get('/v1/auth/links', { params: { userId } });
  if (!response.data) {
    throw new Error('Invalid response from server');
  }
  return response.data;
};

export const updatePushToken = async (token) => {
  const response = await apiClient.post('/v1/auth/update-push-token', { token });
  if (!response.data) {
    throw new Error('Invalid response from server');
  }
  return response.data;
};

export const fetchCurrentUser = async (authToken) => {
  try {
    const headers = authToken
      ? { Authorization: `Bearer ${authToken}` }
      : {};

    const response = await apiClient.get('/v1/auth/me', { headers });
    return response.data;
  } catch (error) {
    console.error('❌ Fetch current user failed:', error.message);
    throw error;
  }
};


