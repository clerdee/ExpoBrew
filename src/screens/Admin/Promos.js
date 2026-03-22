import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert, View, StyleSheet, FlatList, Modal, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Searchbar, Button, TextInput, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const TYPES = [
  { l: '% Off', v: 'Percentage', i: 'percent' },
  { l: '₱ Off', v: 'Fixed', i: 'currency-php' },
  { l: 'Free Ship', v: 'FreeShipping', i: 'truck-fast' },
  { l: 'Deal', v: 'SpecialDeal', i: 'star-shooting' },
];

export default function Promos({ navigation }) {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'Percentage', value: '', code: '', validUntil: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] });

  const fetchPromos = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const t = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/admin/promos`, { headers: { Authorization: `Bearer ${t}` } });
      setPromos(data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to load promos' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
    const interval = setInterval(() => fetchPromos(true), 10000);
    return () => clearInterval(interval);
  }, [fetchPromos]);

  const handleCreate = async () => {
    if (!form.title || !form.code || !form.validUntil || !form.description) {
      return Toast.show({ type: 'error', text1: 'Please fill all required fields' });
    }

    try {
      const t = await SecureStore.getItemAsync('userToken');
      await axios.post(`${API_BASE_URL}/admin/promos`, { ...form, value: Number(form.value) || 0 }, { headers: { Authorization: `Bearer ${t}` } });
      Toast.show({ type: 'success', text1: 'Promo Blast Sent!' });
      setModal(false);
      setForm({ title: '', description: '', type: 'Percentage', value: '', code: '', validUntil: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0] });
      fetchPromos(true);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Creation failed', text2: e.response?.data?.message || 'Check terminal details' });
    }
  };

  const handleDeletePromo = (promo) => {
    Alert.alert('Delete Promo', `Remove ${promo.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeletingId(promo._id);
            const t = await SecureStore.getItemAsync('userToken');
            await axios.delete(`${API_BASE_URL}/admin/promos/${promo._id}`, { headers: { Authorization: `Bearer ${t}` } });
            setPromos((current) => current.filter((item) => item._id !== promo._id));
            Toast.show({ type: 'success', text1: 'Promo deleted' });
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Delete failed', text2: error.response?.data?.message || 'Unable to delete promo.' });
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const filtered = useMemo(() => promos.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase())), [promos, search]);

  const renderItem = ({ item: p }) => {
    const isExp = new Date(p.validUntil) < new Date();
    const typeObj = TYPES.find((t) => t.v === p.type) || TYPES[0];

    return (
      <Card style={[styles.card, isExp && { opacity: 0.6 }]} mode="elevated">
        <View style={styles.cContent}>
          <View style={[styles.iconBox, isExp && { backgroundColor: '#EEE' }]}><MaterialCommunityIcons name={typeObj.i} size={30} color={isExp ? '#999' : '#6F4E37'} /></View>
          <View style={styles.info}>
            <View style={styles.tRow}>
              <Text style={styles.name}>{p.title}</Text>
              <Text style={styles.val}>{p.type === 'Percentage' ? `${p.value}%` : p.type === 'Fixed' ? `₱${p.value}` : p.type === 'SpecialDeal' ? `₱${p.value} DEAL` : 'FREE'}</Text>
            </View>
            <Text style={styles.code}>CODE: <Text style={{ fontWeight: '900', color: isExp ? '#999' : '#4A2E1B' }}>{p.code}</Text> • {isExp ? 'EXPIRED' : `Till ${new Date(p.validUntil).toLocaleDateString()}`}</Text>
            <Text style={styles.desc} numberOfLines={2}>{p.description}</Text>
          </View>
          <IconButton icon="delete-outline" iconColor="#D32F2F" loading={deletingId === p._id} disabled={deletingId === p._id} onPress={() => handleDeletePromo(p)} />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.bg}>
      <View style={styles.top}>
        <View style={styles.head}>
          <View style={styles.hRow}>
            <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
            <Text style={styles.title}>Promotions</Text>
            <IconButton icon="plus-box" size={28} iconColor="#FFF" onPress={() => setModal(true)} style={{ marginRight: -10 }} />
          </View>
        </View>
        <View style={styles.sRow}><Searchbar placeholder="Search codes..." onChangeText={setSearch} value={search} style={styles.sBar} iconColor="#4A2E1B" elevation={2} /></View>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No promos found.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPromos(true); }} tintColor="#4A2E1B" />}
        />
      )}

      <Modal visible={modal} animationType="slide" transparent>
        <View style={styles.overlay}><View style={styles.sheet}>
          <View style={styles.mHead}><Text style={styles.mTitle}>Create Blast</Text><IconButton icon="close" onPress={() => setModal(false)} /></View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TextInput label="Promo Title *" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} mode="outlined" style={styles.inp} activeOutlineColor="#4A2E1B" />
            <TextInput label="Message / Description" value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} mode="outlined" multiline numberOfLines={2} style={styles.inp} activeOutlineColor="#4A2E1B" />
            <Text style={styles.lbl}>Promotion Type</Text>
            <View style={styles.chipRow}>
              {TYPES.map((t) => <Chip key={t.v} selected={form.type === t.v} onPress={() => setForm({ ...form, type: t.v })} style={[styles.chip, form.type === t.v && { backgroundColor: '#6F4E37' }]} textStyle={{ color: form.type === t.v ? '#FFF' : '#333' }}>{t.l}</Chip>)}
            </View>
            <View style={styles.fRow}>
              <TextInput label="Value (e.g., 15)" value={form.value} onChangeText={(t) => setForm({ ...form, value: t })} mode="outlined" keyboardType="numeric" style={[styles.inp, { flex: 0.8, marginRight: 10 }]} activeOutlineColor="#4A2E1B" disabled={form.type === 'FreeShipping'} />
              <TextInput label="Promo Code *" value={form.code} onChangeText={(t) => setForm({ ...form, code: t })} mode="outlined" style={[styles.inp, { flex: 1.2 }]} activeOutlineColor="#4A2E1B" />
            </View>
            <TextInput label="Expires On (YYYY-MM-DD)" value={form.validUntil} onChangeText={(t) => setForm({ ...form, validUntil: t })} mode="outlined" style={styles.inp} activeOutlineColor="#4A2E1B" />
            <Button mode="contained" onPress={handleCreate} buttonColor="#4A2E1B" style={styles.sBtn}>SEND TO ALL CUSTOMERS</Button>
          </ScrollView>
        </View></View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#FAFAFA' }, top: { zIndex: 999 },
  head: { backgroundColor: '#4A2E1B', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 40, borderBottomRightRadius: 25, borderBottomLeftRadius: 25 },
  hRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  sRow: { flexDirection: 'row', alignItems: 'center', marginTop: -25, paddingHorizontal: 20 }, sBar: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, height: 50 },
  loader: { flex: 1, justifyContent: 'center' }, list: { padding: 20 }, card: { marginBottom: 14, backgroundColor: '#FFF', borderRadius: 15 },
  cContent: { flexDirection: 'row', padding: 15, alignItems: 'center' }, iconBox: { width: 55, height: 55, borderRadius: 12, backgroundColor: '#FDF7F2', justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 15 }, tRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 }, val: { fontSize: 15, color: '#27AE60', fontWeight: '900' },
  code: { fontSize: 11, color: '#888', marginBottom: 4 }, desc: { fontSize: 12, color: '#666', lineHeight: 16 }, empty: { textAlign: 'center', marginTop: 40, color: '#999' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '90%' },
  mHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, mTitle: { fontSize: 20, fontWeight: 'bold', color: '#4A2E1B' },
  inp: { marginBottom: 12, backgroundColor: '#FFF' }, fRow: { flexDirection: 'row' }, lbl: { fontSize: 12, color: '#666', fontWeight: 'bold', marginTop: 5, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }, chip: { marginRight: 8, marginBottom: 8 },
  sBtn: { marginTop: 15, borderRadius: 10, paddingVertical: 5 },
});
