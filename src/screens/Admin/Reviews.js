import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView, RefreshControl, Image } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar, Avatar, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const RATINGS = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

export default function Reviews({ navigation }) {
  const [reviews, setReviews] = useState([]), [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false); 
  const [search, setSearch] = useState(''), [ratingFilter, setRatingFilter] = useState('All'); 

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

  const handleDelete = (id) => {
    Alert.alert("Delete Review", "Permanently remove this customer feedback?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: 'destructive', onPress: async () => {
          try { 
            const token = await SecureStore.getItemAsync('userToken');
            await axios.delete(`${API_BASE_URL}/admin/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } }); 
            Toast.show({ type: 'success', text1: 'Review removed' }); fetchReviews(); 
          } catch (e) { Toast.show({ type: 'error', text1: 'Error deleting' }); }
        }
      }
    ]);
  };

  const filtered = useMemo(() => reviews.filter(i => {
    const matchSearch = (i.user?.name || '').toLowerCase().includes(search.toLowerCase()) || (i.product?.name || '').toLowerCase().includes(search.toLowerCase()) || (i.comment || '').toLowerCase().includes(search.toLowerCase());
    const target = ratingFilter === 'All' ? null : parseInt(ratingFilter.charAt(0));
    return matchSearch && (ratingFilter === 'All' || i.rating === target);
  }), [reviews, search, ratingFilter]);

  const renderItem = ({ item: i }) => {
    const custText = i.customizations && Object.values(i.customizations).filter(Boolean).length > 0 ? `Variation: ${Object.values(i.customizations).filter(Boolean).join(', ')}` : null;
    const dateStr = i.createdAt ? new Date(i.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '--';
    const timeStr = i.createdAt ? new Date(i.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <Card style={styles.card} mode="elevated">
        <View style={styles.cardContent}>
          {i.user?.profileImage ? (
            <Image source={{ uri: i.user.profileImage }} style={styles.userImage} />
          ) : (
            <Avatar.Text size={50} label={i.user?.name?.charAt(0) || 'U'} style={styles.avatar} color="#FFF" />
          )}

          <View style={styles.info}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{i.user?.name || 'Deleted User'}</Text>
              <IconButton icon="trash-can-outline" size={18} iconColor="#D32F2F" containerColor="#FEEBEE" onPress={() => handleDelete(i._id)} style={styles.deleteBtn} />
            </View>
            <Text style={styles.dateTime}>{dateStr} • {timeStr}</Text>
            <Divider style={styles.cardDiv} />
            <View style={styles.productRow}>
              <MaterialCommunityIcons name="coffee-outline" size={14} color="#6F4E37" />
              <Text style={styles.productName}>{i.product?.name || 'Unknown Item'}</Text>
            </View>
            <View style={styles.stars}>{[1,2,3,4,5].map(s => <MaterialCommunityIcons key={s} name={s <= i.rating ? 'star' : 'star-outline'} size={14} color="#D4AF37" />)}</View>
            {custText && <Text style={styles.variationTxt}>{custText}</Text>}
            <Text style={styles.desc}>{i.comment || "No comment provided."}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
            <Text style={styles.title}>Review Moderation</Text>
            <IconButton icon="refresh" size={24} iconColor="#FFF" onPress={() => fetchReviews()} />
          </View>
        </View>
        <View style={styles.searchRow}><Searchbar placeholder="Search name or comment..." onChangeText={setSearch} value={search} style={styles.searchBar} inputStyle={{ fontSize: 14 }} iconColor="#4A2E1B" /></View>
        <View style={styles.filters}>
          <Text style={styles.filterTitle}>Filter by Rating</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
            {RATINGS.map(f => (<Chip key={f} mode="flat" onPress={()=>setRatingFilter(f)} style={[styles.chip, ratingFilter===f?styles.chipOn:styles.chipOff]} textStyle={ratingFilter===f?styles.textOn:styles.textOff}>{f}</Chip>))}
          </ScrollView>
        </View>
      </View>
      <View style={styles.bottom}>
        {loading && !refreshing ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : (
          <FlatList data={filtered} keyExtractor={i => i._id || Math.random().toString()} renderItem={renderItem} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>fetchReviews(true)} tintColor="#4A2E1B" />} ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="comment-off" size={50} color="#CCC" /><Text style={styles.emptyText}>No reviews found.</Text></View>} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' }, header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 45, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 20, fontWeight: '800', color: '#FFF' },
  searchRow: { marginTop: -25, paddingHorizontal: 20 }, searchBar: { backgroundColor: '#FFF', borderRadius: 12, height: 50, elevation: 4 },
  filters: { paddingHorizontal: 20, marginTop: 15 }, filterTitle: { fontSize: 11, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
  scroll: { marginBottom: 10 }, chip: { marginRight: 8, borderRadius: 8, height: 32 }, chipOn: { backgroundColor: '#4A2E1B' }, chipOff: { backgroundColor: '#E0E0E0' },
  textOn: { color: '#FFF', fontWeight: 'bold', fontSize: 12 }, textOff: { color: '#666', fontSize: 12 }, loader: { flex: 1, justifyContent: 'center' },
  list: { padding: 20, paddingBottom: 40 }, card: { marginBottom: 16, backgroundColor: '#FFF', borderRadius: 16, borderLeftWidth: 5, borderLeftColor: '#4A2E1B' },
  cardContent: { flexDirection: 'row', padding: 15 }, userImage: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EEE' },
  avatar: { backgroundColor: '#D2B48C' }, info: { flex: 1, marginLeft: 15 }, titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 15, fontWeight: 'bold', color: '#333' }, dateTime: { fontSize: 11, color: '#999', marginTop: 2 }, cardDiv: { marginVertical: 8, opacity: 0.5 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 }, productName: { fontSize: 12, fontWeight: '700', color: '#6F4E37', marginLeft: 5 },
  stars: { flexDirection: 'row', marginBottom: 6 }, variationTxt: { fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 6 },
  desc: { fontSize: 13, color: '#444', lineHeight: 18 }, deleteBtn: { margin: 0, marginTop: -5 }, empty: { alignItems: 'center', marginTop: 80 }, emptyText: { color: '#999', fontSize: 15 }
});