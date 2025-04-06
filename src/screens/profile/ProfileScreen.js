import React, { useState, useEffect } from 'react';
import { View, ScrollView, Image, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// Import components
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ProfileImage } from './components/ProfileImage';
import { ProfileForm } from './components/ProfileForm';

// Import API và constants
import { userApi } from '../../api/userApi';
import { STORAGE_KEYS } from '../../utils/constants';

export default function ProfileScreen() {
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    birthDay: '',
    nationality: '',
    homeTown: '',
    address: '',
    email: '',
    phoneNumber: '',
    sex: '',
    image: null,
  });
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        Alert.alert('Lỗi', 'Không tìm thấy User ID');
        return;
      }

      setLoading(true);
      const data = await userApi.getProfile(userId);
      setUserData(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu người dùng');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.images, 
        base64: true,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
  
      if (!result.canceled) {
        const base64Image = result.assets[0].base64;
        setUserData(prev => ({ ...prev, image: base64Image }));
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không chọn được hình ảnh');
      console.error('Error selecting image:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await userApi.updateProfile(userData);
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật thành công!');
      setEditable(false);
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data || 'Không cập nhật được hồ sơ');
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    if (editable) {
      handleUpdate();
    } else {
      setEditable(true);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ProfileImage 
        imageUri={userData.image} 
        onPress={handleChooseImage}
      />

      <ProfileForm 
        userData={userData}
        editable={editable}
        onChange={handleInputChange}
      />

      <Button
        title={editable ? 'Lưu' : 'Chỉnh thông tin'}
        onPress={toggleEdit}
        loading={loading}
        style={styles.updateButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  updateButton: {
    width: '90%',
    marginTop: 30,
  },
});