import api from './axiosConfig';

export const calendarApi = {
  // Lấy danh sách kỳ đánh giá
  getTimeEvaluations: async () => {
    try {
      const response = await api.get('/api/timeEvaluateRole/list');
      // Transform data để phù hợp với calendar
      return response.data.map(item => ({
        id: item.id,
        name: item.evaluate.name,
        startTime: new Date(item.startDay),
        endTime: new Date(item.endDay),
        type: 'evaluation',
        roleName: item.role.name
      }));
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      throw error;
    }
  },

  // Lấy danh sách hoạt động 
  getActivities: async () => {
    try {
      const response = await api.get('/api/activities');
      // Transform data để phù hợp với calendar
      return response.data.map(activity => ({
        id: activity.id,
        name: activity.activityName,
        startTime: new Date(activity.startDate),
        endTime: new Date(activity.endDate),
        location: activity.location,
        description: activity.description,
        type: 'activity'
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  // Lấy hoạt động theo người dùng
  getUserActivities: async () => {
    try {
      const response = await api.get('/api/activities/acivityUserRegister');
      return response.data.map(activity => ({
        id: activity.id,
        name: activity.activityName,
        startTime: new Date(activity.startDate),
        endTime: new Date(activity.endDate),
        location: activity.location,
        description: activity.description,
        type: 'activity'
      }));
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  },

  // Lấy danh sách cuộc họp của user
  getUserMeetings: async (userId) => {
    try {
      const response = await api.get(`/api/meetings/list/${userId}`);
      return Array.from(response.data || []).map(meeting => ({
        id: meeting.id,
        name: meeting.meetingName,
        startTime: new Date(meeting.startTime),
        endTime: new Date(meeting.endTime),
        type: 'meeting',
        roomId: meeting.roomId,
        description: meeting.description
      }));
    } catch (error) {
      console.log('Meeting API response:', error.response);
      // Nếu là 404 hoặc không có data, trả về mảng rỗng
      if (error.response?.status === 404 || !error.response?.data) {
        return [];
      }
      throw error;
    }
  },
  // Lấy chi tiết cuộc họp
  getMeetingDetails: async (meetingId) => {
    try {
      const response = await api.get(`/api/meetings/${meetingId}`);
      const meeting = response.data;
      return {
        id: meeting.id,
        name: meeting.meetingName,
        startTime: new Date(meeting.startTime),
        endTime: new Date(meeting.endTime),
        description: meeting.description,
        roomId: meeting.roomId,
        participants: meeting.users
      };
    } catch (error) {
      console.error('Error fetching meeting details:', error);
      throw error;
    }
  }
};