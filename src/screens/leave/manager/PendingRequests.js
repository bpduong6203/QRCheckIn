import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput,
  Platform,
  SafeAreaView,
  Dimensions,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from 'react-native-modal';
import { leaveApi } from '../../../api/leaveApi';
import { userApi } from '../../../api/userApi';
import { STORAGE_KEYS } from '../../../utils/constants';

const screenHeight = Dimensions.get('window').height;

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceUri, setEvidenceUri] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) throw new Error('Không tìm thấy ID người dùng');

      let departmentId = await AsyncStorage.getItem('departmentId');
      
      if (!departmentId) {
        departmentId = await userApi.getDepartmentId(userId);
        if (departmentId) {
          await AsyncStorage.setItem('departmentId', departmentId.toString());
        }
      }

      if (!departmentId) throw new Error('Không tìm thấy ID phòng ban');
      
      const data = await leaveApi.getPendingRequests(departmentId);
      setRequests(data || []);
    } catch (error) {
      console.error('Lỗi:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu cầu đang chờ');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      await leaveApi.approveLeaveRequest(request.id, userId, true);
      Alert.alert(
        'Thành công', 
        'Yêu cầu nghỉ phép đã được chấp nhận',
        [{ text: 'OK', onPress: fetchPendingRequests }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chấp nhận yêu cầu');
    }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      await leaveApi.approveLeaveRequest(selectedRequest.id, userId, false, rejectComment);
      Alert.alert(
        'Thành công', 
        'Yêu cầu nghỉ phép đã bị từ chối',
        [{ text: 'OK', onPress: () => {
          setShowRejectModal(false);
          setRejectComment('');
          setSelectedRequest(null);
          fetchPendingRequests();
        }}]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể từ chối yêu cầu');
    }
  };


  const handleShowEvidence = async (request) => {
    try {
      if (request.evidenceImage) {
        setEvidenceUri(`data:image/png;base64,${request.evidenceImage}`);
        setSelectedRequest(request);
        setShowEvidenceModal(true);
      } else {
        Alert.alert('Thông tin', 'Không có bằng chứng đính kèm');
      }
    } catch (error) {
      console.error('Lỗi tải bằng chứng:', error);
      Alert.alert('Lỗi', 'Không thể tải bằng chứng');
    }
  };

  const renderRequest = (request) => {
    if (!request || !request.id) return null;

    return (
      <View key={request.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.employeeName}>{request.user?.name || 'Không xác định'}</Text>
            <Text style={styles.employeeId}>ID: {request.user?.id || 'Không có'}</Text>
          </View>
          <View style={[
            styles.typeTag, 
            { backgroundColor: request.type === 'ANNUAL_LEAVE' ? '#e7f3ff' : '#ffe7e7' }
          ]}>
            <Text style={[
              styles.typeText, 
              { color: request.type === 'ANNUAL_LEAVE' ? '#007bff' : '#dc3545' }
            ]}>
              {request.type === 'ANNUAL_LEAVE' ? 'Nghỉ Phép Năm' : 'Nghỉ Ốm'}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.dateLabel}>Thời Gian:</Text>
          <Text style={styles.dateText}>
            Từ: {new Date(request.startDate).toLocaleDateString()} {'\n'}
            Đến: {new Date(request.endDate).toLocaleDateString()}
          </Text>
          
          <Text style={styles.reasonLabel}>Lý Do:</Text>
          <Text style={styles.reasonText}>{request.reason || 'Không có lý do'}</Text>

          <View style={styles.evidenceSection}>
            <Text style={styles.evidenceLabel}>Bằng Chứng:</Text>
            {request.evidenceImage ? (
              <TouchableOpacity 
                style={styles.evidenceButton}
                onPress={() => handleShowEvidence(request)}
              >
                <MaterialIcons name="image" size={20} color="#007bff" />
                <Text style={styles.evidenceText}>Xem Bằng Chứng</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noEvidenceText}>Không có bằng chứng</Text>
            )}
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(request)}
          >
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Chấp Nhận</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => {
              setSelectedRequest(request);
              setShowRejectModal(true);
            }}
          >
            <MaterialIcons name="close" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Từ Chối</Text>
          </TouchableOpacity>
        </View>
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
        contentContainerStyle={styles.scrollContent}
      >
        {requests.length > 0 ? (
          requests.map(renderRequest)
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không có yêu cầu đang chờ</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        isVisible={showRejectModal}
        onBackdropPress={() => setShowRejectModal(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={styles.modal}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Từ Chối Yêu Cầu Nghỉ Phép</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Nhập lý do từ chối"
            value={rejectComment}
            onChangeText={setRejectComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowRejectModal(false)}
            >
              <Text style={styles.modalButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.confirmButton]}
              onPress={handleReject}
            >
              <Text style={styles.modalButtonText}>Xác Nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        isVisible={showEvidenceModal}
        onBackdropPress={() => setShowEvidenceModal(false)}
        style={styles.evidenceModal}
      >
        <View style={styles.evidenceModalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowEvidenceModal(false)}
          >
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {evidenceUri && (
            <Image
              source={{ uri: evidenceUri }}
              style={styles.evidenceImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
  scrollContent: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardBody: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
  },
  evidenceSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  evidenceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  evidenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  evidenceText: {
    marginLeft: 6,
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  noEvidenceText: {
    color: '#666',
    fontSize: 14,
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
    borderRadius: 20,
    marginLeft: 12,
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#dc3545',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  evidenceModal: {
    margin: 0,
    justifyContent: 'center',
  },
  evidenceModalContainer: {
    backgroundColor: '#000',
    flex: 1,
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  evidenceImage: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  // Thêm styles phụ trợ cho phần evidence
  evidenceWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  }
});