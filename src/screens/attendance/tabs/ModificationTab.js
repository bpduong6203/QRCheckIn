import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../utils/constants';
import { attendanceApi } from '../../../api/attendanceApi ';

// Helper function to format dates
const formatDateTime = (date) => {
  try {
    return new Date(date).toLocaleString();
  } catch (error) {
    return '-';
  }
};

export default function ModificationTab() {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [checkInTime, setCheckInTime] = useState(new Date());
  const [checkOutTime, setCheckOutTime] = useState(new Date());
  const [showCheckInTimePicker, setShowCheckInTimePicker] = useState(false);
  const [showCheckOutTimePicker, setShowCheckOutTimePicker] = useState(false);
  const [modificationData, setModificationData] = useState({
    date: new Date(),
    time: new Date(),
    reason: '',
    attendanceId: null
  });

  useEffect(() => {
    fetchModificationRequests();
  }, []);

  const fetchModificationRequests = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        Alert.alert('Lỗi', 'Không tìm thấy mã người dùng');
        return;
      }
  
      const response = await attendanceApi.getModificationRequests(userId);
      console.log('Response from get modification requests:', response);
      
      // Sử dụng trực tiếp response data, không cần xử lý approved
      setRequests(response || []);
  
    } catch (error) {
      console.error('Lỗi khi tải yêu cầu chỉnh sửa:', error);
      Alert.alert('Lỗi', 'Không thể tải yêu cầu chỉnh sửa');
    } finally {
      setLoading(false);
    }
  };
  
  const handleShowNewRequest = async () => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        Alert.alert('Lỗi', 'Không tìm thấy mã người dùng');
        return;
      }
      
      // Mở date picker để chọn ngày cần chỉnh sửa trước
      setShowDatePicker(true);
  
    } catch (error) {
      console.error('Lỗi khi tạo yêu cầu mới:', error);
      Alert.alert('Lỗi', 'Không thể chuẩn bị yêu cầu chỉnh sửa');
    }
  };

  const handleDateSelect = async (date) => {
    try {
      setShowDatePicker(false); // Đóng date picker
      setSelectedDate(date); // Lưu ngày được chọn
      
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // Lấy dữ liệu chấm công của ngày đã chọn
      const attendanceData = await attendanceApi.getAttendanceByDate(userId, date);
      if (attendanceData) {
        // Cập nhật dữ liệu và mở modal
        setCheckInTime(new Date(attendanceData.checkInTime));
        setCheckOutTime(attendanceData.checkOutTime ? new Date(attendanceData.checkOutTime) : new Date());
        setModificationData(prev => ({
          ...prev,
          attendanceId: attendanceData.id
        }));
        setShowModal(true);
      } else {
        Alert.alert('Thông báo', 'Không có dữ liệu chấm công cho ngày này');
      }
  
    } catch (error) {
      console.error('Error handling date selection:', error);
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu chấm công');
    }
  };

  const handleSubmitRequest = async () => {
    try {
      // Validate thời gian
      if (checkOutTime < checkInTime) {
        Alert.alert('Lỗi', 'Giờ ra không thể trước giờ vào');
        return;
      }
  
      if (!modificationData.reason.trim()) {
        Alert.alert('Lỗi', 'Vui lòng cung cấp lý do chỉnh sửa');
        return;  
      }
  
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        Alert.alert('Lỗi', 'Không tìm thấy mã người dùng');
        return;
      }
  
      setLoading(true);
  
      // Format datetime theo định dạng yêu cầu của backend: yyyy-MM-dd HH:mm:ss
      const formatDateTime = (date) => {
        return date.toISOString().split('.')[0];
      };
  
      const requestData = {
        userId,
        attendanceId: modificationData.attendanceId,
        checkInTime: formatDateTime(checkInTime),
        checkOutTime: formatDateTime(checkOutTime), 
        reason: modificationData.reason
      };
  
      await attendanceApi.requestModification(requestData);
      
      Alert.alert(
        'Thành công', 
        'Yêu cầu chỉnh sửa đã được gửi thành công',
        [{ 
          text: 'OK',
          onPress: () => {
            setShowModal(false);
            fetchModificationRequests();
          }
        }]
      );
  
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu:', error);
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu chỉnh sửa');
    } finally {
      setLoading(false);
    }
  };

const renderRequest = ({ item }) => {
  const getStatusStyle = () => {
    // Sử dụng status thay vì approved
    switch (item.status) {
      case 'PENDING':
        return styles.statusPending;
      case 'APPROVED':
        return styles.statusApproved;
      case 'REJECTED':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };
  
  const getStatusText = () => {
    // Sử dụng status thay vì approved
    switch (item.status) {
      case 'PENDING':
        return 'Đang Chờ';
      case 'APPROVED':
        return 'Đã Duyệt';
      case 'REJECTED':
        return 'Bị Từ Chối';
      default:
        return 'Đang Chờ';
    }
  };

    return (
      <View style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestDate}>
            {formatDateTime(item.requestTime)}
          </Text>
          <View style={[styles.statusBadge, getStatusStyle()]}>
          <Text style={[
    styles.statusText,
    { color: item.approved === null ? '#856404' : 
            item.approved ? '#155724' : '#721c24' }
  ]}>
    {getStatusText()}
  </Text>
</View>
        </View>

        <View style={styles.requestDetails}>
          <Text style={styles.detailLabel}>Giờ Cũ:</Text>
          <Text style={styles.detailValue}>
            {formatDateTime(item.attendance?.checkInTime)}
          </Text>
          
          <Text style={styles.detailLabel}>Giờ Yêu Cầu:</Text>
          <Text style={styles.detailValue}>
            {formatDateTime(item.requestedCheckInTime)}
          </Text>
          
          <Text style={styles.detailLabel}>Lý Do:</Text>
          <Text style={styles.detailValue}>{item.reason || '-'}</Text>

          {item.approvalComment && (
            <>
              <Text style={styles.detailLabel}>Nhận Xét Quản Lý:</Text>
              <Text style={styles.detailValue}>{item.approvalComment}</Text>
            </>
          )}
        </View>
      </View>
    );
};
  // Rest of the code (render method and styles) remains the same...
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newRequestButton}
        onPress={handleShowNewRequest}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.newRequestButtonText}>Yêu Cầu Chỉnh Sửa Mới</Text>
      </TouchableOpacity>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={fetchModificationRequests}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="history" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có yêu cầu chỉnh sửa</Text>
          </View>
        }
      />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
  <Text style={styles.modalTitle}>Yêu Cầu Chỉnh Sửa Mới</Text>

  <Text style={styles.label}>Ngày: {selectedDate?.toLocaleDateString()}</Text>

  <View style={styles.timeSection}>
    <View style={styles.timeRow}>
      <Text style={styles.timeLabel}>Giờ vào:</Text>
      <TouchableOpacity 
        style={styles.timeButton}
        onPress={() => setShowCheckInTimePicker(true)}
      >
        <Text>{checkInTime.toLocaleTimeString()}</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.timeRow}>
      <Text style={styles.timeLabel}>Giờ ra:</Text>
      <TouchableOpacity 
        style={styles.timeButton}
        onPress={() => setShowCheckOutTimePicker(true)}
      >
        <Text>{checkOutTime.toLocaleTimeString()}</Text>
      </TouchableOpacity>
    </View>
  </View>

  <TextInput
    style={styles.reasonInput}
    placeholder="Nhập lý do chỉnh sửa"
    value={modificationData.reason}
    onChangeText={(text) => setModificationData(prev => ({
      ...prev,
      reason: text
    }))}
    multiline
    numberOfLines={3}
  />

  <View style={styles.modalActions}>
    <TouchableOpacity
      style={[styles.modalButton, styles.cancelButton]}
      onPress={() => setShowModal(false)}
    >
      <Text style={styles.buttonText}>Hủy</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.modalButton, styles.submitButton]}
      onPress={handleSubmitRequest}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.buttonText}>Gửi</Text>
      )}
    </TouchableOpacity>
  </View>
</View>
        </View>
      </Modal>

      <DateTimePickerModal
  isVisible={showDatePicker}
  mode="date"
  onConfirm={handleDateSelect} // Thay đổi trực tiếp gọi handleDateSelect
  onCancel={() => setShowDatePicker(false)}
  maximumDate={new Date()}
/>

<DateTimePickerModal
  isVisible={showCheckInTimePicker}
  mode="time" 
  onConfirm={(time) => {
    setCheckInTime(time);
    setShowCheckInTimePicker(false);
  }}
  onCancel={() => setShowCheckInTimePicker(false)}
/>

<DateTimePickerModal
  isVisible={showCheckOutTimePicker}
  mode="time"
  onConfirm={(time) => {
    setCheckOutTime(time);
    setShowCheckOutTimePicker(false);
  }}
  onCancel={() => setShowCheckOutTimePicker(false)}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  newRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  newRequestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#fff3cd',
  },
  statusApproved: {
    backgroundColor: '#d4edda',
  },
  statusRejected: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requestDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  dateTimeButtonText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
  timeSection: {
    marginVertical: 15,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center', 
    marginVertical: 8,
  },
  timeLabel: {
    width: 80,
    fontSize: 14,
    color: '#666'
  },
  timeButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
});