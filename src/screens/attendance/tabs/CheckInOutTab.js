import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
  Vibration,
  Linking
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { STORAGE_KEYS } from '../../../utils/constants';
import { attendanceApi } from '../../../api/attendanceApi ';
import removeAccents from 'remove-accents'; 

export default function CheckInOutTab() {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [currentAction, setCurrentAction] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scanned, setScanned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location states
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  // Cập nhật đồng hồ mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tải dữ liệu người dùng và kiểm tra quyền location
  useEffect(() => {
    loadUserData();
    checkLocationPermission();
  }, []);

  useEffect(() => {
    if (currentAction) {
      console.log('Current Action:', currentAction);
      console.log('User ID:', userId);
    }
  }, [currentAction, userId]);

  useEffect(() => {
    const cleanup = () => {
      setScanned(false);
      setIsSubmitting(false);
      setLoading(false);
    };
    return cleanup;
  }, []);

  // Kiểm tra và xin quyền truy cập vị trí
  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        getCurrentLocation();
      } else {
        setLocationError('Quyền truy cập vị trí bị từ chối');
        Alert.alert(
          'Cần quyền truy cập vị trí',
          'Vui lòng bật dịch vụ vị trí để sử dụng tính năng chấm công',
          [
            {
              text: 'Mở Cài Đặt',
              onPress: () => Linking.openSettings(),
            },
            {
              text: 'Hủy',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Lỗi quyền truy cập vị trí:', error);
      setLocationError('Không thể lấy quyền truy cập vị trí');
    }
  };

  // Lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const [addressInfo] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const formattedAddress = [
        addressInfo.street,
        addressInfo.district,
        addressInfo.city,
        addressInfo.region,
        addressInfo.country,
      ]
        .filter(Boolean)
        .join(', ');

      // Xóa dấu tiếng Việt
      const finalAddress = removeAccents(formattedAddress);

      setLocation({
        coords: currentLocation.coords,
        address: finalAddress,
      });
    } catch (error) {
      console.error('Lỗi lấy vị trí:', error);
      setLocationError('Không thể lấy vị trí hiện tại');
    }
  };

  // Tải dữ liệu user và trạng thái chấm công hôm nay
  const loadUserData = async () => {
    try {
      const id = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!id) {
        throw new Error('Không tìm thấy mã người dùng');
      }
      setUserId(id);

      const todayStatus = await attendanceApi.getTodayAttendance(id);
      if (todayStatus) {
        setCheckInTime(todayStatus.checkInTime);
        setCheckOutTime(todayStatus.checkOutTime);
      } else {
        setCheckInTime(null);
        setCheckOutTime(null);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu người dùng:', error);
      Alert.alert('Lỗi', 'Không thể tải trạng thái chấm công');
    }
  };

  // Xử lý nhấn nút Check In / Check Out
  const handleAction = async (action) => {
    if (!locationPermission) {
      Alert.alert('Lỗi', 'Cần quyền truy cập vị trí');
      return;
    }

    if (!location) {
      Alert.alert('Lỗi', 'Đang chờ dữ liệu vị trí');
      return;
    }

    try {
      console.log('Bắt đầu hành động:', action);
      setCurrentAction(action);
      setLoading(true);

      const qrContent = await attendanceApi.generateCode(userId, action);
      console.log('Nội dung mã QR đã tạo:', qrContent);

      if (qrContent) {
        setShowMethodModal(true);
      } else {
        throw new Error('Không thể tạo mã');
      }
    } catch (error) {
      console.error('Lỗi hành động:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tạo mã chấm công');
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra và xin quyền camera
  const checkAndRequestPermissions = async () => {
    try {
      if (!permission) {
        const result = await requestPermission();
        console.log('Kết quả yêu cầu quyền:', result);

        if (!result.granted) {
          Alert.alert(
            'Cần quyền truy cập camera',
            'Vui lòng cấp quyền truy cập camera để quét mã QR',
            [
              {
                text: 'Mở Cài Đặt',
                onPress: () => {
                  Linking.openSettings();
                },
              },
              {
                text: 'Hủy',
                style: 'cancel',
              },
            ]
          );
        }
        return result.granted;
      }
      return permission.granted;
    } catch (error) {
      console.error('Lỗi quyền truy cập:', error);
      Alert.alert('Lỗi', 'Không thể yêu cầu quyền truy cập camera');
      return false;
    }
  };

  // Chọn phương thức (QR / Nhập code)
  const handleMethodSelect = async (method) => {
    setShowMethodModal(false);

    if (method === 'QR') {
      const hasPermission = await checkAndRequestPermissions();
      if (hasPermission) {
        setTimeout(() => {
          setShowScanner(true);
        }, 300);
      }
    } else {
      setAttendanceCode('');
      setShowCodeInput(true);
    }
  };

  // Xử lý nhập code
  const handleSubmit = async (code) => {
    if (isSubmitting) return;

    if (!code || code.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã 6 số hợp lệ');
      return;
    }

    if (!location?.coords) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin vị trí');
      return;
    }

    try {
      setIsSubmitting(true);
      setLoading(true);

      const data = {
        userId,
        code,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: location.address || '',
      };

      console.log('Submitting data:', {
        ...data,
        action: currentAction,
      });

      // Gọi API checkIn/checkOut
      const response =
        currentAction === 'CHECK_IN'
          ? await attendanceApi.checkIn(data)
          : await attendanceApi.checkOut(data);

      Alert.alert(
        'Thành công',
        `${
          currentAction === 'CHECK_IN' ? 'Chấm công vào' : 'Chấm công ra'
        } thành công`
      );

      // Reset
      setAttendanceCode('');
      setShowCodeInput(false);
      setShowMethodModal(false);
      setScanned(false);

      // Reload data
      await loadUserData();
    } catch (error) {
      console.error('Submit error:', error);
      if (error.message === 'Invalid or expired code') {
        Alert.alert(
          'Lỗi',
          'Mã đã hết hạn hoặc không hợp lệ. Vui lòng tạo mã mới và thử lại.'
        );
        setShowCodeInput(false);
        setShowMethodModal(false);
        setAttendanceCode('');
      } else {
        Alert.alert('Lỗi', error.message || 'Không thể xử lý yêu cầu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // Biến cờ để tránh quét nhiều lần
  let scanInProgress = false;

  // Xử lý quét QR
  const handleScan = async (result) => {
    if (scanInProgress || scanned || !result?.data) return;

    try {
      scanInProgress = true;
      setScanned(true);
      setLoading(true);

      const { data } = result;
      const parts = data.split(':');
      if (parts.length !== 3) throw new Error('Định dạng mã QR không hợp lệ');

      const [scannedUserId, code, type] = parts;
      if (scannedUserId !== userId || type !== currentAction) {
        throw new Error('Mã QR không hợp lệ');
      }

      setShowScanner(false);
      await handleSubmit(code);
    } catch (error) {
      console.error('Lỗi quét mã:', error);
      Alert.alert('Lỗi', error.message);
    } finally {
      setTimeout(() => {
        scanInProgress = false;
        setScanned(false);
        setLoading(false);
      }, 3000);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Thời gian hiện tại */}
      <View style={styles.timeCard}>
        <Text style={styles.timeLabel}>Thời gian hiện tại:</Text>
        <Text style={styles.timeValue}>
          {currentTime.toLocaleTimeString()}
        </Text>
        <Text style={styles.dateValue}>
          {currentTime.toLocaleDateString()}
        </Text>
      </View>

      {/* Thông tin vị trí */}
      <View style={styles.locationCard}>
        <Text style={styles.statusTitle}>Thông tin vị trí</Text>
        {locationError ? (
          <View style={styles.locationError}>
            <MaterialIcons name="error" size={24} color="#dc3545" />
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        ) : !location ? (
          <View style={styles.loadingLocation}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={styles.loadingText}>Đang lấy vị trí...</Text>
          </View>
        ) : (
          <View style={styles.locationInfo}>
            <View style={styles.coordinatesContainer}>
              <View style={styles.coordinate}>
                <Text style={styles.coordinateLabel}>Vĩ độ:</Text>
                <Text style={styles.coordinateValue}>
                  {location.coords.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.coordinate}>
                <Text style={styles.coordinateLabel}>Kinh độ:</Text>
                <Text style={styles.coordinateValue}>
                  {location.coords.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
            <View style={styles.addressContainer}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.addressText}>{location.address}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Tình hình hôm nay */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Tình hình hôm nay</Text>
        <View style={styles.statusDetails}>
          <View style={styles.statusItem}>
            <MaterialIcons
              name="login"
              size={24}
              color={checkInTime ? '#28a745' : '#666'}
            />
            <Text style={styles.statusLabel}>Check In</Text>
            <Text
              style={[styles.statusTime, checkInTime && styles.statusActive]}
            >
              {checkInTime
                ? new Date(checkInTime).toLocaleTimeString()
                : '--:--'}
            </Text>
          </View>

          <View style={styles.statusDivider} />

          <View style={styles.statusItem}>
            <MaterialIcons
              name="logout"
              size={24}
              color={checkOutTime ? '#28a745' : '#666'}
            />
            <Text style={styles.statusLabel}>Check Out</Text>
            <Text
              style={[styles.statusTime, checkOutTime && styles.statusActive]}
            >
              {checkOutTime
                ? new Date(checkOutTime).toLocaleTimeString()
                : '--:--'}
            </Text>
          </View>
        </View>
      </View>

      {/* Nút check in/out */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.checkInButton,
            (!!checkInTime || loading) && styles.disabledButton,
          ]}
          onPress={() => handleAction('CHECK_IN')}
          disabled={!!checkInTime || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="login" size={24} color="#fff" />
              <Text style={styles.buttonText}>Check In</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.checkOutButton]}
          onPress={() => handleAction('CHECK_OUT')}
          disabled={!!checkOutTime || !checkInTime}
        >
          <MaterialIcons name="logout" size={24} color="#fff" />
          <Text style={styles.buttonText}>Check Out</Text>
        </TouchableOpacity>
      </View>

      {/* Modal chọn phương thức (QR / CODE) */}
      <Modal
        visible={showMethodModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMethodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Method</Text>

            <TouchableOpacity
              style={styles.methodButton}
              onPress={() => handleMethodSelect('QR')}
            >
              <MaterialIcons name="qr-code-scanner" size={32} color="#007bff" />
              <Text style={styles.methodText}>Scan QR Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.methodButton}
              onPress={() => handleMethodSelect('CODE')}
            >
              <MaterialIcons name="keyboard" size={32} color="#007bff" />
              <Text style={styles.methodText}>Enter Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowMethodModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal nhập mã code */}
      <Modal
        visible={showCodeInput}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCodeInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Code</Text>

            <TextInput
              style={styles.codeInput}
              value={attendanceCode}
              onChangeText={setAttendanceCode}
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              maxLength={6}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={() => handleSubmit(attendanceCode)}
                disabled={!attendanceCode || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCodeInput(false);
                  setAttendanceCode('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal quét QR */}
      <Modal visible={showScanner} transparent={false} animationType="slide">
        <View style={styles.scannerContainer}>
          {!permission ? (
            <View style={styles.centerContainer}>
              <Text>Requesting camera permission...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.centerContainer}>
              <Text>No access to camera</Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestPermission}
              >
                <Text>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraWrapper}>
              {showScanner && (
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barCodeScannerSettings={{
                    barCodeTypes: ['qr'],
                  }}
                  // Chú ý: Prop sự kiện của expo-camera cũ là onBarCodeScanned
                  onBarcodeScanned={!scanned ? handleScan : undefined}
                >
                  <View style={styles.scannerOverlay}>
                    <View style={styles.scannerFrame}>
                      <View style={[styles.cornerTL, styles.corner]} />
                      <View style={[styles.cornerTR, styles.corner]} />
                      <View style={[styles.cornerBL, styles.corner]} />
                      <View style={[styles.cornerBR, styles.corner]} />
                    </View>
                    <Text style={styles.scannerText}>
                      {scanned ? 'Processing...' : 'Align QR code within frame'}
                    </Text>
                    <TouchableOpacity
                      style={styles.closeScannerButton}
                      onPress={() => {
                        setScanned(false);
                        setShowScanner(false);
                      }}
                    >
                      <MaterialIcons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </CameraView>
              )}
            </View>
          )}
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
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
  timeCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 8,
  },
  dateValue: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  statusTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 4,
  },
  statusActive: {
    color: '#28a745',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  checkInButton: {
    backgroundColor: '#28a745',
  },
  checkOutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  methodText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 12,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#007bff',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
  },
  cancelText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '500',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#00ff00',
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
  },
  closeScannerButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  locationCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
  },
  locationError: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff3f3',
    borderRadius: 8,
  },
  errorText: {
    marginLeft: 8,
    color: '#dc3545',
    fontSize: 14,
  },
  loadingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  locationInfo: {
    paddingVertical: 8,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  coordinate: {
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 12,
    color: '#666',
  },
  coordinateValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
