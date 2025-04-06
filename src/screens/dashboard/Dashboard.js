import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { USER_ROLES } from '../../utils/constants';
import Calendar from './components/Calendar';

export default function Dashboard({ navigation, route }) {
  const role = route?.params?.role;
  console.log('User role:', role);

  if (!role) {
    Alert.alert('Error', 'Vai trò không xác định, vui lòng thử lại!');
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Vai trò không xác định, vui lòng thử lại!</Text>
      </View>
    );
  }

  // Xử lý điều hướng cho nút More
  const handleMoreNavigation = () => {
    if (role === USER_ROLES.ADMIN) {
      navigation.navigate('AdminDashboard');
    } else if (role === USER_ROLES.MANAGER) {
      navigation.navigate('ManagerDashboard');
    } else if (role === USER_ROLES.EMPLOYEE) {
      navigation.navigate('EmployeeDashboard');
    } else {
      Alert.alert('Error', 'Vai trò không hợp lệ');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>

      {/* Calendar Section */}
      <View style={styles.calendarContainer}>
        <Calendar />
      </View>
    </ScrollView>
      

      {/* Thanh điều hướng dưới cùng */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard', { role })}
        >
          <MaterialIcons name="home" size={24} color="#fff" />
          <Text style={styles.navText}>Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="notifications" size={24} color="#fff" />
          <Text style={styles.navText}>Thông báo</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('ProfileScreen')}
        >
          <MaterialIcons name="person" size={24} color="#fff" />
          <Text style={styles.navText}>Hồ sơ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem} 
          onPress={handleMoreNavigation}
        >
          <MaterialIcons name="menu" size={24} color="#fff" />
          <Text style={styles.navText}>Thêm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden', // For border radius
  },
  statBox: {
    width: '30%',
    padding: 15,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  card: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  },
});