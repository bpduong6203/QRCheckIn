import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// AccountsTab Component
export const AccountsTab = ({ accounts, handleViewProfile, handleDeleteAccount, searchQuery }) => {
  const filteredAccounts = accounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <FlatList
      data={filteredAccounts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <AccountCard
          account={item}
          onViewProfile={handleViewProfile}
          onDelete={handleDeleteAccount}
        />
      )}
    />
  );
};

// DeletedAccountsTab Component
export const DeletedAccountsTab = ({ deletedAccounts }) => {
  return (
    <FlatList
      data={deletedAccounts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AccountCard
          account={item}
          isDeleted
        />
      )}
    />
  );
};

// AccountCard Component
const AccountCard = ({ account, onViewProfile, onDelete, isDeleted }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{
          uri: account.avatar || 'https://via.placeholder.com/150',
        }}
        style={styles.avatar}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{account.name}</Text>
        <Text style={styles.cardSubtitle}>{account.email}</Text>
        <Text style={styles.cardRole}>Role: {account.role || 'N/A'}</Text>
      </View>
      {!isDeleted && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => onViewProfile(account.id)}
          >
            <MaterialIcons name="info" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(account.id)}
          >
            <MaterialIcons name="delete" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardRole: {
    fontSize: 12,
    color: '#999',
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  viewButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  }
});