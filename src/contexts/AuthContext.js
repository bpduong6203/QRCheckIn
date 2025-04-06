import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userApi } from '../api/userApi';
import { STORAGE_KEYS, USER_ROLES } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    userId: null,
    role: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    userData: null
  });

  // Khởi tạo state từ AsyncStorage khi app khởi động
  useEffect(() => {
    loadAuthState();
  }, []);

  // Login
  const login = useCallback(async (id, password) => {
    try {
      const response = await userApi.login(id, password);
      const { role, status } = response;
  
      if (!id || !role || status !== "Login Success") {
        throw new Error('Invalid login data');
      }
  
      // Lưu từng item một
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, id.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.ROLE, role);
  
      setAuthState({
        userId: id,
        role,
        isLoading: false,
        isAuthenticated: true,
        userData: { id, role }
      });
  
      return { success: true, role };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid credentials'
      };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.ROLE,
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER_DATA
      ]);

      setAuthState({
        userId: null,
        role: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        userData: null
      });

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }, []);

  // Load auth state
  const loadAuthState = useCallback(async () => {
    try {
      // Lấy từng item riêng lẻ
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      const role = await AsyncStorage.getItem(STORAGE_KEYS.ROLE);
  
      // Validate role
      const isValidRole = role && Object.values(USER_ROLES).includes(role);
  
      setAuthState({
        userId: userId || null,
        role: isValidRole ? role : null,
        isLoading: false,
        isAuthenticated: Boolean(userId && isValidRole),
        userData: userId && role ? { id: userId, role } : null
      });
    } catch (error) {
      console.error('Load auth state error:', error);
      setAuthState({
        userId: null,
        role: null,
        isLoading: false,
        isAuthenticated: false,
        userData: null
      });
    }
  }, []);

  // Update role
  const updateRole = useCallback(async (newRole) => {
    try {
      if (!Object.values(USER_ROLES).includes(newRole)) {
        throw new Error('Invalid role');
      }

      await userApi.updateRole(authState.userId, newRole);
      
      await AsyncStorage.setItem(STORAGE_KEYS.ROLE, newRole);
      
      setAuthState(prev => ({
        ...prev,
        role: newRole
      }));

      return { success: true };
    } catch (error) {
      console.error('Update role error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update role'
      };
    }
  }, [authState.userId]);

  // Kiểm tra role hiện tại
  const checkRole = useCallback((allowedRoles) => {
    return allowedRoles.includes(authState.role);
  }, [authState.role]);

  return (
    <AuthContext.Provider 
      value={{
        authState,
        isAdmin: authState.role === USER_ROLES.ADMIN,
        isManager: authState.role === USER_ROLES.MANAGER,
        isEmployee: authState.role === USER_ROLES.EMPLOYEE,
        login,
        logout,
        loadAuthState,
        updateRole,
        checkRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
