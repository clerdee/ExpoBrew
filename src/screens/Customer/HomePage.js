import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Image, Modal } from 'react-native';
import { Text, Card, IconButton, Searchbar, TextInput, Button, Chip } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../configs/config';
import CardComponent from '../../components/CardComponent';
import CartModal from '../../components/CartModal';
import AuthModal from '../../components/AuthModal';
import Header from '../../components/Header';
import ProfileModal from '../../components/ProfileModal';
import CustomizeDrinkModal from '../../components/CustomizeDrinkModal';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 40; 
const CATEGORIES = ['All', 'Brewed', 'Espresso', 'Frappuccino', 'Refreshers', 'Non-Coffee', 'Tea'];

const BANNERS = [
  { id: 1, img: require('../../../assets/pic1.jpg'), title: "MORNING BREW", sub: "20% OFF ESPRESSO" },
  { id: 2, img: require('../../../assets/pic2.jpg'), title: "NEW ARRIVAL", sub: "TRY OUR MATCHA" },
  { id: 3, img: require('../../../assets/pic3.jpg'), title: "HAPPY HOUR", sub: "BUY 1 GET 1 FREE" }
];

export default function HomePage({ navigation }) {
  const [cartVis, setCartVis] = useState(false), [authVis, setAuthVis] = useState(false), [profVis, setProfVis] = useState(false);
  const [custVis, setCustVis] = useState(false), [user, setUser] = useState(null), [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]), [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true), [activeCat, setActiveCat] = useState('All'), [favorites, setFavorites] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const bannerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

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

  useFocusEffect(useCallback(() => { loadData(); }, [searchQuery, activeCat, minPrice, maxPrice]));

  useEffect(() => {
    (async () => { if (!loading) {
      const db = await SQLite.openDatabaseAsync('coffeecart.db');
      await db.runAsync('INSERT OR REPLACE INTO cart_table (id, cart_data) VALUES (1, ?);', JSON.stringify(cartItems));
    }})();
  }, [cartItems, loading]);

  const handleFavorite = async (p) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) return setAuthVis(true); // Pops AuthModal if guest
      const res = await axios.post(`${API_BASE_URL}/users/favorites/${p._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setFavorites(res.data.favorites);
    } catch (e) { Alert.alert('Error', 'Could not update favorites'); }
  };

  const confirmCustomization = (cust) => {
    setCartItems(prev => [...prev, { ...cust, qty: 1, cartId: Date.now().toString() + Math.random().toString(36).substr(2, 5) }]);
    setCustVis(false); setCartVis(true);
  };

  const navigateSlide = (dir) => {
    const next = (currentSlide + dir + BANNERS.length) % BANNERS.length;
    setCurrentSlide(next); bannerRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCat === 'All' || p.category === activeCat;
    const matchMin = minPrice ? Number(p.price) >= Number(minPrice) : true;
    const matchMax = maxPrice ? Number(p.price) <= Number(maxPrice) : true;
    return matchSearch && matchCategory && matchMin && matchMax;
  }), [products, searchQuery, activeCat, minPrice, maxPrice]);

  const activeFilterCount = [activeCat !== 'All', !!minPrice, !!maxPrice].filter(Boolean).length;

  const applyFilters = () => {
    setActiveCat(tempCategory);
    setMinPrice(tempMinPrice);
    setMaxPrice(tempMaxPrice);
    setFilterVis(false);
  };

  const clearFilters = () => {
    setTempCategory('All');
    setTempMinPrice('');
    setTempMaxPrice('');
    setActiveCat('All');
    setMinPrice('');
    setMaxPrice('');
    setFilterVis(false);
  };

  const openFilters = () => {
    setTempCategory(activeCat);
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
    setFilterVis(true);
  };

  const renderHeader = () => (
    <View>
      <Header user={user} cartItemCount={cartItems.length} onAvatarPress={() => user ? setProfVis(true) : setAuthVis(true)} onCartPress={() => setCartVis(true)} />
      <Text variant="titleMedium" style={styles.secTitle}>Daily discounts</Text>
      
      <Card style={styles.banner}>
        <FlatList
          ref={bannerRef}
          data={BANNERS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          getItemLayout={(data, index) => ({ length: BANNER_WIDTH, offset: BANNER_WIDTH * index, index })}
          onMomentumScrollEnd={(e) => setCurrentSlide(Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH))}
          renderItem={({ item }) => (
            <View style={{ width: BANNER_WIDTH, height: 220 }}>
              <Image source={item.img} style={styles.bannerImg} />
              <View style={styles.bannerOver}>
                <Text style={styles.bTitle}>{item.title}</Text>
                <Text style={styles.bSub}>{item.sub}</Text>
                <View style={styles.bBtn}><Text style={{fontWeight:"bold",fontSize:10,color:"#4A3B32"}}>ORDER NOW</Text></View>
              </View>
            </View>
          )}
        />
        
        <View style={styles.slideControls} pointerEvents="box-none">
          <IconButton icon="chevron-left" size={30} iconColor="#fff" onPress={() => navigateSlide(-1)} style={styles.navBtn} />
          <IconButton icon="chevron-right" size={30} iconColor="#fff" onPress={() => navigateSlide(1)} style={styles.navBtn} />
        </View>

        <View style={styles.dotsContainer} pointerEvents="none">
          {BANNERS.map((_, i) => (
            <View key={i} style={[styles.dot, currentSlide === i && styles.activeDot]} />
          ))}
        </View>
      </Card>

      <Text variant="titleMedium" style={styles.secTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c} onPress={() => { setActiveCat(c); setTempCategory(c); }} style={[styles.catPill, activeCat === c && styles.catOn]}>
            <Text style={[styles.catText, activeCat === c && styles.catTextOn]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {(minPrice || maxPrice) && (
        <View style={styles.activeFiltersRow}>
          {!!minPrice && <Chip compact style={styles.activeFilterChip}>Min ₱{minPrice}</Chip>}
          {!!maxPrice && <Chip compact style={styles.activeFilterChip}>Max ₱{maxPrice}</Chip>}
          <TouchableOpacity onPress={clearFilters}><Text style={styles.clearText}>Clear filters</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator size="large" color="#6F4E37" style={{flex:1}} /> : (
        <FlatList 
          data={filtered} 
          renderItem={({ item }) => (
            <CardComponent 
              item={item} 
              isGuest={!user} 
              onAddToCart={() => {setSelectedItem(item); setCustVis(true)}} 
              onFavorite={() => handleFavorite(item)} 
              isFavorite={favorites.includes(item._id)} 
            />
          )} 
          keyExtractor={i => i._id} 
          numColumns={2} 
          columnWrapperStyle={styles.colWrap} 
          ListHeaderComponent={renderHeader()} 
          contentContainerStyle={styles.list} 
          showsVerticalScrollIndicator={false} 
        />
      )}

      <Modal animationType="slide" transparent visible={filterVis} onRequestClose={() => setFilterVis(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filter Menu</Text>
              <IconButton icon="close" onPress={() => setFilterVis(false)} />
            </View>

            <Text style={styles.filterSectionTitle}>Category</Text>
            <View style={styles.chipWrap}>
              {CATEGORIES.map(category => (
                <Chip
                  key={category}
                  selected={tempCategory === category}
                  onPress={() => setTempCategory(category)}
                  style={[styles.filterChip, tempCategory === category && styles.filterChipActive]}
                  textStyle={tempCategory === category ? styles.filterChipTextActive : styles.filterChipText}
                >
                  {category}
                </Chip>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <TextInput
              mode="outlined"
              label="Minimum Price"
              value={tempMinPrice}
              onChangeText={setTempMinPrice}
              keyboardType="numeric"
              style={styles.filterInput}
              activeOutlineColor="#6F4E37"
              left={<TextInput.Affix text="₱" />}
            />
            <TextInput
              mode="outlined"
              label="Maximum Price"
              value={tempMaxPrice}
              onChangeText={setTempMaxPrice}
              keyboardType="numeric"
              style={styles.filterInput}
              activeOutlineColor="#6F4E37"
              left={<TextInput.Affix text="₱" />}
            />

            <View style={styles.sheetActions}>
              <Button mode="text" textColor="#8B5E3C" onPress={clearFilters}>Clear All</Button>
              <Button mode="contained" buttonColor="#6F4E37" onPress={applyFilters}>Apply Filters</Button>
            </View>
          </View>
        </View>
      </Modal>

      <CustomizeDrinkModal visible={custVis} onClose={() => setCustVis(false)} item={selectedItem} onConfirm={confirmCustomization} />
      <CartModal visible={cartVis} onClose={() => setCartVis(false)} cartItems={cartItems} setCartItems={setCartItems} navigation={navigation} />
      <AuthModal visible={authVis} onClose={() => setAuthVis(false)} />
      <ProfileModal visible={profVis} onClose={() => setProfVis(false)} user={user} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5F0", paddingTop: 50 }, list: { paddingHorizontal: 20, paddingBottom: 100 },
  secTitle: { fontWeight: "bold", color: "#4A3B32", marginBottom: 12, marginTop: 5 }, 
  banner: { marginBottom: 25, borderRadius: 15, overflow: "hidden", height: 220, backgroundColor: '#EFEFEF' }, 
  bannerImg: { width: '100%', height: '100%', resizeMode: 'cover' }, 
  bannerOver: { position: "absolute", left: 20, top: 55, zIndex: 1 }, 
  bTitle: { color: "#fff", fontWeight: "900", fontSize: 24, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 },
  bSub: { color: "#fff", fontSize: 14, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 }, 
  bBtn: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start", elevation: 3 },
  slideControls: { position: 'absolute', width: '100%', height: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navBtn: { backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: 5 },
  dotsContainer: { position: 'absolute', bottom: 12, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#fff', width: 20 },
  catScroll: { flexDirection: "row", marginBottom: 20 }, catPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFEF" },
  catOn: { backgroundColor: "#6F4E37", borderColor: "#6F4E37" }, catText: { color: "#6F4E37", fontWeight: "600" }, catTextOn: { color: "#fff" }, colWrap: { justifyContent: "space-between" }
});