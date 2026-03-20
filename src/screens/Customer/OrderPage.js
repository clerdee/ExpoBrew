import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Button, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

export default function OrderPage({ navigation }) {
  const [activeTab, setActiveTab] = useState('Active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      // ENSURE THIS URL MATCHES YOUR BACKEND ROUTE EXACTLY
      const { data } = await axios.get(`${API_BASE_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
    } catch (e) { console.error("Order fetch error:", e); } 
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(o => 
    activeTab === 'Active' ? ['Pending', 'Preparing', 'Ready'].includes(o.status) : o.status === 'Completed'
  );

  const renderOrder = ({ item: o }) => {
    const config = {
      Pending: { color: '#F1C40F', icon: 'clock-outline' },
      Preparing: { color: '#E67E22', icon: 'coffee-maker' },
      Ready: { color: '#27AE60', icon: 'check-decagram' },
      Completed: { color: '#6F4E37', icon: 'check-circle' }
    }[o.status] || { color: '#888', icon: 'help-circle' };

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.row}>
            <View>
              <Text style={styles.id}>Order #{o._id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.date}>{new Date(o.createdAt).toLocaleDateString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: config.color + '15' }]}>
              <MaterialCommunityIcons name={config.icon} size={14} color={config.color} />
              <Text style={[styles.status, { color: config.color }]}>{o.status}</Text>
            </View>
          </View>
          <Divider style={styles.div} />
          <View style={styles.row}>
            <View style={styles.itemsWrap}>
              <MaterialCommunityIcons name="shopping-outline" size={16} color="#888" />
              <Text numberOfLines={1} style={styles.items}>{o.orderItems.map(i => `${i.qty}x ${i.name}`).join(', ')}</Text>
            </View>
            <Text style={styles.total}>₱{o.totalPrice.toFixed(2)}</Text>
          </View>
          <Button mode={activeTab==='Active'?"contained":"outlined"} style={styles.btn} buttonColor={activeTab==='Active'?"#6F4E37":null} textColor={activeTab==='History'?"#6F4E37":"#FFF"} onPress={()=>{}}>
            {activeTab === 'Active' ? 'Track Order' : 'Reorder'}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.hTitle}>My Orders</Text><IconButton icon="magnify" size={24} iconColor="#4A3B32" /></View>
      <View style={styles.tabs}>{['Active', 'History'].map(t => (
        <TouchableOpacity key={t} style={[styles.tab, activeTab===t && styles.activeTab]} onPress={()=>setActiveTab(t)}>
          <Text style={[styles.tabTxt, activeTab===t && styles.activeTabTxt]}>{t}</Text>
        </TouchableOpacity>))}
      </View>
      {loading ? <ActivityIndicator style={{flex:1}} color="#6F4E37" /> : (
        <FlatList data={filtered} renderItem={renderOrder} keyExtractor={i=>i._id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true); fetchOrders();}} />}
          ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="coffee-off-outline" size={64} color="#CCC" /><Text style={styles.emptyTxt}>No {activeTab.toLowerCase()} orders.</Text></View>} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  hTitle: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32' },
  tabs: { flexDirection: 'row', backgroundColor: '#EBE1D7', marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff', elevation: 3 },
  tabTxt: { fontWeight: '600', color: '#888' },
  activeTabTxt: { color: '#6F4E37', fontWeight: 'bold' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', marginBottom: 16, borderRadius: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontWeight: '800', color: '#333', fontSize: 15 },
  date: { color: '#999', fontSize: 12, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
  status: { fontWeight: 'bold', fontSize: 11 },
  div: { marginVertical: 12, backgroundColor: '#F5F5F5' },
  itemsWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 },
  items: { color: '#666', fontSize: 13, flexShrink: 1 },
  total: { fontWeight: 'bold', color: '#6F4E37', fontSize: 16 },
  btn: { marginTop: 15, borderRadius: 10 },
  empty: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
  emptyTxt: { marginTop: 12, color: '#888', fontSize: 16, fontWeight: '500' }
});