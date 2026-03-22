import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, ScrollView, RefreshControl, Modal, Dimensions } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const { width } = Dimensions.get('window');
const ROLES = ['All', 'Admin', 'Customer'];

export default function Users({ navigation }) {
  const [users, setUsers] = useState([]), [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState(''), [roleFilter, setRoleFilter] = useState('All');
  const [modalVis, setModalVis] = useState(false), [targetUser, setTargetUser] = useState({ id: null, name: '', isActive: true });

  const fetchUsers = async (isRef = false) => {
    if (!isRef) setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(data);
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to load users' }); } 
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchUsers(); }, []));

  const confirmToggle = (u) => { setTargetUser({ id: u._id, name: u.name, isActive: u.isActive !== false }); setModalVis(true); };

  const executeToggle = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await axios.put(`${API_BASE_URL}/admin/users/${targetUser.id}/deactivate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      Toast.show({ type: 'success', text1: 'Success', text2: `${targetUser.name} is now ${res.data.isActive ? 'Active' : 'Inactive'}` });
      setModalVis(false);
      fetchUsers(true);
    } catch (e) { setModalVis(false); Toast.show({ type: 'error', text1: 'Action failed' }); }
  };

  const filtered = useMemo(() => users.filter(u => (roleFilter === 'All' || u.role?.toLowerCase() === roleFilter.toLowerCase()) && 
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  ), [users, search, roleFilter]);

  const renderItem = ({ item: u }) => {
    const isAdmin = u.role?.toLowerCase() === 'admin', isInactive = u.isActive === false;
    return (
      <Card style={styles.card} mode="elevated">
        <View style={styles.cardContent}>
          {u.profileImage ? <Image source={{ uri: u.profileImage }} style={styles.avatarImg} /> : <View style={styles.avatar}><MaterialCommunityIcons name="account" size={35} color="#6F4E37" /></View>}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{u.name}</Text>
            <Text style={styles.email} numberOfLines={1}>{u.email}</Text>
            <Chip icon={isAdmin ? "shield-account" : isInactive ? "account-off" : "account"} textStyle={{ color: isAdmin || isInactive ? '#FFF' : '#4A3B32', fontSize: 11, fontWeight: 'bold' }} style={{ backgroundColor: isAdmin ? '#4A2E1B' : isInactive ? '#D32F2F' : '#E8F5E9', height: 28, alignSelf: 'flex-start', marginTop: 4 }} compact>
              {isInactive ? `${u.role} • Inactive` : u.role}
            </Chip>
          </View>
          <IconButton icon={isInactive ? "account-check" : "account-cancel"} size={26} iconColor={isInactive ? "#388E3C" : "#D32F2F"} containerColor={isInactive ? "#E8F5E9" : "#FEEBEE"} onPress={() => confirmToggle(u)} disabled={isAdmin} style={{ opacity: isAdmin ? 0.3 : 1 }} />
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF5F0' }}>
      <View style={styles.header}>
        <View style={styles.hRow}>
          <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
          <Text style={styles.title}>User Management</Text>
          <IconButton icon="refresh" size={26} iconColor="#FFF" onPress={() => fetchUsers(true)} style={{ marginRight: -10 }} />
        </View>
        <Searchbar placeholder="Search name or email..." onChangeText={setSearch} value={search} style={styles.searchBar} inputStyle={{ fontSize: 14 }} iconColor="#4A2E1B" elevation={2} />
      </View>

      <View style={styles.filters}>
        <Text style={styles.fTitle}>Filter by Role</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {ROLES.map(f => (
            <Chip key={f} mode="flat" onPress={()=>setRoleFilter(f)} style={[styles.chip, roleFilter===f ? styles.cOn : styles.cOff]} textStyle={{color: roleFilter===f ? '#FFF' : '#666', fontWeight:'bold', fontSize: 12}}>
              {f}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? <ActivityIndicator size="large" color="#4A2E1B" style={{flex:1}} /> : (
        <FlatList data={filtered} keyExtractor={i => i._id} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>fetchUsers(true)} tintColor="#4A2E1B" />} 
          ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="account-search-outline" size={60} color="#D3C4B7" /><Text style={styles.emptyText}>No users found.</Text></View>} 
        />
      )}

      <Modal animationType="fade" transparent={true} visible={modalVis} onRequestClose={() => setModalVis(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalSheet}>
            <MaterialCommunityIcons name={targetUser.isActive ? "account-cancel-outline" : "account-check-outline"} size={50} color={targetUser.isActive ? "#D32F2F" : "#388E3C"} style={{ alignSelf: 'center', marginBottom: 15 }} />
            <Text style={styles.mTitle}>{targetUser.isActive ? 'Deactivate User' : 'Reactivate User'}</Text>
            <Text style={styles.mDesc}>
              {targetUser.isActive 
                ? `Are you sure you want to deactivate ${targetUser.name}? They will no longer be able to log in.` 
                : `Are you sure you want to reactivate ${targetUser.name}? They will regain access to their account.`}
            </Text>
            <View style={styles.mActions}>
              <Button mode="outlined" onPress={() => setModalVis(false)} style={styles.mBtn} textColor="#666">Cancel</Button>
              <Button mode="contained" onPress={executeToggle} style={styles.mBtn} buttonColor={targetUser.isActive ? "#D32F2F" : "#388E3C"}>
                {targetUser.isActive ? 'Deactivate' : 'Reactivate'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 50, borderBottomRightRadius: 35, borderBottomLeftRadius: 35, zIndex: 5 },
  hRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, title: { fontSize: 20, fontWeight: '900', color: '#FFF' }, 
  searchBar: { backgroundColor: '#FFF', borderRadius: 15, height: 50, position: 'absolute', bottom: -25, left: 20, width: width - 40 },
  filters: { paddingHorizontal: 20, marginTop: 40, marginBottom: 10 }, fTitle: { fontSize: 11, fontWeight: '800', color: '#8B5E3C', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 }, 
  scroll: { marginBottom: 10 }, chip: { marginRight: 8, borderRadius: 20, paddingHorizontal: 8, height: 32 }, cOn: { backgroundColor: '#6F4E37' }, cOff: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EBE1D7' },
  list: { paddingHorizontal: 16, paddingBottom: 40 }, card: { marginBottom: 16, backgroundColor: '#FFF', borderRadius: 20, elevation: 3 }, cardContent: { flexDirection: 'row', alignItems: 'center', padding: 15 }, 
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#F0E6D2', justifyContent: 'center', alignItems: 'center' }, avatarImg: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#EEE' }, 
  info: { flex: 1, marginLeft: 15 }, name: { fontSize: 16, fontWeight: '900', color: '#333' }, email: { fontSize: 12, color: '#888', marginBottom: 2, fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 }, modalSheet: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, elevation: 20 },
  mTitle: { fontSize: 20, fontWeight: '900', color: '#4A3B32', marginBottom: 10, textAlign: 'center' }, mDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 30, textAlign: 'center' },
  mActions: { flexDirection: 'row', justifyContent: 'space-between' }, mBtn: { flex: 0.48, borderRadius: 12 },
  empty: { alignItems: 'center', marginTop: 80 }, emptyText: { color: '#D3C4B7', fontSize: 16, marginTop: 10, fontWeight: 'bold' }
});