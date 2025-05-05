import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserData } from "../(services)/api/api";
import { Alert } from 'react-native';

// Load user from AsyncStorage
const loadUserFromStorage = async () => {
  try {
    const userDataString = await AsyncStorage.getItem("userData");  
    let userData = null;
    if (userDataString) {
      const parsedData = JSON.parse(userDataString);
      userData = Array.isArray(parsedData) ? parsedData[0] : parsedData;
    }

    // Return userData if available
    return userData || null;
  } catch (error) { 
    return null;
  }
};

const initialState = {
  user: null,
  loading: true,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginAction: (state, action) => {
      state.user = action.payload;  // Store the entire response
      state.loading = false;
      state.error = null;
      AsyncStorage.setItem("userData", JSON.stringify(action.payload));
    },
    logoutAction: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
      AsyncStorage.removeItem("userData");
      AsyncStorage.removeItem("userPhoneNumber");
      AsyncStorage.removeItem("userInfo");
    },
    setUser: (state, action) => {
      const userData = Array.isArray(action.payload) ? action.payload[0] : action.payload;
      state.user = userData;
      state.loading = false;
      state.error = null;
      AsyncStorage.setItem("userData", JSON.stringify(userData));
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
});

export const {
  loginAction,
  logoutAction,
  setUser,
  setLoading,
  setError
} = authSlice.actions;

export default authSlice.reducer;

// Helper function to fetch and process user data
const fetchUserData = async (phoneNumber, dispatch) => {
  try {
    const userData = await getUserData(phoneNumber);
    if (userData) {
      const userDataObj = Array.isArray(userData) ? userData[0] : userData;
      dispatch(setUser(userDataObj));
    } else {
      dispatch(setError("User not found"));
      dispatch(logoutAction());
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to load user data. Please try again.');
    
    if (error.message === 'User not found') {
      dispatch(setError("User account no longer exists"));
    } else {
      dispatch(setError("Failed to load user data"));
    }
    dispatch(logoutAction());
  }
};

// Thunk for loading the user initially
export const loadUser = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    // Try to get phone number directly from storage first
    let phoneNumber = await AsyncStorage.getItem('userPhoneNumber');

    if (!phoneNumber) {
      // If no phone number, try to get from stored user info
      const user = await loadUserFromStorage();
      if (!user || !user.PhoneNumber) {
        dispatch(setLoading(false));
        return;
      }
      phoneNumber = user.PhoneNumber;
      await AsyncStorage.setItem('userPhoneNumber', phoneNumber);
    }
   
    // Fetch fresh user data using the phone number
    const userData = await getUserData(phoneNumber);
    if (userData) {
      const userDataObj = Array.isArray(userData) ? userData[0] : userData;
      dispatch(setUser(userDataObj));
    } else {
      dispatch(setError("User not found"));
      dispatch(logoutAction());
    }
  } catch (error) {
    dispatch(setError("Failed to load user data"));
    dispatch(logoutAction());
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk for refreshing user data
const refreshUserData = () => async (dispatch, getState) => {
  dispatch(setLoading(true));

  const { user } = getState().auth;

  if (user) {
    try {
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      if (!phoneNumber) {
        throw new Error('No phone number available for refresh');
      }
      
      await fetchUserData(phoneNumber, dispatch);
    } catch (error) {
      console.error("Error refreshing user data:", error);
      dispatch(setError("Failed to refresh user data")); 
      dispatch(logoutAction());
    }
  } else {
    dispatch(setLoading(false));
  }
};

export { refreshUserData };
