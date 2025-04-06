import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../utils/constants';
import { attendanceApi } from '../../../api/attendanceApi ';

const PAGE_SIZE = 10;

// Helper functions wrapped in Text components
const FormattedDate = ({ date }) => {
  try {
    const d = new Date(date);
    const formatted = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return <Text>{formatted}</Text>;
  } catch (error) {
    return <Text>-</Text>;
  }
};

const FormattedTime = ({ date }) => {
  try {
    const d = new Date(date);
    const formatted = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return <Text>{formatted}</Text>;
  } catch (error) {
    return <Text>-</Text>;
  }
};

const setTimeForDate = (date, hours, minutes, seconds, milliseconds) => {
  const d = new Date(date);
  d.setHours(hours, minutes, seconds, milliseconds);
  return d;
};

const StatusBadge = ({ status }) => {
  const statusStyle = getStatusBadgeStyle(status);
  return (
    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
      <Text style={[styles.statusText, { color: statusStyle.color }]}>
        {statusStyle.text}
      </Text>
    </View>
  );
};


const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'PRESENT':
      return {
        backgroundColor: '#e7f3ff',
        color: '#007bff',
        text: 'Có mặt'
      };
    case 'LATE':
      return {
        backgroundColor: '#fff3cd', 
        color: '#ffc107',
        text: 'Đi muộn'
      };
    case 'ABSENT':
      return {
        backgroundColor: '#f8d7da',
        color: '#dc3545',
        text: 'Vắng mặt'
      };
    case 'ON_LEAVE':
      return {
        backgroundColor: '#e2e3e5',
        color: '#6c757d',
        text: 'Nghỉ phép'
      };
    default:
      return {
        backgroundColor: '#e9ecef',
        color: '#6c757d',
        text: status
      };
  }
};



const WorkingHours = ({ hours }) => (
  <View style={styles.workHoursContainer}>
    <MaterialIcons name="access-time" size={16} color="#666" style={styles.workHoursIcon} />
    <Text style={styles.workHours}>
      {`${Number(hours).toFixed(2)} giờ`}
    </Text>
  </View>
);

const ListEmptyComponent = () => (
  <View style={styles.emptyContainer}>
    <MaterialIcons name="history" size={64} color="#ccc" />
    <Text style={styles.emptyText}>Không tìm thấy chấm công</Text>
  </View>
);

const ListFooterComponent = ({ loading, hasData }) => {
  if (loading && hasData) {
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007bff" />
      </View>
    );
  }
  return null;
};

const AttendanceCard = ({ item }) => (
  <View style={styles.historyCard}>
    <View style={styles.dateContainer}>
      <MaterialIcons name="event" size={24} color="#007bff" />
      <Text style={styles.dateText}>
        <FormattedDate date={item.checkInTime} />
      </Text>
    </View>

    <View style={styles.timeContainer}>
      <View style={styles.timeBox}>
        <Text style={styles.timeLabel}>Giờ vào</Text>
        <Text style={styles.timeValue}>
          <FormattedTime date={item.checkInTime} />
        </Text>
      </View>

      <MaterialIcons name="arrow-forward" size={20} color="#666" />

      <View style={styles.timeBox}>
        <Text style={styles.timeLabel}>Giờ ra</Text>
        <Text style={styles.timeValue}>
          {item.checkOutTime ? <FormattedTime date={item.checkOutTime} /> : <Text>-</Text>}
        </Text>
      </View>
    </View>

    <View style={styles.detailsContainer}>
      <StatusBadge status={item.status} />
      {item.workingHours > 0 && <WorkingHours hours={item.workingHours} />}
    </View>
  </View>
);

const DateRangeSelector = ({ dateRange, onStartDatePress, onEndDatePress }) => (
  <View style={styles.dateRangeContainer}>
    <TouchableOpacity 
      style={styles.dateButton}
      onPress={onStartDatePress}
    >
      <MaterialIcons name="calendar-today" size={20} color="#666" />
      <Text style={styles.dateButtonText}>
        <FormattedDate date={dateRange.startDate} />
      </Text>
    </TouchableOpacity>

    <Text style={styles.dateRangeSeparator}>Đến</Text>
    
    <TouchableOpacity 
      style={styles.dateButton}
      onPress={onEndDatePress}
    >
      <MaterialIcons name="calendar-today" size={20} color="#666" />
      <Text style={styles.dateButtonText}>
        <FormattedDate date={dateRange.endDate} />
      </Text>
    </TouchableOpacity>
  </View>
);

export default function HistoryTab() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchAttendanceHistory(true);
  }, [dateRange]);

  const fetchAttendanceHistory = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setPage(0);
        setHasMore(true);
      }
      
      if (!hasMore && !isRefreshing) return;
      
      setLoading(true);
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        Alert.alert('Lỗi', 'Không tìm thấy mã người dùng');
        return;
      }

      const startDate = setTimeForDate(dateRange.startDate, 0, 0, 0, 0);
      const endDate = setTimeForDate(dateRange.endDate, 23, 59, 59, 999);

      const response = await attendanceApi.getAttendanceHistory(
        userId,
        startDate.toISOString().split('.')[0],
        endDate.toISOString().split('.')[0],
        isRefreshing ? 0 : page,
        PAGE_SIZE
      );

      setHasMore(response && response.length === PAGE_SIZE);

      setHistory(prevHistory => {
        if (isRefreshing || page === 0) {
          return response || [];
        }
        return [...prevHistory, ...(response || [])];
      });

    } catch (error) {
      console.error('Lỗi lấy lịch sử:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử chấm công');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendanceHistory(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
      fetchAttendanceHistory();
    }
  };

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
      
      setPage(0);
      setHasMore(true);
      
    } catch (error) {
      Alert.alert('Lỗi', `Không thể thiết lập ${isStartDate ? 'start' : 'end'} date`);
    } finally {
      if (isStartDate) {
        setShowStartPicker(false);
      } else {
        setShowEndPicker(false);
      }
    }
  };

  if (loading && history.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <DateRangeSelector 
        dateRange={dateRange}
        onStartDatePress={() => setShowStartPicker(true)}
        onEndDatePress={() => setShowEndPicker(true)}
      />

      <FlatList
        data={history}
        renderItem={({ item }) => <AttendanceCard item={item} />}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          <ListFooterComponent loading={loading} hasData={history.length > 0} />
        )}
        ListEmptyComponent={ListEmptyComponent}
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  listContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeBox: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  workHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workHoursIcon: {
    marginRight: 4,
  },
  workHours: {
    fontSize: 14,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
  },
});