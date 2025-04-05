import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';

// Import các screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import Dashboard from './src/screens/dashboard/Dashboard';
import AdminDashboard from './src/screens/dashboard/AdminDashboard';
import ManagerDashboard from './src/screens/dashboard/ManagerDashboard';
import EmployeeDashboard from './src/screens/dashboard/EmployeeDashboard';
import AccountManagementScreen from './src/screens/management/AccountManagementScreen';
import DepartmentScreen from './src/screens/management/DepartmentScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import LeaveScreen from './src/screens/leave/LeaveScreen';
import LeaveManagerScreen from './src/screens/leave/LeaveManagerScreen';
import AttendanceMainScreen from './src/screens/attendance/AttendanceMainScreen';
import AttendanceManagerScreen from './src/screens/attendance/AttendanceManagerScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.container}>
        <NavigationContainer>
          <AuthProvider>
            <Stack.Navigator 
              initialRouteName="LoginScreen"
              screenOptions={{
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#f4f6f8',
                },
                headerTitleStyle: {
                  color: '#333',
                },
                cardStyle: { backgroundColor: '#fff' }
              }}
            >
              <Stack.Screen 
                name="LoginScreen" 
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="RegisterScreen" 
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Dashboard" 
                component={Dashboard}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="AdminDashboard" 
                component={AdminDashboard}
                options={{ title: 'Bảng quản trị viên' }}
              />
              <Stack.Screen 
                name="ManagerDashboard" 
                component={ManagerDashboard}
                options={{ title: 'Bảng quản lý' }}
              />
              <Stack.Screen 
                name="EmployeeDashboard" 
                component={EmployeeDashboard}
                options={{ title: 'Bảng nhân viên' }}
              />
              <Stack.Screen 
                name="AccountManagementScreen" 
                component={AccountManagementScreen}
                options={{ title: 'Quản lý tài khoản' }}
              />
              <Stack.Screen 
                name="DepartmentScreen" 
                component={DepartmentScreen}
                options={{ title: 'Quản lý phòng ban' }}
              />
              <Stack.Screen 
                name="ProfileScreen" 
                component={ProfileScreen}
                options={{ title: 'Hồ sơ' }}
              />
              <Stack.Screen 
                name="LeaveScreen" 
                component={LeaveScreen}
                options={{ title: 'Đơn xin nghỉ' }}
              />
              <Stack.Screen 
                name="LeaveManagerScreen" 
                component={LeaveManagerScreen}
                options={{ title: 'Quản lý đơn xin nghỉ' }}
              />
               <Stack.Screen 
                name="AttendanceMainScreen" 
                component={AttendanceMainScreen}
                options={{ title: 'Chấm công' }}
              />
              <Stack.Screen 
                name="AttendanceManagerScreen" 
                component={AttendanceManagerScreen}
                options={{ title: 'Quản lý hấm công' }}
              />
              <Stack.Screen 
                name="ForgotPasswordScreen" 
                component={ForgotPasswordScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </AuthProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});