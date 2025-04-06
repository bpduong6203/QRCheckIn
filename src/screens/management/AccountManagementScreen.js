import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';

// Import các components
import { AccountsTab, DeletedAccountsTab } from './components/AccountComponents';
import { ProfileModal } from './components/ProfileModal';

// Import API
import { userApi } from '../../api/userApi';
import { USER_ROLES } from '../../utils/constants';

export default function AccountManagementScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('AllAccounts');
  const [accounts, setAccounts] = useState([]);
  const [deletedAccounts, setDeletedAccounts] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileDetails, setProfileDetails] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch data functions remain the same
  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsData, deletedAccountsData] = await Promise.all([
        fetchAccounts(),
        fetchDeletedAccounts()
      ]);
      setAccounts(accountsData);
      setDeletedAccounts(deletedAccountsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Unable to fetch accounts data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await userApi.listAccounts();
      const activeAccounts = response.filter(account => !account.isDelete);
      const accountsWithImages = await Promise.all(
        activeAccounts.map(async (account) => ({
          ...account,
          avatar: await userApi.getUserImage(account.id)
        }))
      );
      return accountsWithImages;
    } catch (error) {
      console.log('Error fetching accounts:', error);
      return [];
    }
  };

  const fetchDeletedAccounts = async () => {
    try {
      const deletedAccounts = await userApi.getDeletedAccounts();
      const accountsWithImages = await Promise.all(
        deletedAccounts.map(async (account) => {
          try {
            const avatar = await userApi.getUserImage(account.id);
            return { ...account, avatar };
          } catch (error) {
            return { ...account, avatar: undefined };
          }
        })
      );
      return accountsWithImages;
    } catch (error) {
      console.log('Error processing deleted accounts:', error);
      return [];
    }
  };

  // Other handler functions remain the same
  const handleViewProfile = async (id) => {
    try {
      const profileData = await userApi.getProfile(id);
      const avatar = await userApi.getUserImage(id);
      setProfileDetails({ ...profileData, avatar });
      setEditRole(profileData.role);
      setSelectedProfile(true);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin chi tiết về hồ sơ.');
    }
  };

  const handleDeleteAccount = async (id) => {
    try {
      await userApi.deleteAccount(id);
      Alert.alert('Thành công', 'Tài khoản đã được xóa thành công.');
      fetchData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa tài khoản.');
    }
  };

  const handleUpdateRole = async () => {
    if (!editRole.trim()) {
      Alert.alert('Lỗi', 'Vai trò không được để trống.');
      return;
    }
    try {
      await userApi.updateRole(profileDetails.id, editRole);
      Alert.alert('Thành công', 'Vai trò đã được cập nhật thành công.');
      fetchData();
      setSelectedProfile(false);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật vai trò.');
    }
  };

  const handleUploadExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/vnd.ms-excel'
      });
      if (result.type === 'success') {
        const formData = new FormData();
        formData.append('file', {
          uri: result.uri,
          type: result.mimeType,
          name: result.name,
        });
        await userApi.uploadExcel(formData);
        Alert.alert('Thành công', 'Tệp đã được tải lên thành công.');
        fetchData();
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải tập tin lên.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'AllAccounts':
        return (
          <AccountsTab
            accounts={accounts}
            handleViewProfile={handleViewProfile}
            handleDeleteAccount={handleDeleteAccount}
            searchQuery={searchQuery}
            loading={loading}
          />
        );
      case 'DeletedAccounts':
        return (
          <DeletedAccountsTab
            deletedAccounts={deletedAccounts}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container} edges={['right', 'left']}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên hoặc email"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'AllAccounts' && styles.activeTab]}
            onPress={() => setActiveTab('AllAccounts')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'AllAccounts' && styles.activeTabText
            ]}>
              Tất cả tài khoản
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tab, activeTab === 'DeletedAccounts' && styles.activeTab]}
            onPress={() => setActiveTab('DeletedAccounts')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'DeletedAccounts' && styles.activeTabText
            ]}>
              Tài khoản đã xóa
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {renderContent()}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.fab, styles.createButton]}
          onPress={() => navigation.navigate('RegisterScreen')}
        >
          <MaterialIcons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={[styles.fab, styles.uploadButton]}
          onPress={handleUploadExcel}
        >
          <MaterialIcons name="file-upload" size={24} color="#fff" />
        </TouchableOpacity> */}

        {/* Profile Modal */}
        <ProfileModal
          visible={selectedProfile}
          profile={profileDetails}
          editRole={editRole}
          setEditRole={setEditRole}
          onSave={handleUpdateRole}
          onClose={() => setSelectedProfile(false)}
          roleOptions={Object.values(USER_ROLES)}
        />
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007bff',
  },
  content: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  createButton: {
    bottom: 90,
    right: 20,
    backgroundColor: '#28a745',
  },
  uploadButton: {
    bottom: 20,
    right: 20,
    backgroundColor: '#007bff',
  }
});