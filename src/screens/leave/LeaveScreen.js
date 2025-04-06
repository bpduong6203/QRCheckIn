import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LeaveRequestScreen from './LeaveRequestScreen';
import LeaveHistoryScreen from './LeaveHistoryScreen';

export default function LeaveScreen() {
  const [activeTab, setActiveTab] = useState('YeuCauMoi');

  const renderContent = () => {
    switch (activeTab) {
      case 'LichSu':
        return <LeaveHistoryScreen />;
      case 'YeuCauMoi':
        return <LeaveRequestScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'LichSu' && styles.activeTab]}
          onPress={() => setActiveTab('LichSu')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'LichSu' && styles.activeTabText
          ]}>
            Yêu Cầu Của Tôi
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'YeuCauMoi' && styles.activeTab]}
          onPress={() => setActiveTab('YeuCauMoi')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'YeuCauMoi' && styles.activeTabText
          ]}>
            Yêu Cầu Mới
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
    backgroundColor: 'white',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007bff',
  },
  content: {
    flex: 1,
  },
});
