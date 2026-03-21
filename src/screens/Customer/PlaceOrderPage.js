import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, RadioButton, Card, Divider, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

export default function PlaceOrderPage({ route, navigation }) {
  const { orderItems = [], totalPrice: initTotal = 0, subtotal = 0, tax = 0 } = route.params || {};
  const [user, setUser] = useState(null);
  const [method, setMethod] = useState('Pickup');
  const [branch, setBranch] = useState("Main Branch - TUP Taguig");
  const [addrType, setAddrType] = useState('Home');
  const [customAddr, setCustomAddr] = useState('');
  const [mop, setMop] = useState('GCash');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/users/profile`, { headers: { Authorization: `Bearer ${t}` } });
      setUser(data);
    })();
  }, []);

  const finalPrice = useMemo(() => Math.max(0, initTotal - discount), [initTotal, discount]);

  const handlePlaceOrder = async () => {
    const addr = method === 'Pickup' ? `PICKUP: ${branch}` : (addrType === 'Home' ? user?.address : customAddr);
    if (method === 'Delivery' && !addr) return Alert.alert("Error", "Address required");
    
    setLoading(true);
    try {
      const t = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_BASE_URL}/orders`, { orderItems, shippingAddress: addr, paymentMethod: mop, totalPrice: finalPrice, discountAmount: discount }, { headers: { Authorization: `Bearer ${t}` } });
      Toast.show({ type: 'success', text1: 'Order Placed!' });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed' }); } finally { setLoading(false); }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.header}><IconButton icon="arrow-left" onPress={() => navigation.goBack()} /><Text style={styles.hTitle}>Checkout</Text></View>
      <ScrollView contentContainerStyle={{padding:20}}>
        <Text style={styles.label}>Method</Text>
        <View style={{flexDirection:'row',gap:10}}>
          <Button mode={method==='Pickup'?'contained':'outlined'} onPress={()=>setMethod('Pickup')} style={{flex:1}}>Pickup</Button>
          <Button mode={method==='Delivery'?'contained':'outlined'} onPress={()=>setMethod('Delivery')} style={{flex:1}}>Delivery</Button>
        </View>

        <Text style={styles.label}>Summary</Text>
        <Card style={{padding:15, backgroundColor:'#FFF'}}>
          {orderItems.map((item, i) => <View key={i} style={{flexDirection:'row',justifyContent:'space-between'}}><Text>{item.qty}x {item.name}</Text><Text>₱{(item.price*item.qty).toFixed(2)}</Text></View>)}
          <Divider style={{marginVertical:10}} />
          <View style={styles.sumRow}><Text>Subtotal</Text><Text>₱{subtotal.toFixed(2)}</Text></View>
          <View style={styles.sumRow}><Text>VAT (12%)</Text><Text>₱{tax.toFixed(2)}</Text></View>
          <View style={styles.sumRow}><Text style={{fontWeight:'bold',fontSize:18}}>Total</Text><Text style={{fontWeight:'bold',fontSize:18,color:'#6F4E37'}}>₱{finalPrice.toFixed(2)}</Text></View>
        </Card>

        <Button mode="contained" loading={loading} onPress={handlePlaceOrder} buttonColor="#6F4E37" style={{marginTop:30,borderRadius:12}} contentStyle={{height:55}}>PLACE ORDER</Button>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  bg:{flex:1,backgroundColor:'#FDFCFB'}, hTitle:{fontSize:20,fontWeight:'bold'}, header:{flexDirection:'row',alignItems:'center',paddingTop:50,backgroundColor:'#FFF',elevation:2},
  label:{fontSize:12,fontWeight:'bold',color:'#888',marginTop:20,marginBottom:10,textTransform:'uppercase'}, sumRow:{flexDirection:'row',justifyContent:'space-between',marginTop:5}
});