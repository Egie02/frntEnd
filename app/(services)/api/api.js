import axiosInstance from '../config/axios.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Helper function to clear user data from storage
const clearUserData = async () => {
  await AsyncStorage.multiRemove(['userInfo', 'userPhoneNumber', 'userData']);
};

// Helper function to handle API errors
const handleApiError = (error, customMessage = 'An error occurred') => {
  const errorMessage = error.response?.data?.message || error.message || customMessage;
  
  if (error.response?.status === 404) {
    throw new Error('Resource not found');
  }
  
  if (error.response?.status === 401) {
    throw new Error('Unauthorized access');
  }
  
  throw new Error(errorMessage);
};

// Login User 
export const loginUser = async (user) => {
  try {
    const response = await axiosInstance.post('/api/profile/login', {
      PhoneNumber: user.PhoneNumber,
      PIN: user.PIN
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Login failed');
    }

    if (!response.data?.user) {
      throw new Error('Invalid response format');
    }

    const userData = {
      user: response.data.user,
      token: response.data.token
    };

    await Promise.all([
      AsyncStorage.setItem('userInfo', JSON.stringify(userData)),
      AsyncStorage.setItem('userPhoneNumber', user.PhoneNumber)
    ]);
      
    return userData;
  } catch (error) {
    handleApiError(error, 'Login failed');
  }
};

// Get User Data
export const getUserData = async (PhoneNumber) => {
  try {
    if (!PhoneNumber) {
      PhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      
      if (!PhoneNumber) {
        throw new Error('No phone number available');
      }
    }
    
    const response = await axiosInstance.get(`/api/profile/${PhoneNumber}`);
    await AsyncStorage.setItem('userData', JSON.stringify(response.data));
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      Alert.alert('Error', `User not found: ${PhoneNumber}`);
      await clearUserData();
    }
    handleApiError(error, 'Failed to fetch user data');
  }
};

// Change PIN
export const changePIN = async (PhoneNumber, oldPIN, newPIN, isFirstTime = false) => {
  try {
    if (!PhoneNumber || (!isFirstTime && !oldPIN) || !newPIN) {
      throw new Error('Missing required parameters');
    }

    const response = await axiosInstance.put(`/api/profile/auth/pin/${PhoneNumber}`, {
      oldPIN: oldPIN,
      newPIN: newPIN,
      isFirstTime: isFirstTime
    });

    if (!response.data) {
      throw new Error('No response received');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to change PIN');
    }

    // Only clear user data if PIN was changed successfully
    if (response.data.success) {
      await clearUserData();
    }

    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error('Unauthorized: Please login again');
    }
    if (error.response?.status === 403) {
      throw new Error('You can only update your own PIN');
    }
    throw new Error(error.response?.data?.message || error.message || 'PIN change failed');
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    await clearUserData();
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export default {
  loginUser,
  getUserData,
  changePIN,
  logoutUser
};