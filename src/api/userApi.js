import api from './axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const userApi = {
  // Authentication
  login: async (id, password) => {
    try {
      if (!id || !password) {
        throw new Error('ID and password are required');
      }
  
      const response = await api.post('/api/auth/login', {
        identifier: id.toString(),
        password: password.toString()
      });
  
      // Parse response từ backend
      const { accessToken, tokenType, role, userId } = response.data;
      if (!accessToken || !role || !userId) {
        throw new Error('Invalid response format');
      }
  
      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('tokenType', tokenType);
  
      // Trả về format phù hợp với code hiện tại
      return {
        token: accessToken,
        tokenType,
        role,
        id: userId,
        status: "Login Success"
      };
  
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Invalid credentials');
          case 404:
            throw new Error('User not found');
          case 500:
            throw new Error('Authentication failed');
          default:
            throw new Error(error.response.data?.message || error.response.data || 'Login failed');
        }
      }
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Profile Management
  getProfile: async (id) => {
    try {
      const response = await api.get(`/api/user/profile`, {
        params: { id }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userData) => {
    const response = await api.put('/api/user/update', userData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  },

  updateRole: async (userId, newRole) => {
    try {
      // Lấy token từ storage 
      const token = await AsyncStorage.getItem('accessToken');
      
      const response = await api.put('/api/user/updateRole', null, {
        params: { userId, newRole },
        headers: {
          'Authorization': `Bearer ${token}` // Thêm token vào header
        }
      });
      return response.data;
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to update roles');
      }
      throw error;
    }
  },

  // Account Management
  listAccounts: async () => {
    try {
      const response = await api.get('/api/user/list');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDeletedAccounts: async () => {
    try {
      const response = await api.get('/api/user/listUserDelete');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAccount: async (id) => {
    try {
      const response = await api.post('/api/user/delete', null, {
        params: { id }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/user/add', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Image Management
  getUserImage: async (id) => {
    try {
      const response = await api.get(`/api/user/${id}/image`, {
        responseType: 'text'
      });
      return `data:image/jpeg;base64,${response.data}`;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  },

  uploadImage: async (id, imageData) => {
    try {
      const response = await api.post(`/api/user/${id}/upload-image`, imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Excel Management
  uploadExcel: async (formData) => {
    try {
      const response = await api.post('/api/user/uploadExcel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Department Management
  getUsersByDepartment: async (departmentId) => {
    try {
      const response = await api.get('/api/user/by-department', {
        params: { departmentId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  addUserToDepartment: async (userId, departmentId) => {
    try {
      const response = await api.post('/api/user/add-to-department', null, {
        params: { userId, departmentId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getDepartmentId: async (userId) => {
    try {
      const response = await api.get('/api/user/user-department', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Get department ID error:', error);
      throw error;
    }
  },
  sendCode: async (userId) => {
    try {
      const response = await api.post('/api/user/sendCode', null, {
        params: { id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Send code error:', error);
      throw error;
    }
  },

  // Verify the code sent to email
  checkSendCode: async (code) => {
    try {
      const response = await api.post('/api/user/checkSendCode', null, {
        params: { code }
      });
      return response.data;
    } catch (error) {
      console.error('Check code error:', error);
      throw error;
    }
  },

  // Reset password with new password
  resetPassword: async (userId, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/api/user/resetPassword', null, {
        params: {
          id: userId,
          passwordNew: newPassword,
          passwordNew1: confirmPassword
        }
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

};