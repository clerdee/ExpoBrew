import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, IconButton, ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../configs/config';

const STAR_OPTIONS = [1, 2, 3, 4, 5];

export default function OrderPage({ navigation }) {
  const [activeTab, setActiveTab] = useState('Active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [reviewModalVis, setReviewModalVis] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewId, setReviewId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        setIsGuest(true);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      setIsGuest(false);
      const { data } = await axios.get(`${API_BASE_URL}/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
    } catch (e) { console.error('Order fetch error:', e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(o =>
    activeTab === 'Active' ? ['Pending', 'Preparing', 'Ready'].includes(o.status) : o.status === 'Completed'
  );

  const loadExistingReview = async (orderId, productId) => {
    try {
      setReviewLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/reviews/my-review`, {
        params: { orderId, productId },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data) {
        setReviewId(data._id);
        setRating(data.rating);
        setComment(data.comment || '');
      } else {
        setReviewId(null);
        setRating(5);
        setComment('');
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Review Error', text2: 'Could not load your existing review.' });
    } finally {
      setReviewLoading(false);
    }
  };

  const openReviewModal = async (order) => {
    const reviewableItems = order.orderItems.filter(item => !!item.product);
    if (reviewableItems.length === 0) {
      Toast.show({ type: 'info', text1: 'Review unavailable', text2: 'Only newly completed orders with product references can be reviewed.' });
      return;
    }

    const initialProduct = reviewableItems[0];
    setSelectedOrder(order);
    setSelectedProduct(initialProduct);
    setReviewModalVis(true);
    await loadExistingReview(order._id, initialProduct.product);
  };

  const handleSelectReviewItem = async (item) => {
    setSelectedProduct(item);
    await loadExistingReview(selectedOrder._id, item.product);
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder || !selectedProduct?.product) return;

    try {
      setSubmitLoading(true);
      const token = await SecureStore.getItemAsync('userToken');
      const payload = { rating, comment, orderId: selectedOrder._id };

      if (reviewId) {
        await axios.put(`${API_BASE_URL}/reviews/${reviewId}`, { rating, comment }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Toast.show({ type: 'success', text1: 'Review Updated', text2: `Updated your rating for ${selectedProduct.name}.` });
      } else {
        await axios.post(`${API_BASE_URL}/products/${selectedProduct.product}/reviews`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Toast.show({ type: 'success', text1: 'Review Submitted', text2: `Thanks for reviewing ${selectedProduct.name}!` });
      }

      setReviewModalVis(false);
      setReviewId(null);
      setComment('');
      setRating(5);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Review Failed', text2: e.response?.data?.message || 'Could not submit your review.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const renderOrder = ({ item: o }) => {
    const config = {
      Pending: { color: '#F1C40F', icon: 'clock-outline' },
      Preparing: { color: '#E67E22', icon: 'coffee-maker' },
      Ready: { color: '#27AE60', icon: 'check-decagram' },
      Completed: { color: '#6F4E37', icon: 'check-circle' }
    }[o.status] || { color: '#888', icon: 'help-circle' };

    const canReview = o.status === 'Completed' && o.orderItems.some(item => !!item.product);

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.row}>
            <View>
              <Text style={styles.id}>Order #{o._id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.date}>{new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: `${config.color}15` }]}>
              <MaterialCommunityIcons name={config.icon} size={14} color={config.color} />
              <Text style={[styles.status, { color: config.color }]}>{o.status}</Text>
            </View>
          </View>
          <Divider style={styles.div} />
          <View style={styles.row}>
            <View style={styles.itemsWrap}>
              <MaterialCommunityIcons name="shopping-outline" size={16} color="#888" />
              <Text numberOfLines={1} style={styles.items}>{o.orderItems.map(i => `${i.qty}x ${i.name}`).join(', ')}</Text>
            </View>
            <Text style={styles.total}>₱{o.totalPrice.toFixed(2)}</Text>
          </View>
          <Button
            mode={activeTab === 'Active' ? 'contained' : 'outlined'}
            style={styles.btn}
            buttonColor={activeTab === 'Active' ? '#6F4E37' : undefined}
            textColor={activeTab === 'History' ? '#6F4E37' : '#FFF'}
            onPress={() => activeTab === 'History' ? openReviewModal(o) : null}
            disabled={activeTab === 'History' && !canReview}
          >
            {activeTab === 'Active' ? 'Track Order' : canReview ? 'Review Items' : 'Review Unavailable'}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hTitle}>My Orders</Text>
        {!isGuest && <IconButton icon="magnify" size={24} iconColor="#4A3B32" />}
      </View>

      {isGuest ? (
        <View style={styles.guestContainer}>
          <MaterialCommunityIcons name="login-variant" size={80} color="#D2B48C" />
          <Text style={styles.guestTitle}>Sign in to view orders</Text>
          <Text style={styles.guestSub}>Track your active deliveries and easily reorder your past favorites.</Text>
          <Button mode="contained" buttonColor="#6F4E37" style={styles.loginBtn} onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
            Log In or Sign Up
          </Button>
        </View>
      ) : (
        <>
          <View style={styles.tabs}>{['Active', 'History'].map(t => (
            <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}>
              <Text style={[styles.tabTxt, activeTab === t && styles.activeTabTxt]}>{t}</Text>
            </TouchableOpacity>))}
          </View>
          {loading ? <ActivityIndicator style={{ flex: 1 }} color="#6F4E37" /> : (
            <FlatList data={filtered} renderItem={renderOrder} keyExtractor={i => i._id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} />}
              ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="coffee-off-outline" size={64} color="#CCC" /><Text style={styles.emptyTxt}>No {activeTab.toLowerCase()} orders.</Text></View>} />
          )}
        </>
      )}

      <Modal animationType="slide" transparent visible={reviewModalVis} onRequestClose={() => setReviewModalVis(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{reviewId ? 'Update Review' : 'Leave a Review'}</Text>
              <IconButton icon="close" onPress={() => setReviewModalVis(false)} />
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Select Purchased Item</Text>
                <View style={styles.chipWrap}>
                  {selectedOrder.orderItems.filter(item => !!item.product).map(item => (
                    <Chip
                      key={`${selectedOrder._id}-${item.product}`}
                      selected={selectedProduct?.product === item.product}
                      onPress={() => handleSelectReviewItem(item)}
                      style={[styles.chip, selectedProduct?.product === item.product && styles.chipOn]}
                      textStyle={selectedProduct?.product === item.product ? styles.chipTextOn : styles.chipTextOff}
                    >
                      {item.name}
                    </Chip>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Rating</Text>
                <View style={styles.starRow}>
                  {STAR_OPTIONS.map(star => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                      <MaterialCommunityIcons name={star <= rating ? 'star' : 'star-outline'} size={34} color="#D4AF37" />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  mode="outlined"
                  label="Your Review"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  style={styles.reviewInput}
                  activeOutlineColor="#6F4E37"
                  placeholder="Tell us about the drink, service, and quality..."
                />

                {reviewLoading ? (
                  <ActivityIndicator color="#6F4E37" style={{ marginVertical: 20 }} />
                ) : (
                  <Button mode="contained" buttonColor="#6F4E37" onPress={handleSubmitReview} loading={submitLoading} disabled={submitLoading} style={styles.submitBtn}>
                    {reviewId ? 'Update Review' : 'Submit Review'}
                  </Button>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  hTitle: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32' },
  tabs: { flexDirection: 'row', backgroundColor: '#EBE1D7', marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#fff', elevation: 3 },
  tabTxt: { fontWeight: '600', color: '#888' },
  activeTabTxt: { color: '#6F4E37', fontWeight: 'bold' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#fff', marginBottom: 16, borderRadius: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontWeight: '800', color: '#333', fontSize: 15 },
  date: { color: '#999', fontSize: 12, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
  status: { fontWeight: 'bold', fontSize: 11 },
  div: { marginVertical: 12, backgroundColor: '#F5F5F5' },
  itemsWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 },
  items: { color: '#666', fontSize: 13, flexShrink: 1 },
  total: { fontWeight: 'bold', color: '#6F4E37', fontSize: 16 },
  btn: { marginTop: 15, borderRadius: 10 },
  empty: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
  emptyTxt: { marginTop: 12, color: '#888', fontSize: 16, fontWeight: '500' },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, marginTop: -80 },
  guestTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A3B32', marginTop: 15 },
  guestSub: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 8, marginBottom: 30, lineHeight: 20 },
  loginBtn: { borderRadius: 25, width: '100%', paddingVertical: 6, elevation: 3 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '82%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A3B32' },
  sectionTitle: { marginTop: 10, marginBottom: 10, fontSize: 13, color: '#A0938A', fontWeight: '700', textTransform: 'uppercase' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { marginRight: 8, marginBottom: 8, backgroundColor: '#F3F3F3' },
  chipOn: { backgroundColor: '#6F4E37' },
  chipTextOn: { color: '#FFF', fontWeight: '700' },
  chipTextOff: { color: '#555', fontWeight: '600' },
  starRow: { flexDirection: 'row', marginBottom: 12 },
  starBtn: { marginRight: 6 },
  reviewInput: { backgroundColor: '#FFF', marginTop: 8 },
  submitBtn: { marginTop: 20, borderRadius: 14, marginBottom: 10 }
});
