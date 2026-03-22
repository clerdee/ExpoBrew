import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Text, IconButton, Divider, Card, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../configs/config';

const STEPS = ['Pending', 'Preparing', 'Ready', 'Completed'];

export default function OrderDetailPage({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null), [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchDetail = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const token = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } });
      setOrder(data);
    } catch (e) { console.log("Detail Fetch Error:", e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(() => fetchDetail(), 5000); 
    return () => clearInterval(interval);
  }, [orderId]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const token = await SecureStore.getItemAsync('userToken');
      await axios.put(`${API_BASE_URL}/orders/${orderId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchDetail();
      Toast.show({ type: 'success', text1: 'Order Cancelled', text2: 'Your order was successfully cancelled.' });
    } catch (e) { 
      Toast.show({ type: 'error', text1: 'Cancel Failed', text2: e.response?.data?.message || 'Server error' }); 
    } finally { 
      setCancelling(false); 
    }
  };

  if (loading && !order) return <View style={styles.center}><ActivityIndicator color="#6F4E37" size="large" /></View>;
  if (!order) return <View style={styles.center}><Text>Order not found.</Text><IconButton icon="refresh" onPress={fetchDetail} /></View>;

  const currentStep = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';
  
  const getStatusTheme = () => {
    if (isCancelled) return { color: '#E74C3C', icon: 'close-circle' };
    if (order.status === 'Completed') return { color: '#27AE60', icon: 'check-circle' };
    if (order.status === 'Ready') return { color: '#3498DB', icon: 'moped' };
    if (order.status === 'Preparing') return { color: '#E67E22', icon: 'coffee-maker' };
    return { color: '#F1C40F', icon: 'clock-outline' };
  };
  
  const getStatusMessage = () => {
    if (isCancelled) return "This order has been cancelled.";
    if (order.status === 'Completed') return "Thank you for enjoying ExpoBrew!";
    if (order.status === 'Ready') return "Your order is ready to be picked up!";
    if (order.status === 'Preparing') return "Our baristas are crafting your drink right now!";
    return "We've received your order and will start preparing it soon.";
  };

  const theme = getStatusTheme();

  return (
    <View style={styles.bg}>
      <View style={styles.head}><IconButton icon="arrow-left" onPress={() => navigation.goBack()} /><Text style={styles.hTitle}>Order Details</Text><View style={{width:48}}/></View>
      
      <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDetail(true)} />}>
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <MaterialCommunityIcons name={theme.icon} size={48} color={theme.color} />
            <Text style={[styles.statText, {color: theme.color}]}>{order.status.toUpperCase()}</Text>
            <Text style={styles.statDesc}>{getStatusMessage()}</Text>
          </View>
          
          {!isCancelled && (
            <View style={styles.stepper}>
              {STEPS.map((s, i) => (
                <View key={s} style={styles.step}>
                  <View style={[styles.dot, i <= currentStep && {backgroundColor: theme.color}]} />
                  <Text style={[styles.stepLabel, i <= currentStep && styles.activeStepLabel]}>{s}</Text>
                  {i < STEPS.length - 1 && <View style={[styles.line, i < currentStep && {backgroundColor: theme.color}]} />}
                </View>
              ))}
            </View>
          )}
        </Card>

        <Text style={styles.secTitle}>Items Ordered</Text>
        <Card style={styles.itemCard}>
          {order.orderItems.map((item, i) => {
            const cust = item.customizations || {};
            return (
              <View key={i}>
                <View style={styles.itemRow}>
                  {item.image ? <Image source={{ uri: item.image }} style={styles.itemImg} /> : <View style={styles.imgPlaceholder}><MaterialCommunityIcons name="coffee" size={24} color="#CCC" /></View>}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>Qty: {item.qty}</Text>
                    
                    {/* Render Customizations if available */}
                    {(cust.size || cust.espresso || cust.milk || cust.syrups || cust.extras || cust.condiments) && (
                      <View style={styles.custWrap}>
                        {!!cust.size && <Text style={styles.itemSub}>Size: {cust.size}</Text>}
                        {!!cust.espresso && <Text style={styles.itemSub}>Espresso: {cust.espresso}</Text>}
                        {!!cust.milk && <Text style={styles.itemSub}>Milk: {cust.milk}</Text>}
                        {!!cust.syrups && <Text style={styles.itemSub}>Syrups: {cust.syrups}</Text>}
                        {!!cust.extras && <Text style={styles.itemSub}>Extras: {cust.extras}</Text>}
                        {!!cust.condiments && <Text style={styles.itemSub}>Condiments: {cust.condiments}</Text>}
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemPrice}>₱{(item.price * item.qty).toFixed(2)}</Text>
                </View>
                {i < order.orderItems.length - 1 && <Divider style={styles.div} />}
              </View>
            );
          })}
        </Card>

        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total Amount</Text><Text style={styles.totalVal}>₱{order.totalPrice.toFixed(2)}</Text></View>

        <Card style={styles.infoCard}>
          <Text style={styles.infoHead}>Order Information</Text>
          <Text style={styles.infoText}>Order ID: <Text style={{fontWeight:'bold'}}>#{order._id.toUpperCase()}</Text></Text>
          <Text style={styles.infoText}>Payment: {order.paymentMethod}</Text>
          <Text style={styles.infoText}>Address: {order.shippingAddress}</Text>
          <Text style={styles.infoText}>Placed on: {new Date(order.createdAt).toLocaleString()}</Text>
        </Card>

        <Button 
          mode="contained" 
          buttonColor={order.status === 'Pending' ? "#E74C3C" : "#D3D3D3"} 
          loading={cancelling} 
          disabled={cancelling || order.status !== 'Pending'} 
          onPress={handleCancelOrder} 
          style={styles.cancelBtn}
          labelStyle={order.status !== 'Pending' ? {color: '#888'} : {}}
        >
          Cancel Order
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAF5F0' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 10, backgroundColor: '#FFF', elevation: 2 },
  hTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' }, scroll: { padding: 20 },
  statCard: { padding: 20, borderRadius: 15, backgroundColor: '#FFF', marginBottom: 25, elevation: 3 },
  statHeader: { alignItems: 'center', marginBottom: 20 }, statText: { fontSize: 24, fontWeight: '900', marginTop: 10 },
  statDesc: { fontSize: 13, color: '#666', marginTop: 5, textAlign: 'center' },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  step: { alignItems: 'center', flex: 1 }, dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#DDD', zIndex: 2 },
  line: { position: 'absolute', top: 7, left: '50%', width: '100%', height: 2, backgroundColor: '#DDD', zIndex: 1 },
  stepLabel: { fontSize: 10, marginTop: 8, color: '#AAA' }, activeStepLabel: { color: '#333', fontWeight: 'bold' },
  secTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A3B32', marginBottom: 12 },
  itemCard: { padding: 15, backgroundColor: '#FFF', borderRadius: 12, elevation: 1, marginBottom: 20 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start' },
  itemImg: { width: 55, height: 55, borderRadius: 8, backgroundColor: '#EEE', marginRight: 15 },
  imgPlaceholder: { width: 55, height: 55, borderRadius: 8, backgroundColor: '#EEE', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1 }, itemName: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  itemQty: { fontSize: 12, color: '#555', fontWeight: 'bold', marginBottom: 4 },
  custWrap: { backgroundColor: '#F9F9F9', padding: 8, borderRadius: 6, marginTop: 4 },
  itemSub: { fontSize: 11, color: '#777', marginTop: 2 }, itemPrice: { fontWeight: 'bold', color: '#6F4E37', fontSize: 16 },
  div: { marginVertical: 12 }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' }, totalVal: { fontSize: 22, fontWeight: '900', color: '#6F4E37' },
  infoCard: { padding: 15, backgroundColor: '#EBE1D7', borderRadius: 12, marginBottom: 25 },
  infoHead: { fontWeight: 'bold', marginBottom: 10, color: '#4A3B32', fontSize: 15 }, 
  infoText: { fontSize: 12, color: '#555', marginBottom: 5, lineHeight: 18 },
  cancelBtn: { borderRadius: 10, paddingVertical: 5, elevation: 2, marginBottom: 20 }
});