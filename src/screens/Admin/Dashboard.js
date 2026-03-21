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
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
            <Text style={styles.title}>Dashboard</Text>
            <IconButton icon="refresh" size={26} iconColor="#FFF" onPress={() => {setRefreshing(true); fetchStats();}} style={{ marginRight: -10 }} />
          </View>
        </View>
        <View style={styles.overlapRow}>
          <TouchableOpacity style={styles.revCard} activeOpacity={0.9}>
            <View style={styles.revIcon}><MaterialCommunityIcons name="finance" size={28} color="#FFF" /></View>
            <View>
              <Text style={styles.revLabel}>Total Gross Revenue</Text>
              <Text style={styles.revValue}>₱{stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottom}>
        {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true); fetchStats();}} />}>
            
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
              <Text style={styles.footerSub}>ExpoBrew Command Center v1.0</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' }, top: { zIndex: 999 }, bottom: { flex: 1 },
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 45, borderBottomRightRadius: 25, borderBottomLeftRadius: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  overlapRow: { marginTop: -35, paddingHorizontal: 20 },
  revCard: { backgroundColor: '#27AE60', borderRadius: 15, padding: 18, flexDirection: 'row', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  revIcon: { width: 50, height: 50, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  revLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' }, revValue: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }, grid: { flexDirection: 'row', justifyContent: 'space-between' },
  secTitle: { fontSize: 12, fontWeight: '800', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginTop: 10 },
  card: { backgroundColor: '#FFF', width: (width-55)/2, padding: 20, borderRadius: 20, marginBottom: 15, elevation: 2, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cVal: { fontSize: 22, fontWeight: '900', color: '#333' }, cTitle: { fontSize: 11, color: '#999', fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' },
  loader: { flex: 1, justifyContent: 'center' },
  footer: { marginTop: 30, alignItems: 'center', opacity: 0.3 }, footerText: { fontSize: 12, fontWeight: '700' }, footerSub: { fontSize: 10, marginTop: 2 }
});