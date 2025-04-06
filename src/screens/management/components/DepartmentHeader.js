import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { MaterialIcons } from '@expo/vector-icons';

export const DepartmentHeader = ({ title, onAddDepartment }) => {
  const [newDepartment, setNewDepartment] = useState('');

  const handleAdd = () => {
    if (!newDepartment.trim()) {
      Alert.alert('Error', 'Tên phòng ban không được để trống!');
      return;
    }
    
    if (onAddDepartment) {  // Kiểm tra xem prop có tồn tại không
      onAddDepartment(newDepartment);
      setNewDepartment('');
    } else {
      Alert.alert('Error', 'Không thể thêm phòng ban');
    }
  };

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title || 'Quản Lý Phòng Ban'}</Text>
      <View style={styles.addContainer}>
        <Input
          value={newDepartment}
          onChangeText={setNewDepartment}
          placeholder="Nhập tên phòng ban mới"
          containerStyle={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center'
  }
});