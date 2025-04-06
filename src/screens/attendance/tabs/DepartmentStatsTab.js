import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { attendanceApi } from '../../../api/attendanceApi ';
import { userApi } from '../../../api/userApi';
import { STORAGE_KEYS } from '../../../utils/constants';

const { width } = Dimensions.get('window');

export function DepartmentStatsTab() {
  const [stats, setStats] = useState({
    totalAttendance: 0,
    onTimeCount: 0,
    lateCount: 0,
    absentCount: 0,
    overtimeCount: 0,
    totalWorkingHours: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Thêm state error

  useEffect(() => {
    fetchDepartmentStats();
  }, []);

  const fetchDepartmentStats = async () => {
    try {
      setLoading(true);
      setError(null); 

      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        throw new Error('Không tìm thấy mã người dùng');
      }

      const departmentId = await userApi.getDepartmentId(userId);
      if (!departmentId) {
        throw new Error('Không tìm thấy mã phòng ban');
      }

      const response = await attendanceApi.getDepartmentStats(
        departmentId,
        new Date(new Date().setDate(1)),
        new Date()
      );

      setStats({
        totalAttendance: response.totalAttendance || 0,
        onTimeCount: response.onTimeCount || 0,
        lateCount: response.lateCount || 0,
        absentCount: response.absentCount || 0,
        overtimeCount: response.overtimeCount || 0,
        totalWorkingHours: response.totalWorkingHours || 0,
      });

    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
      setError(error.message || 'Không thể tải thống kê phòng ban');
      Alert.alert('Lỗi', 'Không thể tải thống kê phòng ban');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
        <RefreshControl 
          refreshing={loading}
          onRefresh={fetchDepartmentStats}
          colors={["#007bff"]}
        />
      }
    >
      <View style={styles.statsGrid}>
        <View style={styles.statsBox}>
          <MaterialIcons name="people" size={24} color="#007bff" />
          <Text style={styles.statsNumber}>{stats.totalAttendance}</Text>
          <Text style={styles.statsLabel}>Tổng Chấm Công</Text>
        </View>
        
        <View style={styles.statsBox}>
          <MaterialIcons name="check-circle" size={24} color="#28a745" />
          <Text style={styles.statsNumber}>{stats.onTimeCount}</Text>
          <Text style={styles.statsLabel}>Đúng Giờ</Text>
        </View>
        
        <View style={styles.statsBox}>
          <MaterialIcons name="schedule" size={24} color="#ffc107" />
          <Text style={styles.statsNumber}>{stats.lateCount}</Text>
          <Text style={styles.statsLabel}>Đi Trễ</Text>
        </View>
        
        <View style={styles.statsBox}>
          <MaterialIcons name="warning" size={24} color="#dc3545" />
          <Text style={styles.statsNumber}>{stats.absentCount}</Text>
          <Text style={styles.statsLabel}>Vắng Mặt</Text>
        </View>

        <View style={styles.statsBox}>
          <MaterialIcons name="timer" size={24} color="#17a2b8" />
          <Text style={styles.statsNumber}>{stats.overtimeCount}</Text>
          <Text style={styles.statsLabel}>Làm Thêm Giờ</Text>
        </View>
        
        <View style={styles.statsBox}>
          <MaterialIcons name="access-time" size={24} color="#6f42c1" />
          <Text style={styles.statsNumber}>{stats.totalWorkingHours.toFixed(1)}</Text>
          <Text style={styles.statsLabel}>Tổng Giờ Làm</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tổng Kết Tháng</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tỉ Lệ Chấm Công:</Text>
          <Text style={styles.summaryValue}>
            {((stats.onTimeCount / (stats.totalAttendance || 1)) * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tỉ Lệ Đi Trễ:</Text>
          <Text style={styles.summaryValue}>
            {((stats.lateCount / (stats.totalAttendance || 1)) * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Giờ Làm Trung Bình:</Text>
          <Text style={styles.summaryValue}>
            {(stats.totalWorkingHours / (stats.totalAttendance || 1)).toFixed(1)} giờ
          </Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={24} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchDepartmentStats}
          >
            <Text style={styles.retryText}>Thử Lại</Text>
          </TouchableOpacity>
        </View>
      )}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'space-between',
  },
  statsBox: {
    width: (width - 36) / 2,
    backgroundColor: '#fff',
    padding: 16,
    margin: 4,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 8,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  }
});