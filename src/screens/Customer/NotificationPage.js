import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import { Text, IconButton, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "../../configs/config";
import * as SecureStore from 'expo-secure-store'; 

const formatTime = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now - past;
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";
  return past.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function NotificationsPage({ navigation }) {
  const [notifs, setNotifs] = useState([]), [loading, setLoading] = useState(true), [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken'); 
      const { data } = await axios.get(`${API_BASE_URL}/users/notifications`, { headers: { Authorization: `Bearer ${token}` } });
      setNotifs(data);
    } catch (e) { console.log("Fetch error"); } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const promos = notifs.filter(n => n.type?.toLowerCase() === 'promo');
  const updates = notifs.filter(n => n.type?.toLowerCase() === 'order');
  const unreadPromos = promos.filter(p => !p.isRead).length;

  const markAllRead = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken'); 
      await axios.put(`${API_BASE_URL}/users/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (e) { console.log("Mark read error"); }
  };

  const getStatusConfig = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes('completed')) return { icon: 'check-circle', color: '#2ECC71' };
    if (text.includes('ready')) return { icon: 'moped', color: '#3498DB' };
    if (text.includes('preparing')) return { icon: 'coffee-maker', color: '#E67E22' };
    if (text.includes('pending')) return { icon: 'clock-outline', color: '#F1C40F' };
    if (text.includes('cancelled')) return { icon: 'close-circle', color: '#E74C3C' };
    return { icon: 'truck-delivery-outline', color: '#6F4E37' };
  };

  const renderUpdate = ({ item }) => {
    // CRITICAL FIX: Look for relatedId (matches your controller)
    const rawOrderId = item.relatedId || item.data?.orderId || item.message.match(/#?([a-f\d]{24})/i)?.[1];
    const displayId = rawOrderId ? rawOrderId.slice(-6).toUpperCase() : "ORDER";
    const statusCfg = getStatusConfig(item.message);

    return (
      <TouchableOpacity 
        style={[styles.item, !item.isRead && styles.unread]} 
        onPress={() => navigation.navigate('OrderDetail', { orderId: rawOrderId })}
      >
        <View style={[styles.iconCircle, { backgroundColor: statusCfg.color + '15' }]}>
          <MaterialCommunityIcons name={statusCfg.icon} size={24} color={statusCfg.color} />
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={{flex:1, marginLeft:12}}>
          <View style={styles.rowBetween}>
            <View style={styles.titleRow}>
               <Text style={styles.iTitle}>{item.title}</Text>
               <View style={styles.idBadge}>
                  <Text style={styles.idText}>#{displayId}</Text>
               </View>
            </View>
            <Text style={styles.iTime}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.iMsg} numberOfLines={2}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bg}>
      <View style={styles.head}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text style={styles.hTitle}>Notifications</Text>
        <View style={{width:48}} />
      </View>
      
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{setRefreshing(true); fetchData();}} />}>
        <TouchableOpacity style={styles.promoRow} onPress={() => navigation.navigate('PromoList', { promos })}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, {backgroundColor:'#F1C40F20'}]}>
              <MaterialCommunityIcons name="ticket-percent-outline" size={24} color="#F1C40F" />
            </View>
            <View style={{marginLeft:12}}>
              <Text style={styles.pTitle}>Promotions</Text>
              <Text style={styles.pSub}>{promos[0]?.title || "Check out latest deals"}</Text>
            </View>
          </View>
          <View style={styles.row}>
            {unreadPromos > 0 && <View style={styles.pBadge}><Text style={styles.pBadgeText}>{unreadPromos}</Text></View>}
            <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Order Updates</Text>
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.readAll}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#6F4E37" style={{marginTop:20}} />
        ) : (
          <FlatList 
            data={updates} 
            scrollEnabled={false} 
            keyExtractor={i=>i._id} 
            renderItem={renderUpdate} 
            ListEmptyComponent={<Text style={styles.empty}>No updates yet</Text>} 
          />
        )}
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, flexWrap: 'wrap' },
  pTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  pSub: { fontSize: 13, color: '#888', marginTop: 2 },
  pBadge: { backgroundColor: '#E74C3C', paddingHorizontal: 6, borderRadius: 10, marginRight: 5 },
  pBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  divider: { height: 10, backgroundColor: '#F5F5F5' },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderColor: '#F0F0F0' },
  secTitle: { fontSize: 13, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' },
  readAll: { fontSize: 13, color: '#6F4E37', fontWeight: '600' },
  item: { flexDirection: 'row', padding: 15, borderBottomWidth: 0.5, borderColor: '#F0F0F0' },
  unread: { backgroundColor: '#FDF7F2' },
  unreadDot: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E74C3C', borderWidth: 1, borderColor: '#FFF' },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  iTitle: { fontWeight: 'bold', color: '#333', fontSize: 14, marginRight: 6 },
  idBadge: { backgroundColor: '#6F4E37', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, marginTop: 2 },
  idText: { fontSize: 9, color: '#FFF', fontWeight: 'bold' },
  iMsg: { color: '#666', fontSize: 13, marginTop: 4, lineHeight: 18 },
  iTime: { color: '#AAA', fontSize: 10, marginLeft: 5 },
  empty: { textAlign: 'center', marginTop: 40, color: '#CCC' }
});