import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
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
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All'); 
  const [stockFilter, setStockFilter] = useState('All');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try { setProducts((await axios.get(`${API_BASE_URL}/products`)).data); } 
    catch (e) { Toast.show({ type: 'error', text1: 'Failed to load products' }); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try { 
      await axios.delete(`${API_BASE_URL}/products/${id}`, { headers: { Authorization: `Bearer ${await SecureStore.getItemAsync('userToken')}` } }); 
      Toast.show({ type: 'success', text1: 'Coffee deleted' }); fetchProducts(); 
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to delete coffee' }); }
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
      <Card style={styles.card} mode="elevated">
        <View style={styles.cardContent}>
          <Image source={{ uri: i.imageUrl || i.image || 'https://via.placeholder.com/100?text=No' }} style={styles.img} />
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{i.name}</Text>
            <Text style={styles.price}>₱{Number(i.price).toFixed(2)}</Text>
            <Text style={styles.cat}>{i.category || 'Uncategorized'}</Text>
            <Chip icon={out?"close-circle":"check-circle"} textStyle={{fontSize:10, color:'#FFF'}} style={[styles.badge, {backgroundColor: out?'#D32F2F':'#388E3C'}]} compact>
              {out ? 'Out of Stock' : `${i.countInStock} in stock`}
            </Chip>
          </View>
          <View style={styles.actions}>
            <IconButton icon="pencil-outline" size={20} iconColor="#4A2E1B" containerColor="#F5F5F5" onPress={() => openModal(i)} />
            <IconButton icon="trash-can-outline" size={20} iconColor="#D32F2F" containerColor="#FEEBEE" onPress={() => handleDelete(i._id)} />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
            <Text style={styles.title}>Inventory</Text>
            <IconButton icon="plus-box" size={28} iconColor="#FFF" onPress={() => openModal()} style={{ marginRight: -10 }} />
          </View>
        </View>
        <View style={styles.searchRow}>
          <Searchbar placeholder="Search coffees..." onChangeText={setSearch} value={search} style={styles.searchBar} inputStyle={{ fontSize: 15 }} iconColor="#4A2E1B" elevation={2} />
        </View>
        <View style={styles.filters}>
          <Text style={styles.filterTitle}>Availability</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {STOCK_FILTERS.map(f => <Chip key={f} mode="flat" onPress={()=>setStockFilter(f)} style={[styles.chip, stockFilter===f?styles.chipOn:styles.chipOff]} textStyle={stockFilter===f?styles.textOn:styles.textOff}>{f}</Chip>)}
          </ScrollView>
          <Text style={styles.filterTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {CATEGORIES.map(f => <Chip key={f} mode="flat" onPress={()=>setCatFilter(f)} style={[styles.chip, catFilter===f?styles.chipOn:styles.chipOff]} textStyle={catFilter===f?styles.textOn:styles.textOff}>{f}</Chip>)}
          </ScrollView>
        </View>
      </View>
      <View style={styles.bottom}>
        {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : (
          <FlatList data={filtered} keyExtractor={i => i._id.toString()} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} ListEmptyComponent={
            <View style={styles.empty}><MaterialCommunityIcons name="coffee-off" size={60} color="#CCC" /><Text style={styles.emptyText}>No matching coffees found.</Text></View>
          } />
        )}
      </View>
      <AddProduct visible={modal} onClose={() => setModal(false)} product={editing} onSuccess={fetchProducts} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' }, top: { zIndex: 999, elevation: 999 }, bottom: { flex: 1, zIndex: 1, elevation: 1 },
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40, borderBottomRightRadius: 25, borderBottomLeftRadius: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: -25, paddingHorizontal: 20 }, searchBar: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, height: 50 },
  filters: { paddingHorizontal: 20, marginTop: 15, marginBottom: 5 }, filterTitle: { fontSize: 12, fontWeight: '700', color: '#A0A0A0', textTransform: 'uppercase', marginBottom: 6 },
  scroll: { marginBottom: 12 }, chip: { marginRight: 8, borderRadius: 20, paddingHorizontal: 4, height: 34, justifyContent: 'center' },
  chipOn: { backgroundColor: '#4A2E1B' }, chipOff: { backgroundColor: '#EAEAEA' }, textOn: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }, textOff: { color: '#666', fontWeight: '600', fontSize: 13 },
  loader: { flex: 1, justifyContent: 'center' }, list: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 5 }, card: { marginBottom: 12, backgroundColor: '#FFF', borderRadius: 15 },
  cardContent: { flexDirection: 'row', alignItems: 'center', padding: 12 }, img: { width: 80, height: 80, borderRadius: 10, backgroundColor: '#E0E0E0' },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' }, name: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 },
  price: { fontSize: 15, color: '#6F4E37', fontWeight: '600', marginBottom: 2 }, cat: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 6 },
  badge: { alignSelf: 'flex-start', height: 22 }, actions: { flexDirection: 'column', justifyContent: 'space-between', marginLeft: 10 },
  empty: { alignItems: 'center', marginTop: 60 }, emptyText: { color: '#888', fontSize: 16, marginTop: 10, fontWeight: '500' }
});