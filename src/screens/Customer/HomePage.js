import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Text, Card } from "react-native-paper";
import * as SecureStore from "expo-secure-store";
import axios from 'axios';
import { API_BASE_URL } from '../../configs/config';
import CardComponent from "../../components/CardComponent";
import CartModal from "../../components/CartModal";
import AuthModal from "../../components/AuthModal";
import Header from "../../components/Header";
import ProfileModal from "../../components/ProfileModal";

const CATEGORIES = ['All', 'Brewed', 'Espresso', 'Frappuccino', 'Refreshers', 'Non-Coffee', 'Tea'];

export default function HomePage() {
  const [cartVis, setCartVis] = useState(false);
  const [authVis, setAuthVis] = useState(false);
  const [profVis, setProfVis] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('All');

  useEffect(() => {
    (async () => {
      try {
        const u = await SecureStore.getItemAsync("userInfo");
        if (u) setUser(JSON.parse(u));
        setProducts((await axios.get(`${API_BASE_URL}/products`)).data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const addToCart = (p) => {
    setCartItems(prev => {
      const exist = prev.find(i => i._id === p._id);
      return exist ? prev.map(i => i._id === p._id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }];
    });
    setCartVis(true);
  };

  const filtered = useMemo(() => products.filter(p => activeCat === 'All' || p.category === activeCat), [products, activeCat]);
  const handleAvatar = () => user ? setProfVis(true) : setAuthVis(true);

  const renderHeader = () => (
    <View>
      <Header user={user} cartItemCount={cartItems.length} onAvatarPress={handleAvatar} onCartPress={() => setCartVis(true)} />
      <Text variant="titleMedium" style={styles.secTitle}>Daily discounts</Text>
      <Card style={styles.banner}>
        <Card.Cover source={{ uri: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80" }} style={styles.bannerImg} />
        <View style={styles.bannerOver}><Text style={styles.bTitle}>SALE</Text><Text style={styles.bSub}>UP TO 50% OFF</Text>
          <View style={styles.bBtn}><Text style={{ fontWeight: "bold", fontSize: 10, color: "#4A3B32" }}>ORDER NOW</Text></View>
        </View>
      </Card>
      <Text variant="titleMedium" style={styles.secTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c} onPress={() => setActiveCat(c)} style={[styles.catPill, activeCat === c && styles.catOn]}>
            <Text style={[styles.catText, activeCat === c && styles.catTextOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#6F4E37" style={{ flex: 1 }} /> : (
        <FlatList data={filtered} renderItem={({ item }) => <CardComponent item={item} onAddToCart={() => addToCart(item)} />} keyExtractor={i => i._id.toString()} numColumns={2} columnWrapperStyle={styles.colWrap} ListHeaderComponent={renderHeader} contentContainerStyle={styles.list} />
      )}
      <CartModal visible={cartVis} onClose={() => setCartVis(false)} cartItems={cartItems} setCartItems={setCartItems} />
      <AuthModal visible={authVis} onClose={() => setAuthVis(false)} />
      <ProfileModal visible={profVis} onClose={() => setProfVis(false)} user={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5F0", paddingTop: 50 }, list: { paddingHorizontal: 20, paddingBottom: 100 },
  secTitle: { fontWeight: "bold", color: "#4A3B32", marginBottom: 12, marginTop: 5 }, banner: { marginBottom: 25, borderRadius: 15, overflow: "hidden", height: 140, justifyContent: "center" },
  bannerImg: { height: 140 }, bannerOver: { position: "absolute", left: 20, justifyContent: "center" }, bTitle: { color: "#fff", fontWeight: "900", fontSize: 24 },
  bSub: { color: "#fff", fontSize: 14, marginBottom: 8 }, bBtn: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" },
  catScroll: { flexDirection: "row", marginBottom: 20 }, catPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFEF" },
  catOn: { backgroundColor: "#6F4E37", borderColor: "#6F4E37" }, catText: { color: "#6F4E37", fontWeight: "600" }, catTextOn: { color: "#fff" }, colWrap: { justifyContent: "space-between" }
});