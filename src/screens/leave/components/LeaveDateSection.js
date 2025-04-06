import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '../../../components/common/Button';

export const LeaveDateSection = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Leave Period</Text>
      <View style={styles.dateContainer}>
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>Start Date</Text>
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, date) => onStartDateChange(date)}
            style={styles.datePicker}
          />
        </View>
        
        <View style={styles.dateField}>
          <Text style={styles.dateLabel}>End Date</Text>
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, date) => onEndDateChange(date)}
            style={styles.datePicker}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateField: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  datePicker: {
    width: '100%',
  }
});