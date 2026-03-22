import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar, Avatar, Divider, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const { width } = Dimensions.get('window');
const RATINGS = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

export default function Reviews({ navigation }) {
  const [reviews, setReviews] = useState([]), [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState(''), [ratingFilter, setRatingFilter] = useState('All');
  const [delTarget, setDelTarget] = useState(null), [delVis, setDelVis] = useState(false);

  const fetchReviews = async (isPull = false) => {
    if (!isPull) setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/admin/reviews`, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(data);
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to load reviews' }); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useFocusEffect(useCallback(() => { fetchReviews(); }, []));

  const confirmDelete = (id) => { setDelTarget(id); setDelVis(true); };

  const executeDelete = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      await axios.delete(`${API_BASE_URL}/admin/reviews/${delTarget}`, { headers: { Authorization: `Bearer ${token}` } });
      Toast.show({ type: 'success', text1: 'Review Removed' });
      setDelVis(false); fetchReviews(true);
    } catch (e) { setDelVis(false); Toast.show({ type: 'error', text1: 'Error deleting' }); }
  };

  const filtered = useMemo(() => reviews.filter(i => {
    const name = (i.user?.name || '').toLowerCase();
    const email = (i.user?.email || '').toLowerCase();
    const prod = (i.product?.name || '').toLowerCase();
    const comm = (i.comment || '').toLowerCase();
    const term = search.toLowerCase();
    
    const matchSearch = name.includes(term) || email.includes(term) || prod.includes(term) || comm.includes(term);
    const target = ratingFilter === 'All' ? null : parseInt(ratingFilter.charAt(0));
    return matchSearch && (ratingFilter === 'All' || i.rating === target);
  }), [reviews, search, ratingFilter]);

  const renderItem = ({ item: i }) => {
    const d = new Date(i.createdAt);
    const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
      <Card style={styles.card} mode="elevated">
        <View style={styles.cardContent}>
          <View style={styles.sideHeader}>
            {i.user?.profileImage ? (
              <Image source={{ uri: i.user.profileImage }} style={styles.userImage} />
            ) : (
              <Avatar.Text size={45} label={i.user?.name?.charAt(0) || 'U'} style={styles.avatar} color="#FFF" />
            )}
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingNum}>{i.rating}</Text>
              <MaterialCommunityIcons name="star" size={12} color="#D4AF37" />
            </View>
          </View>
          <View style={styles.info}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{i.user?.name || 'Deleted User'}</Text>
                <Text style={styles.emailText} numberOfLines={1}>{i.user?.email || 'No Email Found'}</Text>
              </View>
              <IconButton icon="trash-can-outline" size={20} iconColor="#D32F2F" containerColor="#FEEBEE" onPress={() => confirmDelete(i._id)} />
            </View>
            <Text style={styles.dateTime}>{dateStr} • {timeStr}</Text>
            <Divider style={styles.cardDiv} />
            <View style={styles.productRow}>
              <MaterialCommunityIcons name="coffee" size={14} color="#6F4E37" />
              <Text style={styles.productName}>{i.product?.name || 'Unknown Item'}</Text>
            </View>
            <Text style={styles.desc}>{i.comment || "No comment provided."}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF5F0' }}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
          <Text style={styles.title}>Reviews</Text>
          <IconButton icon="refresh" size={24} iconColor="#FFF" onPress={() => fetchReviews(true)} style={{ marginRight: -10 }} />
        </View>
        <Searchbar 
            placeholder="Search name, email, or coffee..." 
            onChangeText={setSearch} 
            value={search} 
            style={styles.searchBar} 
            inputStyle={{ fontSize: 14 }} 
            iconColor="#4A2E1B" 
            elevation={2} 
        />
      </View>

      <View style={styles.filters}>
        <Text style={styles.filterTitle}>Filter by Rating</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {RATINGS.map(f => (
            <TouchableOpacity key={f} onPress={() => setRatingFilter(f)} style={[styles.pill, ratingFilter === f && styles.pillOn]}>
              <Text style={[styles.filterText, ratingFilter === f && styles.pillTxtOn]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? <ActivityIndicator size="large" color="#4A2E1B" style={{ flex: 1 }} /> : (
        <FlatList 
          data={filtered} 
          keyExtractor={i => i._id} 
          renderItem={renderItem} 
          contentContainerStyle={styles.list} 
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchReviews(true)} tintColor="#4A2E1B" />}
          ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="comment-off-outline" size={50} color="#D3C4B7" /><Text style={styles.emptyText}>No reviews found.</Text></View>} 
        />
      )}

      <Modal animationType="fade" transparent={true} visible={delVis} onRequestClose={() => setDelVis(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalSheet}>
            <MaterialCommunityIcons name="alert-decagram" size={50} color="#D32F2F" style={{ alignSelf: 'center', marginBottom: 15 }} />
            <Text style={styles.mTitle}>Delete Review</Text>
            <Text style={styles.mDesc}>Are you sure? This feedback will be removed permanently and cannot be recovered.</Text>
            <View style={styles.mActions}>
              <Button mode="outlined" onPress={() => setDelVis(false)} style={styles.mBtn} textColor="#666">Cancel</Button>
              <Button mode="contained" onPress={executeDelete} style={styles.mBtn} buttonColor="#D32F2F">Confirm</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 50, borderBottomRightRadius: 35, borderBottomLeftRadius: 35, zIndex: 5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  searchBar: { backgroundColor: '#FFF', borderRadius: 15, height: 50, position: 'absolute', bottom: -25, left: 20, width: width - 40 },
  filters: { paddingHorizontal: 20, marginTop: 40, marginBottom: 10 },
  filterTitle: { fontSize: 11, fontWeight: '800', color: '#8B5E3C', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', marginRight: 8, borderWidth: 1, borderColor: '#EBE1D7' },
  pillOn: { backgroundColor: '#6F4E37', borderColor: '#6F4E37' }, 
  filterText: { fontSize: 12, color: '#666', fontWeight: 'bold' }, 
  pillTxtOn: { color: '#FFF' },
  list: { padding: 16, paddingBottom: 40 }, 
  card: { marginBottom: 16, backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', elevation: 3 },
  cardContent: { flexDirection: 'row', padding: 15 }, 
  sideHeader: { alignItems: 'center' }, 
  userImage: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#EEE' }, 
  avatar: { backgroundColor: '#D2B48C' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAF5F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, marginTop: 8 },
  ratingNum: { fontSize: 11, fontWeight: 'bold', color: '#4A3B32', marginRight: 2 },
  info: { flex: 1, marginLeft: 15 }, 
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 15, fontWeight: 'bold', color: '#333' }, 
  emailText: { fontSize: 11, color: '#888', marginTop: 1 },
  dateTime: { fontSize: 11, color: '#AAA', marginTop: 5, fontWeight: '600' },
  cardDiv: { marginVertical: 10, opacity: 0.3 }, 
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  productName: { fontSize: 12, fontWeight: '900', color: '#6F4E37', marginLeft: 6 },
  desc: { fontSize: 13, color: '#444', lineHeight: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 30 },
  modalSheet: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, elevation: 20 },
  mTitle: { fontSize: 22, fontWeight: '900', color: '#4A3B32', marginBottom: 10, textAlign: 'center' },
  mDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 30, textAlign: 'center' },
  mActions: { flexDirection: 'row', justifyContent: 'space-between' }, 
  mBtn: { flex: 0.48, borderRadius: 12 },
  empty: { alignItems: 'center', marginTop: 80 }, 
  emptyText: { color: '#D3C4B7', fontSize: 16, marginTop: 10, fontWeight: 'bold' }
});