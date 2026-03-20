import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Alert, Image, ScrollView } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const ROLES = ['All', 'Admin', 'Customer'];

export default function Users({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      setUsers((await axios.get(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })).data);
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to load users' }); } 
    finally { setLoading(false); }
  };

  const confirmDeactivate = (id, name) => {
    Alert.alert("Deactivate User", `Are you sure you want to deactivate ${name}'s account?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Deactivate", style: "destructive", onPress: () => handleDeactivate(id) }
    ]);
  };

  const handleDeactivate = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      // Assuming you will have a route like PUT /users/:id/deactivate (or you can pass { isActive: false } to your update route)
      await axios.put(`${API_BASE_URL}/users/${id}/deactivate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      Toast.show({ type: 'success', text1: 'User deactivated successfully' }); fetchUsers();
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to deactivate user' }); }
  };

  const filtered = useMemo(() => users.filter(u => {
    const roleMatch = roleFilter === 'All' || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());
    const searchMatch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return roleMatch && searchMatch;
  }), [users, search, roleFilter]);

  const renderItem = ({ item: u }) => {
    const isAdmin = u.role === 'admin' || u.role === 'Admin';
    const displayRole = u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'User';
    
    return (
      <Card style={styles.card} mode="elevated">
        <View style={styles.cardContent}>
          {u.profileImage ? <Image source={{ uri: u.profileImage }} style={styles.avatarImg} /> : <View style={styles.avatar}><MaterialCommunityIcons name="account" size={35} color="#6F4E37" /></View>}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{u.name}</Text>
            <Text style={styles.email} numberOfLines={1}>{u.email}</Text>
            <Chip icon={isAdmin ? "shield-account" : "account"} textStyle={[styles.badgeText, { color: isAdmin ? '#FFF' : '#333' }]} style={[styles.badge, { backgroundColor: isAdmin ? '#4A2E1B' : '#EAEAEA' }]} compact>
              {displayRole}
            </Chip>
          </View>
          <IconButton icon="account-cancel-outline" size={26} iconColor="#D32F2F" containerColor="#FEEBEE" onPress={() => confirmDeactivate(u._id, u.name)} disabled={isAdmin} style={styles.actionBtn} />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
            <Text style={styles.title}>Users</Text>
            <View style={{ width: 48 }} /> 
          </View>
        </View>
        <View style={styles.searchRow}>
          <Searchbar placeholder="Search name or email..." onChangeText={setSearch} value={search} style={styles.searchBar} inputStyle={{ fontSize: 15 }} iconColor="#4A2E1B" elevation={2} />
        </View>
        <View style={styles.filters}>
          <Text style={styles.filterTitle}>Filter by Role</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {ROLES.map(f => <Chip key={f} mode="flat" onPress={()=>setRoleFilter(f)} style={[styles.chip, roleFilter===f?styles.chipOn:styles.chipOff]} textStyle={roleFilter===f?styles.textOn:styles.textOff}>{f}</Chip>)}
          </ScrollView>
        </View>
      </View>
      <View style={styles.bottom}>
        {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : (
          <FlatList data={filtered} keyExtractor={i => i._id.toString()} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} ListEmptyComponent={
            <View style={styles.empty}><MaterialCommunityIcons name="account-search-outline" size={60} color="#CCC" /><Text style={styles.emptyText}>No users found.</Text></View>
          } />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' }, top: { zIndex: 999, elevation: 999 }, bottom: { flex: 1, zIndex: 1, elevation: 1 },
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40, borderBottomRightRadius: 25, borderBottomLeftRadius: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: -25, paddingHorizontal: 20 }, searchBar: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, height: 50 },
  filters: { paddingHorizontal: 20, marginTop: 15, marginBottom: 5 }, filterTitle: { fontSize: 12, fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', marginBottom: 6 },
  scroll: { marginBottom: 12 }, chip: { marginRight: 8, borderRadius: 20, paddingHorizontal: 4, height: 34, justifyContent: 'center' },
  chipOn: { backgroundColor: '#4A2E1B' }, chipOff: { backgroundColor: '#EAEAEA' }, textOn: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }, textOff: { color: '#666', fontWeight: '600', fontSize: 13 },
  loader: { flex: 1, justifyContent: 'center' }, list: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 5 }, card: { marginBottom: 14, backgroundColor: '#FFF', borderRadius: 15 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 20, minHeight: 110 }, avatar: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#F0E6D2', justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 66, height: 66, borderRadius: 33, backgroundColor: '#EAEAEA' }, info: { flex: 1, marginLeft: 18, justifyContent: 'center' }, 
  name: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 3 }, email: { fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 12 }, 
  badge: { alignSelf: 'flex-start', height: 28, justifyContent: 'center' }, badgeText: { fontSize: 12, fontWeight: 'bold' }, actionBtn: { margin: 0, marginLeft: 10 },
  empty: { alignItems: 'center', marginTop: 60 }, emptyText: { color: '#888', fontSize: 16, marginTop: 10, fontWeight: '500' }
});