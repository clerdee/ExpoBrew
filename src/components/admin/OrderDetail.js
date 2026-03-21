import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Text, Card, Divider, IconButton, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const STATUSES = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

export default function OrderDetail({ route, navigation }) {
  const { order: initialOrder, refresh } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [modalVis, setModalVis] = useState(false);
  const [delVis, setDelVis] = useState(false); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const t = await SecureStore.getItemAsync('userToken');
      const orderId = String(order._id).trim();
      
      const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${t}` } });
      
      if (response.status === 200) {
        setOrder({ ...order, status: newStatus });
        if(refresh) refresh();
        setModalVis(false);
        Toast.show({ type: 'success', text1: 'Status Updated', text2: `Order is now ${newStatus}` });
      }
    } catch (e) { 
      console.log("Status Error:", e.response?.data || e.message);
      Toast.show({ type: 'error', text1: 'Update Failed', text2: e.response?.data?.message || 'Check terminal' }); 
    } finally { setLoading(false); }
  };

  const executeDelete = async () => {
    try {
      const t = await SecureStore.getItemAsync('userToken');
      const orderId = String(order._id).trim();
      await axios.delete(`${API_BASE_URL}/orders/${orderId}`, { headers: { Authorization: `Bearer ${t}` } });
      
      Toast.show({ type: 'success', text1: 'Order Deleted' });
      if(refresh) refresh();
      setDelVis(false);
      navigation.goBack(); 
    } catch (e) { 
      console.log("Delete Error:", e.response?.data || e.message);
      setDelVis(false);
      Toast.show({ type: 'error', text1: 'Delete Failed', text2: e.response?.data?.message || 'Check terminal' }); 
    }
  };

  const renderCust = (cust) => {
    if (!cust) return null;
    const txt = typeof cust === 'object' ? Object.values(cust).filter(Boolean).join(', ') : cust;
    return txt ? <Text style={styles.custTxt} numberOfLines={3}>{txt}</Text> : null;
  };

  const currIdx = STATUSES.indexOf(order.status);
  const sCfg = { 
    Pending: { c: '#F1C40F', i: 'clock-outline' }, Preparing: { c: '#E67E22', i: 'coffee-maker' }, 
    Ready: { c: '#3498DB', i: 'bell-ring' }, Completed: { c: '#27AE60', i: 'check-circle' }, 
    Cancelled: { c: '#E74C3C', i: 'cancel' } 
  }[order.status] || { c: '#888', i: 'help-circle' };

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} style={{margin:0, marginLeft:-10}}/>
        <Text style={styles.hTxt}>Order Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {order.status === 'Pending' && (
          <Button mode="contained" buttonColor="#27AE60" style={styles.mainAction} loading={loading} icon="check-bold" onPress={() => updateStatus('Preparing')}>
            ACCEPT ORDER
          </Button>
        )}

        <Card style={styles.card}><Card.Content>
          <View style={styles.row}>
            <View><Text style={styles.lbl}>Order ID</Text><Text style={styles.val}>#{order._id}</Text></View>
            <View style={{alignItems: 'flex-end'}}><Text style={styles.lbl}>Date</Text><Text style={[styles.val, {fontSize: 13}]}>{new Date(order.createdAt).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</Text></View>
          </View>
          
          <TouchableOpacity activeOpacity={0.8} onPress={()=>setModalVis(true)} style={[styles.statusBtn, { backgroundColor: sCfg.c }]}>
            <View style={styles.rowTop}><MaterialCommunityIcons name={sCfg.i} size={20} color="#FFF" style={{marginRight: 8}}/><Text style={styles.statusTxt}>STATUS: {order.status.toUpperCase()}</Text></View>
            <View style={styles.rowTop}><Text style={styles.tapTxt}>CHANGE</Text><MaterialCommunityIcons name="chevron-down" size={20} color="#FFF"/></View>
          </TouchableOpacity>
        </Card.Content></Card>

        <Card style={styles.card}><Card.Content>
          <Text style={styles.secTitle}>Customer Info</Text>
          <View style={styles.infoRow}><MaterialCommunityIcons name="account" size={18} color="#888"/><Text style={styles.valTxt}>{order.user?.name || 'Guest'}</Text></View>
          <View style={styles.infoRow}><MaterialCommunityIcons name="phone" size={18} color="#888"/><Text style={styles.valTxt}>{order.user?.phone || 'N/A'}</Text></View>
          <View style={styles.infoRow}><MaterialCommunityIcons name="email" size={18} color="#888"/><Text style={styles.valTxt}>{order.user?.email || 'N/A'}</Text></View>
          <View style={styles.infoRow}><MaterialCommunityIcons name="map-marker" size={18} color="#888"/><Text style={[styles.valTxt, {flex: 1, lineHeight: 20}]} numberOfLines={3}>{order.shippingAddress || 'N/A'}</Text></View>
        </Card.Content></Card>

        <Text style={[styles.secTitle, {marginLeft: 5}]}>Items</Text>
        {order.orderItems.map((item, idx) => (
          <Card key={idx} style={styles.itemCard}><Card.Content>
            <View style={styles.rowTop}>
              <View style={styles.qtyBox}><Text style={styles.qty}>{item.qty}x</Text></View>
              <View style={{flex:1, paddingHorizontal: 12}}>
                <Text style={styles.iName}>{item.name}</Text>
                {renderCust(item.customizations)}
              </View>
              <Text style={styles.iPrice}>₱{(item.price * item.qty).toFixed(2)}</Text>
            </View>
          </Card.Content></Card>
        ))}

        <Card style={styles.card}><Card.Content>
          <View style={styles.row}><Text style={styles.lbl}>Payment Method</Text><Text style={styles.payVal}>{order.paymentMethod || 'GCash'}</Text></View>
          <Divider style={styles.div} />
          <View style={styles.row}><Text style={styles.lbl}>Total Amount</Text><Text style={styles.totVal}>₱{order.totalPrice.toFixed(2)}</Text></View>
        </Card.Content></Card>

        <Button mode="outlined" textColor="#D32F2F" style={styles.deleteBtn} icon="trash-can-outline" onPress={() => setDelVis(true)}>DELETE ORDER</Button>
      </ScrollView>

      {/* STATUS UPDATE MODAL */}
      <Modal animationType="fade" transparent visible={modalVis} onRequestClose={()=>setModalVis(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.mHead}><Text style={styles.mTitle}>Update Status</Text><IconButton icon="close" onPress={()=>setModalVis(false)}/></View>
            {STATUSES.map((s, i) => {
              const isPast = i < currIdx;
              const isCurrent = order.status === s;
              const isDone = currIdx >= 3 && !isCurrent; 
              const disabled = isPast || isCurrent || isDone;

              return (
                <TouchableOpacity key={s} disabled={disabled} style={[styles.sBtn, isCurrent && styles.sBtnOn, disabled && !isCurrent && {opacity: 0.4}]} onPress={()=>updateStatus(s)}>
                  <Text style={[styles.sBtnTxt, isCurrent && styles.sBtnTxtOn]}>{s}</Text>
                  {isCurrent && <MaterialCommunityIcons name="check" size={20} color="#6F4E37" />}
                  {disabled && !isCurrent && <MaterialCommunityIcons name="cancel" size={20} color="#CCC" />}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </Modal>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <Modal animationType="fade" transparent visible={delVis} onRequestClose={()=>setDelVis(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={[styles.mTitle, {color: '#D32F2F', marginBottom: 10}]}>Delete Order</Text>
            <Text style={{color: '#555', marginBottom: 25, fontSize: 15}}>Are you sure you want to permanently delete this order? This action cannot be undone.</Text>
            <View style={{flexDirection: 'row', gap: 10}}>
              <Button mode="outlined" textColor="#555" style={{flex: 1, borderColor: '#CCC'}} onPress={()=>setDelVis(false)}>Cancel</Button>
              <Button mode="contained" buttonColor="#D32F2F" style={{flex: 1}} onPress={executeDelete}>Delete</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAF5F0', paddingTop: 50 },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 }, hTxt: { fontSize: 22, fontWeight: 'bold', color: '#4A3B32' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 }, mainAction: { marginBottom: 15, borderRadius: 12, paddingVertical: 5 },
  card: { backgroundColor: '#FFF', marginBottom: 15, borderRadius: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, rowTop: { flexDirection: 'row', alignItems: 'flex-start' },
  lbl: { color: '#888', fontSize: 12, textTransform: 'uppercase' }, val: { fontWeight: 'bold', color: '#333', fontSize: 16 },
  statusBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 10, marginTop: 15 },
  statusTxt: { color: '#FFF', fontWeight: '900', fontSize: 15 }, tapTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold', marginRight: 4 },
  secTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A3B32', marginBottom: 10 }, 
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 10 }, valTxt: { marginLeft: 10, color: '#444', fontWeight: '500', fontSize: 14 },
  itemCard: { backgroundColor: '#FFF', marginBottom: 12, borderRadius: 12 },
  qtyBox: { backgroundColor: '#EBE1D7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }, qty: { fontWeight: 'bold', color: '#6F4E37' },
  iName: { fontWeight: 'bold', fontSize: 16, color: '#333' }, custTxt: { fontSize: 12, color: '#888', marginTop: 4, lineHeight: 18 }, iPrice: { fontWeight: 'bold', color: '#6F4E37', fontSize: 16 },
  div: { marginVertical: 12, backgroundColor: '#F0F0F0' }, payVal: { fontWeight: 'bold', color: '#555', fontSize: 15 },
  totVal: { fontSize: 20, fontWeight: '900', color: '#6F4E37' }, deleteBtn: { marginTop: 10, borderColor: '#D32F2F', borderRadius: 10 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }, sheet: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  mHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, mTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' },
  sBtn: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 12, marginBottom: 8, backgroundColor: '#F9F9F9' }, sBtnOn: { backgroundColor: '#EBE1D7', borderWidth: 1, borderColor: '#6F4E37' },
  sBtnTxt: { fontSize: 15, color: '#555', fontWeight: '500' }, sBtnTxtOn: { color: '#6F4E37', fontWeight: 'bold' }
});