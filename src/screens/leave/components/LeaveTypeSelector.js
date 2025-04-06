import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const LeaveTypeSelector = ({ selectedType, onTypeChange }) => {
  const leaveTypes = [
    { id: 'ANNUAL_LEAVE', label: 'Annual Leave', color: '#007bff' },
    { id: 'SICK_LEAVE', label: 'Sick Leave', color: '#28a745' },
    { id: 'UNPAID_LEAVE', label: 'Unpaid Leave', color: '#dc3545' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Leave Type</Text>
      <View style={styles.buttonGroup}>
        {leaveTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.button,
              selectedType === type.id && styles.selectedButton,
              { borderColor: type.color }
            ]}
            onPress={() => onTypeChange(type.id)}
          >
            <Text style={[
              styles.buttonText,
              selectedType === type.id && styles.selectedButtonText,
              { color: selectedType === type.id ? '#fff' : type.color }
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#fff',
  },
});