import React, { useState, useEffect, useMemo, useCallback } from "react";
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Text, Card } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../configs/config';
import CardComponent from "../../components/CardComponent";
import CartModal from "../../components/CartModal";
import AuthModal from "../../components/AuthModal";
import Header from "../../components/Header";
import ProfileModal from "../../components/ProfileModal";
import CustomizeDrinkModal from "../../components/CustomizeDrinkModal";

const CATEGORIES = ['All', 'Brewed', 'Espresso', 'Frappuccino', 'Refreshers', 'Non-Coffee', 'Tea'];

export default function HomePage() {
  const [cartVis, setCartVis] = useState(false), [authVis, setAuthVis] = useState(false), [profVis, setProfVis] = useState(false);
  const [custVis, setCustVis] = useState(false), [user, setUser] = useState(null), [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]), [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true), [activeCat, setActiveCat] = useState('All'), [favorites, setFavorites] = useState([]);

  const loadData = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('coffeecart.db');
      await db.execAsync('CREATE TABLE IF NOT EXISTS cart_table (id INTEGER PRIMARY KEY NOT NULL, cart_data TEXT);');
      const saved = await db.getFirstAsync('SELECT cart_data FROM cart_table WHERE id = 1;');
      if (saved?.cart_data) setCartItems(JSON.parse(saved.cart_data));

      const uStr = await SecureStore.getItemAsync("userInfo"), token = await SecureStore.getItemAsync("userToken");
      if (uStr) setUser(JSON.parse(uStr));
      
      const [pRes, fRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        token ? axios.get(`${API_BASE_URL}/users/favorites`, { headers: { Authorization: `Bearer ${token}` } }) : { data: [] }
      ]);
      setProducts(pRes.data);
      setFavorites(fRes.data.map(f => f._id));
    } catch (e) { console.error("Init Error:", e); } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  useEffect(() => {
    (async () => {
      if (!loading) {
        const db = await SQLite.openDatabaseAsync('coffeecart.db');
        await db.runAsync('INSERT OR REPLACE INTO cart_table (id, cart_data) VALUES (1, ?);', JSON.stringify(cartItems));
      }
    })();
  }, [cartItems, loading]);

  const handleFavorite = async (p) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) return setAuthVis(true);
      const res = await axios.post(`${API_BASE_URL}/users/favorites/${p._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(res.data.favorites);
    } catch (e) { Alert.alert("Error", "Could not update favorites"); }
  };

  const confirmCustomization = (cust) => {
    setCartItems(prev => [...prev, { ...cust, qty: 1, cartId: Date.now().toString() + Math.random().toString(36).substr(2, 5) }]);
    setCustVis(false); setCartVis(true);
  };

  const filtered = useMemo(() => products.filter(p => activeCat === 'All' || p.category === activeCat), [products, activeCat]);

  const renderHeader = () => (
    <View>
      <Header user={user} cartItemCount={cartItems.length} onAvatarPress={() => user ? setProfVis(true) : setAuthVis(true)} onCartPress={() => setCartVis(true)} />
      <Text variant="titleMedium" style={styles.secTitle}>Daily discounts</Text>
      <Card style={styles.banner}><Card.Cover source={{ uri: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800" }} style={styles.bannerImg} /><View style={styles.bannerOver}><Text style={styles.bTitle}>SALE</Text><Text style={styles.bSub}>UP TO 50% OFF</Text><View style={styles.bBtn}><Text style={{fontWeight:"bold",fontSize:10,color:"#4A3B32"}}>ORDER NOW</Text></View></View></Card>
      <Text variant="titleMedium" style={styles.secTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>{CATEGORIES.map(c => (<TouchableOpacity key={c} onPress={() => setActiveCat(c)} style={[styles.catPill, activeCat === c && styles.catOn]}><Text style={[styles.catText, activeCat === c && styles.catTextOn]}>{c}</Text></TouchableOpacity>))}</ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#6F4E37" style={{flex:1}} /> : (
        <FlatList data={filtered} renderItem={({ item }) => <CardComponent item={item} onAddToCart={() => {setSelectedItem(item); setCustVis(true)}} onFavorite={() => handleFavorite(item)} isFavorite={favorites.includes(item._id)} />} keyExtractor={i => i._id} numColumns={2} columnWrapperStyle={styles.colWrap} ListHeaderComponent={renderHeader} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} />
      )}
      <CustomizeDrinkModal visible={custVis} onClose={() => setCustVis(false)} item={selectedItem} onConfirm={confirmCustomization} />
      <CartModal visible={cartVis} onClose={() => setCartVis(false)} cartItems={cartItems} setCartItems={setCartItems} />
      <AuthModal visible={authVis} onClose={() => setAuthVis(false)} />
      <ProfileModal visible={profVis} onClose={() => setProfVis(false)} user={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5F0", paddingTop: 50 }, list: { paddingHorizontal: 20, paddingBottom: 100 },
  secTitle: { fontWeight: "bold", color: "#4A3B32", marginBottom: 12, marginTop: 5 }, banner: { marginBottom: 25, borderRadius: 15, overflow: "hidden", height: 140 },
  bannerImg: { height: 140 }, bannerOver: { position: "absolute", left: 20, top: 30 }, bTitle: { color: "#fff", fontWeight: "900", fontSize: 24 },
  bSub: { color: "#fff", fontSize: 14, marginBottom: 8 }, bBtn: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" },
  catScroll: { flexDirection: "row", marginBottom: 20 }, catPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFEF" },
  catOn: { backgroundColor: "#6F4E37", borderColor: "#6F4E37" }, catText: { color: "#6F4E37", fontWeight: "600" }, catTextOn: { color: "#fff" }, colWrap: { justifyContent: "space-between" }
});