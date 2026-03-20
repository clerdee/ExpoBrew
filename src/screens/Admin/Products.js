import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar, Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from '../../configs/config';
import AddProduct from '../../components/admin/AddProduct'; 

const CATEGORIES = ['All', 'Brewed', 'Espresso', 'Frappuccino', 'Refreshers', 'Non-Coffee', 'Tea'];
const STOCK_FILTERS = ['All', 'In Stock', 'Out of Stock'];

export default function Products({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All'); 
  const [stockFilter, setStockFilter] = useState('All');
  const [showStockMenu, setShowStockMenu] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try { const response = await axios.get(`${API_BASE_URL}/products`); setProducts(response.data); } 
    catch (error) { console.error("Fetch error:", error); Toast.show({ type: 'error', text1: 'Failed to load products' }); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try { 
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(`${API_BASE_URL}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }); 
      Toast.show({ type: 'success', text1: 'Coffee deleted' }); fetchProducts(); 
    } catch (error) { console.error("Delete error:", error); Toast.show({ type: 'error', text1: 'Failed to delete coffee' }); }
  };

  const openAddModal = () => { setEditingProduct(null); setModalVisible(true); };
  const openEditModal = (product) => { setEditingProduct(product); setModalVisible(true); };

  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' ? true : item.category === categoryFilter;
      const matchesStock = stockFilter === 'All' ? true : stockFilter === 'In Stock' ? item.countInStock > 0 : item.countInStock <= 0;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  const renderItem = ({ item }) => {
    const isOutOfStock = item.countInStock <= 0;
    return (
      <Card style={styles.card} mode="elevated">
        <View style={styles.cardContent}>
          <Image source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/100?text=No+Image' }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productPrice}>₱{Number(item.price).toFixed(2)}</Text>
            <Text style={styles.categoryText}>{item.category || 'Uncategorized'}</Text>
            <Chip icon={isOutOfStock ? "close-circle" : "check-circle"} textStyle={{ fontSize: 10, color: '#FFF' }} style={[styles.stockBadge, { backgroundColor: isOutOfStock ? '#D32F2F' : '#388E3C' }]} compact>{isOutOfStock ? 'Out of Stock' : `${item.countInStock} in stock`}</Chip>
          </View>
          <View style={styles.actions}>
            <IconButton icon="pencil-outline" size={20} iconColor="#4A2E1B" containerColor="#F5F5F5" onPress={() => openEditModal(item)} />
            <IconButton icon="trash-can-outline" size={20} iconColor="#D32F2F" containerColor="#FEEBEE" onPress={() => handleDelete(item._id)} />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
          <Text style={styles.headerTitle}>Inventory</Text>
          <IconButton icon="plus-box" size={28} iconColor="#FFF" onPress={openAddModal} style={{ marginRight: -10 }} />
        </View>
      </View>

      {/* Search Bar & Stock Filter Dropdown Side-by-Side */}
      <View style={styles.searchRow}>
        <Searchbar placeholder="Search coffees..." onChangeText={setSearchQuery} value={searchQuery} style={styles.searchBar} inputStyle={{ fontSize: 15 }} iconColor="#4A2E1B" elevation={2} />
        <Menu visible={showStockMenu} onDismiss={() => setShowStockMenu(false)} anchor={
          <IconButton icon={stockFilter === 'All' ? "filter-outline" : "filter"} iconColor="#FFF" containerColor="#4A2E1B" size={24} style={styles.filterBtn} onPress={() => setShowStockMenu(true)} />
        }>
          {STOCK_FILTERS.map(f => ( <Menu.Item key={f} onPress={() => { setStockFilter(f); setShowStockMenu(false); }} title={f} titleStyle={{ color: stockFilter === f ? '#4A2E1B' : '#333', fontWeight: stockFilter === f ? 'bold' : 'normal' }} /> ))}
        </Menu>
      </View>

      {/* Single Category Filter Bar */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {CATEGORIES.map((f) => ( <Chip key={f} mode={categoryFilter === f ? 'flat' : 'outlined'} onPress={() => setCategoryFilter(f)} style={[styles.filterChip, categoryFilter === f && { backgroundColor: '#4A2E1B' }]} textStyle={{ color: categoryFilter === f ? '#FFF' : '#4A2E1B', fontWeight: '600', fontSize: 12 }}>{f}</Chip> ))}
        </ScrollView>
      </View>

      {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : <FlatList data={filteredProducts} keyExtractor={(item) => item._id.toString()} renderItem={renderItem} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false} ListEmptyComponent={<View style={styles.emptyContainer}><MaterialCommunityIcons name="coffee-off" size={60} color="#CCC" /><Text style={styles.emptyText}>No matching coffees found.</Text></View>} />}
      <AddProduct visible={modalVisible} onClose={() => setModalVisible(false)} product={editingProduct} onSuccess={fetchProducts} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40, borderBottomRightRadius: 25, borderBottomLeftRadius: 25 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: -25, paddingHorizontal: 20, zIndex: 1 },
  searchBar: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, height: 50 },
  filterBtn: { borderRadius: 12, height: 50, width: 50, margin: 0, marginLeft: 10, elevation: 2 },
  filterWrapper: { paddingHorizontal: 20, marginTop: 15, marginBottom: 5 },
  filterScroll: { marginBottom: 8 },
  filterChip: { marginRight: 8, borderRadius: 20, borderColor: '#4A2E1B', height: 32 },
  loader: { flex: 1, justifyContent: 'center' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 5 },
  card: { marginBottom: 12, backgroundColor: '#FFF', borderRadius: 15 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  productImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#E0E0E0' },
  productInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  productPrice: { fontSize: 15, color: '#6F4E37', fontWeight: '600', marginBottom: 2 },
  categoryText: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 6 },
  stockBadge: { alignSelf: 'flex-start', height: 22 },
  actions: { flexDirection: 'column', justifyContent: 'space-between', marginLeft: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#888', fontSize: 16, marginTop: 10, fontWeight: '500' }
});