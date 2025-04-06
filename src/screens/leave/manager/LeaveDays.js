import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Input } from '../../../components/common/Input';
import { leaveApi } from '../../../api/leaveApi';

export default function LeaveDays() {
  const [formData, setFormData] = useState({
    employeeId: '',
    annualDays: '',
    sickDays: '',
    unpaidDays: ''
  });
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    const { employeeId, annualDays, sickDays, unpaidDays } = formData;
    
    if (!employeeId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã nhân viên');
      return false;
    }

    const validateNumber = (value, field) => {
      const num = parseFloat(value);
      if (value.trim() && (isNaN(num) || num < 0 || !Number.isInteger(num))) {
        Alert.alert('Lỗi', `Vui lòng nhập số nguyên hợp lệ cho ${field}`);
        return false;
      }
      return true;
    };

    return validateNumber(annualDays, 'Số ngày nghỉ phép thường niên') &&
           validateNumber(sickDays, 'Số ngày nghỉ ốm') &&
           validateNumber(unpaidDays, 'Số ngày nghỉ không lương');
  };

  const handleUpdate = async () => {
    if (!validateInput()) return;

    try {
      setLoading(true);
      await leaveApi.updateLeaveDays(formData.employeeId, {
        annualDays: parseInt(formData.annualDays) || 0,
        sickDays: parseInt(formData.sickDays) || 0,
        unpaidDays: parseInt(formData.unpaidDays) || 0
      });

      Alert.alert(
        'Thành công',
        'Cập nhật ngày nghỉ phép thành công',
        [{ text: 'OK', onPress: handleReset }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật ngày nghỉ phép. Vui lòng kiểm tra mã nhân viên và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      employeeId: '',
      annualDays: '',
      sickDays: '',
      unpaidDays: ''
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <MaterialIcons name="event-available" size={32} color="#007bff" />
            <Text style={styles.title}>Cập nhật ngày nghỉ phép</Text>
          </View>

          <View style={styles.card}>
            <Input
              label="Mã nhân viên"
              value={formData.employeeId}
              onChangeText={(text) => setFormData(prev => ({ ...prev, employeeId: text }))}
              placeholder="Nhập mã nhân viên"
              keyboardType="number-pad"
              containerStyle={styles.inputContainer}
              autoCapitalize="none"
            />

            <Input
              label="Số ngày nghỉ phép thường niên"
              value={formData.annualDays}
              onChangeText={(text) => setFormData(prev => ({ ...prev, annualDays: text }))}
              placeholder="Nhập số ngày nghỉ phép thường niên"
              keyboardType="number-pad"
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Số ngày nghỉ ốm"
              value={formData.sickDays}
              onChangeText={(text) => setFormData(prev => ({ ...prev, sickDays: text }))}
              placeholder="Nhập số ngày nghỉ ốm"
              keyboardType="number-pad"
              containerStyle={styles.inputContainer}
            />

            <Input
              label="Số ngày nghỉ không lương"
              value={formData.unpaidDays}
              onChangeText={(text) => setFormData(prev => ({ ...prev, unpaidDays: text }))}
              placeholder="Nhập số ngày nghỉ không lương"
              keyboardType="number-pad"
              containerStyle={styles.inputContainer}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.resetButton]}
                onPress={handleReset}
                disabled={loading}
              >
                <MaterialIcons name="refresh" size={20} color="#fff" />
                <Text style={styles.buttonText}>Làm mới</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.updateButton, loading && styles.disabledButton]}
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Cập nhật</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={24} color="#666" />
            <Text style={styles.infoText}>
              Nhập tổng số ngày nghỉ cho từng loại. Để trống nếu không muốn cập nhật danh mục đó. Giá trị phải là số nguyên.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
  inputContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
  },
  resetButton: {
    backgroundColor: '#6c757d',
  },
  updateButton: {
    backgroundColor: '#007bff',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
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
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  }
});