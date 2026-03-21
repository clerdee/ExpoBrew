import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, IconButton, Divider, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const STEPS = ['Pending', 'Preparing', 'Ready', 'Completed'];

export default function OrderDetailPage({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null), [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);

  const fetchDetail = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const token = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(data);
    } catch (e) { console.log("Detail Fetch Error:", e.response?.status); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(() => fetchDetail(), 5000); 
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading && !order) return <View style={styles.center}><ActivityIndicator color="#6F4E37" size="large" /></View>;
  if (!order) return <View style={styles.center}><Text>Order not found.</Text><IconButton icon="refresh" onPress={fetchDetail} /></View>;

  const currentStep = STEPS.indexOf(order.status);
  const getStatusTheme = () => {
    if (order.status === 'Completed') return { color: '#27AE60', icon: 'check-circle' };
    if (order.status === 'Ready') return { color: '#3498DB', icon: 'moped' };
    if (order.status === 'Preparing') return { color: '#E67E22', icon: 'coffee-maker' };
    return { color: '#F1C40F', icon: 'clock-outline' };
  };
  const theme = getStatusTheme();

  return (
    <View style={styles.bg}>
      <View style={styles.head}><IconButton icon="arrow-left" onPress={() => navigation.goBack()} /><Text style={styles.hTitle}>Order Tracking</Text><View style={{width:48}}/></View>
      
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDetail(true)} />}>
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <MaterialCommunityIcons name={theme.icon} size={48} color={theme.color} />
            <Text style={[styles.statText, {color: theme.color}]}>{order.status.toUpperCase()}</Text>
          </View>
          <View style={styles.stepper}>
            {STEPS.map((s, i) => (
              <View key={s} style={styles.step}>
                <View style={[styles.dot, i <= currentStep && {backgroundColor: theme.color}]} />
                <Text style={[styles.stepLabel, i <= currentStep && styles.activeStepLabel]}>{s}</Text>
                {i < STEPS.length - 1 && <View style={[styles.line, i < currentStep && {backgroundColor: theme.color}]} />}
              </View>
            ))}
          </View>
        </Card>

        <Text style={styles.secTitle}>Order Items</Text>
        {order.orderItems.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={{flex:1}}><Text style={styles.itemName}>{item.qty}x {item.name}</Text><Text style={styles.itemSub}>{item.size} | {item.sugarLevel || 'Standard'}</Text></View>
            <Text style={styles.itemPrice}>₱{(item.price * item.qty).toFixed(2)}</Text>
          </View>
        ))}

        <Divider style={styles.div} />
        <View style={styles.rowBetween}><Text style={styles.totalLabel}>Total Paid</Text><Text style={styles.totalVal}>₱{order.totalPrice.toFixed(2)}</Text></View>

        <Card style={styles.infoCard}>
          <Text style={styles.infoHead}>Order Info</Text>
          <Text style={styles.infoText}>Order ID: <Text style={{fontWeight:'bold'}}>#{order._id.toUpperCase()}</Text></Text>
          <Text style={styles.infoText}>Payment: {order.paymentMethod}</Text>
          <Text style={styles.infoText}>Address: {order.shippingAddress}</Text>
          <Text style={styles.infoText}>Placed on: {new Date(order.createdAt).toLocaleString()}</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAF5F0' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 10, backgroundColor: '#FFF', elevation: 2 },
  hTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' }, scroll: { padding: 20 },
  statCard: { padding: 20, borderRadius: 15, backgroundColor: '#FFF', marginBottom: 25, elevation: 3 },
  statHeader: { alignItems: 'center', marginBottom: 30 }, statText: { fontSize: 24, fontWeight: '900', marginTop: 10 },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  step: { alignItems: 'center', flex: 1 }, dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#DDD', zIndex: 2 },
  line: { position: 'absolute', top: 7, left: '50%', width: '100%', height: 2, backgroundColor: '#DDD', zIndex: 1 },
  stepLabel: { fontSize: 10, marginTop: 8, color: '#AAA' }, activeStepLabel: { color: '#333', fontWeight: 'bold' },
  secTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A3B32', marginBottom: 15 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  itemName: { fontSize: 15, fontWeight: '600' }, itemSub: { fontSize: 12, color: '#888' }, itemPrice: { fontWeight: 'bold' },
  div: { marginVertical: 15 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold' }, totalVal: { fontSize: 22, fontWeight: 'bold', color: '#6F4E37' },
  infoCard: { marginTop: 25, padding: 15, backgroundColor: '#EBE1D7', borderRadius: 12 },
  infoHead: { fontWeight: 'bold', marginBottom: 10, color: '#4A3B32' }, infoText: { fontSize: 12, color: '#666', marginBottom: 5, lineHeight: 18 }
});