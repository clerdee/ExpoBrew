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
    } catch (e) { Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load statistics.' }); } 
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const StatCard = ({ title, value, icon, color, prefix = '', onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}><MaterialCommunityIcons name={icon} size={26} color={color} /></View>
      <View style={styles.cardTextCont}>
        <Text style={styles.cVal}>{prefix}{value}</Text>
        <Text style={styles.cTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        <View style={styles.hRow}>
          <IconButton icon="menu" iconColor="#FFF" size={28} onPress={() => navigation.toggleDrawer()} style={{marginLeft:-10}} />
          <View><Text style={styles.hTitle}>ExpoBrew Admin</Text><Text style={styles.hSub}>Daily Performance Overview</Text></View>
        </View>
      </View>

      {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={{flex:1}} /> : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true); fetchStats();}} />}>
          
          <Text style={styles.secTitle}>Financials</Text>
          <StatCard title="Gross Revenue (Completed)" value={stats.totalRevenue.toFixed(2)} prefix="₱" icon="currency-php" color="#27AE60" />

          <Text style={styles.secTitle}>Operations</Text>
          <View style={styles.grid}>
            <StatCard title="Active Orders" value={stats.activeOrders} icon="coffee-maker" color="#E67E22" onPress={()=>navigation.navigate('Orders')} />
            <StatCard title="Total Products" value={stats.totalProducts} icon="coffee" color="#6F4E37" onPress={()=>navigation.navigate('Products')} />
            <StatCard title="Customers" value={stats.totalCustomers} icon="account-group" color="#3498DB" onPress={()=>navigation.navigate('Users')} />
            <StatCard title="Admin Staff" value={stats.totalAdmins} icon="shield-account" color="#607D8B" />
          </View>

          <Text style={styles.secTitle}>Quick Access</Text>
          <View style={styles.actionGrid}>
            {[ {n:'Orders', i:'clipboard-list', l:'Orders'}, {n:'Products', i:'package-variant', l:'Inventory'}, {n:'Users', i:'account-multiple', l:'Users'}, {n:'Promos', i:'ticket-percent', l:'Promos'} ].map(a => (
              <TouchableOpacity key={a.n} style={styles.aBtn} onPress={()=>navigation.navigate(a.n)}>
                <MaterialCommunityIcons name={a.i} size={22} color="#4A2E1B" /><Text style={styles.aBtnTxt}>{a.l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F8F9FA' },
  head: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 35, borderBottomRightRadius: 30, borderBottomLeftRadius: 30 },
  hRow: { flexDirection: 'row', alignItems: 'center' }, hTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFF' }, hSub: { fontSize: 13, color: '#D3C4B7' },
  scroll: { padding: 20, paddingBottom: 40 }, grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', width: (width-50)/2, padding: 18, borderRadius: 20, marginBottom: 15, elevation: 2, flexDirection: 'column', alignItems: 'flex-start' },
  cardFull: { width: '100%', flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTextCont: { marginLeft: 2 },
  cVal: { fontSize: 20, fontWeight: '900', color: '#333' }, cTitle: { fontSize: 11, color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  secTitle: { fontSize: 14, fontWeight: '800', color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginTop: 10 },
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  aBtn: { backgroundColor: '#FFF', padding: 15, borderRadius: 18, width: (width-75)/4, alignItems: 'center', elevation: 2 },
  aBtnTxt: { fontSize: 10, fontWeight: 'bold', color: '#4A2E1B', marginTop: 6 }
});