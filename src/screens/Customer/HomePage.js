import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Image, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Text, Card, IconButton, Searchbar, TextInput, Button, Chip } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { API_BASE_URL } from '../../configs/config';
import { loadCartItems, saveCartItems } from '../../utils/cartStorage';
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
  const dispatch = useDispatch();
  const [cartVis, setCartVis] = useState(false), [authVis, setAuthVis] = useState(false), [profVis, setProfVis] = useState(false);
  const [custVis, setCustVis] = useState(false), [user, setUser] = useState(null), [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]), [selectedItem, setSelectedItem] = useState(null), [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true), [activeCat, setActiveCat] = useState('All'), [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState(''), [minPrice, setMinPrice] = useState(''), [maxPrice, setMaxPrice] = useState('');
  const [filterVis, setFilterVis] = useState(false), [tempCategory, setTempCategory] = useState('All'), [tempMinPrice, setTempMinPrice] = useState(''), [tempMaxPrice, setTempMaxPrice] = useState('');

  const bannerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % BANNERS.length;
        if (bannerRef.current) bannerRef.current.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const loadLocalData = async () => {
    try {
      setLoading(true);
      try {
        const savedCart = await loadCartItems();
        setCartItems(savedCart);
      } catch (dbError) { console.log('SQLite Load Error:', dbError); }

      const uStr = await SecureStore.getItemAsync("userInfo"), token = await SecureStore.getItemAsync("userToken");
      if (uStr) setUser(JSON.parse(uStr));
      
      const [pRes, fRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`, { params: { search: searchQuery.trim() || undefined, category: activeCat !== 'All' ? activeCat : undefined, minPrice: minPrice || undefined, maxPrice: maxPrice || undefined }}),
        token ? axios.get(`${API_BASE_URL}/users/favorites`, { headers: { Authorization: `Bearer ${token}` } }) : { data: [] }
      ]);
      setProducts(pRes.data); setFavorites((fRes.data || []).filter(Boolean).map(f => String(f._id))); 
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { loadLocalData(); }, [searchQuery, activeCat, minPrice, maxPrice]));

  useEffect(() => {
    (async () => { 
      if (!loading) {
        try {
          await saveCartItems(cartItems);
        } catch (dbError) { console.log('SQLite Save Error:', dbError); }
      }
    })();
  }, [cartItems, loading]);

  const handleFavorite = async (p) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) return setAuthVis(true);
      const res = await axios.post(`${API_BASE_URL}/users/favorites/${p._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setFavorites((res.data.favorites || []).map((id) => String(id)));

    } catch (e) { Alert.alert('Error', 'Could not update favorites'); }
  };

  const confirmCustomization = (cust) => {
    if (!user) {
      setCustVis(false);
      setAuthVis(true);
      return Toast.show({ type: 'info', text1: 'Login Required', text2: 'Please log in or register to add items to your cart.' });
    }

    setCartItems(prev => [...prev, { ...cust, qty: 1, cartId: Date.now().toString() + Math.random().toString(36).substr(2, 5) }]);
    setCustVis(false); setCartVis(true);
  };

  const handleProductClick = (item) => navigation.navigate('IndividualProductPage', { product: item });

  const filtered = useMemo(() => products.filter(p => {
    const term = searchQuery.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(term) || (p.description || '').toLowerCase().includes(term);
    const matchCategory = activeCat === 'All' || p.category === activeCat;
    const pPrice = Number(p.price) || 0;
    const matchMin = minPrice === '' || pPrice >= Number(minPrice);
    const matchMax = maxPrice === '' || pPrice <= Number(maxPrice);
    return matchSearch && matchCategory && matchMin && matchMax;
  }), [products, searchQuery, activeCat, minPrice, maxPrice]);

  const applyFilters = () => { setActiveCat(tempCategory); setMinPrice(tempMinPrice); setMaxPrice(tempMaxPrice); setFilterVis(false); };
  const clearFilters = () => { setTempCategory('All'); setTempMinPrice(''); setTempMaxPrice(''); setActiveCat('All'); setMinPrice(''); setMaxPrice(''); setFilterVis(false); };

  const renderHeader = () => (
    <View>
      <Header user={user} cartItemCount={cartItems.length} onAvatarPress={() => user ? setProfVis(true) : setAuthVis(true)} onCartPress={() => setCartVis(true)} />
      <View style={styles.searchRow}>
        <Searchbar placeholder="Search products..." onChangeText={setSearchQuery} value={searchQuery} style={styles.searchBar} inputStyle={{minHeight: 0}} />
        <IconButton icon="filter-variant" mode="contained" containerColor="#6F4E37" iconColor="#fff" size={24} onPress={() => { setTempCategory(activeCat); setTempMinPrice(minPrice); setTempMaxPrice(maxPrice); setFilterVis(true); }} />
      </View>
      <Text variant="titleMedium" style={styles.secTitle}>Daily discounts</Text>
      <Card style={styles.bannerCard}>
        <View style={styles.bannerInner}>
          <FlatList ref={bannerRef} data={BANNERS} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={item => item.id.toString()} getItemLayout={(data, index) => ({ length: BANNER_WIDTH, offset: BANNER_WIDTH * index, index })} onScrollToIndexFailed={info => { const wait = new Promise(resolve => setTimeout(resolve, 500)); wait.then(() => { bannerRef.current?.scrollToIndex({ index: info.index, animated: true }); }); }}
            renderItem={({ item }) => (
              <View style={{ width: BANNER_WIDTH, height: 220 }}>
                <Image source={item.img} style={styles.bannerImg} />
                <View style={styles.bannerOver}><Text style={styles.bTitle}>{item.title}</Text><Text style={styles.bSub}>{item.sub}</Text><View style={styles.bBtn}><Text style={{fontWeight:"bold",fontSize:10,color:"#4A3B32"}}>ORDER NOW</Text></View></View>
              </View>
            )} />
        </View>
      </Card>
      <Text variant="titleMedium" style={styles.secTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c} onPress={() => setActiveCat(c)} style={[styles.catPill, activeCat === c && styles.catOn]}><Text style={[styles.catText, activeCat === c && styles.catTextOn]}>{c}</Text></TouchableOpacity>
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
      {loading ? <ActivityIndicator size="large" color="#6F4E37" style={{ flex: 1 }} /> : (
        <FlatList data={filtered} numColumns={2} columnWrapperStyle={styles.colWrap} ListHeaderComponent={renderHeader()} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} keyExtractor={i => i._id}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleProductClick(item)} style={{ flex: 1 }}>
               <CardComponent item={item} isGuest={!user} onAddToCart={() => { if (!user) { setAuthVis(true); return Toast.show({ type: 'info', text1: 'Login Required', text2: 'Please log in or register to add items to your cart.' }); } setSelectedItem(item); setCustVis(true); }} onFavorite={() => handleFavorite(item)} isFavorite={favorites.includes(item._id)} />
            </TouchableOpacity>
          )} 
          ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 30, color: '#888'}}>No products match your filters.</Text>} />
      )}
      <Modal animationType="slide" transparent visible={filterVis} onRequestClose={() => setFilterVis(false)}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ width: '100%' }}>
              <View style={styles.sheet}>
                <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Filter Menu</Text><IconButton icon="close" onPress={() => setFilterVis(false)} /></View>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.chipWrap}>
                  {CATEGORIES.map(cat => <Chip key={cat} selected={tempCategory === cat} onPress={() => setTempCategory(cat)} style={[styles.filterChip, tempCategory === cat && styles.filterChipActive]} textStyle={tempCategory === cat ? styles.filterChipTextActive : styles.filterChipText}>{cat}</Chip> )}
                </View>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <TextInput mode="outlined" label="Min Price" value={tempMinPrice} onChangeText={setTempMinPrice} keyboardType="numeric" style={styles.filterInput} activeOutlineColor="#6F4E37" left={<TextInput.Affix text="₱ " />} />
                <TextInput mode="outlined" label="Max Price" value={tempMaxPrice} onChangeText={setTempMaxPrice} keyboardType="numeric" style={styles.filterInput} activeOutlineColor="#6F4E37" left={<TextInput.Affix text="₱ " />} />
                <View style={styles.sheetActions}><Button mode="text" textColor="#8B5E3C" onPress={clearFilters}>Clear All</Button><Button mode="contained" buttonColor="#6F4E37" onPress={applyFilters}>Apply Filters</Button></View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
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
  bannerCard: { marginBottom: 25, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, backgroundColor: '#EFEFEF' }, 
  bannerInner: { borderRadius: 15, overflow: "hidden", height: 220 }, bannerImg: { width: '100%', height: '100%', resizeMode: 'cover' }, 
  bannerOver: { position: "absolute", left: 20, top: 55, zIndex: 1 }, bTitle: { color: "#fff", fontWeight: "900", fontSize: 24, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 },
  bSub: { color: "#fff", fontSize: 14, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 4 }, bBtn: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start", elevation: 3 },
  catScroll: { flexDirection: "row", marginBottom: 20 }, catPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: "#EFEFEF" },
  catOn: { backgroundColor: "#6F4E37", borderColor: "#6F4E37" }, catText: { color: "#6F4E37", fontWeight: "600" }, catTextOn: { color: "#fff" }, colWrap: { gap: 10, marginBottom: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 }, searchBar: { flex: 1, backgroundColor: '#fff', elevation: 2, height: 50 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }, sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, sheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A3B32' },
  filterSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A3B32', marginTop: 15, marginBottom: 10 }, chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { backgroundColor: '#EFEFEF', marginBottom: 5 }, filterChipActive: { backgroundColor: '#6F4E37' }, filterChipText: { color: '#4A3B32' }, filterChipTextActive: { color: '#fff' },
  filterInput: { backgroundColor: '#fff', marginTop: 5 }, sheetActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25 },
  activeFiltersRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 15 }, activeFilterChip: { backgroundColor: '#EFEFEF' },
  clearText: { color: '#8B5E3C', textDecorationLine: 'underline', fontSize: 13, marginLeft: 5 }
});