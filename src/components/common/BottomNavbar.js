import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const BottomNavbar = ({ role, currentScreen, navigation, onMorePress }) => {
  const navItems = [
    {
      icon: 'home',
      label: 'Home',
      onPress: () => navigation.navigate('Dashboard', { role })
    },
    {
      icon: 'notifications',
      label: 'Notifications',
      onPress: () => Alert.alert('Coming Soon', 'Notifications feature is coming soon!')
    },
    {
      icon: 'person',
      label: 'Profile',
      onPress: () => navigation.navigate('ProfileScreen')
    },
    {
      icon: 'menu',
      label: 'More',
      onPress: onMorePress
    }
  ];

  return (
    <View style={styles.navbar}>
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={item.onPress}
        >
          <MaterialIcons 
            name={item.icon} 
            size={24} 
            color={currentScreen === item.label ? '#fff' : '#e7f3ff'} 
          />
          <Text style={styles.navText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});