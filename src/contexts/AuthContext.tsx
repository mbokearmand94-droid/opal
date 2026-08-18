import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = process.env.OPAL_API_BASE || 'http://localhost:3000';

type AuthState = { isLoading: boolean; userToken: string | null };

type Action =
  | { type: 'RESTORE_TOKEN'; token: string | null }
  | { type: 'SIGN_IN'; token: string }
  | { type: 'SIGN_OUT' };

const initialState: AuthState = { isLoading: true, userToken: null };

function reducer(prevState: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return { ...prevState, userToken: action.token, isLoading: false };
    case 'SIGN_IN':
      return { ...prevState, userToken: action.token };
    case 'SIGN_OUT':
      return { ...prevState, userToken: null };
    default:
      return prevState;
  }
}

const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Try to restore token
    (async () => {
      try {
        const token = await AsyncStorage.getItem('@opal_token');
        dispatch({ type: 'RESTORE_TOKEN', token });
      } catch (e) {
        dispatch({ type: 'RESTORE_TOKEN', token: null });
      }
    })();
  }, []);

  const signIn = async (data: { email: string; password: string }) => {
    const res = await axios.post(`${API_BASE}/auth/login`, data);
    if (res.data && res.data.token) {
      await AsyncStorage.setItem('@opal_token', res.data.token);
      dispatch({ type: 'SIGN_IN', token: res.data.token });
    } else {
      throw new Error('invalid_response');
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('@opal_token');
    dispatch({ type: 'SIGN_OUT' });
  };

  const signUp = async (data: { email: string; password: string }) => {
    const res = await axios.post(`${API_BASE}/auth/register`, data);
    if (res.data && res.data.token) {
      await AsyncStorage.setItem('@opal_token', res.data.token);
      dispatch({ type: 'SIGN_IN', token: res.data.token });
    } else {
      throw new Error('invalid_response');
    }
  };

  const authContext = { state, signIn, signOut, signUp };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
