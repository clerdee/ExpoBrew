import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Text, IconButton, ActivityIndicator, Searchbar, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';
import AddProduct from '../../components/admin/AddProduct';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const CATEGORIES = ['All', 'Brewed', 'Espresso', 'Frappuccino', 'Refreshers', 'Non-Coffee', 'Tea'];
const STOCK_FILTERS = ['All', 'In Stock', 'Out of Stock'];

export default function Products({ navigation }) {
  const [products, setProducts] = useState([]), [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false), [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All'), [stockFilter, setStockFilter] = useState('All');
  const [modal, setModal] = useState(false), [editing, setEditing] = useState(null);

  const fetchProducts = useCallback(async (isSilent = false) => {
    if (!isSilent) isSilent === 'pull' ? setRefreshing(true) : setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/products`);
      setProducts(data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Sync Failed', text2: 'Could not update inventory' });
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(() => fetchProducts(true), 10000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(`${API_BASE_URL}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      Toast.show({ type: 'success', text1: 'Deleted', text2: 'Product removed from inventory' });
      fetchProducts(true);
    } catch (e) { Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete coffee' }); }
  };

  const openModal = (prod = null) => { setEditing(prod); setModal(true); };

  const filtered = useMemo(() => products.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) &&
    (catFilter === 'All' || i.category === catFilter) &&
    (stockFilter === 'All' || (stockFilter === 'In Stock' ? i.countInStock > 0 : i.countInStock <= 0))
  ), [products, search, catFilter, stockFilter]);

  const renderItem = ({ item: i }) => {
    const out = i.countInStock <= 0;
    return (
      <Surface style={styles.card} elevation={1}>
        <View style={styles.cardInner}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: i.imageUrl || i.image || 'https://via.placeholder.com/150' }} style={styles.img} />
            <View style={[styles.stockTag, { backgroundColor: out ? '#D32F2F' : '#388E3C' }]}>
              <Text style={styles.stockText}>{out ? 'Out' : `${i.countInStock} Left`}</Text>
            </View>
          </View>
          <View style={styles.cardDetails}>
            <Text style={styles.cardCat}>{i.category}</Text>
            <Text style={styles.cardName} numberOfLines={1}>{i.name}</Text>
            <Text style={styles.cardPrice}>₱{Number(i.price).toFixed(2)}</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={() => openModal(i)} style={[styles.btn, styles.editBtn]}>
                <MaterialCommunityIcons name="pencil" size={16} color="#6F4E37" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(i._id)} style={[styles.btn, styles.delBtn]}>
                <MaterialCommunityIcons name="trash-can" size={16} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.navRow}>
          <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} />
          <Text style={styles.headerTitle}>Inventory</Text>
          <IconButton icon="plus-circle" size={28} iconColor="#FFF" onPress={() => openModal()} />
        </View>
        <View style={styles.searchWrapper}>
          <Searchbar placeholder="Search products..." onChangeText={setSearch} value={search} style={styles.searchBar} inputStyle={styles.searchInput} iconColor="#6F4E37" elevation={0} />
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STOCK_FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setStockFilter(f)} style={[styles.filterPill, stockFilter === f && styles.filterPillOn]}>
              <Text style={[styles.filterText, stockFilter === f && styles.filterTextOn]}>{f}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.divider} />
          {CATEGORIES.map(f => (
            <TouchableOpacity key={f} onPress={() => setCatFilter(f)} style={[styles.filterPill, catFilter === f && styles.filterPillOn]}>
              <Text style={[styles.filterText, catFilter === f && styles.filterTextOn]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.listWrapper}>
        {loading ? <ActivityIndicator size="large" color="#6F4E37" style={{flex:1}} /> : (
          <FlatList
            data={filtered} numColumns={2} keyExtractor={i => i._id.toString()} renderItem={renderItem}
            contentContainerStyle={styles.list} columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts('pull')} tintColor="#6F4E37" />}
            ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="coffee-off" size={64} color="#D3C4B7" /><Text style={styles.emptyText}>No products found</Text></View>}
          />
        )}
      </View>
      <AddProduct visible={modal} onClose={() => setModal(false)} product={editing} onSuccess={() => fetchProducts(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0' },
  headerSection: { backgroundColor: '#4A2E1B', paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 10 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  searchWrapper: { paddingHorizontal: 20, marginTop: 10 },
  searchBar: { height: 45, borderRadius: 12, backgroundColor: '#FFF' }, searchInput: { fontSize: 14 },
  filterSection: { marginTop: 15, marginBottom: 5 }, filterScroll: { paddingHorizontal: 16, alignItems: 'center' },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', marginRight: 8, borderWidth: 1, borderColor: '#EBE1D7' },
  filterPillOn: { backgroundColor: '#6F4E37', borderColor: '#6F4E37' },
  filterText: { fontSize: 12, color: '#6F4E37', fontWeight: 'bold' }, filterTextOn: { color: '#FFF' },
  divider: { width: 1, height: 20, backgroundColor: '#D3C4B7', marginRight: 8 },
  listWrapper: { flex: 1 }, list: { paddingHorizontal: 16, paddingBottom: 30 },
  columnWrapper: { justifyContent: 'space-between' },
  card: { width: CARD_WIDTH, backgroundColor: '#FFF', borderRadius: 20, marginBottom: 16 },
  cardInner: { borderRadius: 20, overflow: 'hidden' },
  imageWrapper: { width: '100%', height: 140 }, img: { width: '100%', height: '100%' },
  stockTag: { position: 'absolute', top: 10, right: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  stockText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  cardDetails: { padding: 12 },
  cardCat: { fontSize: 10, color: '#8B5E3C', textTransform: 'uppercase', fontWeight: '800' },
  cardName: { fontSize: 15, fontWeight: 'bold', color: '#333', marginVertical: 2 },
  cardPrice: { fontSize: 16, color: '#6F4E37', fontWeight: '900' },
  actionRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' },
  btn: { flex: 0.48, height: 35, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  editBtn: { backgroundColor: '#FAF5F0' }, delBtn: { backgroundColor: '#FEEBEE' },
  empty: { flex: 1, alignItems: 'center', marginTop: 100 }, emptyText: { color: '#D3C4B7', fontSize: 16, marginTop: 10, fontWeight: 'bold' }
});