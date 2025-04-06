import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View 
} from 'react-native';

export const Button = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  // Xác định styles dựa trên type và size
  const buttonStyles = [
    styles.button,
    type === 'text' && styles.textButton,
    size === 'small' && styles.smallButton,
    size === 'large' && styles.largeButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    type === 'text' && styles.textButtonText,
    size === 'small' && styles.smallButtonText,
    size === 'large' && styles.largeButtonText,
    disabled && styles.disabledButtonText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={type === 'text' ? '#007bff' : '#fff'} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Text button styles
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  textButtonText: {
    color: '#007bff',
  },
  // Size variations
  smallButton: {
    height: 36,
    paddingHorizontal: 12,
  },
  smallButtonText: {
    fontSize: 14,
  },
  largeButton: {
    height: 56,
    paddingHorizontal: 32,
  },
  largeButtonText: {
    fontSize: 18,
  },
  // Disabled state
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#666',
  },
});