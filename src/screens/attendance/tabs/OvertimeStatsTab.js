import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text, 
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { attendanceApi } from '../../../api/attendanceApi ';
import { userApi } from '../../../api/userApi';
import { STORAGE_KEYS } from '../../../utils/constants';

export function OvertimeStatsTab() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date()
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [departmentId, setDepartmentId] = useState(null);

  useEffect(() => {
    initializeDepartment();
  }, []);

  useEffect(() => {
    if (departmentId) {
      fetchOvertimeStats();
    }
  }, [dateRange, departmentId]);

  const initializeDepartment = async () => {
    try {
      setLoading(true);
      
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) throw new Error('Không tìm thấy mã người dùng');

      const userRole = await AsyncStorage.getItem(STORAGE_KEYS.ROLE);
      if (userRole !== 'MANAGER' && userRole !== 'ADMIN') {
        throw new Error('Quyền hạn không đủ để xem thống kê làm thêm giờ');
      }

      const deptId = await userApi.getDepartmentId(userId);
      if (!deptId) throw new Error('Không tìm thấy mã phòng ban');

      setDepartmentId(deptId);
    } catch (error) {
      console.error('Lỗi khởi tạo phòng ban:', error);
      setError(error.message);
      Alert.alert('Lỗi', error.message || 'Không thể khởi tạo phòng ban');
    } finally {
      setLoading(false);
    }
  };

const fetchOvertimeStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceApi.getOvertimeStats(
        departmentId,
        dateRange.startDate,
        dateRange.endDate
      );

      setStats(response || []);
    } catch (error) {
      console.error('Lỗi khi tải thống kê làm thêm giờ:', error);
      if (error.response?.status === 403) {
        const errorMessage = 'Bạn không có quyền xem thống kê làm thêm giờ';
        setError(errorMessage);
        Alert.alert('Truy Cập Bị Từ Chối', errorMessage);
      } else {
        const errorMessage = 'Không thể tải thống kê làm thêm giờ';
        setError(errorMessage);
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

const handleRefresh = () => {
    setRefreshing(true);
    fetchOvertimeStats();
  };

const handleDateChange = (date, type) => {
    if (type === 'start') {
      if (date > dateRange.endDate) {
        Alert.alert('Ngày Không Hợp Lệ', 'Ngày bắt đầu không thể sau ngày kết thúc');
        return;
      }
      setDateRange(prev => ({ ...prev, startDate: date }));
      setShowStartPicker(false);
    } else {
      if (date < dateRange.startDate) {
        Alert.alert('Ngày Không Hợp Lệ', 'Ngày kết thúc không thể trước ngày bắt đầu');
        return;
      }
      setDateRange(prev => ({ ...prev, endDate: date }));
      setShowEndPicker(false);
    }
  };

const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tổng Quan</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng Giờ Làm Thêm:</Text>
          <Text style={styles.summaryValue}>
            {stats.reduce((sum, item) => sum + (item.overtimeHours || 0), 0).toFixed(1)} giờ
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Số Nhân Viên Làm Thêm Giờ:</Text>
          <Text style={styles.summaryValue}>{stats.length}</Text>
        </View>
      </View>

      {stats.map((item, index) => (
        <View key={index} style={styles.statCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userId}>Mã: {item.userId}</Text>
            <Text style={styles.department}>{item.departmentName}</Text>
          </View>
          <View style={styles.overtimeInfo}>
            <Text style={styles.overtimeHours}>{item.overtimeHours?.toFixed(1)} giờ</Text>
            <Text style={styles.overtimeDays}>{item.overtimeDays} ngày</Text>
            {item.overtimeHours > 40 && (
              <View style={styles.warningBadge}>
                <MaterialIcons name="warning" size={12} color="#fff" />
                <Text style={styles.warningText}>Làm Thêm Nhiều</Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#007bff"]}
        />
      }
    >
      <View style={styles.dateSelector}>
        <TouchableOpacity 
          style={[styles.dateButton, loading && styles.disabledButton]}
          onPress={() => setShowStartPicker(true)}
          disabled={loading}
        >
          <MaterialIcons name="calendar-today" size={20} color={loading ? '#999' : '#666'} />
          <Text style={[styles.dateText, loading && styles.disabledText]}>
            {dateRange.startDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dateSeparator}>đến</Text>

        <TouchableOpacity 
          style={[styles.dateButton, loading && styles.disabledButton]}
          onPress={() => setShowEndPicker(true)}
          disabled={loading}
        >
          <MaterialIcons name="calendar-today" size={20} color={loading ? '#999' : '#666'} />
          <Text style={[styles.dateText, loading && styles.disabledText]}>
            {dateRange.endDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Đang tải thống kê làm thêm giờ...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchOvertimeStats}
          >
            <Text style={styles.retryText}>Thử Lại</Text>
          </TouchableOpacity>
        </View>
      ) : stats.length > 0 ? (
        renderStats()
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="access-time" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Không có bản ghi làm thêm giờ</Text>
        </View>
      )}

      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="date"
        onConfirm={(date) => handleDateChange(date, 'start')}
        onCancel={() => setShowStartPicker(false)}
        maximumDate={dateRange.endDate}
      />

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="date"
        onConfirm={(date) => handleDateChange(date, 'end')}
        onCancel={() => setShowEndPicker(false)}
        minimumDate={dateRange.startDate}
        maximumDate={new Date()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledButton: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  disabledText: {
    color: '#999',
  },
  dateSeparator: {
    marginHorizontal: 12,
    color: '#666',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  statsContainer: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  department: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  overtimeInfo: {
    alignItems: 'flex-end',
  },
  overtimeHours: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  overtimeDays: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  warningText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});