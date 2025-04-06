import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Dialog, Portal, Button } from 'react-native-paper';

export const DepartmentDialog = ({
  visible,
  department,
  onDismiss,
  onSave
}) => {
  const [departmentName, setDepartmentName] = useState('');

  useEffect(() => {
    if (department) {
      setDepartmentName(department.name);
    }
  }, [department]);

  const handleSave = () => {
    if (!departmentName.trim()) {
      Alert.alert('Error', 'Tên phòng ban không được để trống!');
      return;
    }
    onSave(department?.id, departmentName);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Cập Nhật Phòng Ban</Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={styles.input}
            placeholder="Tên phòng ban mới"
            value={departmentName}
            onChangeText={setDepartmentName}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Hủy</Button>
          <Button onPress={handleSave}>Lưu</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
  }
});