// DepartmentHeader.js
export const DepartmentHeader = ({ onAdd }) => {
    const [newDepartment, setNewDepartment] = useState('');
  
    const handleAdd = () => {
      if (!newDepartment.trim()) {
        Alert.alert('Error', 'Tên phòng ban không được để trống!');
        return;
      }
      onAdd(newDepartment);
      setNewDepartment('');
    };
  
    return (
      <View style={styles.header}>
        <Text style={styles.title}>Quản Lý Phòng Ban</Text>
        <View style={styles.addContainer}>
          <Input
            value={newDepartment}
            onChangeText={setNewDepartment}
            placeholder="Nhập tên phòng ban mới"
          />
          <Button onPress={handleAdd} icon="add" />
        </View>
      </View>
    );
  };
  
  // DepartmentList.js
  export const DepartmentList = ({ departments, loading, onEdit, onDelete, onSelect }) => {
    const renderItem = ({ item, index }) => (
      <View style={styles.row}>
        <Text style={styles.cell}>{index + 1}</Text>
        <TouchableOpacity onPress={() => onSelect(item)}>
          <Text style={[styles.cell, styles.link]}>{item.name}</Text>
        </TouchableOpacity>
        <View style={styles.actions}>
          <IconButton icon="edit" onPress={() => onEdit(item)} />
          <IconButton 
            icon="delete" 
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
          />
        </View>
      </View>
    );
  
    return (
      <View style={styles.list}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={departments}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </View>
    );
  };
  
  // DepartmentDetail.js
  export const DepartmentDetail = ({ department, onAddUser }) => {
    const [newUserId, setNewUserId] = useState('');
  
    const handleAddUser = () => {
      if (!newUserId.trim()) {
        Alert.alert('Error', 'Mã nhân viên không được để trống!');
        return;
      }
      onAddUser(newUserId);
      setNewUserId('');
    };
  
    return (
      <View style={styles.detail}>
        <Text style={styles.detailTitle}>
          Nhân viên trong phòng ban {department.name}
        </Text>
        <FlatList
          data={department.employees}
          renderItem={({ item }) => (
            <Text style={styles.employeeItem}>{item.name}</Text>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <View style={styles.addUserContainer}>
          <Input
            value={newUserId}
            onChangeText={setNewUserId}
            placeholder="Nhập mã nhân viên"
          />
          <Button onPress={handleAddUser} icon="add" />
        </View>
      </View>
    );
  };