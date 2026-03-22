import React from 'react';
import { View, StyleSheet, Modal, FlatList, Image } from 'react-native';
import { Text, IconButton, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';

export default function CartModal({ visible, onClose, cartItems, setCartItems, navigation }) {
  const subtotal = cartItems.reduce((s, i) => s + (i.price * i.qty), 0);
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const updateQty = async (cartId, qtyChange) => {
    const newCart = cartItems.map(item => {
      if (item.cartId === cartId) return { ...item, qty: item.qty + qtyChange };
      return item;
    }).filter(item => item.qty > 0);

    setCartItems(newCart);
    const db = await SQLite.openDatabaseAsync('coffeecart.db');
    await db.runAsync('UPDATE cart_table SET cart_data = ? WHERE id = 1;', JSON.stringify(newCart));
  };

  const handleCheckout = () => {
    onClose();
    navigation.navigate('PlaceOrder', {
      orderItems: cartItems.map(i => ({ 
        product: i.product || i._id || i.id, 
        name: i.name, 
        qty: i.qty, 
        price: i.price, 
        image: i.imageUrl || i.image, 
        customizations: i.customizations 
      })),
      subtotal, tax, totalPrice: total
    });
  };

  const renderItem = ({ item: i }) => (
    <View style={styles.item}>
      <Image source={{ uri: i.imageUrl || i.image }} style={styles.img} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{i.name}</Text>
        {i.customizations && <Text style={styles.cust} numberOfLines={2}>{Object.values(i.customizations).filter(Boolean).join(', ')}</Text>}
        <Text style={styles.price}>₱{i.price.toFixed(2)}</Text>
      </View>
      <View style={styles.qtyBox}>
        <IconButton icon="minus" size={16} iconColor="#FFF" containerColor="#D2B48C" onPress={() => updateQty(i.cartId, -1)} />
        <Text style={styles.qtyTxt}>{i.qty}</Text>
        <IconButton icon="plus" size={16} iconColor="#FFF" containerColor="#6F4E37" onPress={() => updateQty(i.cartId, 1)} />
      </View>
    </View>
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>Your Basket</Text>
            <IconButton icon="close" size={24} onPress={onClose} />
          </View>
          
          {cartItems.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="basket-outline" size={60} color="#CCC" />
              <Text style={styles.emptyTxt}>Your basket is empty.</Text>
            </View>
          ) : (
            <>
              <FlatList 
                data={cartItems} 
                renderItem={renderItem} 
                keyExtractor={i => i.cartId} 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={styles.list} 
              />
              <View style={styles.summary}>
                <View style={styles.row}><Text style={styles.sTxt}>Subtotal</Text><Text style={styles.sVal}>₱{subtotal.toFixed(2)}</Text></View>
                <View style={styles.row}><Text style={styles.sTxt}>VAT (12%)</Text><Text style={styles.sVal}>₱{tax.toFixed(2)}</Text></View>
                <Divider style={{ marginVertical: 10 }} />
                <View style={[styles.row, { marginBottom: 15 }]}><Text style={styles.tTxt}>Total</Text><Text style={styles.tVal}>₱{total.toFixed(2)}</Text></View>
                <Button mode="contained" buttonColor="#6F4E37" style={{ borderRadius: 12 }} contentStyle={{ height: 50 }} labelStyle={{ fontSize: 16, fontWeight: 'bold' }} onPress={handleCheckout}>Checkout</Button>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%', minHeight: 300 }, 
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontWeight: 'bold', color: '#4A3B32' }, 
  list: { paddingBottom: 20 }, 
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 40 }, 
  emptyTxt: { color: '#888', marginTop: 15, fontSize: 16 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, backgroundColor: '#FAF5F0', padding: 10, borderRadius: 12 }, 
  img: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#EBE1D7' },
  info: { flex: 1, marginLeft: 12 }, 
  name: { fontWeight: 'bold', fontSize: 16, color: '#333' }, 
  cust: { fontSize: 12, color: '#777', marginTop: 2, lineHeight: 16 }, 
  price: { fontWeight: 'bold', color: '#6F4E37', marginTop: 4 },
  qtyBox: { flexDirection: 'row', alignItems: 'center' }, 
  qtyTxt: { fontWeight: 'bold', marginHorizontal: 5, fontSize: 16 },
  summary: { borderTopWidth: 1, borderColor: '#EEE', paddingTop: 15 }, 
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }, 
  sTxt: { color: '#666', fontSize: 14 }, 
  sVal: { fontWeight: 'bold', color: '#444' },
  tTxt: { fontWeight: '900', fontSize: 18, color: '#4A3B32' }, 
  tVal: { fontWeight: '900', fontSize: 20, color: '#6F4E37' }
});