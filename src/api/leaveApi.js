import api from './axiosConfig';

export const leaveApi = {
  // Employee endpoints
  getMyLeaves: async (userId) => {
    try {
      const response = await api.get('/api/leave/my-requests', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Get my leaves error:', error);
      throw error;
    }
  },

  getRemainingDays: async (userId) => {
    try {
      const response = await api.get('/api/leave/remaining-days', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Get remaining days error:', error);
      throw error;
    }
  },

  createLeave: async (formData) => {
    try {
      const response = await api.post('/api/leave/request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create leave error:', error);
      throw error;
    }
  },

  cancelLeave: async (leaveId) => {
    try {
      const response = await api.post(`/api/leave/${leaveId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Cancel leave error:', error);
      throw error;
    }
  },
  // manager

  // Lấy danh sách đơn xin nghỉ chờ duyệt
  getPendingRequests: async (departmentId) => {
    try {
      const response = await api.get('/api/leave/manager/pending-requests', {
        params: { departmentId }
      });
      return response.data;
    } catch (error) {
      console.error('Get pending requests error:', error);
      throw error;
    }
  },

  // Phê duyệt/từ chối đơn xin nghỉ
  approveLeaveRequest: async (leaveId, approverId, approved, comment = '') => {
    try {
      const response = await api.post(`/api/leave/manager/${leaveId}/approve`, null, {
        params: {
          approverId,
          approved,
          comment
        }
      });
      return response.data;
    } catch (error) {
      console.error('Approve leave request error:', error);
      throw error;
    }
  },

  // Thống kê nghỉ phép theo phòng ban
  getDepartmentLeaveStats: async (departmentId, startDate, endDate) => {
    try {
      const response = await api.get('/api/leave/manager/department-stats', {
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

  // Xuất báo cáo nghỉ phép
  exportLeaveReport: async (departmentId, startDate, endDate) => {
    try {
      const response = await api.get('/api/leave/manager/export', {
        params: {
          departmentId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
      });
      // Return trực tiếp base64 string từ response
      return response.data;
    } catch (error) {
      console.error('Export leave report error:', error);
      throw error;
    }
  },

  // Cập nhật số ngày nghỉ phép cho nhân viên
  updateLeaveDays: async (userId, { annualDays, sickDays }) => {
    const response = await api.put('/api/leave/manager/update-leave-days', null, {
      params: {
        userId,
        annualLeaveDays: annualDays,
        sickLeaveDays: sickDays
      }
    });
    return response.data;
  },
  

  // Lấy minh chứng đơn xin nghỉ
  getLeaveEvidence: async (leaveId) => {
    try {
      const response = await api.get(`/api/leave/manager/${leaveId}/evidence`);
      return response.data;
    } catch (error) {
      console.error('Get leave evidence error:', error);
      return null;
    }
  },

  // Lấy danh sách đơn xin nghỉ theo khoảng thời gian
  getLeavesByDateRange: async (departmentId, startDate, endDate, status = null) => {
    try {
      const response = await api.get('/api/leave/manager/leaves', {
        params: {
          departmentId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get leaves by date range error:', error);
      throw error;
    }
  },

  // Lấy chi tiết đơn xin nghỉ
  getLeaveDetails: async (leaveId) => {
    try {
      const response = await api.get(`/api/leave/manager/${leaveId}/details`);
      return response.data;
    } catch (error) {
      console.error('Get leave details error:', error);
      throw error;
    }
  },

  // Lấy thống kê theo loại nghỉ phép
  getLeaveStatsByType: async (departmentId, startDate, endDate) => {
    try {
      const response = await api.get('/api/leave/manager/stats/by-type', {
        params: {
          departmentId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get leave stats by type error:', error);
      throw error;
    }
  },

  // Lấy danh sách nhân viên đang nghỉ
  getCurrentLeaves: async (departmentId) => {
    try {
      const response = await api.get('/api/leave/manager/current-leaves', {
        params: { departmentId }
      });
      return response.data;
    } catch (error) {
      console.error('Get current leaves error:', error);
      throw error;
    }
  },

  // Hủy duyệt đơn xin nghỉ
  revokeApproval: async (leaveId, managerId, reason) => {
    try {
      const response = await api.post(`/api/leave/manager/${leaveId}/revoke`, null, {
        params: {
          managerId,
          reason
        }
      });
      return response.data;
    } catch (error) {
      console.error('Revoke approval error:', error);
      throw error;
    }
  },

  // Xuất báo cáo theo nhân viên
  exportLeaveReportByEmployee: async (userId, startDate, endDate) => {
    try {
      const response = await api.get('/api/leave/manager/export/by-employee', {
        params: {
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Export employee leave report error:', error);
      throw error;
    }
  }

};