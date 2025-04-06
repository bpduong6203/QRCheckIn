import api from './axiosConfig';

const parseBoolean = (value) => value === true || value === "true";


export const attendanceApi = {
  // Tạo mã chấm công
  generateCode: async (userId, type) => {
    try {
      const response = await api.post('/api/attendance/generate-code', null, {
        params: { userId, type }
      });
      return response.data;
    } catch (error) {
      console.error('Generate code error:', error);
      throw error;
    }
  },

  // Check in
  // Check in
checkIn: async (data) => {
  try {
    console.log('Check-in request data:', {
      userId: data.userId,
      code: data.code,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address
    });

    const response = await api.post('/api/attendance/check-in', null, {
      params: {
        userId: data.userId,
        code: data.code,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        address: data.address || ''
      }
    });
    
    console.log('Check-in response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Check-in error:', {
      status: error.response?.status,
      message: error.response?.data
    });
    throw new Error(error.response?.data || 'Không thể xử lý yêu cầu');
  }
},

// Check out
checkOut: async (data) => {
  try {
    console.log('Check-out request data:', data);
    const response = await api.post('/api/attendance/check-out', null, {
      params: {
        userId: data.userId,
        code: data.code,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        address: data.address || ''
      }
    });
    console.log('Check-out response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Check-out error:', {
      status: error.response?.status,
      message: error.response?.data
    });
    throw new Error(error.response?.data || 'Không thể xử lý yêu cầu');
  }
},
  // Get attendance history
  getAttendanceHistory: async (userId, startDate, endDate, page = 0, size = 10) => {
    try {
      const response = await api.get('/api/attendance/history', {
        params: {
          userId,
          startDate,
          endDate,
          page,
          size
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        return [];
      }
      console.error('Get history error:', error);
      throw error;
    }
  },

  // Get user attendance summary
  getUserAttendanceSummary: async (userId, startDate, endDate) => {
    try {
      if (!userId || !startDate || !endDate) {
        throw new Error('Missing required parameters');
      }
  
      const response = await api.get('/api/attendance/summary', {
        params: {
          userId,
          startDate,
          endDate
        }
      });
  
      return response.data;
    } catch (error) {
      // Handle 403 error specifically
      if (error.response?.status === 403) {
        console.log('User has not checked out yet, returning default values');
        return {
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          absentDays: 0,
          totalWorkingHours: 0,
          averageWorkingHours: 0,
          overtimeDays: 0
        };
      }
  
      // For other errors, rethrow
      throw error;
    }
  },

  // Request attendance modification
  requestModification: async (request) => {
    try {
      const response = await api.post('/api/attendance/request-modification', request, {
        params: { userId: request.userId }
      });
      return response.data;
    } catch (error) {
      console.error('Request modification error:', error);
      throw error;
    }
  },

  // Get modification requests
  getModificationRequests: async (userId) => {
    try {
      const response = await api.get('/api/attendance/modification-requests', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Get modification requests error:', error);
      throw error;
    }
  },

  // Get today's attendance status
  getTodayAttendance: async (userId) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await api.get('/api/attendance/history', {
        params: {
          userId,
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
          page: 0,
          size: 1
        }
      });

      return response.data[0] || null;
    } catch (error) {
      console.error('Get today attendance error:', error);
      throw error;
    }
  },
  getDepartmentStats: async (departmentId, startDate, endDate) => {
    try {
      const response = await api.get('/api/attendance/manager/department/stats', {
        params: {
          departmentId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get department stats error:', error);
      throw error;
    }
  },

  // Get stats by user
  getUsersStats: async (departmentId, startDate, endDate) => {
    try {
      const response = await api.get('/api/attendance/manager/users/stats', {
        params: {
          departmentId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get users stats error:', error);
      throw error;
    }
  },

  // Get overtime statistics
  getOvertimeStats: async (departmentId, startDate, endDate) => {
    try {
      const response = await api.get('/api/attendance/manager/overtime/stats', {
        params: {
          departmentId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get overtime stats error:', error);
      throw error;
    }
  },

  // Export attendance report
  exportReport: async (departmentId, startDate, endDate) => {
    try {
      const response = await api.get('/api/attendance/manager/export', {
        params: {
          departmentId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Export report error:', error);
      throw error;
    }
  },

  // Search attendance records
  searchAttendance: async (params) => {
    try {
      const response = await api.get('/api/attendance/manager/search', {
        params: {
          userId: params.userId,
          departmentId: params.departmentId,
          startDate: params.startDate?.toISOString(),
          endDate: params.endDate?.toISOString(),
          status: params.status,
          page: params.page || 0,
          size: params.size || 10
        }
      });
      return response.data;
    } catch (error) {
      console.error('Search attendance error:', error);
      throw error;
    }
  },

  // Get pending modification requests
  getPendingRequests: async (departmentId) => {
    try {
      const response = await api.get('/api/attendance/manager/modification-requests/pending', {
        params: { departmentId }
      });
      return response.data;
    } catch (error) {
      console.error('Get pending requests error:', error);
      throw error;
    }
  },

  // Approve/reject modification request
  approveModificationRequest: async (requestId, approverId, approved, comment) => {
    try {
      const response = await api.post(`/api/attendance/manager/modification-requests/${requestId}/approve`, null, {
        params: {
          approverId,
          approved,
          comment
        }
      });
      return response.data;
    } catch (error) {
      console.error('Approve modification request error:', error);
      throw error;
    }
  },

  // Get daily attendance statistics
  getDailyStats: async (departmentId, date) => {
    try {
      const response = await api.get('/api/attendance/manager/daily-stats', {
        params: {
          departmentId,
          date: date.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get daily stats error:', error);
      throw error;
    }
  },

  // Update attendance record
  updateAttendance: async (attendanceId, updateRequest) => {
    try {
      const response = await api.put(`/api/attendance/manager/${attendanceId}`, updateRequest);
      return response.data;
    } catch (error) {
      console.error('Update attendance error:', error);
      throw error;
    }
  },

  // Get attendance audit log
  getAuditLog: async (attendanceId) => {
    try {
      const response = await api.get(`/api/attendance/manager/${attendanceId}/audit-log`);
      return response.data;
    } catch (error) {
      console.error('Get audit log error:', error);
      throw error;
    }
  },
  getAttendanceByDate: async (userId, date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
      const response = await api.get('/api/attendance/by-date', {
        params: {
          userId,
          date: formattedDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get attendance by date error:', error);
      throw error;
    }
  }
};
