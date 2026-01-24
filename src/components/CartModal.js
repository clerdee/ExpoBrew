import React, { useState } from 'react';
import { View, StyleSheet, Modal, FlatList, TouchableOpacity, Image, Platform } from 'react-native';
import { Text, IconButton, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- DUMMY CART DATA ---
const INITIAL_CART = [
  {
    id: '1',
    name: 'Fruity Summer',
    note: 'Less ice',
    price: 7.60,
    qty: 1,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80',
  },
  {
    id: '2',
    name: 'Brownie Cake',
    note: 'Warmed up',
    price: 5.00,
    qty: 1,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
  },
];

const CartModal = ({ visible, onClose }) => {
  const [cartItems, setCartItems] = useState(INITIAL_CART);

  // --- CART LOGIC ---
  const updateQty = (id, increment) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + increment;
        return { ...item, qty: newQty > 0 ? newQty : 1 }; // Prevent qty going below 1
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const tax = subtotal * 0.10; // 10% tax
  const total = subtotal + tax;

  // --- RENDER CART ITEM ---
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <Text variant="titleMedium" style={styles.itemName}>{item.name}</Text>
        <Text variant="bodySmall" style={styles.itemNote}>{item.note}</Text>
        <Text variant="titleMedium" style={styles.itemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
      </View>

      <View style={styles.qtyContainer}>
        {/* Delete button if Qty is 1, otherwise Minus */}
        {item.qty === 1 ? (
          <IconButton icon="trash-can-outline" iconColor="#E74C3C" size={18} onPress={() => removeItem(item.id)} style={styles.qtyBtn} />
        ) : (
          <IconButton icon="minus" size={18} iconColor="#6F4E37" onPress={() => updateQty(item.id, -1)} style={styles.qtyBtn} />
        )}
        
        <Text style={styles.qtyText}>{item.qty}</Text>
        
        <IconButton icon="plus" size={18} iconColor="#6F4E37" onPress={() => updateQty(item.id, 1)} style={styles.qtyBtn} />
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Bottom Sheet Container */}
        <View style={styles.sheetContainer}>
          
          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text variant="titleLarge" style={styles.headerTitle}>Your Basket</Text>
            <IconButton icon="close" size={24} onPress={onClose} />
          </View>

          {/* Cart Items List */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="basket-outline" size={50} color="#CCC" />
                <Text style={styles.emptyText}>Your basket is empty.</Text>
              </View>
            }
          />

          {/* Order Summary (Only show if items exist) */}
          {cartItems.length > 0 && (
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Tax & Fees (10%)</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={[styles.summaryRow, { marginBottom: 15 }]}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>

              <Button 
                mode="contained" 
                buttonColor="#6F4E37" 
                style={styles.checkoutBtn}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                onPress={() => {
                  console.log('Proceed to Checkout');
                  onClose();
                }}
              >
                Checkout
              </Button>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Dim background
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FAF5F0',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '75%', // Covers 75% of the screen
    paddingTop: 10,
    overflow: 'hidden', // Contains everything inside the sheet
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EBE1D7',
    paddingBottom: 10,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#4A3B32',
  },
  listContent: {
    padding: 20,
  },
  
  // --- FIXED: Cart Item Styles ---
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    // Shadow properties for both iOS and Android without clipping
    elevation: 2, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'visible', // <-- FIX: Prevents React Native Paper shadow warning
  },
  itemImage: {
    width: 65,
    height: 65,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontWeight: 'bold',
    color: '#333',
  },
  itemNote: {
    color: '#888',
    fontSize: 12,
    marginVertical: 2,
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  
  // --- Quantity Selector ---
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  qtyBtn: {
    margin: 0,
    height: 32,
    width: 32,
  },
  qtyText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },

  // --- FIXED: Summary & Checkout ---
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    // Shadow properties
    elevation: 15, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    overflow: 'visible', // <-- FIX: Ensures the top shadow isn't clipped
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    color: '#666',
  },
  summaryValue: {
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    marginVertical: 10,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#6F4E37',
  },
  checkoutBtn: {
    borderRadius: 12,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    marginTop: 10,
    fontSize: 16,
  },
});

export default CartModal;