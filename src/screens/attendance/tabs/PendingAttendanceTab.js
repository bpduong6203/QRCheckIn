import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { attendanceApi } from '../../../api/attendanceApi ';
import { STORAGE_KEYS } from '../../../utils/constants';
import { userApi } from '../../../api/userApi';

export function PendingAttendanceTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    // Cập nhật lại danh sách khi có thay đổi về trạng thái
    if (requestStatus) {
      fetchPendingRequests();
      setRequestStatus('');
    }
  }, [requestStatus]);

  const fetchPendingRequests = async () => {
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

      const response = await attendanceApi.getPendingRequests(departmentId);
      setRequests(response || []);
    } catch (error) {
      console.error('Lỗi khi tải yêu cầu:', error);
      setError(error.message);
      Alert.alert('Lỗi', 'Không thể tải yêu cầu chờ xử lý');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setLoading(true);
      const managerId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);

      console.log('Manager ID:', managerId);
    console.log('Request payload:', {
      requestId,
      managerId,
      approved: true,
      comment
    });
      
      const response = await attendanceApi.approveModificationRequest(
        requestId,
        managerId,
        true,
        comment
      );
  
      if (response) {
        setRequestStatus('approved');
        Alert.alert(
          'Thành công', 
          'Yêu cầu đã được phê duyệt thành công',
          [{ text: 'OK', onPress: () => {
            setSelectedRequest(null);
            setComment('');
          }}]
        );
      }
    } catch (error) {
      console.error('Lỗi khi phê duyệt:', error);
      let errorMessage = 'Không thể phê duyệt yêu cầu';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện hành động này.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  

  const handleReject = async (requestId) => {
    if (!comment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng cung cấp lý do từ chối');
      return;
    }
    
    try {
      setLoading(true);
      const managerId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      
      const response = await attendanceApi.approveModificationRequest(
        requestId, 
        managerId,
        false,
        comment
      );
  
      if (response) {
        setRequestStatus('rejected');
        Alert.alert(
          'Thành công', 
          'Yêu cầu đã bị từ chối thành công',
          [{ text: 'OK', onPress: () => {
            setSelectedRequest(null); 
            setComment('');
          }}]
        );
      }
    } catch (error) {
      console.error('Lỗi khi từ chối:', error);
      Alert.alert('Lỗi', 'Không thể từ chối yêu cầu');
    } finally {
      setLoading(false);
    }
  };

const renderRequest = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.employeeName}>{item.requestedBy.name}</Text>
          <Text style={styles.employeeId}>ID: {item.requestedBy.id}</Text>
        </View>
        <Text style={styles.requestDate}>
          {new Date(item.requestTime).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.timeRow}>
          <Text style={styles.label}>Giờ Vào Hiện Tại:</Text>
          <Text style={styles.time}>
            {new Date(item.attendance.checkInTime).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.label}>Giờ Vào Yêu Cầu:</Text>
          <Text style={styles.time}>
            {new Date(item.requestedCheckInTime).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.label}>Giờ Ra Hiện Tại:</Text>
          <Text style={styles.time}>
            {item.attendance.checkOutTime ? 
              new Date(item.attendance.checkOutTime).toLocaleTimeString() : 
              'Chưa chấm giờ ra'
            }
          </Text>
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.label}>Giờ Ra Yêu Cầu:</Text>
          <Text style={styles.time}>
            {new Date(item.requestedCheckOutTime).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.reasonLabel}>Lý Do:</Text>
        <Text style={styles.reason}>{item.reason}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => setSelectedRequest(item)}
        >
          <MaterialIcons name="rate-review" size={20} color="#fff" />
          <Text style={styles.buttonText}>Xem Xét</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="inbox" size={48} color="#ccc" />
      <Text style={styles.emptyText}>Không có yêu cầu đang chờ xử lý</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchPendingRequests}
        ListEmptyComponent={renderEmptyList}
      />

      <Modal
        isVisible={!!selectedRequest}
        onBackdropPress={() => {
          if (!loading) {
            setSelectedRequest(null);
            setComment('');
          }
        }}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Yêu cầu đánh giá</Text>
          
          <Input
            label="Bình luận"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            placeholder="Nhập bình luận (cần thiết để từ chối)"
            editable={!loading}
          />

          <View style={styles.modalActions}>
            <Button
              title="Từ chối"
              onPress={() => handleReject(selectedRequest?.id)}
              style={[styles.modalButton, styles.rejectButton]}
              disabled={loading}
            />
            <Button
              title="Chấp thuận"
              onPress={() => handleApprove(selectedRequest?.id)}
              style={[styles.modalButton, styles.approveButton]}
              disabled={loading}
            />
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007bff" />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    padding: 16,
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
  requestDate: {
    fontSize: 14,
    color: '#666',
  },
  cardBody: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    width: 140,
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  reasonLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 0.48,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
});