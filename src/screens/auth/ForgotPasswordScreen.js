import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Import components
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

// Import API
import { userApi } from '../../api/userApi';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCode = async () => {
    if (!userId.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập User ID');
      return;
    }

    try {
      setLoading(true);
      await userApi.sendCode(userId);
      Alert.alert(
        'Thành công',
        'Mã xác minh đã được gửi đến email của bạn',
        [{ text: 'OK', onPress: () => setStep(2) }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không gửi được mã xác minh. Vui lòng kiểm tra User ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác minh');
      return;
    }

    try {
      setLoading(true);
      const isValid = await userApi.checkSendCode(verificationCode);
      if (isValid) {
        setStep(3);
      } else {
        Alert.alert('Lỗi', 'Mã xác minh không hợp lệ');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xác minh mã');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền vào tất cả các trường');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu không khớp');
      return;
    }

    try {
      setLoading(true);
      await userApi.resetPassword(userId, newPassword, confirmPassword);
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được đặt lại thành công',
        [{ text: 'OK', onPress: () => navigation.navigate('LoginScreen') }]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name="lock-reset" size={64} color="#007bff" />
      <Text style={styles.title}>Đặt lại mật khẩu</Text>

      {step === 1 && (
        <View style={styles.formContainer}>
          <Input
            placeholder="User ID"
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
            containerStyle={styles.input}
          />
          <Button
            title="Gửi mã xác minh"
            onPress={handleSendCode}
            loading={loading}
            style={styles.button}
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Nhập mã xác minh</Text>
          <Input
            placeholder="Mã xác minh"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="numeric"
            containerStyle={styles.input}
          />
          <Button
            title="Xác minh mã"
            onPress={handleVerifyCode}
            loading={loading}
            style={styles.button}
          />
        </View>
      )}

      {step === 3 && (
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Nhập mật khẩu mới</Text>
          <Input
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            containerStyle={styles.input}
          />
          <Input
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            containerStyle={styles.input}
          />
          <Button
            title="Đặt lại mật khẩukhẩu"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.button}
          />
        </View>
      )}

      <Button
        title="Trở về trang đăng nhập"
        onPress={() => navigation.goBack()}
        type="text"
        style={styles.backButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
  backButton: {
    marginTop: 20,
  },
});