import React,{useState,useMemo,useEffect} from 'react';
import {View,StyleSheet,ScrollView,TouchableOpacity,Alert} from 'react-native';
import {Text,TextInput,Button,Card,Divider,IconButton,RadioButton} from 'react-native-paper';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import Toast from 'react-native-toast-message';import axios from 'axios';
import * as SecureStore from 'expo-secure-store';import * as SQLite from 'expo-sqlite';
import {API_BASE_URL} from '../../configs/config';

const PICKUP_BRANCHES=["Main Branch - TUP Taguig, Western Bicutan, Taguig City","2nd Branch - Malacanang Village, Paranaque City","Outlet Branch - Near Silangan Elementary School, Upper Bicutan, Taguig City"];

export default function PlaceOrderPage({route,navigation}){
  const {orderItems=[],totalPrice:initTotal=0,subtotal=0,tax=0}=route.params||{};
  const [user,setUser]=useState(null),[loading,setLoading]=useState(false);
  const [method,setMethod]=useState('Pickup'),[branch,setBranch]=useState(PICKUP_BRANCHES[1]);
  const [addrType,setAddrType]=useState(0),[customAddr,setCustomAddr]=useState('');
  const [mop,setMop]=useState('GCash'),[discount,setDiscount]=useState(0);

  useEffect(()=>{
    (async()=>{
      const uStr=await SecureStore.getItemAsync('userInfo');
      if(uStr){const u=JSON.parse(uStr);setUser({...u,addresses:u.addresses?.length?u.addresses:[]});}
    })();
  },[]);

  const finalPrice=useMemo(()=>Math.max(0,initTotal-discount),[initTotal,discount]);

  const handlePlaceOrder=async()=>{
    const shippingAddress=method==='Pickup'?`PICKUP: ${branch}`:(addrType==='custom'?customAddr:user?.addresses[addrType]);
    if(method==='Delivery'&&!shippingAddress)return Alert.alert("Error","Please select or enter a delivery address.");
    
    setLoading(true);
    try{
      const token=await SecureStore.getItemAsync('userToken');
      const payload={
        orderItems:orderItems.map(i=>({product:i.product||i._id||i.id,name:i.name,qty:i.qty,price:i.price,image:i.image,customizations:i.customizations||{}})),
        shippingAddress,paymentMethod:mop,totalPrice:finalPrice,discountAmount:discount||0
      };

      await axios.post(`${API_BASE_URL}/orders`,payload,{headers:{Authorization:`Bearer ${token}`}});
      
      const db=await SQLite.openDatabaseAsync('coffeecart.db');
      try{await db.execAsync("DELETE FROM cart;");}catch(e){} 
      try{await db.runAsync("UPDATE cart_table SET cart_data = '[]'");}catch(e){}

      Toast.show({type:'success',text1:'Order Placed!',text2:'Preparing your brew...'});
      setTimeout(()=>navigation.reset({index:0,routes:[{name:'Home'}]}),1000);
    }catch(e){
      console.log("Checkout Error:",e.response?.data||e.message);
      Toast.show({type:'error',text1:'Order failed',text2:'Check your connection or try again.'});
    }finally{setLoading(false);}
  };

  const renderCust=(cust)=>{
    if(!cust)return null;const txt=typeof cust==='object'?Object.values(cust).filter(Boolean).join(', '):cust;
    return txt?<Text style={styles.custTxt} numberOfLines={2}>{txt}</Text>:null;
  };

  return(
    <View style={styles.bg}>
      <View style={styles.header}><IconButton icon="arrow-left" onPress={()=>navigation.goBack()}/><Text style={styles.hTitle}>Checkout</Text></View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Order Type</Text>
        <View style={styles.rowOpt}>
          <TouchableOpacity style={[styles.optCard,method==='Pickup'&&styles.optOn]} onPress={()=>setMethod('Pickup')}><MaterialCommunityIcons name="storefront-outline" size={28} color={method==='Pickup'?'#6F4E37':'#888'}/><Text style={[styles.optTxt,method==='Pickup'&&styles.optTxtOn]}>Pickup</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.optCard,method==='Delivery'&&styles.optOn]} onPress={()=>setMethod('Delivery')}><MaterialCommunityIcons name="bike-fast" size={28} color={method==='Delivery'?'#6F4E37':'#888'}/><Text style={[styles.optTxt,method==='Delivery'&&styles.optTxtOn]}>Delivery</Text></TouchableOpacity>
        </View>

        {method==='Delivery'&&(
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            {user?.addresses?.map((addr,i)=>(
              <TouchableOpacity key={i} style={styles.radioRow} onPress={()=>setAddrType(i)}><RadioButton value={i} status={addrType===i?'checked':'unchecked'} color="#6F4E37" onPress={()=>setAddrType(i)}/><View style={{flex:1}}><Text style={styles.addrTxt}>{addr}</Text></View></TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.radioRow} onPress={()=>setAddrType('custom')}><RadioButton value="custom" status={addrType==='custom'?'checked':'unchecked'} color="#6F4E37" onPress={()=>setAddrType('custom')}/><Text style={styles.addrTxt}>Use a different address</Text></TouchableOpacity>
            {addrType==='custom'&&<TextInput mode="outlined" placeholder="Enter full address..." value={customAddr} onChangeText={setCustomAddr} style={styles.input} activeOutlineColor="#6F4E37"/>}
          </Card>
        )}

        {method==='Pickup'&&(
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Select Pickup Location</Text>
            {PICKUP_BRANCHES.map((b,i)=>(
              <TouchableOpacity key={i} style={styles.radioRow} onPress={()=>setBranch(b)}><RadioButton value={b} status={branch===b?'checked':'unchecked'} color="#6F4E37" onPress={()=>setBranch(b)}/><View style={{flex:1}}><Text style={styles.addrTxt}>{b}</Text></View></TouchableOpacity>
            ))}
          </Card>
        )}

        <Text style={styles.label}>Payment Method</Text>
        <Card style={styles.card}>
          {['GCash','Credit / Debit Card','Cash on Delivery'].map(m=>{
            if(method==='Pickup'&&m==='Cash on Delivery')return null;
            return(
              <TouchableOpacity key={m} style={styles.radioRow} onPress={()=>setMop(m)}>
                <RadioButton value={m} status={mop===m?'checked':'unchecked'} color="#6F4E37" onPress={()=>setMop(m)}/><MaterialCommunityIcons name={m==='GCash'?'wallet':m==='Credit / Debit Card'?'credit-card-outline':'cash'} size={24} color="#555" style={{marginHorizontal:10}}/><Text style={styles.addrTxt}>{m==='Cash on Delivery'&&method==='Pickup'?'Pay at Counter':m}</Text>
              </TouchableOpacity>
            );
          })}
        </Card>

        <Text style={styles.label}>Order Summary</Text>
        <Card style={styles.card}>
          {orderItems.map((item,i)=>(
            <View key={i} style={styles.itemRow}><View style={styles.itemQty}><Text style={styles.qtyTxt}>{item.qty}x</Text></View><View style={{flex:1}}><Text style={styles.itemTxt}>{item.name}</Text>{renderCust(item.customizations)}</View><Text style={styles.itemTxt}>₱{(item.price*item.qty).toFixed(2)}</Text></View>
          ))}
          <Divider style={styles.div}/>
          <View style={styles.sumRow}><Text style={styles.sumLbl}>Subtotal</Text><Text style={styles.sumVal}>₱{subtotal.toFixed(2)}</Text></View>
          <View style={styles.sumRow}><Text style={styles.sumLbl}>VAT (12%)</Text><Text style={styles.sumVal}>₱{tax.toFixed(2)}</Text></View>
          <View style={[styles.sumRow,{marginTop:15}]}><Text style={styles.totLbl}>Total Payment</Text><Text style={styles.totVal}>₱{finalPrice.toFixed(2)}</Text></View>
        </Card>
        <Button mode="contained" loading={loading} onPress={handlePlaceOrder} buttonColor="#6F4E37" style={styles.btn} contentStyle={{height:55}} labelStyle={{fontSize:16,fontWeight:'bold'}}>PLACE ORDER</Button>
      </ScrollView>
    </View>
  );
}

const styles=StyleSheet.create({
  bg:{flex:1,backgroundColor:'#FAF5F0'},header:{flexDirection:'row',alignItems:'center',paddingTop:50,paddingBottom:10,backgroundColor:'#FFF',elevation:2},
  hTitle:{fontSize:20,fontWeight:'bold',color:'#4A3B32'},scroll:{padding:20,paddingBottom:50},
  label:{fontSize:13,fontWeight:'bold',color:'#8B5E3C',marginTop:20,marginBottom:10,textTransform:'uppercase',letterSpacing:1},
  rowOpt:{flexDirection:'row',gap:15},optCard:{flex:1,backgroundColor:'#FFF',padding:20,borderRadius:15,alignItems:'center',borderWidth:2,borderColor:'#EBE1D7'},
  optOn:{borderColor:'#6F4E37',backgroundColor:'#FDF8F4'},optTxt:{marginTop:8,fontWeight:'bold',color:'#888'},optTxtOn:{color:'#6F4E37'},
  card:{backgroundColor:'#FFF',borderRadius:15,padding:15,elevation:1},cardTitle:{fontWeight:'bold',color:'#4A3B32',marginBottom:10,fontSize:16},
  radioRow:{flexDirection:'row',alignItems:'center',paddingVertical:5},addrTxt:{fontSize:14,color:'#333',flexShrink:1},
  input:{backgroundColor:'#FFF',marginTop:10,height:45},pickupBox:{flexDirection:'row',alignItems:'center',backgroundColor:'#F5F5F5',padding:12,borderRadius:10},pickupTxt:{marginLeft:10,color:'#4A3B32',fontWeight:'bold'},
  itemRow:{flexDirection:'row',marginBottom:15,alignItems:'flex-start'},itemQty:{backgroundColor:'#F5F5F5',paddingHorizontal:8,paddingVertical:2,borderRadius:6,marginRight:10},
  qtyTxt:{fontWeight:'bold',color:'#6F4E37',fontSize:13},itemTxt:{fontWeight:'bold',color:'#4A3B32',fontSize:15},custTxt:{fontSize:12,color:'#888',marginTop:2},
  div:{marginVertical:10,backgroundColor:'#EBE1D7'},sumRow:{flexDirection:'row',justifyContent:'space-between',marginBottom:5},
  sumLbl:{color:'#888',fontSize:14},sumVal:{color:'#4A3B32',fontWeight:'bold'},totLbl:{fontWeight:'900',fontSize:18,color:'#4A3B32'},totVal:{fontWeight:'900',fontSize:20,color:'#6F4E37'},
  btn:{marginTop:35,borderRadius:15,elevation:4}
});