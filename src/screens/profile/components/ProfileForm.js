import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from '../../../components/common/Input';

export const ProfileForm = ({ userData, editable, onChange }) => {
  const fields = [
    { key: 'name', label: 'Tên', placeholder: 'Nhập tên của bạn' },
    { key: 'birthDay', label: 'Ngày sinh', placeholder: 'YYYY-MM-DD' },
    { key: 'nationality', label: 'Quốc tịch', placeholder: 'Việt Nam' },
    { key: 'homeTown', label: 'Quê quán', placeholder: 'Đồng Nai' },
    { key: 'address', label: 'Địa chỉ', placeholder: 'Phú Thạnh, Nhơn Trạch, Đồng Nai' },
    { key: 'email', label: 'Email', placeholder: 'Nhập email', keyboardType: 'email-address' },
    { key: 'phoneNumber', label: 'Số điện thoại', placeholder: '0797837520', keyboardType: 'phone-pad' },
    { key: 'sex', label: 'Giới tính', placeholder: 'Nam' },
  ];

  return (
    <View style={styles.container}>
      {fields.map(field => (
        <Input
          key={field.key}
          label={field.label}
          value={userData[field.key]}
          onChangeText={(text) => onChange(field.key, text)}
          placeholder={field.placeholder}
          editable={editable}
          keyboardType={field.keyboardType}
          containerStyle={styles.inputContainer}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    width: '90%',
    marginBottom: 15,
  },
});