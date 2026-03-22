import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Modal, ScrollView } from 'react-native';
import { Text, Card, Button, Divider, IconButton, ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../redux/actions/orderActions';
import { fetchMyReview, submitReview, clearReviewState } from '../../redux/actions/reviewActions';

const STAR_OPTIONS = [1, 2, 3, 4, 5];

export default function OrderPage({ navigation }) {
  const dispatch = useDispatch();
  const { items: orders, loading, error } = useSelector((state) => state.orderList);
  const { currentReview, loading: reviewLoading, submitting } = useSelector((state) => state.reviewState);

  const [activeTab, setActiveTab] = useState('Active'), [refreshing, setRefreshing] = useState(false);
  const [isGuest, setIsGuest] = useState(false), [reviewModalVis, setReviewModalVis] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null), [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5), [comment, setComment] = useState('');

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('userToken');
      setIsGuest(!token); if (token) dispatch(fetchOrders());
    })();
  }, [dispatch]);

  useEffect(() => {
    if (currentReview) { setRating(currentReview.rating || 5); setComment(currentReview.comment || ''); }
    else { setRating(5); setComment(''); }
  }, [currentReview]);

  useEffect(() => { if (error) Toast.show({ type: 'error', text1: 'Orders Error', text2: error }); }, [error]);

  const refreshOrders = async () => { setRefreshing(true); await dispatch(fetchOrders()); setRefreshing(false); };
  const filtered = orders.filter(o => activeTab === 'Active' ? ['Pending', 'Preparing', 'Ready'].includes(o.status) : o.status === 'Completed' || o.status === 'Cancelled');

  const openReviewModal = async (order) => {
    const items = order.orderItems.filter(i => !!i.product);
    if (!items.length) return Toast.show({ type: 'info', text1: 'Unavailable', text2: 'No reviewable products found.' });
    setSelectedOrder(order); setSelectedProduct(items[0]); setReviewModalVis(true);
    try { await dispatch(fetchMyReview(order._id, items[0].product)); } catch (e) { console.log(e); }
  };

  const handleSelectReviewItem = async (item) => {
    setSelectedProduct(item);
    try { await dispatch(fetchMyReview(selectedOrder._id, item.product)); } catch (e) { console.log(e); }
  };

  const closeReviewModal = () => { setReviewModalVis(false); setSelectedOrder(null); setSelectedProduct(null); dispatch(clearReviewState()); };

  const handleSubmitReview = async () => {
    if (!selectedOrder || !selectedProduct?.product) return;
    try {
      await dispatch(submitReview({ productId: selectedProduct.product, orderId: selectedOrder._id, rating, comment, reviewId: currentReview?._id }));
      Toast.show({ type: 'success', text1: 'Success', text2: 'Review saved successfully.' });
      closeReviewModal();
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed', text2: e.message }); }
  };

  const renderOrder = ({ item: o }) => {
    const config = { Pending: { color: '#F1C40F', icon: 'clock-outline' }, Preparing: { color: '#E67E22', icon: 'coffee-maker' }, Ready: { color: '#27AE60', icon: 'check-decagram' }, Completed: { color: '#6F4E37', icon: 'check-circle' }, Cancelled: { color: '#E74C3C', icon: 'cancel' } }[o.status] || { color: '#888', icon: 'help-circle' };
    const canRev = o.status === 'Completed' && o.orderItems.some(i => !!i.product);

    return (
      <Card style={styles.card} mode="elevated" onPress={() => navigation.navigate('OrderDetail', { orderId: o._id })}>
        <Card.Content>
          <View style={styles.row}>
            <View><Text style={styles.id}>Order #{o._id.slice(-6).toUpperCase()}</Text><Text style={styles.date}>{new Date(o.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text></View>
            <View style={[styles.badge, { backgroundColor: `${config.color}15` }]}><MaterialCommunityIcons name={config.icon} size={14} color={config.color} /><Text style={[styles.status, { color: config.color }]}>{o.status}</Text></View>
          </View>
          <Divider style={styles.div} />
          <View style={styles.row}>
            <View style={styles.itemsWrap}><MaterialCommunityIcons name="shopping-outline" size={16} color="#888" /><Text numberOfLines={1} style={styles.items}>{o.orderItems.map(i => `${i.qty}x ${i.name}`).join(', ')}</Text></View>
            <Text style={styles.total}>₱{o.totalPrice.toFixed(2)}</Text>
          </View>
          {o.status !== 'Cancelled' && (
            <Button mode={activeTab === 'Active' ? 'contained' : 'outlined'} style={styles.btn} buttonColor={activeTab === 'Active' ? '#6F4E37' : undefined} textColor={activeTab === 'History' ? '#6F4E37' : '#FFF'} onPress={() => activeTab === 'Active' ? navigation.navigate('OrderDetail', { orderId: o._id }) : openReviewModal(o)} disabled={activeTab === 'History' && !canRev}>
              {activeTab === 'Active' ? 'Track Order' : canRev ? 'Rate Your Brew' : 'Review Unavailable'}
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.hTitle}>My Orders</Text>{!isGuest && <IconButton icon="magnify" size={24} iconColor="#4A3B32" />}</View>
      {isGuest ? (
        <View style={styles.guestContainer}><MaterialCommunityIcons name="login-variant" size={80} color="#D2B48C" /><Text style={styles.guestTitle}>Sign in to view orders</Text><Button mode="contained" buttonColor="#6F4E37" style={styles.loginBtn} onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>Log In</Button></View>
      ) : (
        <>
          <View style={styles.tabs}>{['Active', 'History'].map(t => (<TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.activeTab]} onPress={() => setActiveTab(t)}><Text style={[styles.tabTxt, activeTab === t && styles.activeTabTxt]}>{t}</Text></TouchableOpacity>))}</View>
          {loading ? <ActivityIndicator style={{ flex: 1 }} color="#6F4E37" /> : (
            <FlatList data={filtered} renderItem={renderOrder} keyExtractor={i => i._id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshOrders} />} ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="coffee-off-outline" size={64} color="#CCC" /><Text style={styles.emptyTxt}>No {activeTab.toLowerCase()} orders.</Text></View>} />
          )}
        </>
      )}
      <Modal animationType="slide" transparent visible={reviewModalVis} onRequestClose={closeReviewModal}>
        <View style={styles.overlay}><View style={styles.sheet}><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>{currentReview?._id ? 'Update Review' : 'Rate Your Brew'}</Text><IconButton icon="close" onPress={closeReviewModal} /></View>
            {selectedOrder && <ScrollView showsVerticalScrollIndicator={false}><Text style={styles.secT}>Select Drink</Text><View style={styles.chipWrap}>{selectedOrder.orderItems.filter(i => !!i.product).map(i => (<Chip key={i.product} selected={selectedProduct?.product === i.product} onPress={() => handleSelectReviewItem(i)} style={[styles.chip, selectedProduct?.product === i.product && styles.chipOn]} textStyle={{color: selectedProduct?.product === i.product ? '#FFF' : '#555'}}>{i.name}</Chip>))}</View>
                <Text style={styles.secT}>Rating</Text><View style={styles.starRow}>{STAR_OPTIONS.map(s => (<TouchableOpacity key={s} onPress={() => setRating(s)}><MaterialCommunityIcons name={s <= rating ? 'star' : 'star-outline'} size={34} color="#D4AF37" /></TouchableOpacity>))}</View>
                <TextInput mode="outlined" label="Review" value={comment} onChangeText={setComment} multiline numberOfLines={4} style={styles.revInp} activeOutlineColor="#6F4E37" />
                {reviewLoading ? <ActivityIndicator color="#6F4E37" style={{ margin: 20 }} /> : <Button mode="contained" buttonColor="#6F4E37" onPress={handleSubmitReview} loading={submitting} style={styles.subBtn}>{currentReview?._id ? 'Update Rating' : 'Submit Rating'}</Button>}
            </ScrollView>}</View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0', paddingTop: 50 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  hTitle: { fontSize: 24, fontWeight: 'bold', color: '#4A3B32' }, tabs: { flexDirection: 'row', backgroundColor: '#EBE1D7', marginHorizontal: 20, borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 }, activeTab: { backgroundColor: '#fff', elevation: 3 }, tabTxt: { fontWeight: '600', color: '#888' },
  activeTabTxt: { color: '#6F4E37', fontWeight: 'bold' }, list: { paddingHorizontal: 20, paddingBottom: 40 }, card: { backgroundColor: '#fff', marginBottom: 16, borderRadius: 16, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, id: { fontWeight: '800', color: '#333', fontSize: 15 }, date: { color: '#999', fontSize: 12, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 }, status: { fontWeight: 'bold', fontSize: 11 }, div: { marginVertical: 12, backgroundColor: '#F5F5F5' },
  itemsWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 }, items: { color: '#666', fontSize: 13, flexShrink: 1 }, total: { fontWeight: 'bold', color: '#6F4E37', fontSize: 16 },
  btn: { marginTop: 15, borderRadius: 10 }, empty: { alignItems: 'center', marginTop: 100, opacity: 0.5 }, emptyTxt: { marginTop: 12, color: '#888', fontSize: 16 },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }, guestTitle: { fontSize: 22, fontWeight: 'bold', color: '#4A3B32', marginVertical: 15 },
  loginBtn: { borderRadius: 25, width: '100%' }, overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '82%' }, sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetTitle: { fontSize: 20, fontWeight: 'bold' }, secT: { marginTop: 15, marginBottom: 10, fontSize: 13, color: '#A0938A', fontWeight: '700' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chipOn: { backgroundColor: '#6F4E37' }, starRow: { flexDirection: 'row', gap: 8, marginVertical: 10 }, revInp: { backgroundColor: '#FFF', marginTop: 8 }, subBtn: { marginTop: 20, borderRadius: 14 }
});