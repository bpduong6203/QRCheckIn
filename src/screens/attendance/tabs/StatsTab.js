import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../utils/constants';
import { attendanceApi } from '../../../api/attendanceApi ';

// Helper functions
const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return '-';
  }
};

const formatDateForAPI = (date) => {
  const d = new Date(date);
  // Reset the hours and keep the UTC time
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split('.')[0];
};

const StatCard = ({ icon, title, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const DateRangeSelector = ({ dateRange, onStartDatePress, onEndDatePress }) => (
  <View style={styles.dateRangeContainer}>
    <TouchableOpacity style={styles.dateButton} onPress={onStartDatePress}>
      <MaterialIcons name="calendar-today" size={20} color="#666" />
      <View style={styles.dateTextContainer}>
        <Text style={styles.dateButtonText}>
          {formatDate(dateRange.startDate)}
        </Text>
      </View>
    </TouchableOpacity>

    <View style={styles.separatorContainer}>
      <Text style={styles.dateRangeSeparator}>đến</Text>
    </View>

    <TouchableOpacity style={styles.dateButton} onPress={onEndDatePress}>
      <MaterialIcons name="calendar-today" size={20} color="#666" />
      <View style={styles.dateTextContainer}>
        <Text style={styles.dateButtonText}>
          {formatDate(dateRange.endDate)}
        </Text>
      </View>
    </TouchableOpacity>
  </View>
);

export default function StatsTab() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [userId, setUserId] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date()
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    initializeUserId();
    return () => {
      setStats(null);
      setError(null);
    };
  }, []);

  const initializeUserId = async () => {
    try {
      const id = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!id) throw new Error('Không tìm thấy ID người dùng');
      setUserId(id);
    } catch (error) {
      setError('Không thể khởi tạo dữ liệu người dùng');
      Alert.alert('Lỗi', 'Không thể khởi tạo dữ liệu người dùng');
    }
  };

  const fetchStats = useCallback(async () => {
    if (!userId) return;
  
    try {
      setError(null);
      setLoading(true);
  
      // Set first day of current month
      const start = new Date(dateRange.startDate);
      start.setDate(1); // Always start from first day of month
      const end = new Date(dateRange.endDate);
  
      // Format dates properly for API
      const startStr = `${formatDateForAPI(start)}`;
      const endStr = `${formatDateForAPI(end)}`;
  
      console.log('Fetching stats with dates:', {startStr, endStr});
  
      const response = await attendanceApi.getUserAttendanceSummary(
        userId,
        startStr,
        endStr
      );
  
      console.log('Summary response:', response);
  
      setStats({
        totalDays: response?.totalDays ?? 0,
        presentDays: response?.presentDays ?? 0,
        lateDays: response?.lateDays ?? 0,
        absentDays: response?.absentDays ?? 0,
        totalWorkingHours: response?.totalWorkingHours ?? 0,
        averageWorkingHours: response?.averageWorkingHours ?? 0,
        overtimeDays: response?.overtimeDays ?? 0
      });
  
    } catch (error) {
      console.error('Lỗi lấy số liệu thống kê:', error);
      setError(error.message || 'Không thể lấy số liệu thống kê');
      setStats({
        totalDays: 0,
        presentDays: 0,
        lateDays: 0, 
        absentDays: 0,
        totalWorkingHours: 0,
        averageWorkingHours: 0,
        overtimeDays: 0
      });
    } finally {
      setLoading(false);
    }
  }, [userId, dateRange]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchStats]);

  const handleDateChange = async (date, isStartDate) => {
    try {
      if (isStartDate) {
        if (date > dateRange.endDate) {
          Alert.alert('Lỗi', 'Ngày bắt đầu không thể sau ngày kết thúc');
          return;
        }
      } else {
        if (date < dateRange.startDate) {
          Alert.alert('Lỗi', 'Ngày kết thúc không thể trước ngày bắt đầu');
          return;
        }
      }

      setDateRange(prev => ({
        ...prev,
        [isStartDate ? 'startDate' : 'endDate']: date
      }));
    } catch (error) {
      Alert.alert('Error', `Failed to set ${isStartDate ? 'start' : 'end'} date`);
    } finally {
      if (isStartDate) {
        setShowStartPicker(false);
      } else {
        setShowEndPicker(false);
      }
    }
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchStats} />
      }
    >
      <DateRangeSelector 
        dateRange={dateRange}
        onStartDatePress={() => setShowStartPicker(true)}
        onEndDatePress={() => setShowEndPicker(true)}
      />

      {error && (
        <View style={styles.errorCard}>
          <MaterialIcons name="error" size={24} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchStats}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {stats && (
        <View style={styles.statsContainer}>
          {!stats.hasCheckedOut && (
            <View style={styles.warningCard}>
              <MaterialIcons name="info" size={24} color="#ffc107" />
              <Text style={styles.warningText}>
              Số liệu thống kê sẽ có sau khi check-out
              </Text>
            </View>
          )}

          <StatCard
            icon="event-available"
            title="Tổng số ngày"
            value={stats.totalDays}
            color="#007bff"
          />
         <StatCard
  icon="check-circle"
  title="Có mặt"  // Changed from "Ngày Đi Làm" 
  value={stats.presentDays}
  color="#28a745"
/>
<StatCard
  icon="schedule"
  title="Đi muộn"  // Changed from "Ngày Đi Trễ"
  value={stats.lateDays}
  color="#ffc107"
/>
<StatCard
  icon="cancel"
  title="Vắng mặt" // Changed from "Ngày Vắng Mặt"
  value={stats.absentDays}
  color="#dc3545"
/>
<StatCard
  icon="access-time"
  title="Tổng Giờ Làm"
  value={`${(stats.totalWorkingHours).toFixed(1)}h`}
  color="#6f42c1"
/>
<StatCard
  icon="trending-up"
  title="Trung Bình Giờ/Ngày"
  value={`${(stats.averageWorkingHours).toFixed(1)}h`}
  color="#17a2b8"
/>
<StatCard
  icon="alarm-on"
  title="Ngày Làm Thêm"
  value={stats.overtimeDays}
  color="#fd7e14"
/>

        </View>
      )}

      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="date"
        onConfirm={(date) => handleDateChange(date, true)}
        onCancel={() => setShowStartPicker(false)}
        maximumDate={dateRange.endDate}
      />

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="date"
        onConfirm={(date) => handleDateChange(date, false)}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  dateRangeSeparator: {
    marginHorizontal: 12,
    color: '#666',
  },
  statsContainer: {
    padding: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  warningText: {
    marginLeft: 8,
    color: '#856404',
    fontSize: 14,
    flex: 1,
  },
  errorCard: {
    backgroundColor: '#f8d7da',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  errorText: {
    marginLeft: 8,
    color: '#721c24',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  dateTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  separatorContainer: {
    marginHorizontal: 12,
  },
});