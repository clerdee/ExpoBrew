import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, RadioButton, Card, Divider, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const BRANCHES = ["Main Branch - TUP Taguig", "2nd Branch - Malacanang Village, Paranaque City", "Outlet Branch - Upper Bicutan"];
const PAYMENTS = [
  { id: 'GCash', icon: 'wallet', color: '#007DFE', label: 'GCash' },
  { id: 'Maya', icon: 'brightness-5', color: '#1FB22F', label: 'Maya' },
  { id: 'COD', icon: 'cash-marker', color: '#6F4E37', label: 'COD' }
];

export default function PlaceOrderPage({ route, navigation }) {
  const { cartItems = [], totalPrice = 0, user = {}, clearCart } = route.params || {};
  
  const [method, setMethod] = useState('Pickup');
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [addrType, setAddrType] = useState('Home');
  const [customAddr, setCustomAddr] = useState('');
  const [mop, setMop] = useState('GCash');
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  const finalPrice = useMemo(() => Math.max(0, totalPrice - discount), [totalPrice, discount]);

  const applyPromo = async () => {
    if (!promo) return;
    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/promos`);
      const found = data.find(p => p.code?.toLowerCase() === promo.toLowerCase() && p.isActive);
      if (found) {
        const val = found.type === 'Percentage' ? (totalPrice * (found.value / 100)) : found.value;
        setDiscount(val);
        Toast.show({ type: 'success', text1: 'Promo Applied!', text2: `-₱${val.toFixed(2)}` });
      } else { Toast.show({ type: 'error', text1: 'Invalid Code' }); }
    } catch (e) { Toast.show({ type: 'error', text1: 'Promo Error' }); }
  };

  const handlePlaceOrder = async () => {
    const homeAddr = user?.address || "";
    const shippingAddress = method === 'Pickup' 
      ? `PICKUP: ${branch}` 
      : (addrType === 'Home' ? homeAddr : customAddr);

    if (method === 'Delivery' && !shippingAddress.trim()) {
      return Alert.alert("Missing Info", "Please provide a delivery address.");
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      const payload = {
        orderItems: cartItems.map(i => ({
          product: i._id || i.product || null,
          name: i.name || "Unknown Item",
          qty: i.qty || 1,
          price: i.price || 0,
          image: i.imageUrl || i.image || "",
          customizations: i.customizations || {}
        })),
        shippingAddress: shippingAddress || "No Address Provided",
        paymentMethod: mop || "GCash",
        totalPrice: finalPrice,
        promoCode: promo || "",
        discountAmount: discount || 0
      };

      await axios.post(`${API_BASE_URL}/orders`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (clearCart) clearCart(); 

      Toast.show({ type: 'success', text1: 'Order Placed!', text2: 'Preparing your brew...' });

      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }, 500);

    } catch (e) { 
      console.log("Checkout Error Detail:", e.response?.data || e.message);
      Toast.show({ type: 'error', text1: 'Order failed', text2: 'Check your connection or try again.' }); 
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.header}><IconButton icon="arrow-left" onPress={() => navigation.goBack()} /><Text style={styles.hTitle}>Checkout</Text></View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Fullfillment Method</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity style={[styles.mBtn, method === 'Pickup' && styles.mBtnActive]} onPress={() => setMethod('Pickup')}>
            <MaterialCommunityIcons name="store-outline" size={24} color={method === 'Pickup' ? '#FFF' : '#6F4E37'} /><Text style={[styles.mText, method === 'Pickup' && { color: '#FFF' }]}>Pick Up</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mBtn, method === 'Delivery' && styles.mBtnActive]} onPress={() => setMethod('Delivery')}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={24} color={method === 'Delivery' ? '#FFF' : '#6F4E37'} /><Text style={[styles.mText, method === 'Delivery' && { color: '#FFF' }]}>Delivery</Text>
          </TouchableOpacity>
        </View>

        {method === 'Pickup' ? (
          <Card style={styles.card}><RadioButton.Group onValueChange={v => setBranch(v)} value={branch}>
            {BRANCHES.map(b => (<View key={b} style={styles.rRow}><RadioButton value={b} color="#6F4E37" /><Text style={styles.rText}>{b}</Text></View>))}
          </RadioButton.Group></Card>
        ) : (
          <Card style={styles.card}><RadioButton.Group onValueChange={v => setAddrType(v)} value={addrType}>
            <View style={styles.rRow}><RadioButton value="Home" color="#6F4E37" /><View style={{flex:1}}><Text style={styles.rText}>Default Address</Text>{user?.address ? <Text style={styles.subTxt}>{user.address}</Text> : <TouchableOpacity onPress={() => navigation.navigate('Profile')}><Text style={styles.link}>+ Setup Profile Address</Text></TouchableOpacity>}</View></View>
            <View style={styles.rRow}><RadioButton value="Custom" color="#6F4E37" /><Text style={styles.rText}>Different Address</Text></View>
          </RadioButton.Group>{addrType === 'Custom' && <TextInput mode="outlined" placeholder="Enter delivery address..." value={customAddr} onChangeText={setCustomAddr} multiline style={styles.addrInp} activeOutlineColor="#6F4E37" />}</Card>
        )}

        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.pGrid}>{PAYMENTS.map(p => (
          <TouchableOpacity key={p.id} style={[styles.pBox, mop === p.id && { borderColor: p.color, backgroundColor: p.color + '10' }]} onPress={() => setMop(p.id)}>
            <MaterialCommunityIcons name={p.icon} size={28} color={mop === p.id ? p.color : '#CCC'} />
            <Text style={[styles.pLabel, mop === p.id && { color: p.color }]}>{p.label}</Text>
            {mop === p.id && <View style={[styles.pCheck, { backgroundColor: p.color }]}><MaterialCommunityIcons name="check" size={10} color="#FFF" /></View>}
          </TouchableOpacity>
        ))}</View>

        <Text style={styles.label}>Order Summary</Text>
        <Card style={styles.card}>{cartItems.map((item, idx) => (
          <View key={idx} style={styles.itemBox}><View style={styles.flexR}><Text style={styles.itemName}>{item.qty}x {item.name}</Text><Text style={styles.itemPrice}>₱{(item.price * item.qty).toFixed(2)}</Text></View>
          {item.customizations && <Text style={styles.custDetails}>{item.customizations.size} • {item.customizations.milk} • {item.customizations.espresso}</Text>}</View>
        ))}</Card>

        <View style={styles.promoRow}><TextInput mode="outlined" placeholder="Promo Code" value={promo} onChangeText={setPromo} style={styles.promoInp} activeOutlineColor="#6F4E37" dense />
        <Button mode="contained" onPress={applyPromo} buttonColor="#6F4E37" style={styles.promoBtn}>Apply</Button></View>

        <View style={styles.summaryCard}>
          <View style={styles.sumRow}><Text style={styles.sumTxt}>Subtotal</Text><Text style={styles.sumVal}>₱{totalPrice.toFixed(2)}</Text></View>
          {discount > 0 && <View style={styles.sumRow}><Text style={[styles.sumTxt, {color:'#27AE60'}]}>Discount</Text><Text style={[styles.sumVal, {color:'#27AE60'}]}>- ₱{discount.toFixed(2)}</Text></View>}
          <Divider style={{ marginVertical: 10 }} />
          <View style={styles.sumRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalVal}>₱{finalPrice.toFixed(2)}</Text></View>
        </View>

        <Button mode="contained" onPress={handlePlaceOrder} loading={loading} buttonColor="#6F4E37" style={styles.confirmBtn} contentStyle={{ height: 55 }}>CONFIRM & PLACE ORDER</Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FDFCFB' }, hTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A3B32' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 10, backgroundColor: '#FFF', elevation: 2 },
  scroll: { padding: 20 }, label: { fontSize: 13, fontWeight: 'bold', color: '#A0938A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 20 },
  methodRow: { flexDirection: 'row', gap: 10 },
  mBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EBE1D7' },
  mBtnActive: { backgroundColor: '#6F4E37', borderColor: '#6F4E37' },
  mText: { marginLeft: 8, fontWeight: 'bold', color: '#6F4E37' },
  card: { borderRadius: 15, backgroundColor: '#FFF', padding: 10, elevation: 1 },
  rRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 }, rText: { fontSize: 15, color: '#4A3B32' },
  subTxt: { fontSize: 12, color: '#888', marginLeft: 32 }, link: { fontSize: 12, color: '#007DFE', marginLeft: 32, fontWeight: 'bold' },
  addrInp: { backgroundColor: '#FFF', marginTop: 10, marginHorizontal: 10 },
  pGrid: { flexDirection: 'row', gap: 10 },
  pBox: { flex: 1, height: 75, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 2, borderColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center' },
  pLabel: { fontSize: 10, fontWeight: 'bold', marginTop: 4, color: '#888' },
  pCheck: { position: 'absolute', top: 5, right: 5, width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  itemBox: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  flexR: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontWeight: 'bold', color: '#4A3B32' }, itemPrice: { color: '#6F4E37', fontWeight: 'bold' },
  custDetails: { fontSize: 11, color: '#888', marginTop: 2 },
  promoRow: { flexDirection: 'row', marginTop: 20, gap: 10 }, promoInp: { flex: 1, backgroundColor: '#FFF' }, promoBtn: { borderRadius: 8 },
  summaryCard: { marginTop: 25, padding: 15, backgroundColor: '#EBE1D730', borderRadius: 15 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  sumTxt: { color: '#777' }, sumVal: { color: '#4A3B32', fontWeight: 'bold' },
  totalLabel: { fontSize: 18, fontWeight: '900', color: '#4A3B32' },
  totalVal: { fontSize: 22, fontWeight: '900', color: '#6F4E37' },
  confirmBtn: { marginTop: 30, marginBottom: 50, borderRadius: 15 }
});