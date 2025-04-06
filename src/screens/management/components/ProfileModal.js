import React from 'react';
import { View, Text, Image, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';

export const ProfileModal = ({
  visible,
  profile,
  editRole,
  setEditRole,
  onSave,
  onClose,
  roleOptions = ['Admin', 'Employee', 'Manager']
}) => {
  if (!profile) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Avatar */}
          <Image 
            source={{ uri: profile.avatar }} 
            style={styles.profileAvatar}
          />

          {/* Profile Info */}
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileEmail}>Email: {profile.email}</Text>
          <Text style={styles.profileRole}>
            Current Role: {profile.role || 'N/A'}
          </Text>

          {/* Role Dropdown */}
          <ModalDropdown
            options={roleOptions}
            defaultValue={editRole || 'Select a Role'}
            style={styles.dropdown}
            textStyle={styles.dropdownText}
            dropdownStyle={styles.dropdownStyle}
            dropdownTextStyle={styles.dropdownTextStyle}
            onSelect={(index, value) => setEditRole(value)}
          />

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={onSave}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  profileRole: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  dropdown: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownStyle: {
    width: '90%',
    maxHeight: 150,
    borderRadius: 5,
    elevation: 3,
    backgroundColor: '#fff',
  },
  dropdownTextStyle: {
    fontSize: 16,
    color: '#333',
    padding: 10,
  },
  modalButton: {
    width: '90%',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});