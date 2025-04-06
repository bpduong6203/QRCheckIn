import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const FeatureCard = ({ feature, onPress }) => {
  const { name, icon, color } = feature;
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name={icon} size={40} color="#fff" />
      <Text style={styles.cardText}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '45%',
    height: 120,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});