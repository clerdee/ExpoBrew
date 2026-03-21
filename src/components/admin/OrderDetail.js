import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
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

  const updateStatus = async (status) => {
    try {
      setModalVis(false);
      const t = await SecureStore.getItemAsync('userToken');
      await axios.put(`${API_BASE_URL}/orders/${order._id}/status`, { status }, { headers: { Authorization: `Bearer ${t}` } });
      setOrder({ ...order, status });
      if(refresh) refresh();
      Toast.show({ type: 'success', text1: 'Status Updated' });
    } catch (e) { Toast.show({ type: 'error', text1: 'Update Failed' }); }
  };

  const sCfg = { Pending: { c: '#F1C40F', i: 'clock-outline' }, Preparing: { c: '#E67E22', i: 'coffee-maker' }, Ready: { c: '#3498DB', i: 'bell-ring' }, Completed: { c: '#27AE60', i: 'check-circle' }, Cancelled: { c: '#E74C3C', i: 'cancel' } }[order.status] || { c: '#888', i: 'help-circle' };

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        {/* Strictly navigates back to Orders list */}
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.navigate('Orders')} style={{margin:0, marginLeft:-10}}/>
        <Text style={styles.hTxt}>Order Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Order ID & PROMINENT STATUS BUTTON */}
        <Card style={styles.card}><Card.Content>
          <View style={styles.row}>
            <View><Text style={styles.lbl}>Order ID</Text><Text style={styles.val}>#{order._id}</Text></View>
            <View style={{alignItems: 'flex-end'}}><Text style={styles.lbl}>Date & Time</Text><Text style={[styles.val, {fontSize: 13}]}>{new Date(order.createdAt).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}</Text></View>
          </View>
          
          <TouchableOpacity activeOpacity={0.8} onPress={()=>setModalVis(true)} style={[styles.statusBtn, { backgroundColor: sCfg.c }]}>
            <View style={styles.rowTop}><MaterialCommunityIcons name={sCfg.i} size={20} color="#FFF" style={{marginRight: 8}}/><Text style={styles.statusTxt}>STATUS: {order.status.toUpperCase()}</Text></View>
            <View style={styles.rowTop}><Text style={styles.tapTxt}>TAP TO CHANGE</Text><MaterialCommunityIcons name="chevron-down" size={20} color="#FFF"/></View>
          </TouchableOpacity>
        </Card.Content></Card>

        <Card style={styles.card}><Card.Content>
          <Text style={styles.secTitle}>Customer Info</Text>
          <View style={styles.row}><MaterialCommunityIcons name="account" size={18} color="#888"/><Text style={styles.valTxt}>{order.user?.name || 'Guest'}</Text></View>
          <View style={[styles.row, {marginTop:8}]}><MaterialCommunityIcons name="email" size={18} color="#888"/><Text style={styles.valTxt}>{order.user?.email || 'N/A'}</Text></View>
        </Card.Content></Card>

        <Text style={[styles.secTitle, {marginLeft: 5, marginBottom: 10}]}>Order Items</Text>
        {order.orderItems.map((item, idx) => (
          <Card key={idx} style={styles.itemCard}><Card.Content>
            <View style={styles.rowTop}>
              <View style={styles.qtyBox}><Text style={styles.qty}>{item.qty}x</Text></View>
              <View style={{flex:1, paddingHorizontal: 12}}><Text style={styles.iName}>{item.name}</Text></View>
              <Text style={styles.iPrice}>₱{(item.price * item.qty).toFixed(2)}</Text>
            </View>

            {item.customizations && (
              <View style={styles.custBox}>
                <Text style={styles.cHead}><MaterialCommunityIcons name="tune" size={12}/> CUSTOMIZATIONS</Text>
                <View style={styles.cRow}><Text style={styles.cLbl}>Size:</Text><Text style={styles.cVal}>{item.customizations.size}</Text></View>
                <View style={styles.cRow}><Text style={styles.cLbl}>Milk:</Text><Text style={styles.cVal}>{item.customizations.milk}</Text></View>
                <View style={styles.cRow}><Text style={styles.cLbl}>Espresso:</Text><Text style={styles.cVal}>{item.customizations.espresso}</Text></View>
                {item.customizations.syrups?.length > 0 && <View style={styles.cRow}><Text style={styles.cLbl}>Syrups:</Text><Text style={styles.cVal}>{item.customizations.syrups.map(s=>s.l).join(', ')}</Text></View>}
                {item.customizations.extras?.length > 0 && <View style={styles.cRow}><Text style={styles.cLbl}>Extras:</Text><Text style={styles.cVal}>{item.customizations.extras.map(e=>e.l).join(', ')}</Text></View>}
                {item.customizations.condiments?.length > 0 && <View style={styles.cRow}><Text style={styles.cLbl}>Condiments:</Text><Text style={styles.cVal}>{item.customizations.condiments.join(', ')}</Text></View>}
              </View>
            )}
          </Card.Content></Card>
        ))}

        <Card style={[styles.card, {marginTop: 10}]}><Card.Content>
          <View style={styles.row}><Text style={styles.lbl}>Subtotal</Text><Text style={styles.val}>₱{(order.totalPrice / 1.12).toFixed(2)}</Text></View>
          <View style={[styles.row, {marginVertical:8}]}><Text style={styles.lbl}>VAT (12%)</Text><Text style={styles.val}>₱{(order.totalPrice - (order.totalPrice / 1.12)).toFixed(2)}</Text></View>
          <Divider style={styles.div}/>
          <View style={styles.row}><Text style={styles.totLbl}>Total Amount</Text><Text style={styles.totVal}>₱{order.totalPrice.toFixed(2)}</Text></View>
        </Card.Content></Card>
      </ScrollView>

      <Modal animationType="fade" transparent visible={modalVis} onRequestClose={() => setModalVis(false)}><View style={styles.overlay}><View style={styles.sheet}>
        <View style={styles.mHead}><Text style={styles.mTitle}>Update Status</Text><IconButton icon="close" onPress={()=>setModalVis(false)}/></View>
        {STATUSES.map(s => (<TouchableOpacity key={s} style={[styles.sBtn, order.status===s && styles.sBtnOn]} onPress={()=>updateStatus(s)}><Text style={[styles.sBtnTxt, order.status===s && styles.sBtnTxtOn]}>{s}</Text>{order.status===s && <MaterialCommunityIcons name="check" size={20} color="#6F4E37" />}</TouchableOpacity>))}
      </View></View></Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAF5F0', paddingTop: 50 },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 }, hTxt: { fontSize: 22, fontWeight: 'bold', color: '#4A3B32' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', marginBottom: 15, borderRadius: 12, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, rowTop: { flexDirection: 'row', alignItems: 'center' },
  lbl: { color: '#888', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }, val: { fontWeight: 'bold', color: '#333', fontSize: 16, marginTop: 2 },
  statusBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 10, marginTop: 15, elevation: 3 },
  statusTxt: { color: '#FFF', fontWeight: '900', fontSize: 15, letterSpacing: 1 }, tapTxt: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold', marginRight: 4 },
  secTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A3B32', marginBottom: 10 }, valTxt: { marginLeft: 10, color: '#444', fontWeight: '500', fontSize: 15 },
  div: { marginVertical: 12, backgroundColor: '#F0F0F0' },
  itemCard: { backgroundColor: '#FFF', marginBottom: 12, borderRadius: 12, elevation: 1 },
  qtyBox: { backgroundColor: '#EBE1D7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }, qty: { fontWeight: 'bold', color: '#6F4E37' },
  iName: { fontWeight: 'bold', fontSize: 16, color: '#333' }, iPrice: { fontWeight: 'bold', color: '#6F4E37', fontSize: 16 },
  custBox: { marginTop: 12, padding: 12, backgroundColor: '#FDFCFB', borderRadius: 8, borderWidth: 1, borderColor: '#EBE1D7' },
  cHead: { fontSize: 11, fontWeight: 'bold', color: '#A0938A', letterSpacing: 1, marginBottom: 8 },
  cRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cLbl: { fontSize: 13, color: '#777' }, cVal: { fontSize: 13, color: '#333', fontWeight: '700', textAlign: 'right', flex: 1, marginLeft: 15 },
  totLbl: { fontSize: 16, fontWeight: 'bold', color: '#333' }, totVal: { fontSize: 20, fontWeight: '900', color: '#6F4E37' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }, sheet: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  mHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, mTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' },
  sBtn: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderRadius: 12, marginBottom: 8, backgroundColor: '#F9F9F9' }, sBtnOn: { backgroundColor: '#EBE1D7', borderWidth: 1, borderColor: '#6F4E37' },
  sBtnTxt: { fontSize: 15, color: '#555', fontWeight: '500' }, sBtnTxtOn: { color: '#6F4E37', fontWeight: 'bold' }
});