import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '../../../components/common/Button';

export const LeaveEvidenceSection = ({ evidence, onEvidenceChange }) => {
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });

      if (result.type === 'success') {
        onEvidenceChange({
          uri: result.uri,
          name: result.name,
          type: result.mimeType
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to upload file');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Supporting Document (Optional)</Text>
      <Button
        title={evidence ? 'Document Uploaded' : 'Upload Document'}
        onPress={handleUpload}
        type={evidence ? 'success' : 'primary'}
      />
      {evidence && (
        <Text style={styles.fileName}>{evidence.name}</Text>
      )}
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
  fileName: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  }
});