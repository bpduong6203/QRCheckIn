import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '../../../components/common/Button';

export function AttendanceDetailModal({ 
  visible, 
  attendance, 
  onClose,
  onModify,
  showModifyButton = false 
}) {
  if (!attendance) return null;

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return '#28a745';
      case 'LATE': return '#ffc107';
      case 'ABSENT': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Details</Text>
          <MaterialIcons 
            name="close" 
            size={24} 
            color="#666"
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.employeeSection}>
            <MaterialIcons name="person" size={24} color="#007bff" />
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>{attendance.userName}</Text>
              <Text style={styles.employeeId}>ID: {attendance.userId}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(attendance.status) }
            ]}>
              <Text style={styles.statusText}>{attendance.status}</Text>
            </View>
          </View>

          <View style={styles.timeSection}>
            <View style={styles.timeRow}>
              <MaterialIcons name="login" size={20} color="#666" />
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Check In</Text>
                <Text style={styles.timeValue}>
                  {formatTime(attendance.checkInTime)}
                </Text>
              </View>
            </View>

            <View style={styles.timeRow}>
              <MaterialIcons name="logout" size={20} color="#666" />
              <View style={styles.timeInfo}>
                <Text style={styles.timeLabel}>Check Out</Text>
                <Text style={styles.timeValue}>
                  {formatTime(attendance.checkOutTime)}
                </Text>
              </View>
            </View>
          </View>

          {attendance.workingHours && (
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <MaterialIcons name="access-time" size={20} color="#007bff" />
                <Text style={styles.statValue}>
                  {attendance.workingHours.toFixed(1)} hours
                </Text>
                <Text style={styles.statLabel}>Working Hours</Text>
              </View>

              {attendance.isOvertime && (
                <View style={styles.statItem}>
                  <MaterialIcons name="timer" size={20} color="#28a745" />
                  <Text style={[styles.statValue, { color: '#28a745' }]}>Overtime</Text>
                </View>
              )}
            </View>
          )}

          {showModifyButton && (
            <Button
              title="Modify Record"
              onPress={() => onModify(attendance)}
              style={styles.modifyButton}
            />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  employeeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  employeeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeSection: {
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeInfo: {
    marginLeft: 12,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  modifyButton: {
    marginTop: 20,
  },
});