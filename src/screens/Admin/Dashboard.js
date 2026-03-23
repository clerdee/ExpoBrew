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
  const [stats, setStats] = useState({ totalOrders: 0, activeOrders: 0, completedOrders: 0, totalProducts: 0, totalRevenue: 0, totalCustomers: 0, totalAdmins: 0 });
  const [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const t = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${t}` } });
      setStats(data);
    } catch (e) { Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to sync dashboard.' }); } 
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}><MaterialCommunityIcons name={icon} size={26} color={color} /></View>
        <MaterialCommunityIcons name="arrow-top-right" size={22} color="#D3C4B7" />
      </View>
      <View style={styles.cardBottom}>
        <Text style={styles.cVal}>{value}</Text>
        <Text style={styles.cTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  const compOrders = stats.completedOrders !== undefined ? stats.completedOrders : Math.max(0, stats.totalOrders - stats.activeOrders);
  const activePct = stats.totalOrders > 0 ? (stats.activeOrders / stats.totalOrders) * 100 : 0;
  const compPct = stats.totalOrders > 0 ? (compOrders / stats.totalOrders) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
            <Text style={styles.title}>Overview</Text>
            <View style={{ width: 48 }} /> 
          </View>
          <Text style={styles.subTitle}>Here's what's happening today</Text>
        </View>
        <View style={styles.overlapRow}>
          <TouchableOpacity style={styles.revCard} activeOpacity={0.9} onPress={() => navigation.navigate('Orders')}>
            <View style={styles.revIcon}><MaterialCommunityIcons name="finance" size={32} color="#FFF" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.revLabel}>Total Gross Revenue</Text>
              <Text style={styles.revValue}>₱{stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottom}>
        {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : (
          <ScrollView 
            contentContainerStyle={styles.scroll} 
            showsVerticalScrollIndicator={false} 
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchStats(true)} tintColor="#6F4E37" colors={['#6F4E37']} />}
          >
            <TouchableOpacity style={styles.orderCard} onPress={() => navigation.navigate('Orders')} activeOpacity={0.8}>
              <View style={styles.cardTop}>
                <View style={styles.secHeader}>
                  <MaterialCommunityIcons name="clipboard-text-multiple" size={22} color="#6F4E37" style={{marginRight: 8}} />
                  <Text style={styles.secTitle}>Order Fulfillment</Text>
                </View>
                <MaterialCommunityIcons name="arrow-top-right" size={24} color="#D3C4B7" />
              </View>
              
              <Text style={styles.bigOrderText}>{stats.totalOrders}</Text>
              <Text style={styles.subOrderText}>Total Lifetime Orders</Text>

              <View style={styles.barContainer}>
                <View style={[styles.barActive, { width: `${activePct}%` }]} />
                <View style={[styles.barCompleted, { width: `${compPct}%` }]} />
              </View>

              <View style={styles.barLabels}>
                <View style={styles.labelRow}><View style={[styles.dot, {backgroundColor: '#E67E22'}]}/><Text style={styles.labelText}><Text style={styles.boldTxt}>{stats.activeOrders}</Text> Active</Text></View>
                <View style={styles.labelRow}><View style={[styles.dot, {backgroundColor: '#27AE60'}]}/><Text style={styles.labelText}><Text style={styles.boldTxt}>{compOrders}</Text> Completed / Other</Text></View>
              </View>
            </TouchableOpacity>

            <View style={[styles.secHeader, {marginBottom: 15}]}>
              <MaterialCommunityIcons name="package-variant-closed" size={22} color="#8B5E3C" style={{marginRight: 8}} />
              <Text style={styles.secTitle}>Inventory & Promos</Text>
            </View>
            <View style={styles.grid}>
              <StatCard title="Total Products" value={stats.totalProducts} icon="coffee" color="#6F4E37" onPress={() => navigation.navigate('Products')} />
              <StatCard title="Promotions" value={stats.totalProducts > 0 ? "Active" : "None"} icon="ticket-percent" color="#9B59B6" onPress={() => navigation.navigate('Promos')} />
            </View>

            <View style={[styles.secHeader, {marginBottom: 15, marginTop: 10}]}>
              <MaterialCommunityIcons name="account-group" size={22} color="#8B5E3C" style={{marginRight: 8}} />
              <Text style={styles.secTitle}>User Management</Text>
            </View>
            <View style={styles.grid}>
              <StatCard title="Customers" value={stats.totalCustomers} icon="account" color="#3498DB" onPress={() => navigation.navigate('Users')} />
              <StatCard title="Admin Staff" value={stats.totalAdmins} icon="shield-account" color="#607D8B" onPress={() => navigation.navigate('Users')} />
            </View>

            <View style={styles.footer}>
              <MaterialCommunityIcons name="check-decagram" size={18} color="#D3C4B7" style={{marginBottom: 6}}/>
              <Text style={styles.footerSub}>ExpoBrew Command Center v1.0</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0' }, top: { zIndex: 999 }, bottom: { flex: 1 },
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 70, borderBottomRightRadius: 40, borderBottomLeftRadius: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, 
  title: { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 }, subTitle: { color: '#D3C4B7', fontSize: 15, alignSelf: 'center', marginTop: 2, fontWeight: '500' },
  overlapRow: { marginTop: -50, paddingHorizontal: 20 },
  revCard: { backgroundColor: '#27AE60', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', elevation: 8, shadowColor: '#27AE60', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10 },
  revIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  revLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }, revValue: { color: '#FFF', fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  scroll: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 50 }, grid: { flexDirection: 'row', justifyContent: 'space-between' },
  secHeader: { flexDirection: 'row', alignItems: 'center' }, secTitle: { fontSize: 14, fontWeight: '800', color: '#8B5E3C', textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: '#FFF', width: (width-55)/2, padding: 20, borderRadius: 24, marginBottom: 20, elevation: 4, shadowColor: '#8B5E3C', shadowOffset: {width:0, height:4}, shadowOpacity: 0.08, shadowRadius: 8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }, cardBottom: { alignItems: 'flex-start' },
  iconCircle: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cVal: { fontSize: 26, fontWeight: '900', color: '#4A3B32', letterSpacing: -0.5 }, cTitle: { fontSize: 12, color: '#888', fontWeight: '700', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  
  orderCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 24, marginBottom: 25, elevation: 4, shadowColor: '#8B5E3C', shadowOffset: {width:0, height:4}, shadowOpacity: 0.08, shadowRadius: 8 },
  bigOrderText: { fontSize: 48, fontWeight: '900', color: '#4A3B32', marginTop: 8, letterSpacing: -1 }, subOrderText: { color: '#A0A0A0', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 24 },
  barContainer: { height: 12, backgroundColor: '#F0EBE6', borderRadius: 6, flexDirection: 'row', overflow: 'hidden', marginBottom: 18 },
  barActive: { height: '100%', backgroundColor: '#E67E22' }, barCompleted: { height: '100%', backgroundColor: '#27AE60' },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' }, labelRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 }, labelText: { fontSize: 14, color: '#666' }, boldTxt: { fontWeight: '800', color: '#4A3B32' },
  
  loader: { flex: 1, justifyContent: 'center' }, footer: { marginTop: 25, alignItems: 'center', opacity: 0.6 }, footerSub: { fontSize: 11, marginTop: 4, color: '#888', fontWeight: 'bold', letterSpacing: 0.5 }
});