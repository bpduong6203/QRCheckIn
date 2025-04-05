export const STORAGE_KEYS = {
  USER_ID: 'userId',
  ROLE: 'userRole'
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const FEATURES = {
  ADMIN: [
    {
      id: 1,
      name: 'Quản lý tài khoản',
      icon: 'people',
      color: '#007bff',
      route: 'AccountManagementScreen'
    },
    {
      id: 2,
      name: 'Xem báo cáo',
      icon: 'assessment',
      color: '#28a745',
      route: 'ViewReports'
    },
    {
      id: 3,
      name: 'Quản lý chấm công',
      icon: 'schedule',
      color: '#ffc107',
      route: 'ManageAttendance'
    },
    {
      id: 4,
      name: 'Quản lý tiền lương',
      icon: 'attach-money',
      color: '#17a2b8',
      route: 'ManagePayroll'
    },
    {
      id: 5,
      name: 'Quản lý phòng ban',
      icon: 'business',
      color: '#6f42c1',
      route: 'DepartmentScreen'
    },
    {
      id: 6,
      name: 'Đăng xuất',
      icon: 'exit-to-app',
      color: '#dc3545',
      route: 'Logout'
    }
  ],
  MANAGER: [
    {
      id: 1,
      name: 'Quản lý nghỉ phép',
      icon: 'event-busy',
      color: '#ffc107',
      route: 'LeaveManagerScreen'
    },
    {
      id: 2,
      name: 'Xem báo cáo',
      icon: 'assessment',
      color: '#28a745',
      route: 'ViewReports'
    },
    {
      id: 3,
      name: 'Quản lý chấm công',
      icon: 'schedule',
      color: '#ffc107',
      route: 'AttendanceManagerScreen'
    },
    {
      id: 4,
      name: 'Quản lý nhiệm vụvụ',
      icon: 'assignment',
      color: '#17a2b8',
      route: 'TaskManagement'
    },
    {
      id: 5,
      name: 'Thông tin phòng ban',
      icon: 'business',
      color: '#6f42c1',
      route: 'DepartmentScreen'
    },
    {
      id: 6,
      name: 'Đăng xuất',
      icon: 'exit-to-app',
      color: '#dc3545',
      route: 'Logout'
    }
  ],
  EMPLOYEE: [
    {
      id: 1,
      name: 'Chấm công',
      icon: 'schedule',
      color: '#007bff',
      route: 'AttendanceMainScreen'
    },
    {
      id: 2,
      name: 'Nhiệm vụ',
      icon: 'assignment',
      color: '#28a745',
      route: 'TaskScreen'
    },
    {
      id: 3,
      name: 'Xin nghỉ phép',
      icon: 'event-busy',
      color: '#ffc107',
      route: 'LeaveScreen'
    },
    {
      id: 4,
      name: 'Phiếu lương',
      icon: 'receipt',
      color: '#17a2b8',
      route: 'PayslipScreen'
    },
    {
      id: 5,
      name: 'Thư mục nhóm',
      icon: 'people',
      color: '#6f42c1',
      route: 'TeamDirectory'
    },
    {
      id: 6,
      name: 'Đăng xuất',
      icon: 'exit-to-app',
      color: '#dc3545',
      route: 'Logout'
    }
  ]
};