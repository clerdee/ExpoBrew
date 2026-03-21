import React from 'react';
import { View, StyleSheet, Modal, FlatList, Image } from 'react-native';
import { Text, IconButton, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function CartModal({ visible, onClose, cartItems = [], setCartItems, user }) {
  const navigation = useNavigation();
  
  const updateQty = (id, inc) => setCartItems(p => p.map(i => i.cartId === id ? { ...i, qty: Math.max(1, i.qty + inc) } : i));
  const removeItem = (id) => setCartItems(p => p.filter(i => i.cartId !== id));
  
  const subtotal = cartItems.reduce((s, i) => s + (i.price * i.qty), 0);
  const total = subtotal * 1.12;

  const handleGoToCheckout = () => {
    if (cartItems.length === 0) return;
    onClose();
    navigation.navigate('PlaceOrder', { 
      cartItems, 
      totalPrice: total,
      user: user,
      clearCart: () => setCartItems([]) 
    });
  };

  const renderItem = ({ item: i }) => (
    <View style={styles.item}>
      <Image source={{ uri: i.imageUrl || i.image }} style={styles.img} />
      <View style={styles.info}>
        <Text variant="titleMedium" style={styles.name}>{i.name}</Text>
        {i.customizations && (
          <Text variant="bodySmall" style={styles.note} numberOfLines={2}>
            {i.customizations.size} • {i.customizations.milk} • {i.customizations.espresso}
            {i.customizations.syrups?.length > 0 ? ` • ${i.customizations.syrups.map(s => s.l).join(', ')}` : ''}
          </Text>
        )}
        <Text variant="titleMedium" style={styles.price}>₱{(i.price * i.qty).toFixed(2)}</Text>
      </View>
      <View style={styles.qtyBox}>
        {i.qty === 1 ? (
          <IconButton icon="trash-can-outline" iconColor="#E74C3C" size={18} onPress={() => removeItem(i.cartId)} style={styles.qtyBtn} />
        ) : (
          <IconButton icon="minus" size={18} iconColor="#6F4E37" onPress={() => updateQty(i.cartId, -1)} style={styles.qtyBtn} />
        )}
        <Text style={styles.qtyTxt}>{i.qty}</Text>
        <IconButton icon="plus" size={18} iconColor="#6F4E37" onPress={() => updateQty(i.cartId, 1)} style={styles.qtyBtn} />
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
          
          <FlatList 
            data={cartItems} 
            renderItem={renderItem} 
            keyExtractor={i => i.cartId} 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.list} 
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialCommunityIcons name="basket-outline" size={50} color="#CCC" />
                <Text style={styles.emptyTxt}>Your basket is empty.</Text>
              </View>
            } 
          />
          
          {cartItems.length > 0 && (
            <View style={styles.summary}>
              <View style={styles.row}>
                <Text style={styles.sTxt}>Subtotal</Text>
                <Text style={styles.sVal}>₱{subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.sTxt}>VAT (12%)</Text>
                <Text style={styles.sVal}>₱{(subtotal * 0.12).toFixed(2)}</Text>
              </View>
              <Divider style={{ marginVertical: 10 }} />
              <View style={[styles.row, { marginBottom: 15 }]}>
                <Text style={styles.tTxt}>Total</Text>
                <Text style={styles.tVal}>₱{total.toFixed(2)}</Text>
              </View>
              <Button 
                mode="contained" 
                buttonColor="#6F4E37" 
                style={{ borderRadius: 12 }} 
                contentStyle={{ height: 50 }} 
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }} 
                onPress={handleGoToCheckout}
              >
                Checkout
              </Button>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FAF5F0', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '75%', paddingTop: 10, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#EBE1D7', paddingBottom: 10 },
  title: { fontWeight: 'bold', color: '#4A3B32' }, 
  list: { padding: 20 },
  item: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, padding: 10, marginBottom: 15, alignItems: 'center', elevation: 2 },
  img: { width: 70, height: 70, borderRadius: 12 }, 
  info: { flex: 1, marginLeft: 15 }, 
  name: { fontWeight: 'bold', color: '#333' }, 
  note: { color: '#888', fontSize: 11, lineHeight: 14, marginVertical: 4 }, 
  price: { fontWeight: 'bold', color: '#6F4E37' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 20 }, 
  qtyBtn: { margin: 0, height: 32, width: 32 }, 
  qtyTxt: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  summary: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, elevation: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }, 
  sTxt: { color: '#666' }, 
  sVal: { fontWeight: '600', color: '#333' },
  tTxt: { fontWeight: 'bold', fontSize: 18, color: '#333' }, 
  tVal: { fontWeight: 'bold', fontSize: 18, color: '#6F4E37' },
  empty: { alignItems: 'center', marginTop: 50 }, 
  emptyTxt: { color: '#888', marginTop: 10 }
});