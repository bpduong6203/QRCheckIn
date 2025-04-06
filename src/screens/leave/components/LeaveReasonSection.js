import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export const LeaveReasonSection = ({ reason, onReasonChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reason for Leave</Text>
      <TextInput
        value={reason}
        onChangeText={onReasonChange}
        placeholder="Enter your reason here..."
        multiline
        numberOfLines={4}
        style={styles.input}
        textAlignVertical="top"
      />
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    height: 100,
    fontSize: 16,
  }
});