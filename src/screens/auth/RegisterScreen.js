import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';

// Import components chung
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

// Import API
import { userApi } from '../../api/userApi';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên người dùng');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email hợp lệ');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      const response = await userApi.register({
        name: username,
        email: email,
      });

      if (response === "OK") {
        Alert.alert(
          "Thành công", 
          "Đã tạo tài khoản thành công! Kiểm tra email của bạn để biết thông tin đăng nhập.",
          [
            { 
              text: "OK", 
              onPress: () => navigation.navigate('LoginScreen') 
            }
          ]
        );
      } else {
        Alert.alert("Error", response);
      }
    } catch (error) {
      if (error.response?.data) {
        Alert.alert("Validation Error", Array.isArray(error.response.data) 
          ? error.response.data.join("\n") 
          : error.response.data
        );
      } else {
        Alert.alert("Lỗi", "Đã xảy ra lỗi trong quá trình đăng ký");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo tài khoản</Text>

      <Input
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        containerStyle={styles.inputContainer}
      />

      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        containerStyle={styles.inputContainer}
      />

      <Button
        title="Đăng ký"
        onPress={handleRegister}
        loading={loading}
        style={styles.registerButton}
      />

      <Button
        title="Đã có tài khoản? Đăng nhập"
        onPress={() => navigation.navigate('LoginScreen')}
        type="text"
        style={styles.loginButton}
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
  registerButton: {
    width: '100%',
    marginTop: 20,
  },
  loginButton: {
    marginTop: 15,
  },
});