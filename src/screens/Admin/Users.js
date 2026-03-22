import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, Image, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const ROLES = ['All', 'Admin', 'Customer'];

export default function Users({ navigation }) {
  const [users, setUsers] = useState([]), [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState(''), [roleFilter, setRoleFilter] = useState('All');

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

  const handleDeactivate = async (id, name) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const res = await axios.put(`${API_BASE_URL}/admin/users/${id}/deactivate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      Toast.show({ type: 'success', text1: 'Success', text2: `${name} is now ${res.data.isActive ? 'Active' : 'Inactive'}` });
      fetchUsers(true);
    } catch (e) { Toast.show({ type: 'error', text1: 'Action failed' }); }
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
            <Chip icon={isAdmin ? "shield-account" : isInactive ? "account-off" : "account"} textStyle={{ color: isAdmin || isInactive ? '#FFF' : '#333', fontSize: 12, fontWeight: 'bold' }} style={{ backgroundColor: isAdmin ? '#4A2E1B' : isInactive ? '#9E9E9E' : '#EAEAEA', height: 28 }} compact>
              {isInactive ? `${u.role} • Inactive` : u.role}
            </Chip>
          </View>
          <IconButton icon={isInactive ? "account-check" : "account-cancel"} size={26} iconColor={isInactive ? "#388E3C" : "#D32F2F"} containerColor={isInactive ? "#E8F5E9" : "#FEEBEE"} onPress={() => handleDeactivate(u._id, u.name)} disabled={isAdmin} />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}><View style={styles.hRow}><IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} /><Text style={styles.title}>Users</Text><IconButton icon="refresh" size={26} iconColor="#FFF" onPress={() => fetchUsers()} /></View></View>
        <View style={styles.searchRow}><Searchbar placeholder="Search users..." onChangeText={setSearch} value={search} style={styles.searchBar} inputStyle={{ fontSize: 15 }} iconColor="#4A2E1B" elevation={2} /></View>
        <View style={styles.filters}><Text style={styles.fTitle}>Filter by Role</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{ROLES.map(f => <Chip key={f} mode="flat" onPress={()=>setRoleFilter(f)} style={[styles.chip, roleFilter===f?styles.cOn:styles.cOff]} textStyle={{color:roleFilter===f?'#FFF':'#666',fontWeight:'bold'}}>{f}</Chip>)}</ScrollView></View>
      </View>
      <View style={styles.bottom}>
        {loading && !refreshing ? <ActivityIndicator size="large" color="#4A2E1B" style={{flex:1}} /> : <FlatList data={filtered} keyExtractor={i => i._id} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>fetchUsers(true)} tintColor="#4A2E1B" />} ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="account-search-outline" size={60} color="#CCC" /><Text style={styles.emptyText}>No users found.</Text></View>} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' }, top: { zIndex: 10 }, header: { backgroundColor: '#4A2E1B', paddingHorizontal: 15, paddingTop: 50, paddingBottom: 40, borderBottomRightRadius: 25, borderBottomLeftRadius: 25 },
  hRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 22, fontWeight: '800', color: '#FFF' }, searchRow: { marginTop: -25, paddingHorizontal: 20 }, searchBar: { backgroundColor: '#FFF', borderRadius: 12, height: 50 },
  filters: { paddingHorizontal: 20, marginTop: 15 }, fTitle: { fontSize: 12, fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', marginBottom: 6 }, chip: { marginRight: 8, borderRadius: 20 }, cOn: { backgroundColor: '#4A2E1B' }, cOff: { backgroundColor: '#EAEAEA' },
  bottom: { flex: 1 }, list: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 5 }, card: { marginBottom: 14, backgroundColor: '#FFF', borderRadius: 15 }, cardContent: { flexDirection: 'row', alignItems: 'center', padding: 15 }, 
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0E6D2', justifyContent: 'center', alignItems: 'center' }, avatarImg: { width: 60, height: 60, borderRadius: 30 }, info: { flex: 1, marginLeft: 15 }, name: { fontSize: 16, fontWeight: 'bold', color: '#333' }, email: { fontSize: 13, color: '#666', marginBottom: 5 },
  empty: { alignItems: 'center', marginTop: 60 }, emptyText: { color: '#888', fontSize: 16, marginTop: 10 }
});