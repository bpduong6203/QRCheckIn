import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import components đã tạo
import { FeatureCard } from './components/FeatureCard';
import { DashboardHeader } from './components/DashboardHeader.js';

// Import constants
import { FEATURES, STORAGE_KEYS } from '../../utils/constants';

export default function EmployeeDashboard({ navigation }) {
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      
      Alert.alert(
        'Đã đăng xuất', 
        'Bạn đã đăng xuất thành công!',
        [{ 
          text: 'OK', 
          onPress: () => navigation.replace('LoginScreen') 
        }]
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  const handleFeaturePress = (route) => {
    if (route === 'Logout') {
      handleLogout();
    } else {
      navigation.navigate(route);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* <DashboardHeader 
        title="Employee Dashboard"
        subtitle="Choose a feature to manage:"
      /> */}

      <View style={styles.featuresContainer}>
        {FEATURES.EMPLOYEE.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            onPress={() => handleFeaturePress(feature.route)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f1f5f9',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});