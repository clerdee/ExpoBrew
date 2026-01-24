import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Divider, IconButton, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CartModal from '../components/CartModal';

// --- DUMMY DATA ---
const ACTIVE_ORDERS = [
  {
    id: '#10045',
    date: 'Today, 09:15 AM',
    items: '1x Mochaccino, 1x Brownie Cake',
    total: '$8.80',
    status: 'Preparing', 
  },
];

const PAST_ORDERS = [
  {
    id: '#10044',
    date: 'Jan 22, 08:30 AM',
    items: '2x Iced Americano, 1x Sweet Lemon',
    total: '$10.50',
    status: 'Completed',
  },
  {
    id: '#10038',
    date: 'Jan 20, 07:45 AM',
    items: '1x Fruity Summer, 1x Caramel Macchiato',
    total: '$12.10',
    status: 'Completed',
  },
];

const OrderPage = () => {
  const [activeTab, setActiveTab] = useState('Active'); 

  // --- CART STATE ---
  const [isCartVisible, setIsCartVisible] = useState(false);
  const cartItemCount = 2; // Placeholder until Redux is added

  // --- RENDER ORDER CARD ---
  const renderOrderItem = ({ item }) => {
    const isPreparing = item.status === 'Preparing';
    const isReady = item.status === 'Ready';

    // Status Colors
    let statusColor = '#6F4E37'; // Completed (Brown)
    let statusIcon = 'check-circle';

    if (isPreparing) {
      statusColor = '#E67E22'; // Orange
      statusIcon = 'coffee-maker';
    } else if (isReady) {
      statusColor = '#27AE60'; // Green
      statusIcon = 'check-decagram';
    }

    return (
      <Card style={styles.orderCard} mode="elevated">
        <Card.Content>
          {/* Header: Order ID and Status */}
          <View style={styles.cardHeader}>
            <View>
              <Text variant="titleMedium" style={styles.orderId}>Order {item.id}</Text>
              <Text variant="bodySmall" style={styles.orderDate}>{item.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <MaterialCommunityIcons name={statusIcon} size={14} color={statusColor} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Body: Items and Price */}
          <View style={styles.cardBody}>
            <View style={styles.itemContainer}>
              <MaterialCommunityIcons name="shopping-outline" size={16} color="#888" style={{ marginRight: 6 }} />
              <Text variant="bodyMedium" numberOfLines={1} style={styles.orderItems}>{item.items}</Text>
            </View>
            <Text variant="titleMedium" style={styles.orderTotal}>{item.total}</Text>
          </View>

          {/* Footer: Actions */}
          <View style={styles.cardFooter}>
            {activeTab === 'Active' ? (
              <Button 
                mode="contained" 
                style={styles.actionButton}
                buttonColor="#6F4E37"
                onPress={() => console.log('Track Order')}
              >
                Track Order
              </Button>
            ) : (
              <Button 
                mode="outlined" 
                style={styles.reorderButton}
                textColor="#6F4E37"
                onPress={() => console.log('Reorder items')}
              >
                Reorder
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* --- UPDATED PAGE HEADER WITH CART --- */}
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.headerTitle}>My Orders</Text>
        
        {/* Search and Cart Icons Container */}
        <View style={styles.headerRight}>
          <IconButton icon="magnify" size={24} iconColor="#4A3B32" />
          
          <View style={styles.iconContainer}>
            <IconButton 
              icon="basket-outline" 
              size={24} 
              iconColor="#4A3B32" 
              onPress={() => setIsCartVisible(true)} 
            />
            {cartItemCount > 0 && (
              <Badge style={styles.cartBadge} size={16}>{cartItemCount}</Badge>
            )}
          </View>
        </View>
      </View>

      {/* --- CUSTOM TABS --- */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
          onPress={() => setActiveTab('Active')}
        >
          <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tab, activeTab === 'History' && styles.activeTab]}
          onPress={() => setActiveTab('History')}
        >
          <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      {/* --- ORDER LIST --- */}
      <FlatList
        data={activeTab === 'Active' ? ACTIVE_ORDERS : PAST_ORDERS}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="coffee-off-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders right now.</Text>
          </View>
        }
      />

      {/* --- CART MODAL --- */}
      <CartModal visible={isCartVisible} onClose={() => setIsCartVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F0', 
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#4A3B32',
  },
  
  // --- NEW HEADER CART STYLES ---
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#6F4E37',
    color: '#fff',
    fontWeight: 'bold',
  },

  // --- TABS ---
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EBE1D7',
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2, 
  },
  tabText: {
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#6F4E37', 
    fontWeight: 'bold',
  },

  // --- LIST CONTENT ---
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, 
  },

  // --- ORDER CARD ---
  orderCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  divider: {
    marginVertical: 12,
    backgroundColor: '#F0F0F0',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  orderItems: {
    color: '#555',
    flexShrink: 1,
  },
  orderTotal: {
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    borderRadius: 8,
    width: '100%',
  },
  reorderButton: {
    borderColor: '#6F4E37',
    borderRadius: 8,
    width: '100%',
  },

  // --- EMPTY STATE ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
  },
});

export default OrderPage;