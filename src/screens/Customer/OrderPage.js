import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Button, Divider, IconButton, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../redux/actions/orderActions';

export default function OrderPage({ navigation }) {
  const dispatch = useDispatch();
  const { items: orders, loading, error } = useSelector((state) => state.orderList);

  const [activeTab, setActiveTab] = useState('Active'), [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('userToken');
      setIsGuest(!token); if (token) dispatch(fetchOrders());
    })();
  }, [dispatch]);

  useEffect(() => { if (error) Toast.show({ type: 'error', text1: 'Orders Error', text2: error }); }, [error]);

  const refreshOrders = async () => { setRefreshing(true); await dispatch(fetchOrders()); setRefreshing(false); };
  const filtered = orders.filter(o => activeTab === 'Active' ? ['Pending', 'Preparing', 'Ready'].includes(o.status) : o.status === 'Completed' || o.status === 'Cancelled');

  const handleRateBrew = (order) => {
    const items = order.orderItems.filter(i => !!i.product);
    if (!items.length) return Toast.show({ type: 'info', text1: 'Unavailable', text2: 'No items to review.' });
    navigation.navigate('ProductDetail', { productId: items[0].product, orderItem: items[0], orderId: order._id });
  };

  const renderOrder = ({ item: o }) => {
    const config = { Pending: { color: '#F1C40F', icon: 'clock-outline' }, Preparing: { color: '#E67E22', icon: 'coffee-maker' }, Ready: { color: '#27AE60', icon: 'check-decagram' }, Completed: { color: '#6F4E37', icon: 'check-circle' }, Cancelled: { color: '#E74C3C', icon: 'cancel' } }[o.status] || { color: '#888', icon: 'help-circle' };
    const isCancelled = o.status === 'Cancelled';
    const canRev = o.status === 'Completed' && o.orderItems.some(i => !!i.product);

    return (
      <Card style={styles.card} mode="elevated" onPress={() => navigation.navigate('OrderDetail', { orderId: o._id })}>
        <Card.Content>
          <View style={styles.row}>
            <View><Text style={styles.id}>Order #{o._id.slice(-6).toUpperCase()}</Text><Text style={styles.date}>{new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text></View>
            <View style={[styles.badge, { backgroundColor: `${config.color}15` }]}><MaterialCommunityIcons name={config.icon} size={14} color={config.color} /><Text style={[styles.status, { color: config.color }]}>{o.status}</Text></View>
          </View>
          <Divider style={styles.div} />
          <View style={styles.row}>
            <View style={styles.itemsWrap}><MaterialCommunityIcons name="shopping-outline" size={16} color="#888" /><Text numberOfLines={1} style={styles.items}>{o.orderItems.map(i => `${i.qty}x ${i.name}`).join(', ')}</Text></View>
            <Text style={styles.total}>₱{o.totalPrice.toFixed(2)}</Text>
          </View>
          {isCancelled ? (
            <Button mode="outlined" style={styles.btn} disabled>Order Cancelled</Button>
          ) : (
            <Button mode={activeTab === 'Active' ? 'contained' : 'outlined'} style={styles.btn} buttonColor={activeTab === 'Active' ? '#6F4E37' : undefined} textColor={activeTab === 'History' ? '#6F4E37' : '#FFF'} onPress={() => activeTab === 'Active' ? navigation.navigate('OrderDetail', { orderId: o._id }) : handleRateBrew(o)} disabled={activeTab === 'History' && !canRev}>
              {activeTab === 'Active' ? 'Track Order' : canRev ? 'Rate Your Brew' : 'Review Unavailable'}
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.hTitle}>My Orders</Text>{!isGuest && <IconButton icon="magnify" size={24} iconColor="#4A3B32" />}</View>
      {isGuest ? (
        <View style={styles.guestContainer}><MaterialCommunityIcons name="login-variant" size={80} color="#D2B48C" /><Text style={styles.guestTitle}>Sign in to view orders</Text><Button mode="contained" buttonColor="#6F4E37" style={styles.loginBtn} onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>Log In</Button></View>
      ) : (
        <>
          <View style={styles.tabs}>{['Active', 'History'].map(t => (<TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}><Text style={[styles.tabTxt, activeTab === t && styles.activeTabTxt]}>{t}</Text></TouchableOpacity>))}</View>
          {loading ? <ActivityIndicator style={{ flex: 1 }} color="#6F4E37" /> : (
            <FlatList data={filtered} renderItem={renderOrder} keyExtractor={i => i._id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshOrders} />} ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="coffee-off-outline" size={64} color="#CCC" /><Text style={styles.emptyTxt}>No {activeTab.toLowerCase()} orders.</Text></View>} />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0', paddingTop: 50 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  hTitle: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32' }, tabs: { flexDirection: 'row', backgroundColor: '#EBE1D7', marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 }, activeTab: { backgroundColor: '#fff', elevation: 3 }, tabTxt: { fontWeight: '600', color: '#888' },
  activeTabTxt: { color: '#6F4E37', fontWeight: 'bold' }, list: { paddingHorizontal: 20, paddingBottom: 40 }, card: { backgroundColor: '#fff', marginBottom: 16, borderRadius: 16, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, id: { fontWeight: '800', color: '#333', fontSize: 15 }, date: { color: '#999', fontSize: 12, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 }, status: { fontWeight: 'bold', fontSize: 11 }, div: { marginVertical: 12, backgroundColor: '#F5F5F5' },
  itemsWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 }, items: { color: '#666', fontSize: 13, flexShrink: 1 }, total: { fontWeight: 'bold', color: '#6F4E37', fontSize: 16 },
  btn: { marginTop: 15, borderRadius: 10 }, empty: { alignItems: 'center', marginTop: 100, opacity: 0.5 }, emptyTxt: { marginTop: 12, color: '#888', fontSize: 16 },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }, guestTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A3B32', marginVertical: 15 }, loginBtn: { borderRadius: 25, width: '100%' }
});