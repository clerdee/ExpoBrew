import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, IconButton, Divider, Card, TextInput, Button, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { useDispatch, useSelector } from 'react-redux';
import { API_BASE_URL } from '../configs/config';
import { fetchMyReview, submitReview, clearReviewState } from '../redux/actions/reviewActions';

const STAR_OPTIONS = [1, 2, 3, 4, 5];

export default function ProductDetailModal({ route, navigation }) {
  const { productId, orderItem, orderId } = route.params;
  const dispatch = useDispatch();
  
  const { currentReview, loading: reviewLoading, submitting } = useSelector((state) => state.reviewState);
  const [currentUser, setCurrentUser] = useState(null);
  const [product, setProduct] = useState(null), [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5), [comment, setComment] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync('userInfo').then(u => { if(u) setCurrentUser(JSON.parse(u)); });
    
    axios.get(`${API_BASE_URL}/products/${productId}`)
         .then(res => setProduct(res.data))
         .catch(e => console.log(e))
         .finally(() => setLoading(false));
         
    if (orderId) dispatch(fetchMyReview(orderId, productId));
    return () => dispatch(clearReviewState());
  }, [productId, orderId, dispatch]);

  useEffect(() => {
    if (currentReview) { setRating(currentReview.rating || 5); setComment(currentReview.comment || ''); }
  }, [currentReview]);

  const handleSubmit = async () => {
    try {
      await dispatch(submitReview({ productId, orderId, rating, comment, customizations: orderItem?.customizations, reviewId: currentReview?._id }));
      Toast.show({ type: 'success', text1: 'Success', text2: 'Your rating has been saved.' });
      navigation.goBack();
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed', text2: e.message }); }
  };

  const cust = orderItem?.customizations || {};
  const hasCustomizations = Object.values(cust).some(Boolean);
  const formatCust = (c) => c && Object.values(c).filter(Boolean).length ? `Variation: ${Object.values(c).filter(Boolean).join(', ')}` : null;
  const formatDate = (date) => new Date(date).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading && !product) return <View style={styles.center}><ActivityIndicator color="#6F4E37" size="large" /></View>;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bg}>
      <View style={styles.head}><IconButton icon="arrow-left" onPress={() => navigation.goBack()} /><Text style={styles.hTitle}>Rate Your Brew</Text><View style={{width:48}}/></View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        
        <Image source={{ uri: product?.image || orderItem?.image }} style={styles.img} />
        <View style={styles.infoWrap}>
          <View style={styles.rowBetween}><Text style={styles.name}>{product?.name || orderItem?.name}</Text><Text style={styles.price}>₱{Number(orderItem?.price || product?.price).toFixed(2)}</Text></View>
          <Text style={styles.desc}>{product?.description || "No description available."}</Text>
        </View>

        {hasCustomizations && (
          <Card style={styles.custCard}>
            <Text style={styles.secTitle}>Your Customizations</Text>
            {!!cust.size && <Text style={styles.custTxt}>• Size: {cust.size}</Text>}
            {!!cust.espresso && <Text style={styles.custTxt}>• Espresso: {cust.espresso}</Text>}
            {!!cust.milk && <Text style={styles.custTxt}>• Milk: {cust.milk}</Text>}
            {!!cust.syrups && <Text style={styles.custTxt}>• Syrups: {cust.syrups}</Text>}
            {!!cust.extras && <Text style={styles.custTxt}>• Extras: {cust.extras}</Text>}
            {!!cust.condiments && <Text style={styles.custTxt}>• Condiments: {cust.condiments}</Text>}
          </Card>
        )}

        <Divider style={styles.div} />

        {/* Display The User's Current Live Review Data if it exists */}
        {currentReview?._id && (
            <View>
              <Text style={styles.secTitle}>Your Current Review</Text>
              <Card style={styles.reviewCard}>
                  <Card.Content style={styles.rRow}>
                      <Avatar.Icon size={40} icon="account" style={styles.avatar} color="#FFF" />
                      <View style={styles.rInfo}>
                          <View style={styles.rowBetween}>
                              <Text style={styles.rUser}>{currentUser?.name || 'Coffee Lover'}</Text>
                              <Text style={styles.rDate}>{formatDate(currentReview.updatedAt || currentReview.createdAt)}</Text>
                          </View>
                          <View style={styles.stars}>{[1,2,3,4,5].map(s => <MaterialCommunityIcons key={s} name={s <= currentReview.rating ? 'star' : 'star-outline'} size={14} color="#F1C40F" />)}</View>
                          {currentReview.customizations && <Text style={styles.variationTxt}>{formatCust(currentReview.customizations)}</Text>}
                          <Text style={styles.rComment}>{currentReview.comment}</Text>
                      </View>
                  </Card.Content>
              </Card>
            </View>
        )}

        <Card style={styles.reviewFormCard}>
          <Text style={styles.secTitle}>{currentReview?._id ? 'Update Your Rating' : 'Rate This Brew'}</Text>
          <View style={styles.starRow}>{STAR_OPTIONS.map(s => (<TouchableOpacity key={s} onPress={() => setRating(s)}><MaterialCommunityIcons name={s <= rating ? 'star' : 'star-outline'} size={38} color="#D4AF37" /></TouchableOpacity>))}</View>
          <TextInput mode="outlined" label="Share your experience..." value={comment} onChangeText={setComment} multiline numberOfLines={3} style={styles.revInp} activeOutlineColor="#6F4E37" />
          <Button mode="contained" buttonColor="#6F4E37" onPress={handleSubmit} loading={submitting} disabled={submitting} style={styles.subBtn}>{currentReview?._id ? 'Update Rating' : 'Submit Rating'}</Button>
        </Card>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAF5F0' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 10, backgroundColor: '#FFF', elevation: 2 },
  hTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' }, scroll: { padding: 20, paddingBottom: 40 },
  img: { width: '100%', height: 220, borderRadius: 16, backgroundColor: '#EBE1D7', marginBottom: 15 },
  infoWrap: { marginBottom: 15 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32', flex: 1 }, price: { fontSize: 22, fontWeight: '900', color: '#6F4E37' }, 
  desc: { fontSize: 14, color: '#666', lineHeight: 22, marginTop: 8 },
  custCard: { backgroundColor: '#FDF8F4', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1, borderWidth: 1, borderColor: '#EBE1D7' },
  custTxt: { color: '#555', fontSize: 14, marginTop: 4 }, div: { marginVertical: 15, backgroundColor: '#EFEFEF', height: 1 },
  reviewFormCard: { padding: 15, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 25, elevation: 2 },
  secTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32', marginBottom: 10 }, starRow: { flexDirection: 'row', gap: 10, marginVertical: 10, justifyContent: 'center' },
  revInp: { backgroundColor: '#FFF', marginTop: 5, fontSize: 14 }, subBtn: { marginTop: 15, borderRadius: 10 },
  reviewCard: { backgroundColor: '#FFF', marginBottom: 25, borderRadius: 12, elevation: 1, borderWidth: 1, borderColor: '#6F4E37' }, rRow: { flexDirection: 'row', alignItems: 'flex-start' }, avatar: { backgroundColor: '#D2B48C', marginRight: 12, marginTop: 4 },
  rInfo: { flex: 1 }, rUser: { fontWeight: 'bold', color: '#333', fontSize: 14 }, rDate: { fontSize: 11, color: '#AAA', marginTop: 2 }, stars: { flexDirection: 'row', marginVertical: 6 }, 
  variationTxt: { fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 4 }, rComment: { fontSize: 13, color: '#444', lineHeight: 18 }
});