import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

export default function Users({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      setUsers((await axios.get(`${API_BASE_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` } })).data);
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to load users' }); } 
    finally { setLoading(false); }
  };

  const renderItem = ({ item: u }) => (
    <Card style={styles.card} mode="elevated">
      <View style={styles.cardContent}>
        <View style={styles.avatar}><MaterialCommunityIcons name="account" size={30} color="#6F4E37" /></View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{u.name}</Text>
          <Text style={styles.email} numberOfLines={1}>{u.email}</Text>
          <Chip icon={u.isAdmin ? "shield-account" : "account"} textStyle={{fontSize: 10, color: u.isAdmin ? '#FFF' : '#333'}} style={[styles.badge, {backgroundColor: u.isAdmin ? '#4A2E1B' : '#EAEAEA'}]} compact>
            {u.isAdmin ? 'Admin' : 'Customer'}
          </Chip>
        </View>
      </View>
    </Card>
  );

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
      </View>
      <View style={styles.bottom}>
        {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : (
          <FlatList data={users} keyExtractor={i => i._id.toString()} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} ListEmptyComponent={
            <View style={styles.empty}><MaterialCommunityIcons name="account-off" size={60} color="#CCC" /><Text style={styles.emptyText}>No users found.</Text></View>
          } />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' }, top: { zIndex: 999, elevation: 999 }, bottom: { flex: 1, zIndex: 1, elevation: 1 },
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 25, borderBottomRightRadius: 25, borderBottomLeftRadius: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  loader: { flex: 1, justifyContent: 'center' }, list: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15 }, card: { marginBottom: 12, backgroundColor: '#FFF', borderRadius: 15 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 15 }, avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0E6D2', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' }, name: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  email: { fontSize: 13, color: '#666', fontStyle: 'italic', marginBottom: 6 }, badge: { alignSelf: 'flex-start', height: 24, paddingHorizontal: 4 },
  empty: { alignItems: 'center', marginTop: 60 }, emptyText: { color: '#888', fontSize: 16, marginTop: 10, fontWeight: '500' }
});