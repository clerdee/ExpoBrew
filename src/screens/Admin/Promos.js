import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Modal } from 'react-native';
import { Text, Button, TextInput, Card, IconButton } from 'react-native-paper';
import axios from 'axios';
import { API_BASE_URL } from '../../configs/config';
import Toast from 'react-native-toast-message';

export default function Promos() {
  const [promos, setPromos] = useState([]), [vis, setVis] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', discountPercent: '', code: '' });

  const fetchPromos = async () => {
    const { data } = await axios.get(`${API_BASE_URL}/admin/promos`);
    setPromos(data);
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleSend = async () => {
    try {
      await axios.post(`${API_BASE_URL}/admin/promos`, form);
      Toast.show({ type: 'success', text1: 'Notification Sent!', text2: 'Customers notified of the new promo.' });
      setVis(false); fetchPromos();
    } catch (e) { Toast.show({ type: 'error', text1: 'Failed to send' }); }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.header}>
        <Text style={styles.hTitle}>Promotions</Text>
        <Button mode="contained" buttonColor="#FFF" textColor="#4A2E1B" onPress={() => setVis(true)}>New Promo</Button>
      </View>

      <FlatList data={promos} keyExtractor={i => i._id} contentContainerStyle={{padding:20}} renderItem={({item}) => (
        <Card style={styles.card}>
          <Card.Title title={item.title} subtitle={`${item.discountPercent}% OFF - Code: ${item.code}`} 
            left={(p) => <IconButton {...p} icon="ticket-percent" iconColor="#4A2E1B" />} />
          <Card.Content><Text>{item.description}</Text></Card.Content>
        </Card>
      )} />

      <Modal visible={vis} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.mTitle}>Blast Notification</Text>
          <TextInput label="Promo Title" value={form.title} onChangeText={t => setForm({...form, title:t})} mode="outlined" style={styles.input}/>
          <TextInput label="Message Content" value={form.description} onChangeText={t => setForm({...form, description:t})} multiline numberOfLines={3} mode="outlined" style={styles.input}/>
          <TextInput label="Discount %" value={form.discountPercent} onChangeText={t => setForm({...form, discountPercent:t})} keyboardType="numeric" mode="outlined" style={styles.input}/>
          <TextInput label="Promo Code" value={form.code} onChangeText={t => setForm({...form, code:t})} mode="outlined" style={styles.input}/>
          <Button mode="contained" onPress={handleSend} buttonColor="#4A2E1B" style={{marginTop:20}}>Send Notification</Button>
          <Button onPress={() => setVis(false)}>Cancel</Button>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#4A2E1B', padding: 40, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  card: { marginBottom: 15, backgroundColor: '#FFF' },
  modal: { flex: 1, padding: 30, justifyContent: 'center' },
  mTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 10 }
});