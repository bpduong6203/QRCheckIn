import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { STORAGE_KEYS } from '../../utils/constants';
import { leaveApi } from '../../api/leaveApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/axiosConfig';
import { userApi } from '../../api/userApi';

// Helper function to calculate leave days
const calculateLeaveDays = (start, end) => {
  const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
  const diffDays = Math.round(Math.abs((end - start) / oneDay)) + 1; // +1 to include start day
  return diffDays;
};

export default function LeaveRequestScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [remainingLeave, setRemainingLeave] = useState({
    annualLeaveRemaining: 0,
    sickLeaveRemaining: 0,
    unpaidLeaveRemaining: 0,
    totalLeaveTaken: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'ANNUAL_LEAVE',
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [evidence, setEvidence] = useState(null);
  
  // Thêm trạng thái cho lỗi và số ngày nghỉ yêu cầu
  const [error, setError] = useState('');
  const [requestedDays, setRequestedDays] = useState(1); // Ít nhất 1 ngày

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    // Tính toán lại số ngày nghỉ mỗi khi ngày bắt đầu, ngày kết thúc hoặc loại nghỉ thay đổi
    const days = calculateLeaveDays(formData.startDate, formData.endDate);
    setRequestedDays(days);

    // Xác định số ngày nghỉ còn lại dựa trên loại nghỉ
    let remainingDays = 0;
    if (formData.leaveType === 'ANNUAL_LEAVE') {
      remainingDays = remainingLeave.annualLeaveRemaining;
    } else if (formData.leaveType === 'SICK_LEAVE') {
      remainingDays = remainingLeave.sickLeaveRemaining;
    } else if (formData.leaveType === 'UNPAID_LEAVE') {
      remainingDays = Infinity; // Không giới hạn số ngày nghỉ không lương
    }

    // Kiểm tra và thiết lập thông báo lỗi nếu cần
    if (days > remainingDays) {
      setError(`Số ngày nghỉ yêu cầu (${days} ngày) vượt quá số ngày nghỉ còn lại (${remainingDays} ngày).`);
    } else {
      setError('');
    }

  }, [formData.startDate, formData.endDate, formData.leaveType, remainingLeave]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!id) {
        throw new Error('Không tìm thấy ID người dùng');
      }
      setUserId(id);
      const remainingDays = await leaveApi.getRemainingDays(id);
      setRemainingLeave(remainingDays);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu người dùng:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const leaveTypes = [
    { id: 'ANNUAL_LEAVE', label: 'Nghỉ Phép Năm', color: '#007bff' },
    { id: 'SICK_LEAVE', label: 'Nghỉ Ốm', color: '#28a745' },
    { id: 'UNPAID_LEAVE', label: 'Nghỉ Không Lương', color: '#dc3545' }
  ];

  const handleConfirmDate = (date, type) => {
    if (type === 'start') {
      setFormData(prev => ({ ...prev, startDate: date }));
      setShowStartPicker(false);
    } else {
      setFormData(prev => ({ ...prev, endDate: date }));
      setShowEndPicker(false);
    }
  };

  const handleUploadEvidence = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Chúng tôi cần quyền truy cập vào thư viện ảnh để tiếp tục!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        setEvidence(result.assets[0]);
      }
    } catch (error) {
      console.log('Lỗi chọn hình ảnh:', error);
      Alert.alert('Lỗi', 'Không thể tải lên hình ảnh. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!userId) {
        throw new Error('Không tìm thấy ID người dùng');
      }

      if (formData.endDate < formData.startDate) {
        throw new Error('Ngày kết thúc không thể trước ngày bắt đầu');
      }

      // Tính số ngày nghỉ yêu cầu
      const days = calculateLeaveDays(formData.startDate, formData.endDate);

      // Xác định số ngày nghỉ còn lại dựa trên loại nghỉ
      let remainingDays = 0;
      if (formData.leaveType === 'ANNUAL_LEAVE') {
        remainingDays = remainingLeave.annualLeaveRemaining;
      } else if (formData.leaveType === 'SICK_LEAVE') {
        remainingDays = remainingLeave.sickLeaveRemaining;
      } else if (formData.leaveType === 'UNPAID_LEAVE') {
        remainingDays = Infinity; // Không giới hạn số ngày nghỉ không lương
      }

      // So sánh số ngày nghỉ yêu cầu với số ngày nghỉ còn lại
      if (days > remainingDays) {
        throw new Error(`Số ngày nghỉ yêu cầu vượt quá số ngày nghỉ còn lại (${remainingDays} ngày)`);
      }

      const formDataToSend = new FormData();

      const leaveData = {
        user: {
          id: userId
        },
        type: formData.leaveType,
        startDate: formData.startDate.toISOString().split('.')[0],
        endDate: formData.endDate.toISOString().split('.')[0],
        reason: formData.reason,
        status: 'PENDING'
      };

      formDataToSend.append('leave', JSON.stringify(leaveData));

      if (evidence) {
        const fileName = evidence.fileName || 'bangchung.jpg';
        const fileType = evidence.mimeType || 'image/jpeg';
        const file = {
          uri: evidence.uri,
          type: fileType,
          name: fileName
        };
        formDataToSend.append('evidence', file);
      }

      const response = await leaveApi.createLeave(formDataToSend);

      Alert.alert(
        'Thành công',
        'Yêu cầu nghỉ phép đã được gửi thành công',
        [{ 
          text: 'OK',
          onPress: () => {
            if (navigation && navigation.goBack) {
              navigation.goBack();
            }
          }
        }]
      );
    } catch (error) {
      console.error('Lỗi gửi yêu cầu:', error);
      Alert.alert('Lỗi', error.message || 'Không thể gửi yêu cầu nghỉ phép');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name="event-note" size={32} color="#007bff" />
        <Text style={styles.headerTitle}>Nộp đơn xin nghỉ phép</Text>
      </View>

      {/* Leave Balance Info */}
      <View style={styles.balanceContainer}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceNumber}>
            {remainingLeave.annualLeaveRemaining || 0}
          </Text>
          <Text style={styles.balanceLabel}>Nghỉ phép năm còn lại</Text>
        </View>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceNumber}>
            {remainingLeave.sickLeaveRemaining || 0}
          </Text>
          <Text style={styles.balanceLabel}>Nghỉ ốm còn lại</Text>
        </View>
        {/* Uncomment if you want to display unpaid leave remaining
        <View style={styles.balanceItem}>
          <Text style={styles.balanceNumber}>
            {remainingLeave.unpaidLeaveRemaining || 0}
          </Text>
          <Text style={styles.balanceLabel}>Nghỉ Không Lương còn lại</Text>
        </View>
        */}
      </View>

      {/* Leave Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loại nghỉ phép</Text>
        <View style={styles.typeContainer}>
          {leaveTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                formData.leaveType === type.id && styles.typeButtonActive,
                { borderColor: type.color }
              ]}
              onPress={() => setFormData(prev => ({ ...prev, leaveType: type.id }))}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  formData.leaveType === type.id && styles.typeButtonTextActive,
                  { color: formData.leaveType === type.id ? '#fff' : type.color }
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thời gian nghỉ phép</Text>
        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <MaterialIcons name="event" size={24} color="#666" />
            <Text style={styles.dateText}>
              {formData.startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dateSeparator}>to</Text>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <MaterialIcons name="event" size={24} color="#666" />
            <Text style={styles.dateText}>
              {formData.endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Hiển thị số ngày nghỉ yêu cầu */}
        <Text style={styles.requestedDaysText}>
          Số ngày nghỉ yêu cầu: {requestedDays} ngày
        </Text>

        {/* Hiển thị thông báo lỗi nếu có */}
        {error !== '' && (
          <Text style={styles.errorMessage}>{error}</Text>
        )}
      </View>

      {/* Reason Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lý do</Text>
        <Input
          multiline
          numberOfLines={4}
          placeholder="Vui lòng cung cấp lý do bạn xin nghỉ phép..."
          value={formData.reason}
          onChangeText={(text) => setFormData(prev => ({ ...prev, reason: text }))}
          style={styles.reasonInput}
        />
      </View>

      {/* Evidence Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minh chứng hỗ trợ (Tùy chọn)</Text>
        <View style={styles.evidenceContainer}>
          {evidence ? (
            <View style={styles.evidencePreview}>
              <Image 
                source={{ uri: evidence.uri }} 
                style={styles.evidenceImage} 
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setEvidence(null)}
              >
                <MaterialIcons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadEvidence}
            >
              <MaterialIcons name="file-upload" size={32} color="#666" />
              <Text style={styles.uploadText}>Tải hình lên</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Submit Button */}
      <Button
        title="Gửi yêu cầu"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={loading}
        disabled={loading || error !== '' || formData.reason.trim() === ''}
      />

      {/* Date Pickers */}
      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="date"
        onConfirm={(date) => handleConfirmDate(date, 'start')}
        onCancel={() => setShowStartPicker(false)}
      />
      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="date"
        onConfirm={(date) => handleConfirmDate(date, 'end')}
        onCancel={() => setShowEndPicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  balanceContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  balanceNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginVertical: 10,
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  dateSeparator: {
    marginHorizontal: 10,
    color: '#666',
  },
  requestedDaysText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  reasonInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  evidenceContainer: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 15,
  },
  evidencePreview: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4/3,
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#dc3545',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    margin: 15,
    marginTop: 20,
  },
});
