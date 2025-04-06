import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  Alert,
  ActivityIndicator // Thêm import này
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const DepartmentList = ({ 
  departments, 
  onEdit, 
  onDelete, 
  onSelect,
  loading 
}) => {
  const renderItem = ({ item, index }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{index + 1}</Text>
      <TouchableOpacity onPress={() => onSelect(item)}>
        <Text style={[styles.cell, styles.link]}>{item.name}</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(item)}
        >
          <MaterialIcons name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              'Xác nhận xóa',
              'Bạn có chắc chắn muốn xóa phòng ban này?',
              [
                { text: 'Hủy' },
                { text: 'Xóa', onPress: () => onDelete(item.id) }
              ]
            );
          }}
        >
          <MaterialIcons name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={departments}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không có phòng ban nào</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
    flex: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  }
});