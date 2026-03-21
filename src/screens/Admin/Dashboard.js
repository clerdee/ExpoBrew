import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const { width } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const [stats, setStats] = useState({ totalOrders: 0, activeOrders: 0, lowStock: 0, totalRevenue: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const t = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${t}` } });
      setStats(data);
    } catch (e) { Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load stats.' }); } 
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const StatCard = ({ title, value, icon, color, prefix = '', onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}><MaterialCommunityIcons name={icon} size={28} color={color} /></View>
      <Text style={styles.cVal}>{prefix}{value}</Text>
      <Text style={styles.cTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        <View style={styles.hRow}>
          <IconButton icon="menu" iconColor="#FFF" size={28} onPress={() => navigation.toggleDrawer()} style={{marginLeft:-10}} />
          <View><Text style={styles.hTitle}>Admin Dashboard</Text><Text style={styles.hSub}>ExpoBrew System Overview</Text></View>
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={{flex:1}} /> : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true); fetchStats();}} />}>
          <View style={styles.grid}>
            <StatCard title="Revenue" value={stats.totalRevenue.toFixed(2)} prefix="₱" icon="cash-register" color="#27AE60" />
            <StatCard title="Active Orders" value={stats.activeOrders} icon="coffee-maker" color="#E67E22" onPress={()=>navigation.navigate('Orders')} />
            <StatCard title="Products" value={stats.lowStock > 0 ? `${stats.lowStock} Low` : 'Healthy'} icon="coffee" color="#6F4E37" onPress={()=>navigation.navigate('Products')} />
            <StatCard title="Total Users" value={stats.totalUsers} icon="account-group" color="#3498DB" onPress={()=>navigation.navigate('Users')} />
          </View>

          <Text style={styles.secTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {[ {n:'Orders', i:'package-variant', l:'Orders'}, {n:'Products', i:'plus-circle', l:'Inventory'}, {n:'Users', i:'account-cog', l:'Users'}, {n:'Settings', i:'cog', l:'Settings'} ].map(a => (
              <TouchableOpacity key={a.n} style={styles.aBtn} onPress={()=>navigation.navigate(a.n)}>
                <MaterialCommunityIcons name={a.i} size={24} color="#4A2E1B" /><Text style={styles.aBtnTxt}>{a.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAFAFA' },
  head: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 35, borderBottomRightRadius: 30, borderBottomLeftRadius: 30 },
  hRow: { flexDirection: 'row', alignItems: 'center' }, hTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' }, hSub: { fontSize: 13, color: '#D3C4B7' },
  scroll: { padding: 20 }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', width: (width-55)/2, padding: 15, borderRadius: 20, marginBottom: 15, elevation: 3, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  cVal: { fontSize: 20, fontWeight: '900', color: '#333' }, cTitle: { fontSize: 12, color: '#888', fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase' },
  secTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A2E1B', marginVertical: 15 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  aBtn: { backgroundColor: '#FFF', padding: 12, borderRadius: 15, width: (width-70)/4, alignItems: 'center', elevation: 2 },
  aBtnTxt: { fontSize: 10, fontWeight: 'bold', color: '#4A2E1B', marginTop: 5 }
});