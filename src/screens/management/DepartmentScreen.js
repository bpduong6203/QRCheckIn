import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import { Provider } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { DepartmentHeader } from './components/DepartmentHeader';
import { DepartmentList } from './components/DepartmentList';
import { DepartmentDialog } from './components/DepartmentDialog';
import { DepartmentDetail } from './components/DepartmentDetail';
import { departmentApi } from '../../api/departmentApi';

export default function DepartmentScreen() {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await departmentApi.getDepartments();
      // Fetch thêm thông tin nhân viên cho mỗi phòng ban
      const departmentsWithEmployees = await Promise.all(
        data.map(async (dept) => {
          const employees = await departmentApi.getDepartmentUsers(dept.id);
          return { ...dept, employees };
        })
      );
      setDepartments(departmentsWithEmployees);
    } catch (error) {
      Alert.alert('Error', 'Không thể lấy danh sách phòng ban.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = async (departmentId) => {
    try {
      const users = await departmentApi.getDepartmentUsers(departmentId);
      return users;
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  };
  
  // Thêm useEffect với dependencies
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleAddUser = async (userId, departmentId) => {
    // Log trước khi gửi request
    console.log('Values before sending:', {
        userId: userId,
        departmentId: departmentId,
        typeUserId: typeof userId,
        typeDepartmentId: typeof departmentId
    });

    try {
        // Chuyển đổi kiểu dữ liệu một cách tường minh
        const actualUserId = userId.toString();
        const actualDepartmentId = Number(departmentId);

        console.log('Converted values:', {
            actualUserId,
            actualDepartmentId
        });

        await departmentApi.addUserToDepartment(actualUserId, actualDepartmentId);
        //... rest of the code
    } catch (error) {
        console.log('Full error:', error);
        console.log('Error response:', error.response);
        Alert.alert('Error', 'Không thể thêm nhân viên.');
    }
};

  const handleUpdateDepartment = async (id, name) => {
    try {
      setLoading(true);
      await departmentApi.updateDepartment(id, name);
      
      // Fetch lại data ngay sau khi cập nhật
      const updatedDepartments = await departmentApi.getDepartments();
      setDepartments(updatedDepartments);
      
      Alert.alert(
        'Thành công', 
        'Phòng ban đã được cập nhật!',
        [
          {
            text: 'OK',
            onPress: () => setDialogVisible(false)
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Không thể cập nhật phòng ban.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteDepartment = async (id) => {
    try {
      setLoading(true);
      await departmentApi.deleteDepartment(id);
      
      // Fetch lại data ngay sau khi xóa
      const updatedDepartments = await departmentApi.getDepartments();
      setDepartments(updatedDepartments);
      
      Alert.alert(
        'Thành công', 
        'Phòng ban đã được xóa!',
        [
          {
            text: 'OK',
            onPress: () => {}
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Không thể xóa phòng ban.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async (name) => {
    try {
      setLoading(true);
      const response = await departmentApi.addDepartment(name);
      
      // Fetch lại data ngay sau khi thêm thành công
      const updatedDepartments = await departmentApi.getDepartments();
      setDepartments(updatedDepartments);
      
      Alert.alert(
        'Thành công', 
        'Đã thêm phòng ban mới!',
        [
          {
            text: 'OK',
            onPress: () => {}
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Không thể thêm phòng ban.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <DepartmentHeader 
          onAddDepartment={handleAddDepartment}
          title="Quản Lý Phòng Ban" 
        />
        
        <DepartmentList
  departments={departments}
  loading={loading}
  onEdit={(dept) => {
    setEditingDepartment(dept);
    setDialogVisible(true);
  }}
  onDelete={handleDeleteDepartment}
  onSelect={async (dept) => {
    const employees = await fetchEmployees(dept.id);
    setSelectedDepartment({
      ...dept,
      employees: employees
    });
  }}
/>

        <Modal
          visible={!!selectedDepartment}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedDepartment(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedDepartment(null)}
              >
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>

              {selectedDepartment && (
                <DepartmentDetail
                  department={selectedDepartment}
                  onAddUser={(userId) => handleAddUser(userId, selectedDepartment.id)}
                />
              )}
            </View>
          </View>
        </Modal>

        <DepartmentDialog
          visible={isDialogVisible}
          department={editingDepartment}
          onDismiss={() => setDialogVisible(false)}
          onSave={handleUpdateDepartment}
        />
      </View>
    </Provider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
});