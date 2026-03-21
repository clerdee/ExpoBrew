import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const { width } = Dimensions.get('window');

export default function Dashboard({ navigation }) {
  const [stats, setStats] = useState({ totalOrders: 0, activeOrders: 0, totalProducts: 0, totalRevenue: 0, totalCustomers: 0, totalAdmins: 0 });
  const [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const t = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${t}` } });
      setStats(data);
    } catch (e) { Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to sync dashboard.' }); } 
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const StatCard = ({ title, value, icon, color, prefix = '', onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}><MaterialCommunityIcons name={icon} size={24} color={color} /></View>
      <Text style={styles.cVal}>{prefix}{value}</Text>
      <Text style={styles.cTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        <View style={styles.hRow}>
          <IconButton icon="menu" iconColor="#FFF" size={28} onPress={() => navigation.toggleDrawer()} style={{marginLeft:-10}} />
          <View><Text style={styles.hTitle}>ExpoBrew Command</Text><Text style={styles.hSub}>Real-time Business Analytics</Text></View>
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={{flex:1}} /> : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true); fetchStats();}} />}>
          
          <Text style={styles.secTitle}>Financial Performance</Text>
          <TouchableOpacity style={styles.revCard} activeOpacity={0.9}>
            <View style={styles.revIcon}><MaterialCommunityIcons name="finance" size={30} color="#FFF" /></View>
            <View>
              <Text style={styles.revLabel}>Total Revenue</Text>
              <Text style={styles.revValue}>₱{stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.secTitle}>Inventory & Orders</Text>
          <View style={styles.grid}>
            <StatCard title="Total Products" value={stats.totalProducts} icon="coffee" color="#6F4E37" onPress={()=>navigation.navigate('Products')} />
            <StatCard title="Active Orders" value={stats.activeOrders} icon="clock-fast" color="#E67E22" onPress={()=>navigation.navigate('Orders')} />
          </View>

          <Text style={styles.secTitle}>User Management</Text>
          <View style={styles.grid}>
            <StatCard title="Customers" value={stats.totalCustomers} icon="account-group" color="#3498DB" onPress={()=>navigation.navigate('Users')} />
            <StatCard title="Admin Staff" value={stats.totalAdmins} icon="shield-check" color="#607D8B" />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Total System Orders: {stats.totalOrders}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F4F7F6' },
  head: { backgroundColor: '#4A2E1B', paddingHorizontal: 25, paddingTop: 60, paddingBottom: 40, borderBottomRightRadius: 35 },
  hRow: { flexDirection: 'row', alignItems: 'center' }, hTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' }, hSub: { fontSize: 13, color: '#D3C4B7', marginTop: 2 },
  scroll: { padding: 20 }, grid: { flexDirection: 'row', justifyContent: 'space-between' },
  secTitle: { fontSize: 12, fontWeight: '900', color: '#B0B0B0', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 15, marginTop: 10 },
  revCard: { backgroundColor: '#27AE60', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 25, elevation: 4 },
  revIcon: { width: 55, height: 55, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  revLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' }, revValue: { color: '#FFF', fontSize: 28, fontWeight: '900' },
  card: { backgroundColor: '#FFF', width: (width-55)/2, padding: 20, borderRadius: 24, marginBottom: 15, elevation: 2, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cVal: { fontSize: 22, fontWeight: '900', color: '#333' }, cTitle: { fontSize: 11, color: '#999', fontWeight: 'bold', marginTop: 4 },
  footer: { marginTop: 20, alignItems: 'center', opacity: 0.4 }, footerText: { fontSize: 12, fontWeight: '600' }
});