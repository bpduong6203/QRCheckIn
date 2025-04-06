import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { leaveApi } from '../../api/leaveApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constants';

export default function LeaveHistoryScreen() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveHistory = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        throw new Error('Không tìm thấy ID người dùng');
      }

      console.log('Lấy lịch sử nghỉ phép cho người dùng:', userId);
      const data = await leaveApi.getMyLeaves(userId);
      console.log('Dữ liệu lịch sử nghỉ phép:', data);
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Lỗi lấy lịch sử:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử nghỉ phép');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  const handleCancelRequest = async (id) => {
    try {
      await leaveApi.cancelLeave(id);
      Alert.alert('Thành công', 'Đã hủy yêu cầu nghỉ phép');
      fetchLeaveHistory();
    } catch (error) {
      console.error('Lỗi hủy yêu cầu:', error);
      Alert.alert('Lỗi', 'Không thể hủy yêu cầu nghỉ phép');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderLeaveRequest = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <MaterialIcons 
            name={item.type === 'ANNUAL_LEAVE' ? 'event' : 'healing'} 
            size={24} 
            color="#007bff" 
          />
          <Text style={styles.typeText}>
            {item.type === 'ANNUAL_LEAVE' ? 'Nghỉ Phép Năm' : 'Nghỉ Ốm'}
          </Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: item.status === 'PENDING' ? '#ffc107' :
                           item.status === 'APPROVED' ? '#28a745' :
                           item.status === 'REJECTED' ? '#dc3545' :
                           '#ccc'
          }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.dateText}>
          Từ: {formatDate(item.startDate)} Đến: {formatDate(item.endDate)}
        </Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      {item.status === 'PENDING' && (
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]}
          onPress={() => Alert.alert(
            'Hủy Yêu Cầu',
            'Bạn có chắc muốn hủy yêu cầu này?',
            [
              { text: 'Không', style: 'cancel' },
              { text: 'Có', onPress: () => handleCancelRequest(item.id) }
            ]
          )}
        >
          <MaterialIcons name="close" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Hủy Yêu Cầu</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (leaveRequests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="event-busy" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Không có yêu cầu nghỉ phép</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leaveRequests}
        renderItem={renderLeaveRequest}
        keyExtractor={item => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchLeaveHistory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  listContainer: {
    padding: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginVertical: 8
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1'
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  typeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  cardBody: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  dateText: {
    fontSize: 14,
    color: '#666'
  },
  reasonText: {
    fontSize: 16,
    marginTop: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    marginTop: 12
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 8
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16
  }
});