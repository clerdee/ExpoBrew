import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Modal, ScrollView } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Chip, Searchbar, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

export default function Promos({ navigation }) {
  const [promos, setPromos] = useState([]), [loading, setLoading] = useState(true), [search, setSearch] = useState('');
  const [modal, setModal] = useState(false), [form, setForm] = useState({ title: '', description: '', discountPercent: '', code: '' });

  useEffect(() => { fetchPromos(); }, []);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const t = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/admin/promos`, { headers: { Authorization: `Bearer ${t}` } });
      setPromos(data);
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to load promos' }); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.title || !form.code) return Toast.show({ type: 'error', text1: 'Fill required fields' });
    try {
      const t = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_BASE_URL}/admin/promos`, form, { headers: { Authorization: `Bearer ${t}` } });
      Toast.show({ type: 'success', text1: 'Promo Blast Sent!' });
      setModal(false); setForm({ title: '', description: '', discountPercent: '', code: '' }); fetchPromos();
    } catch (e) { Toast.show({ type: 'error', text1: 'Creation failed' }); }
  };

  const filtered = useMemo(() => promos.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())
  ), [promos, search]);

  const renderItem = ({ item: p }) => (
    <Card style={styles.card} mode="elevated">
      <View style={styles.cardContent}>
        <View style={styles.iconBox}><MaterialCommunityIcons name="ticket-percent" size={32} color="#6F4E37" /></View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{p.title}</Text>
            <Text style={styles.price}>{p.discountPercent}% OFF</Text>
          </View>
          <Text style={styles.code}>CODE: <Text style={{fontWeight:'900', color:'#4A2E1B'}}>{p.code}</Text></Text>
          <Text style={styles.desc} numberOfLines={2}>{p.description}</Text>
        </View>
        <IconButton icon="trash-can-outline" size={20} iconColor="#D32F2F" containerColor="#FEEBEE" onPress={() => {}} />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
            <Text style={styles.title}>Promotions</Text>
            <IconButton icon="plus-box" size={28} iconColor="#FFF" onPress={() => setModal(true)} style={{ marginRight: -10 }} />
          </View>
        </View>
        <View style={styles.searchRow}>
          <Searchbar placeholder="Search promos or codes..." onChangeText={setSearch} value={search} style={styles.searchBar} iconColor="#4A2E1B" elevation={2} />
        </View>
      </View>

      <View style={styles.bottom}>
        {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : (
          <FlatList data={filtered} keyExtractor={i => i._id} renderItem={renderItem} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} 
            ListEmptyComponent={<View style={styles.empty}><MaterialCommunityIcons name="ticket-confirmation-outline" size={60} color="#CCC" /><Text style={styles.emptyText}>No promos found.</Text></View>} />
        )}
      </View>

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}><View style={styles.sheet}>
          <View style={styles.mHead}><Text style={styles.mTitle}>New Promotion</Text><IconButton icon="close" onPress={()=>setModal(false)}/></View>
          <TextInput label="Promo Title *" value={form.title} onChangeText={t=>setForm({...form, title:t})} mode="outlined" style={styles.input} activeOutlineColor="#4A2E1B"/>
          <TextInput label="Description" value={form.description} onChangeText={t=>setForm({...form, description:t})} mode="outlined" multiline numberOfLines={3} style={styles.input} activeOutlineColor="#4A2E1B"/>
          <View style={styles.fRow}>
            <TextInput label="Discount %" value={form.discountPercent} onChangeText={t=>setForm({...form, discountPercent:t})} mode="outlined" keyboardType="numeric" style={[styles.input, {flex:1, marginRight:10}]} activeOutlineColor="#4A2E1B"/>
            <TextInput label="Promo Code *" value={form.code} onChangeText={t=>setForm({...form, code:t})} mode="outlined" style={[styles.input, {flex:1}]} activeOutlineColor="#4A2E1B"/>
          </View>
          <Button mode="contained" onPress={handleCreate} buttonColor="#4A2E1B" style={styles.submitBtn}>SEND NOTIFICATION BLAST</Button>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' }, top: { zIndex: 999 }, bottom: { flex: 1 },
  header: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40, borderBottomRightRadius: 25, borderBottomLeftRadius: 25 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: -25, paddingHorizontal: 20 }, searchBar: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, height: 50 },
  loader: { flex: 1, justifyContent: 'center' }, list: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 15 }, card: { marginBottom: 14, backgroundColor: '#FFF', borderRadius: 15 },
  cardContent: { flexDirection: 'row', padding: 15, alignItems: 'center' }, 
  iconBox: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#FDF7F2', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 }, titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }, 
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' }, price: { fontSize: 15, color: '#27AE60', fontWeight: '800' }, 
  code: { fontSize: 12, color: '#888', marginBottom: 4, letterSpacing: 0.5 }, desc: { fontSize: 13, color: '#666', lineHeight: 18 },
  empty: { alignItems: 'center', marginTop: 60 }, emptyText: { color: '#888', fontSize: 16, marginTop: 10 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, paddingBottom: 40 },
  mHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }, mTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A2E1B' },
  input: { marginBottom: 12, backgroundColor: '#FFF' }, fRow: { flexDirection: 'row' },
  submitBtn: { marginTop: 10, borderRadius: 10, paddingVertical: 5 }
});