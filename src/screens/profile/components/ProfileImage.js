import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

export const ProfileImage = ({ imageUri, onPress }) => {
  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={{
            uri: imageUri ? `data:image/jpeg;base64,${imageUri}` : 'https://via.placeholder.com/120',
          }}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <Text style={styles.note}>Nhấn vào hình ảnh để thay đổi</Text>
    </>
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderColor: '#007bff',
    borderWidth: 2,
  },
  note: {
    fontSize: 12,
    color: '#555',
    marginBottom: 20,
  },
});