import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const DepartmentDetail = ({ department, onAddUser }) => {
  const [newUserId, setNewUserId] = useState('');
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    console.log('Department data:', department);
    if (department?.employees) {
      console.log('Setting employees:', department.employees);
      setEmployees(department.employees);
    }
  }, [department]);

  const handleAddUser = () => {
    if (!newUserId.trim()) {
      Alert.alert('Error', 'Mã nhân viên không được để trống!');
      return;
    }
    onAddUser(newUserId);
    setNewUserId('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Nhân viên trong phòng ban</Text>
        <Text style={styles.departmentName}>{department.name}</Text>
      </View>
  
      {employees && employees.length > 0 ? (
        <FlatList
          style={styles.list}
          data={employees}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.employeeItem}>
              <Text style={styles.employeeName}>{item.name}</Text>
              <Text style={styles.employeeEmail}>{item.email}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>Chưa có nhân viên nào trong phòng ban này</Text>
      )}
  
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập mã nhân viên"
          value={newUserId}
          onChangeText={setNewUserId}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddUser}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    paddingTop: 40, // Thêm padding cho nút close
  },
  headerContainer: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  departmentName: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  list: {
    maxHeight: '70%',
  },
  employeeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  employeeName: {
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontStyle: 'italic',
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  }
});