import axios from './axiosConfig';

export const departmentApi = {
  getDepartments: async () => {
    const response = await axios.get('/api/department/listDepartment');
    return response.data;
  },

  addDepartment: async (name) => {
    const response = await axios.post('/api/department/add', { name });
    return response.data;
  },

  updateDepartment: async (id, name) => {
    const response = await axios.put('/api/department/update', { id, name });
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await axios.delete(`/api/department?id=${id}`);
    return response.data;
  },

  getDepartmentUsers: async (id) => {
    try {
      const response = await axios.get('/api/department/listUser', {
        params: { id }
      });
      console.log('Department users response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting department users:', error);
      throw error;
    }
  },

  addUserToDepartment: async (userId, departmentId) => {
    const response = await axios.post('/api/department/addUser', null, {
      params: { id: userId, department: departmentId }
    });
    return response.data;
  }
};