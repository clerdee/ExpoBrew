import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Searchbar, Button, Badge, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from "expo-secure-store";
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message'; 
import { API_BASE_URL } from '../../configs/config';

import CartModal from "../../components/CartModal";
import CustomizeDrinkModal from "../../components/CustomizeDrinkModal";

const FavoritesPage = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]), [loading, setLoading] = useState(true), [search, setSearch] = useState('');
  const [cartVis, setCartVis] = useState(false), [custVis, setCustVis] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null), [cartItems, setCartItems] = useState([]);

  const loadFavoritesAndCart = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("userToken");
      const db = await SQLite.openDatabaseAsync('coffeecart.db');
      const saved = await db.getFirstAsync('SELECT cart_data FROM cart_table WHERE id = 1;');
      if (saved?.cart_data) setCartItems(JSON.parse(saved.cart_data));

      if (token) {
        const res = await axios.get(`${API_BASE_URL}/users/favorites`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFavorites(res.data);
      }
    } catch (e) { 
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load favorites.' });
    } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { loadFavoritesAndCart(); }, []));

  useEffect(() => {
    (async () => {
      if (!loading) {
        const db = await SQLite.openDatabaseAsync('coffeecart.db');
        await db.runAsync('INSERT OR REPLACE INTO cart_table (id, cart_data) VALUES (1, ?);', JSON.stringify(cartItems));
      }
    })();
  }, [cartItems]);

  const removeFav = async (item) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      await axios.post(`${API_BASE_URL}/users/favorites/${item._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(i => i._id !== item._id));
      Toast.show({ type: 'info', text1: 'Removed', text2: `${item.name} removed from favorites.` });
    } catch (e) { 
      Toast.show({ type: 'error', text1: 'Update Failed', text2: 'Could not remove item.' });
    }
  };

  const onAddClick = (item) => { setSelectedItem(item); setCustVis(true); };

  const onConfirmCust = (cust) => {
    setCartItems(prev => [...prev, { ...cust, qty: 1, cartId: Date.now().toString() }]);
    setCustVis(false); setCartVis(true);
    Toast.show({ type: 'success', text1: 'Added to Cart', text2: `${cust.name} is ready for checkout!` });
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.cardSurface} elevation={1}>
      <View style={styles.cardInternal}>
        <Image source={{ uri: item.imageUrl || item.image }} style={styles.prodImg} />
        <View style={styles.prodDetails}>
          <Text style={styles.prodCat}>{item.category}</Text>
          <Text variant="titleMedium" style={styles.prodName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.prodPrice}>₱{Number(item.price).toFixed(2)}</Text>
        </View>
        <View style={styles.sideActions}>
          <IconButton icon="heart" iconColor="#FF5252" size={20} onPress={() => removeFav(item)} style={styles.miniBtn} />
          <TouchableOpacity style={styles.addCartBtn} onPress={() => onAddClick(item)}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Surface>
  );

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topNav}>
        <View>
          <Text style={styles.navTitle}>Favorites</Text>
          <Text style={styles.navSub}>Your curated collection</Text>
        </View>
        <TouchableOpacity onPress={() => setCartVis(true)} style={styles.cartIconBox}>
          <MaterialCommunityIcons name="basket-outline" size={28} color="#4A3B32" />
          {cartItems.length > 0 && <Badge style={styles.cartBadge}>{cartItems.length}</Badge>}
        </TouchableOpacity>
      </View>

      <Searchbar placeholder="Search saved items..." onChangeText={setSearch} value={search} style={styles.customSearch} inputStyle={styles.searchInput} iconColor="#6F4E37" />
      
      {loading ? <ActivityIndicator size="large" color="#6F4E37" style={{flex:1}} /> : (
        <FlatList
          data={favorites.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centeredEmpty}>
              <MaterialCommunityIcons name="heart-plus-outline" size={70} color="#D2B48C" />
              <Text style={styles.emptyLabel}>No favorites found</Text>
              <Button mode="outlined" textColor="#6F4E37" onPress={() => navigation.navigate('Home')} style={styles.exploreBtn}>Explore Menu</Button>
            </View>
          }
        />
      )}
      <CustomizeDrinkModal visible={custVis} onClose={() => setCustVis(false)} item={selectedItem} onConfirm={onConfirmCust} />
      <CartModal visible={cartVis} onClose={() => setSelectedItem(null)} cartItems={cartItems} setCartItems={setCartItems} />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FCFAFA', paddingTop: 50 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
  navTitle: { fontSize: 28, fontWeight: 'bold', color: '#2C1E16' },
  navSub: { fontSize: 13, color: '#A08D84', marginTop: -2 },
  cartIconBox: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#D44D44' },
  customSearch: { marginHorizontal: 25, marginBottom: 25, backgroundColor: '#fff', borderRadius: 14, height: 48, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  searchInput: { fontSize: 15 },
  scrollList: { paddingHorizontal: 25, paddingBottom: 50 },
  cardSurface: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 18 },
  cardInternal: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  prodImg: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#F3F3F3' },
  prodDetails: { flex: 1, marginLeft: 16 },
  prodCat: { fontSize: 10, color: '#C19A6B', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  prodName: { fontSize: 16, fontWeight: '700', color: '#3E2723' },
  prodPrice: { fontSize: 18, fontWeight: '800', color: '#6F4E37', marginTop: 4 },
  sideActions: { alignItems: 'center', justifyContent: 'space-between', height: 80 },
  miniBtn: { margin: 0 },
  addCartBtn: { backgroundColor: '#6F4E37', padding: 8, borderRadius: 12, elevation: 4 },
  centeredEmpty: { alignItems: 'center', marginTop: 120 },
  emptyLabel: { color: '#8D6E63', fontSize: 16, marginTop: 12, fontWeight: '500' },
  exploreBtn: { marginTop: 20, borderColor: '#6F4E37', borderWidth: 1.5 }
});

export default FavoritesPage;