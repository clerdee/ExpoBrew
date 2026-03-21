import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const STATUSES = ['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
const DATES = ['All Time', 'Today', 'Last 7 Days'];

export default function AdminOrders({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const t = await SecureStore.getItemAsync('userToken');
      setOrders((await axios.get(`${API_BASE_URL}/orders`, { headers: { Authorization: `Bearer ${t}` } })).data);
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to load orders' }); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleAccept = async (id) => {
    try {
      const t = await SecureStore.getItemAsync('userToken');
      await axios.put(`${API_BASE_URL}/orders/${id}/status`, { status: 'Preparing' }, { headers: { Authorization: `Bearer ${t}` } });
      Toast.show({ type: 'success', text1: 'Order Accepted', text2: 'Moved to Preparing' });
      fetchOrders();
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to update order' }); }
  };

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = o._id.toLowerCase().includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    let matchDate = true;
    const oDate = new Date(o.createdAt), now = new Date();
    if (dateFilter === 'Today') matchDate = oDate.toDateString() === now.toDateString();
    if (dateFilter === 'Last 7 Days') matchDate = (now - oDate) / (1000*60*60*24) <= 7;
    return matchSearch && matchStatus && matchDate;
  }), [orders, search, statusFilter, dateFilter]);

  const renderItem = ({ item: o }) => {
    const sCfg = { Pending: { c: '#F1C40F' }, Preparing: { c: '#E67E22' }, Ready: { c: '#3498DB' }, Completed: { c: '#27AE60' }, Cancelled: { c: '#E74C3C' } }[o.status] || { c: '#888' };
    
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('OrderDetail', { order: o, refresh: fetchOrders })}>
        <Card style={styles.card} mode="elevated">
          <View style={styles.cardContent}>
            <View style={styles.rowTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.id}>#{o._id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.date}>{new Date(o.createdAt).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: sCfg.c + '15' }]}>
                <Text style={[styles.statusTxt, { color: sCfg.c }]}>{o.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <Divider style={styles.div} />
            
            <View style={styles.rowMid}>
              <View>
                <Text style={styles.cust}><MaterialCommunityIcons name="account" size={14}/> {o.user?.name || 'Guest'}</Text>
                <Text style={styles.items}>{o.orderItems.length} items</Text>
              </View>
              <Text style={styles.total}>₱{o.totalPrice.toFixed(2)}</Text>
            </View>

            {/* Direct Accept Action for Pending Orders */}
            {o.status === 'Pending' && (
              <View style={styles.actionRow}>
                <Button mode="contained" buttonColor="#4A2E1B" labelStyle={{fontSize: 13, fontWeight: 'bold'}} style={styles.acceptBtn} onPress={() => handleAccept(o._id)}>
                  ACCEPT ORDER
                </Button>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.toggleDrawer && navigation.toggleDrawer()} style={{ marginLeft: -10 }} />
            <Text style={styles.title}>Orders</Text>
            <IconButton icon="refresh" size={28} iconColor="#FFF" onPress={fetchOrders} style={{ marginRight: -10 }} />
          </View>
        </View>
        
        <View style={styles.searchRow}>
          <Searchbar placeholder="Search ID or Customer..." onChangeText={setSearch} value={search} style={styles.searchBar} inputStyle={{ fontSize: 15 }} iconColor="#4A2E1B" elevation={2} />
        </View>

        <View style={styles.filters}>
          <Text style={styles.filterTitle}>Order Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {STATUSES.map(f => <Chip key={f} mode="flat" onPress={()=>setStatusFilter(f)} style={[styles.chip, statusFilter===f?styles.chipOn:styles.chipOff]} textStyle={statusFilter===f?styles.textOn:styles.textOff}>{f}</Chip>)}
          </ScrollView>
          
          <Text style={styles.filterTitle}>Time Range</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {DATES.map(f => <Chip key={f} mode="flat" onPress={()=>setDateFilter(f)} style={[styles.chip, dateFilter===f?styles.chipOn:styles.chipOff]} textStyle={dateFilter===f?styles.textOn:styles.textOff}>{f}</Chip>)}
          </ScrollView>
        </View>
      </View>

      <View style={styles.bottom}>
        {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : (
          <FlatList data={filtered} keyExtractor={i => i._id.toString()} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} ListEmptyComponent={
            <View style={styles.empty}><MaterialCommunityIcons name="clipboard-text-off" size={60} color="#CCC" /><Text style={styles.emptyText}>No matching orders found.</Text></View>
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
  loader: { flex: 1, justifyContent: 'center' }, list: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 5 }, card: { marginBottom: 14, backgroundColor: '#FFF', borderRadius: 15 },
  cardContent: { padding: 16 }, rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  id: { fontSize: 16, fontWeight: '900', color: '#333' }, date: { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }, statusTxt: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  div: { marginVertical: 12, backgroundColor: '#F0F0F0' }, rowMid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cust: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 4 }, items: { fontSize: 13, color: '#888' },
  total: { fontSize: 18, fontWeight: '900', color: '#4A2E1B' },
  actionRow: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 15 }, acceptBtn: { borderRadius: 8 },
  empty: { alignItems: 'center', marginTop: 60 }, emptyText: { color: '#888', fontSize: 16, marginTop: 10, fontWeight: '500' }
});