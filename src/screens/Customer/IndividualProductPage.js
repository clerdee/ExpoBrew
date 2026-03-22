import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text, IconButton, Divider, Card, Avatar, Button, RadioButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const SIZES = [{ l: 'Tall', p: 0 }, { l: 'Grande', p: 25 }, { l: 'Venti', p: 40 }];
const OPTIONS = {
  milk: [{ l: 'Whole Milk', p: 0 }, { l: 'Non-Fat Milk', p: 10 }, { l: 'Sub Breve', p: 35 }, { l: 'Sub Soymilk', p: 35 }],
  syrups: [{ l: 'Salted Caramel', p: 20 }, { l: 'Vanilla', p: 20 }, { l: 'Hazelnut', p: 20 }, { l: 'Caramel', p: 20 }],
  addons: [{ l: 'Caramel Drizzle', p: 15 }, { l: 'Mocha Sauce', p: 15 }, { l: 'White Mocha Sauce', p: 15 }],
  condiments: ['White Sugar', 'Brown Sugar', 'Splenda', 'Coconut Sugar']
};

export default function IndividualProductPage({ route, navigation }) {
  const { product } = route.params;
  
  const [currentUser, setCurrentUser] = useState(null);
  const [reviews, setReviews] = useState([]), [loadingReviews, setLoadingReviews] = useState(true);
  const [size, setSize] = useState('Tall'), [espresso, setEspresso] = useState('Regular');
  const [milk, setMilk] = useState('Whole Milk'), [syrups, setSyrups] = useState([]);
  const [extras, setExtras] = useState([]), [condiments, setCondiments] = useState([]);

  useEffect(() => {
    SecureStore.getItemAsync('userInfo').then(u => { if(u) setCurrentUser(JSON.parse(u)); });
    
    // Auto-refresh reviews when gaining focus (in case they just edited it)
    const unsubscribe = navigation.addListener('focus', () => {
      setLoadingReviews(true);
      axios.get(`${API_BASE_URL}/reviews/product/${product._id}`)
           .then(res => setReviews(res.data)).catch(e => console.log(e)).finally(() => setLoadingReviews(false));
    });
    return unsubscribe;
  }, [navigation, product._id]);

  const milkPrice = OPTIONS.milk.find(m => m.l === milk)?.p || 0;
  const totalPrice = (product.price || 0) + (SIZES.find(s => s.l === size)?.p || 0) + milkPrice + syrups.reduce((s, i) => s + i.p, 0) + extras.reduce((s, i) => s + i.p, 0);

  const toggle = (list, set, val) => set(list.some(i => i.l === val.l) ? list.filter(i => i.l !== val.l) : [...list, val]);
  const toggleSimple = (list, set, val) => set(list.includes(val) ? list.filter(i => i !== val) : [...list, val]);

  const handleAddToCart = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('coffeecart.db');
      await db.execAsync('CREATE TABLE IF NOT EXISTS cart_table (id INTEGER PRIMARY KEY NOT NULL, cart_data TEXT);');
      const saved = await db.getFirstAsync('SELECT cart_data FROM cart_table WHERE id = 1;');
      let currentCart = saved?.cart_data ? JSON.parse(saved.cart_data) : [];

      const newItem = {
        ...product, price: totalPrice, qty: 1, cartId: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        customizations: { size, espresso, milk, syrups: syrups.map(s => s.l).join(', '), extras: extras.map(e => e.l).join(', '), condiments: condiments.join(', ') }
      };

      currentCart.push(newItem);
      await db.runAsync('INSERT OR REPLACE INTO cart_table (id, cart_data) VALUES (1, ?);', JSON.stringify(currentCart));
      Toast.show({ type: 'success', text1: 'Added to Basket', text2: `${product.name} added successfully!` });
      navigation.goBack();
    } catch (e) { Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add to cart.' }); }
  };

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 0;
  const formatCust = (c) => c && Object.values(c).filter(Boolean).length ? `Variation: ${Object.values(c).filter(Boolean).join(', ')}` : null;
  const formatDate = (date) => new Date(date).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.bg}>
      <View style={styles.head}><IconButton icon="arrow-left" onPress={() => navigation.goBack()} /><Text style={styles.hTitle}>Product Details</Text><View style={{width:48}}/></View>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Image source={{ uri: product.image }} style={styles.img} />
        <View style={styles.infoWrap}>
          <View style={styles.rowBetween}><Text style={styles.name}>{product.name}</Text><Text style={styles.price}>₱{Number(product.price).toFixed(2)}</Text></View>
          <View style={styles.ratingRow}><MaterialCommunityIcons name="star" size={20} color="#F1C40F" /><Text style={styles.ratingText}>{avgRating} ({reviews.length} reviews)</Text></View>
          <Text style={styles.desc}>{product.description || "No description available."}</Text>
        </View>

        <Divider style={styles.div} />
        
        <Text style={styles.secTitle}>Customize Your Drink</Text>
        <Text style={styles.lbl}>Select Size</Text>
        <View style={styles.sizeRow}>{SIZES.map(s => (
          <TouchableOpacity key={s.l} onPress={()=>setSize(s.l)} style={[styles.sizeCard, size===s.l && styles.activeCard]}>
            <MaterialCommunityIcons name="cup" size={size===s.l?28:22} color={size===s.l?'#6F4E37':'#AAA'} />
            <Text style={[styles.sizeL, size===s.l && styles.activeTxt]}>{s.l}</Text>
            <Text style={styles.plusP}>{s.p > 0 ? `+₱${s.p}` : 'Free'}</Text>
          </TouchableOpacity>
        ))}</View>

        <View style={styles.box}>
          <Text style={styles.lblBox}>Espresso Roast</Text>
          <View style={styles.radioContainer}>{['Regular', 'Decaf'].map(v => (
            <TouchableOpacity key={v} onPress={()=>setEspresso(v)} style={styles.touchableRadio} activeOpacity={0.7}>
              <RadioButton value={v} status={espresso===v?'checked':'unchecked'} color="#6F4E37" />
              <Text style={[styles.rTxt, espresso===v && {color:'#6F4E37', fontWeight:'bold'}]}>{v}</Text>
            </TouchableOpacity>
          ))}</View>
          <Divider style={styles.divMini}/>
          <Text style={styles.lblBox}>Milk Choice</Text>
          <View style={styles.wrap}>{OPTIONS.milk.map(m => (
            <TouchableOpacity key={m.l} onPress={()=>setMilk(m.l)} style={[styles.pill, milk===m.l && styles.pillOn]}>
              <Text style={[styles.pTxt, milk===m.l && styles.pTxtOn]}>{m.l} {m.p > 0 && `(+₱${m.p})`}</Text>
            </TouchableOpacity>
          ))}</View>
        </View>

        <Text style={styles.lbl}>Add Syrups</Text>
        <View style={styles.wrap}>{OPTIONS.syrups.map(s => (
          <TouchableOpacity key={s.l} onPress={()=>toggle(syrups, setSyrups, s)} style={[styles.pill, syrups.some(x=>x.l===s.l) && styles.pillOn]}>
            <Text style={[styles.pTxt, syrups.some(x=>x.l===s.l) && styles.pTxtOn]}>{s.l} (+₱{s.p})</Text>
          </TouchableOpacity>
        ))}</View>

        <Text style={styles.lbl}>Extra Toppings</Text>
        <View style={styles.wrap}>{OPTIONS.addons.map(e => (
          <TouchableOpacity key={e.l} onPress={()=>toggle(extras, setExtras, e)} style={[styles.pill, extras.some(x=>x.l===e.l) && styles.pillOn]}>
            <Text style={[styles.pTxt, extras.some(x=>x.l===e.l) && styles.pTxtOn]}>{e.l} (+₱{e.p})</Text>
          </TouchableOpacity>
        ))}</View>

        <Text style={styles.lbl}>Condiments</Text>
        <View style={styles.wrap}>{OPTIONS.condiments.map(c => (
          <TouchableOpacity key={c} onPress={()=>toggleSimple(condiments, setCondiments, c)} style={[styles.pill, condiments.includes(c) && styles.pillOn]}>
            <Text style={[styles.pTxt, condiments.includes(c) && styles.pTxtOn]}>{c}</Text>
          </TouchableOpacity>
        ))}</View>

        <Divider style={[styles.div, { marginTop: 25 }]} />

        {/* REVIEWS SECTION */}
        <Text style={styles.secTitle}>Customer Reviews</Text>
        {loadingReviews ? <ActivityIndicator color="#6F4E37" style={{ marginVertical: 20 }} /> : !reviews.length ? (
            <View style={styles.emptyWrap}><MaterialCommunityIcons name="comment-quote-outline" size={40} color="#CCC" /><Text style={styles.empty}>No reviews yet. Be the first!</Text></View>
        ) : reviews.map((r, i) => (
            <Card key={i} style={styles.reviewCard}>
                <Card.Content style={styles.rRow}>
                    <Avatar.Icon size={40} icon="account" style={styles.avatar} color="#FFF" />
                    <View style={styles.rInfo}>
                        <View style={styles.rowBetween}>
                            <View>
                                <Text style={styles.rUser}>{r.user?.name || 'Coffee Lover'}</Text>
                                <Text style={styles.rDate}>{formatDate(r.createdAt)}</Text>
                            </View>
                            {/* EDIT BUTTON (Only visible if the current user owns the review) */}
                            {currentUser?._id === (r.user?._id || r.user) && (
                                <IconButton 
                                  icon="pencil" size={18} iconColor="#6F4E37" style={{margin: 0}} 
                                  onPress={() => navigation.navigate('ProductDetail', { productId: product._id, orderId: r.order, orderItem: { name: product.name, price: product.price, image: product.image, customizations: r.customizations } })} 
                                />
                            )}
                        </View>
                        <View style={styles.stars}>{[1,2,3,4,5].map(s => <MaterialCommunityIcons key={s} name={s <= r.rating ? 'star' : 'star-outline'} size={14} color="#F1C40F" />)}</View>
                        {r.customizations && <Text style={styles.variationTxt}>{formatCust(r.customizations)}</Text>}
                        <Text style={styles.rComment}>{r.comment}</Text>
                    </View>
                </Card.Content>
            </Card>
        ))}
      </ScrollView>

      {/* STICKY BOTTOM BAR */}
      <View style={styles.footer}>
        <View><Text style={styles.fPrice}>₱{totalPrice.toFixed(2)}</Text><Text style={styles.fSub} numberOfLines={1}>{size} • {espresso} • {milk}</Text></View>
        <Button mode="contained" buttonColor="#6F4E37" onPress={handleAddToCart} style={styles.btn}>Add to Basket</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAF5F0' }, head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 10, backgroundColor: '#FFF', elevation: 2 },
  hTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' }, scroll: { padding: 20, paddingBottom: 100 },
  img: { width: '100%', height: 220, borderRadius: 16, backgroundColor: '#EBE1D7', marginBottom: 15 }, infoWrap: { marginBottom: 15 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32', flex: 1 }, price: { fontSize: 22, fontWeight: '900', color: '#6F4E37' }, ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 10 },
  ratingText: { fontSize: 14, color: '#555', marginLeft: 5, fontWeight: 'bold' }, desc: { fontSize: 14, color: '#666', lineHeight: 22 }, div: { marginVertical: 15, backgroundColor: '#EFEFEF', height: 2 },
  secTitle: { fontSize: 20, fontWeight: '900', color: '#4A3B32', marginBottom: 15 }, lbl: { fontSize: 14, fontWeight: 'bold', color: '#4A3B32', marginTop: 15, marginBottom: 10 },
  sizeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, sizeCard: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  activeCard: { borderColor: '#6F4E37', backgroundColor: '#FDF8F4' }, sizeL: { fontWeight: 'bold', marginTop: 5, color: '#888' }, activeTxt: { color: '#6F4E37' }, plusP: { fontSize: 10, color: '#AAA', fontWeight: 'bold' },
  box: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, elevation: 1, marginTop: 15 }, lblBox: { fontSize: 11, fontWeight: 'bold', color: '#BBB', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  radioContainer: { flexDirection: 'row', justifyContent: 'space-around' }, touchableRadio: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, flex: 1, justifyContent: 'center' },
  rTxt: { fontWeight: '500', color: '#777', marginLeft: 4 }, divMini: { marginVertical: 12, backgroundColor: '#F5F5F5' }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EEE' }, pillOn: { backgroundColor: '#6F4E37', borderColor: '#6F4E37' },
  pTxt: { color: '#444', fontSize: 12, fontWeight: '600' }, pTxtOn: { color: '#FFF' }, emptyWrap: { alignItems: 'center', marginVertical: 20, opacity: 0.7 }, empty: { fontSize: 14, color: '#888', marginTop: 10 },
  reviewCard: { backgroundColor: '#FFF', marginBottom: 12, borderRadius: 12, elevation: 1 }, rRow: { flexDirection: 'row', alignItems: 'flex-start' }, avatar: { backgroundColor: '#D2B48C', marginRight: 12, marginTop: 4 },
  rInfo: { flex: 1 }, rUser: { fontWeight: 'bold', color: '#333', fontSize: 14 }, rDate: { fontSize: 11, color: '#AAA', marginTop: 2 }, stars: { flexDirection: 'row', marginVertical: 6 }, 
  variationTxt: { fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 4 }, rComment: { fontSize: 13, color: '#444', lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#EEE', elevation: 10 },
  fPrice: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32' }, fSub: { fontSize: 11, color: '#AAA', fontWeight: 'bold', maxWidth: 150 }, btn: { borderRadius: 12, paddingHorizontal: 20, height: 45, justifyContent: 'center' }
});