import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import components chung
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

// Import API
import { userApi } from '../../api/userApi';

// Import constants nếu cần
import { STORAGE_KEYS } from '../../utils/constants';

export default function LoginScreen({ navigation }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // src/screens/auth/LoginScreen.js
  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await userApi.login(userId, password);
      console.log('Login response:', response);
      
      const { token, id, role, status } = response;
  
      if (status === "Login Success" && id && role) {
        // Lưu token và thông tin user
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.USER_ID, id.toString()],
          [STORAGE_KEYS.ROLE, role],
          ['accessToken', token]
        ]);
        
        // Điều hướng sau khi lưu thành công
        navigation.replace('Dashboard', { role });
      } else {
        Alert.alert('Lỗi', 'Phản hồi đăng nhập không hợp lệ');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Đăng nhập không thành công',
        error.message || 'Please check your credentials and try again'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password functionality
    Alert.alert('Coming Soon', 'This feature will be available soon');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      <Input
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
        containerStyle={styles.inputContainer}
      />
      
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        containerStyle={styles.inputContainer}
      />

      <Button
        title="Đăng nhập"
        onPress={handleLogin}
        loading={loading}
        style={styles.loginButton}
      />

      <Button
        title="Quên mật khẩu?"
        onPress={() => navigation.navigate('ForgotPasswordScreen')}
        type="text"
        style={styles.forgotButton}
      />

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  loginButton: {
    width: '100%',
    marginTop: 20,
  },
  forgotButton: {
    marginTop: 15,
  },
  registerButton: {
    marginTop: 20,
  }
});