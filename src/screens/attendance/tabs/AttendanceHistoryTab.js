import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Input } from '../../../components/common/Input';
import { attendanceApi } from '../../../api/attendanceApi ';
import { userApi } from '../../../api/userApi';
import { STORAGE_KEYS } from '../../../utils/constants';

export function AttendanceHistoryTab() {
  const [searchParams, setSearchParams] = useState({
    userId: '',
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date(),
    status: '',
  });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [departmentId, setDepartmentId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeDepartmentId();
  }, []);

  const initializeDepartmentId = async () => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) throw new Error('Không tìm thấy mã người dùng');

      const deptId = await userApi.getDepartmentId(userId);
      if (!deptId) throw new Error('Không tìm thấy mã phòng ban');

      setDepartmentId(deptId);
      fetchHistory(deptId);
    } catch (error) {
      console.error('Lỗi khởi tạo:', error);
      setError(error.message);
    }
  };

const fetchHistory = async (deptId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await attendanceApi.searchAttendance({
        userId: searchParams.userId,
        departmentId: deptId || departmentId,
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        status: searchParams.status,
        page: 0,
        size: 20
      });

      setRecords(response || []);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error);
      setError('Không thể tải lịch sử chấm công');
      Alert.alert('Lỗi', 'Không thể tải lịch sử chấm công');
    } finally {
      setLoading(false);
    }
  };

const handleSearch = () => {
    if (!departmentId) {
      Alert.alert('Lỗi', 'Phòng ban chưa được khởi tạo');
      return;
    }
    fetchHistory();
  };

const handleDateSelect = (date, type) => {
    setSearchParams(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: date
    }));

    if (type === 'start') {
      setShowStartPicker(false);
    } else {
      setShowEndPicker(false);
    }
  };

const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="history" size={48} color="#ccc" />
      <Text style={styles.emptyText}>Không có bản ghi chấm công</Text>
    </View>
  );

const renderRecord = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.employeeName}>{item.userName}</Text>
          <Text style={styles.employeeId}>ID: {item.userId}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.timeRow}>
          <MaterialIcons name="login" size={16} color="#666" />
          <Text style={styles.timeText}>
            {new Date(item.checkInTime).toLocaleTimeString()}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.checkInTime).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.timeRow}>
          <MaterialIcons name="logout" size={16} color="#666" />
          <Text style={styles.timeText}>
            {item.checkOutTime ? 
              `${new Date(item.checkOutTime).toLocaleTimeString()} ` : 
              'Chưa chấm giờ ra'}
          </Text>
          {item.checkOutTime && (
            <Text style={styles.dateText}>
              {new Date(item.checkOutTime).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {item.workingHours > 0 && (
        <View style={styles.workingHours}>
          <MaterialIcons name="access-time" size={16} color="#007bff" />
          <Text style={styles.hoursText}>
            {item.workingHours.toFixed(1)} giờ
          </Text>
          {item.isOvertime && (
            <View style={styles.overtimeBadge}>
              <Text style={styles.overtimeText}>Làm Thêm</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return '#28a745';
      case 'LATE': return '#ffc107';
      case 'ABSENT': return '#dc3545';
      default: return '#6c757d';
    }
  };


  if (loading && !records.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Input
          placeholder="Tìm kiếm theo ID nhân viên"
          value={searchParams.userId}
          onChangeText={(text) => setSearchParams(prev => ({ ...prev, userId: text }))}
          style={styles.searchInput}
        />

        <View style={styles.dateRow}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <MaterialIcons name="event" size={20} color="#666" />
            <Text style={styles.dateText}>
              {searchParams.startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>Đến</Text>

          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <MaterialIcons name="event" size={20} color="#666" />
            <Text style={styles.dateText}>
              {searchParams.endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="search" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>Tìm kiếm</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          !records.length && styles.emptyList
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleSearch}
            colors={["#007bff"]}
          />
        }
        ListEmptyComponent={renderEmptyList}
      />

      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="date"
        onConfirm={(date) => handleDateSelect(date, 'start')}
        onCancel={() => setShowStartPicker(false)}
        maximumDate={searchParams.endDate}
      />

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="date"
        onConfirm={(date) => handleDateSelect(date, 'end')}
        onCancel={() => setShowEndPicker(false)}
        minimumDate={searchParams.startDate}
        maximumDate={new Date()}
      />
    </View>
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
  },
  searchSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  dateSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    opacity: (props) => props.disabled ? 0.7 : 1,
  },
  searchButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  workingHours: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  hoursText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
  },
  overtimeBadge: {
    marginLeft: 8,
    backgroundColor: '#dc3545',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  overtimeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});