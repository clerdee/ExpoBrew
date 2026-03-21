import React from 'react';
import { View, StyleSheet, Modal, FlatList, Image } from 'react-native';
import { Text, IconButton, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CartModal({ visible, onClose, cartItems, setCartItems, navigation }) {
  const subtotal = cartItems.reduce((s, i) => s + (i.price * i.qty), 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const handleCheckout = () => {
    onClose();
    navigation.navigate('PlaceOrder', {
      orderItems: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price, image: i.imageUrl || i.image, customizations: i.customizations })),
      subtotal, tax, totalPrice: total
    });
  };

  const renderCustomizations = (cust) => {
    if (!cust) return null;
    const txt = Array.isArray(cust) ? cust.join(', ') : typeof cust === 'object' ? Object.values(cust).filter(Boolean).join(', ') : cust;
    return txt ? <Text style={styles.customTxt} numberOfLines={2}>{txt}</Text> : null;
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}><View style={styles.sheet}>
        <View style={styles.header}><Text variant="titleLarge" style={styles.title}>Your Basket</Text><IconButton icon="close" onPress={onClose} /></View>
        <FlatList data={cartItems} keyExtractor={i => i.cartId} contentContainerStyle={[styles.list, cartItems.length === 0 && {flex: 1, justifyContent: 'center'}]}
          ListEmptyComponent={() => (
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="basket-off-outline" size={70} color="#D2B48C" />
              <Text style={styles.emptyTxt}>Your basket is empty</Text>
            </View>
          )}
          renderItem={({item: i}) => (
          <View style={styles.item}><Image source={{ uri: i.imageUrl || i.image }} style={styles.img} />
            <View style={styles.info}>
              <Text style={styles.name}>{i.name}</Text>
              {renderCustomizations(i.customizations)}
              <Text style={styles.price}>₱{(i.price * i.qty).toFixed(2)}</Text>
            </View>
            <View style={styles.qtyBox}>
              <IconButton icon={i.qty === 1 ? "trash-can-outline" : "minus"} size={18} onPress={() => i.qty === 1 ? setCartItems(p=>p.filter(x=>x.cartId!==i.cartId)) : setCartItems(p=>p.map(x=>x.cartId===i.cartId?{...x,qty:x.qty-1}:x))} />
              <Text style={styles.qtyTxt}>{i.qty}</Text>
              <IconButton icon="plus" size={18} onPress={() => setCartItems(p=>p.map(x=>x.cartId===i.cartId?{...x,qty:x.qty+1}:x))} />
            </View>
          </View>
        )} />
        {cartItems.length > 0 && (
          <View style={styles.summary}>
            <View style={styles.row}><Text>Subtotal</Text><Text>₱{subtotal.toFixed(2)}</Text></View>
            <View style={styles.row}><Text>VAT (12%)</Text><Text>₱{tax.toFixed(2)}</Text></View>
            <Divider style={{marginVertical:10}} /><View style={[styles.row, {marginBottom:15}]}><Text style={styles.tVal}>Total</Text><Text style={styles.tVal}>₱{total.toFixed(2)}</Text></View>
            <Button mode="contained" buttonColor="#6F4E37" style={{borderRadius:12}} onPress={handleCheckout}>Checkout</Button>
          </View>
        )}
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.4)',justifyContent:'flex-end'}, sheet:{backgroundColor:'#FAF5F0',borderTopLeftRadius:25,borderTopRightRadius:25,height:'75%'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,borderBottomWidth:1,borderColor:'#EBE1D7'}, title:{fontWeight:'bold',color:'#4A3B32'},
  list:{padding:20}, item:{flexDirection:'row',backgroundColor:'#fff',borderRadius:15,padding:10,marginBottom:15,alignItems:'center',elevation:2}, img:{width:60,height:60,borderRadius:10},
  info:{flex:1,marginLeft:15}, name:{fontWeight:'bold', color: '#4A3B32'}, customTxt:{fontSize:12,color:'#888',marginBottom:4}, price:{color:'#6F4E37',fontWeight:'bold'}, 
  qtyBox:{flexDirection:'row',alignItems:'center',backgroundColor:'#F5F5F5',borderRadius:20}, qtyTxt:{fontWeight:'bold',fontSize:16},
  summary:{backgroundColor:'#fff',padding:20,borderTopLeftRadius:25,borderTopRightRadius:25,elevation:10}, row:{flexDirection:'row',justifyContent:'space-between',marginBottom:5}, tVal:{fontWeight:'bold',fontSize:18,color:'#6F4E37'},
  emptyBox:{alignItems:'center',justifyContent:'center',marginTop:20}, emptyTxt:{marginTop:15,fontSize:18,color:'#888',fontWeight:'bold'}
});