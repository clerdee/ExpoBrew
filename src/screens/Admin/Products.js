import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL } from '../../configs/config';
import AddProduct from '../../components/admin/AddProduct'; 

export default function Products({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); 
  
  // Modal State
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
      Toast.show({ type: 'success', text1: 'Product deleted' }); fetchProducts(); 
    } catch (error) { console.error("Delete error:", error); Toast.show({ type: 'error', text1: 'Failed to delete product' }); }
  };

  const openAddModal = () => { setEditingProduct(null); setModalVisible(true); };
  const openEditModal = (product) => { setEditingProduct(product); setModalVisible(true); };

  // Advanced Filtering & Searching logic
  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'All' ? true : filter === 'In Stock' ? item.countInStock > 0 : item.countInStock <= 0;
      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, filter]);

  const renderItem = ({ item }) => {
    const isOutOfStock = item.countInStock <= 0;
    return (
      <Card style={styles.card} mode="elevated">
        <View style={styles.cardContent}>
          <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.productPrice}>${Number(item.price).toFixed(2)}</Text>
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
      {/* Header with Hamburger and Add Action */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
          <Text style={styles.headerTitle}>Inventory</Text>
          <IconButton icon="plus-box" size={28} iconColor="#FFF" onPress={openAddModal} style={{ marginRight: -10 }} />
        </View>
      </View>

      {/* Search Bar overlapping the header */}
      <View style={styles.searchContainer}>
        <Searchbar placeholder="Search products..." onChangeText={setSearchQuery} value={searchQuery} style={styles.searchBar} inputStyle={{ fontSize: 15 }} iconColor="#4A2E1B" elevation={2} />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'In Stock', 'Out of Stock'].map((f) => (
            <Chip key={f} mode={filter === f ? 'flat' : 'outlined'} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && { backgroundColor: '#4A2E1B' }]} textStyle={{ color: filter === f ? '#FFF' : '#4A2E1B', fontWeight: '600' }}>{f}</Chip>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : <FlatList data={filteredProducts} keyExtractor={(item) => item._id.toString()} renderItem={renderItem} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false} ListEmptyComponent={<View style={styles.emptyContainer}><MaterialCommunityIcons name="coffee-off" size={60} color="#CCC" /><Text style={styles.emptyText}>No matching products.</Text></View>} />}

      {/* External Modal Component */}
      <AddProduct visible={modalVisible} onClose={() => setModalVisible(false)} product={editingProduct} onSuccess={fetchProducts} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40, borderBottomRightRadius: 25, borderBottomLeftRadius: 25 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  searchContainer: { marginTop: -25, paddingHorizontal: 20, zIndex: 1 },
  searchBar: { backgroundColor: '#FFF', borderRadius: 12, height: 50 },
  filterContainer: { paddingHorizontal: 20, marginTop: 15, marginBottom: 5 },
  filterChip: { marginRight: 10, borderRadius: 20, borderColor: '#4A2E1B' },
  loader: { flex: 1, justifyContent: 'center' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  card: { marginBottom: 12, backgroundColor: '#FFF', borderRadius: 15 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  productImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#E0E0E0' },
  productInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  productPrice: { fontSize: 15, color: '#6F4E37', fontWeight: '600', marginBottom: 6 },
  stockBadge: { alignSelf: 'flex-start', height: 24 },
  actions: { flexDirection: 'column', justifyContent: 'space-between', marginLeft: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#888', fontSize: 16, marginTop: 10, fontWeight: '500' }
});