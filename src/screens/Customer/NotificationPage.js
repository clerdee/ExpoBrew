import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import { Text, IconButton, Divider, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "../../configs/config";

export default function NotificationsPage({ navigation }) {
  const [notifs, setNotifs] = useState([]), [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/users/notifications`);
      setNotifs(data);
    } catch (e) { console.log("Fetch error"); } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const promos = notifs.filter(n => n.type === 'Promo');
  const updates = notifs.filter(n => n.type === 'Order');
  const unreadPromos = promos.filter(p => !p.isRead).length;

  const markAllRead = async () => {
    try {
      // Backend should have a PUT /users/notifications/read-all
      await axios.put(`${API_BASE_URL}/users/notifications/read-all`);
      fetchData();
    } catch (e) { console.log("Mark read error"); }
  };

  const renderUpdate = ({ item }) => (
    <TouchableOpacity style={[styles.item, !item.isRead && styles.unread]} onPress={() => navigation.navigate('OrderDetail', { orderId: item.message.match(/#(\w+)/)?.[1] })}>
      <View style={styles.iconCircle}><MaterialCommunityIcons name="truck-delivery-outline" size={24} color="#6F4E37" /></View>
      <View style={{flex:1, marginLeft:12}}>
        <Text style={styles.iTitle}>{item.title}</Text>
        <Text style={styles.iMsg} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.iTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.hTitle}>Notifications</Text>
        <View style={{width:48}} />
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true); fetchData();}} />}>
        {/* SHOPEE STYLE PROMO SECTION */}
        <TouchableOpacity style={styles.promoRow} onPress={() => navigation.navigate('PromoList', { promos })}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, {backgroundColor:'#F1C40F20'}]}><MaterialCommunityIcons name="ticket-percent-outline" size={24} color="#F1C40F" /></View>
            <View style={{marginLeft:12}}><Text style={styles.pTitle}>Promotions</Text><Text style={styles.pSub}>{promos[0]?.title || "Check out latest deals"}</Text></View>
          </View>
          <View style={styles.row}>
            {unreadPromos > 0 && <View style={styles.pBadge}><Text style={styles.pBadgeText}>{unreadPromos}</Text></View>}
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* ORDER UPDATES SECTION */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Order Updates</Text>
          <TouchableOpacity onPress={markAllRead}><Text style={styles.readAll}>Mark all as read</Text></TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color="#6F4E37" style={{marginTop:20}} /> : 
          <FlatList data={updates} scrollEnabled={false} keyExtractor={i=>i._id} renderItem={renderUpdate} ListEmptyComponent={<Text style={styles.empty}>No updates yet</Text>} />
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FFF' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 10, borderBottomWidth: 0.5, borderColor: '#EEE' },
  hTitle: { fontSize: 18, fontWeight: 'bold', color: '#4A3B32' },
  promoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  pTitle: { fontSize: 16, fontWeight: '600', color: '#333' }, pSub: { fontSize: 13, color: '#888', marginTop: 2 },
  pBadge: { backgroundColor: '#E74C3C', paddingHorizontal: 6, borderRadius: 10, marginRight: 5 }, pBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  divider: { height: 10, backgroundColor: '#F5F5F5' },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderColor: '#F0F0F0' },
  secTitle: { fontSize: 14, color: '#666' }, readAll: { fontSize: 14, color: '#6F4E37', fontWeight: '600' },
  item: { flexDirection: 'row', padding: 15, borderBottomWidth: 0.5, borderColor: '#F0F0F0' },
  unread: { backgroundColor: '#FDF7F2' },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  iTitle: { fontWeight: 'bold', color: '#333', fontSize: 15 }, iMsg: { color: '#666', fontSize: 13, marginTop: 4 },
  iTime: { color: '#AAA', fontSize: 11, marginTop: 6 }, empty: { textAlign: 'center', marginTop: 40, color: '#CCC' }
});