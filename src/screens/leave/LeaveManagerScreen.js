import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import PendingRequests from './manager/PendingRequests';
import LeaveStatistics from './manager/LeaveStatistics';
import LeaveDays from './manager/LeaveDays';

export default function LeaveManagerScreen() {
  const [activeTab, setActiveTab] = useState('pending');

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return <PendingRequests />;
      case 'statistics':
        return <LeaveStatistics />;
      case 'leavedays':
        return <LeaveDays />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <MaterialIcons 
            name="pending-actions" 
            size={24} 
            color={activeTab === 'pending' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'pending' && styles.activeTabText
          ]}>
            Đang Chờ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'statistics' && styles.activeTab]}
          onPress={() => setActiveTab('statistics')}
        >
          <MaterialIcons 
            name="bar-chart" 
            size={24} 
            color={activeTab === 'statistics' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'statistics' && styles.activeTabText
          ]}>
            Thống Kê
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'leavedays' && styles.activeTab]}
          onPress={() => setActiveTab('leavedays')}
        >
          <MaterialIcons 
            name="event" 
            size={24} 
            color={activeTab === 'leavedays' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'leavedays' && styles.activeTabText
          ]}>
            Ngày Nghỉ
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
});
