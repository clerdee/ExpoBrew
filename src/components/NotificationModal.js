import React, { useState, useEffect } from "react";
import { View, StyleSheet, Modal, FlatList, TouchableOpacity } from "react-native";
import { Text, IconButton, Divider, ActivityIndicator } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "../configs/config";

export default function NotificationModal({ visible, onClose }) {
  const [notifs, setNotifs] = useState([]), [loading, setLoading] = useState(false);

  useEffect(() => { if (visible) fetchNotifs(); }, [visible]);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/users/notifications`);
      setNotifs(data);
    } catch (e) { console.log("Notif fetch error"); } finally { setLoading(false); }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.item, !item.isRead && styles.unread]}>
      <View style={[styles.iconBox, { backgroundColor: item.type === 'Promo' ? '#F1C40F20' : '#3498DB20' }]}>
        <MaterialCommunityIcons name={item.type === 'Promo' ? "ticket-percent" : "truck-delivery"} size={22} color={item.type === 'Promo' ? "#F1C40F" : "#3498DB"} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.iTitle}>{item.title}</Text>
        <Text style={styles.iMsg} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.iTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}><View style={styles.sheet}>
        <View style={styles.head}>
          <Text style={styles.hText}>Notifications</Text>
          <IconButton icon="close" onPress={onClose} />
        </View>
        <Divider />
        {loading ? <ActivityIndicator style={{margin:40}} color="#6F4E37" /> : 
          <FlatList data={notifs} keyExtractor={i=>i._id} renderItem={renderItem} 
            contentContainerStyle={{padding:15}} ListEmptyComponent={<Text style={styles.empty}>No new updates</Text>} />
        }
      </View></View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '70%' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, paddingLeft: 20 },
  hText: { fontSize: 20, fontWeight: 'bold', color: '#4A3B32' },
  item: { flexDirection: 'row', padding: 15, borderRadius: 15, marginBottom: 10, backgroundColor: '#F9F9F9' },
  unread: { backgroundColor: '#FDF7F2', borderLeftWidth: 4, borderLeftColor: '#6F4E37' },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iTitle: { fontWeight: 'bold', color: '#333', fontSize: 15 }, iMsg: { color: '#666', fontSize: 13, marginTop: 2 },
  iTime: { color: '#AAA', fontSize: 11, marginTop: 5 }, empty: { textAlign: 'center', marginTop: 50, color: '#AAA' }
});