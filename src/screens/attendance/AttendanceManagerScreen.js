import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { PendingAttendanceTab } from './tabs/PendingAttendanceTab';
import { DepartmentStatsTab } from './tabs/DepartmentStatsTab';
import { AttendanceHistoryTab } from './tabs/AttendanceHistoryTab';
import { OvertimeStatsTab } from './tabs/OvertimeStatsTab';
import { attendanceApi } from '../../api/attendanceApi ';
import { userApi } from '../../api/userApi';
import { STORAGE_KEYS } from '../../utils/constants';

export default function AttendanceManagerScreen() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [departmentId, setDepartmentId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeDepartment();
  }, []);

  const initializeDepartment = async () => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) throw new Error('Không tìm thấy ID người dùng');

      const userRole = await AsyncStorage.getItem(STORAGE_KEYS.ROLE);
      if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
        throw new Error('Không đủ quyền để truy cập vào quản lý chấm công');
      }

      const deptId = await userApi.getDepartmentId(userId);
      if (!deptId) throw new Error('Không tìm thấy ID phòng ban');

      setDepartmentId(deptId);
    } catch (error) {
      console.error('Lỗi khởi tạo phòng ban:', error);
      setError(error.message);
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const startDate = new Date();
      startDate.setDate(1);
      const endDate = new Date();

      const report = await attendanceApi.exportReport(
        departmentId,
        startDate,
        endDate
      );

      const fileName = `attendance_report_${Date.now()}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const reader = new FileReader();
      reader.readAsDataURL(report);
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        await FileSystem.writeAsStringAsync(fileUri, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Lưu Báo Cáo Chấm Công',
          });
          Alert.alert('Thành công', 'Báo cáo đã được tải xuống thành công');
        } else {
          Alert.alert('Lỗi', 'Chia sẻ không khả dụng trên thiết bị này');
        }
      };
    } catch (error) {
      console.error('Lỗi xuất báo cáo:', error);
      Alert.alert('Lỗi', 'Không thể xuất báo cáo chấm công');
    } finally {
      setLoading(false);
    }
  };

const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DepartmentStatsTab />;
      case 'pending':
        return <PendingAttendanceTab />;
      case 'history':
        return <AttendanceHistoryTab />;
      // case 'overtime':
      //   return <OvertimeStatsTab />;
      default:
        return null;
    }
};

if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#dc3545" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
}

return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản Lý Chấm Công</Text>
        <TouchableOpacity 
          style={[styles.exportButton, loading && styles.disabledButton]}
          onPress={handleExport}
          disabled={loading || !departmentId}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="file-download" size={24} color="#fff" />
              <Text style={styles.exportButtonText}>Xuất Báo Cáo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <MaterialIcons 
            name="dashboard" 
            size={24} 
            color={activeTab === 'overview' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'overview' && styles.activeTabText
          ]}>
            Tổng Quan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <MaterialIcons 
            name="pending-actions" 
            size={24} 
            color={activeTab === 'pending' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'pending' && styles.activeTabText
          ]}>
            Đang Chờ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <MaterialIcons 
            name="history" 
            size={24} 
            color={activeTab === 'history' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'history' && styles.activeTabText
          ]}>
            Lịch Sử
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity 
          style={[styles.tab, activeTab === 'overtime' && styles.activeTab]}
          onPress={() => setActiveTab('overtime')}
        >
          <MaterialIcons 
            name="access-time" 
            size={24} 
            color={activeTab === 'overtime' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'overtime' && styles.activeTabText
          ]}>
            Tăng ca
          </Text>
        </TouchableOpacity> */}
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  exportButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
});