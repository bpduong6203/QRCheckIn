import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import CheckInOutTab from './tabs/CheckInOutTab';
import HistoryTab from './tabs/HistoryTab';
import StatsTab from './tabs/StatsTab';
import ModificationTab from './tabs/ModificationTab';

export default function AttendanceMainScreen() {
  const [activeTab, setActiveTab] = useState('checkinout');

  const renderContent = () => {
    switch (activeTab) {
      case 'checkinout':
        return <CheckInOutTab />;
      case 'history':
        return <HistoryTab />;
      case 'stats':
        return <StatsTab />;
      case 'modifications':
        return <ModificationTab />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'checkinout' && styles.activeTab]}
          onPress={() => setActiveTab('checkinout')}
        >
          <MaterialIcons 
            name="access-time" 
            size={24} 
            color={activeTab === 'checkinout' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'checkinout' && styles.activeTabText
          ]}>
            Chấm Công
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <MaterialIcons 
            name="history" 
            size={24} 
            color={activeTab === 'history' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'history' && styles.activeTabText
          ]}>
            Lịch Sử
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <MaterialIcons 
            name="insert-chart" 
            size={24} 
            color={activeTab === 'stats' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'stats' && styles.activeTabText
          ]}>
            Thống Kê
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'modifications' && styles.activeTab]}
          onPress={() => setActiveTab('modifications')}
        >
          <MaterialIcons 
            name="edit" 
            size={24} 
            color={activeTab === 'modifications' ? '#007bff' : '#666'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'modifications' && styles.activeTabText
          ]}>
            Yêu Cầu
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
    backgroundColor: '#f8f9fa',
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
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
});