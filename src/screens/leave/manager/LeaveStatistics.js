import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { LineChart, BarChart } from 'react-native-chart-kit';
import { leaveApi } from '../../../api/leaveApi';
import { STORAGE_KEYS } from '../../../utils/constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 40;

const defaultChartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
  style: {
    borderRadius: 16
  },
  barPercentage: 0.8
};

export default function LeaveStatistics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1),
    endDate: new Date()
  });

  const [stats, setStats] = useState({
    totalEmployees: 0,
    onLeaveCount: 0,
    pendingCount: 0,
    averageLeaveDays: 0,
    leaveTypeStats: [],
    monthlyStats: []
  });

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const departmentId = await AsyncStorage.getItem('departmentId');
      
      if (!departmentId) {
        throw new Error('Không tìm thấy ID phòng ban');
      }

      const response = await leaveApi.getDepartmentLeaveStats(
        parseInt(departmentId),
        dateRange.startDate,
        dateRange.endDate
      );

      if (response) {
        setStats({
          totalEmployees: response.totalEmployees || 0,
          onLeaveCount: response.onLeaveCount || 0,
          pendingCount: response.pendingCount || 0,
          averageLeaveDays: response.averageLeaveDays || 0,
          leaveTypeStats: response.leaveTypeStats || [],
          monthlyStats: response.monthlyStats || []
        });
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
      Alert.alert('Lỗi', 'Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const departmentId = await AsyncStorage.getItem('departmentId');
      if (!departmentId) throw new Error('Không tìm thấy ID phòng ban');
  
      const base64Data = await leaveApi.exportLeaveReport(
        parseInt(departmentId),
        dateRange.startDate,
        dateRange.endDate
      );
  
      if (!base64Data) {
        throw new Error('Không có dữ liệu trả về');
      }
  
      const fileUri = `${FileSystem.documentDirectory}leave_report_${new Date().getTime()}.xlsx`;
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64
      });
  
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Lỗi', 'Chia sẻ không khả dụng trên thiết bị này');
        return;
      }
  
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Xuất báo cáo nghỉ phép',
        UTI: 'com.microsoft.excel.xlsx'
      });
  
    } catch (error) {
      console.error('Lỗi khi xuất:', error);
      Alert.alert('Lỗi', error.message || 'Không thể xuất báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const renderBarChart = () => {
    if (!stats?.leaveTypeStats?.length) return null;

    const data = {
      labels: stats.leaveTypeStats.map(stat => stat.type),
      datasets: [{
        data: stats.leaveTypeStats.map(stat => stat.count)
      }]
    };

    return (
      <View style={styles.chartWrapper}>
        <BarChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={defaultChartConfig}
          verticalLabelRotation={30}
          showValuesOnTopOfBars
          fromZero
          style={styles.chart}
        />
      </View>
    );
  };

  const renderLineChart = () => {
    if (!stats?.monthlyStats?.length) return null;

    const data = {
      labels: stats.monthlyStats.map(stat => stat.month),
      datasets: [{
        data: stats.monthlyStats.map(stat => stat.leaves)
      }]
    };

    return (
      <View style={styles.chartWrapper}>
        <LineChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={defaultChartConfig}
          bezier
          fromZero
          style={styles.chart}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Date Range Selector */}
        <View style={styles.dateContainer}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#666" />
            <Text style={styles.dateText}>
              {dateRange.startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>Đến</Text>

          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#666" />
            <Text style={styles.dateText}>
              {dateRange.endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{stats.totalEmployees}</Text>
            <Text style={styles.summaryLabel}>Tổng số nhân viên</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{stats.onLeaveCount}</Text>
            <Text style={styles.summaryLabel}>Hiện đang nghỉ phép</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{stats.pendingCount}</Text>
            <Text style={styles.summaryLabel}>Yêu cầu đang chờ xử lý</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {stats.averageLeaveDays.toFixed(1)}
            </Text>
            <Text style={styles.summaryLabel}>Ngày nghỉ phép trung bình</Text>
          </View>
        </View>

        {/* Charts */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Phân phối loại nghỉ phép</Text>
          {stats.leaveTypeStats && stats.leaveTypeStats.length > 0 ? (
            renderBarChart()
          ) : (
            <Text style={styles.noDataText}>Không có dữ liệu loại nghỉ phép nào có sẵn</Text>
          )}
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Xu hướng nghỉ phép hàng tháng</Text>
          {stats.monthlyStats && stats.monthlyStats.length > 0 ? (
            renderLineChart()
          ) : (
            <Text style={styles.noDataText}>Không có dữ liệu hàng tháng</Text>
          )}
        </View>

        {/* Export Button */}
        <TouchableOpacity 
          style={styles.exportButton}
          onPress={handleExport}
        >
          <MaterialIcons name="file-download" size={24} color="#fff" />
          <Text style={styles.exportButtonText}>Xuất báo cáo</Text>
        </TouchableOpacity>

        {/* Date Pickers */}
        <DateTimePickerModal
          isVisible={showStartPicker}
          mode="date"
          onConfirm={(date) => {
            setDateRange(prev => ({ ...prev, startDate: date }));
            setShowStartPicker(false);
          }}
          onCancel={() => setShowStartPicker(false)}
        />

        <DateTimePickerModal
          isVisible={showEndPicker}
          mode="date"
          onConfirm={(date) => {
            setDateRange(prev => ({ ...prev, endDate: date }));
            setShowEndPicker(false);
          }}
          onCancel={() => setShowEndPicker(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
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
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  dateSeparator: {
    marginHorizontal: 12,
    color: '#666',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
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
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
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
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  chart: {
    borderRadius: 16,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    padding: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
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
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});