import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, FAB, Portal, Modal, TextInput, IconButton, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import Toast from 'react-native-toast-message';

import { API_BASE_URL } from "../../configs/config";

const API_URL = `${API_BASE_URL}/api/v1/products`; 

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', countInStock: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try { const response = await axios.get(API_URL); setProducts(response.data); } 
    catch (error) { console.error("Fetch error:", error); Toast.show({ type: 'error', text1: 'Failed to load products' }); } 
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return Toast.show({ type: 'error', text1: 'Name and Price required' });
    try {
      if (editingId) { await axios.put(`${API_URL}/${editingId}`, formData); Toast.show({ type: 'success', text1: 'Product updated' }); } 
      else { await axios.post(API_URL, formData); Toast.show({ type: 'success', text1: 'Product created' }); }
      closeModal(); fetchProducts();
    } catch (error) { console.error("Save error:", error); Toast.show({ type: 'error', text1: 'Failed to save product' }); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`${API_URL}/${id}`); Toast.show({ type: 'success', text1: 'Product deleted' }); fetchProducts(); } 
    catch (error) { console.error("Delete error:", error); Toast.show({ type: 'error', text1: 'Failed to delete product' }); }
  };

  const openModal = (product = null) => {
    if (product) { setEditingId(product._id); setFormData({ name: product.name, description: product.description, price: product.price.toString(), countInStock: product.countInStock.toString() }); } 
    else { setEditingId(null); setFormData({ name: '', description: '', price: '', countInStock: '' }); }
    setVisible(true);
  };

  const closeModal = () => setVisible(false);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Title title={item.name} subtitle={`$${item.price} | Stock: ${item.countInStock}`} right={(props) => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton {...props} icon="pencil" onPress={() => openModal(item)} iconColor="#4A2E1B" />
          <IconButton {...props} icon="delete" onPress={() => handleDelete(item._id)} iconColor="#D32F2F" />
        </View>
      )} />
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Manage Products</Text>
      {loading ? <ActivityIndicator size="large" color="#4A2E1B" style={styles.loader} /> : <FlatList data={products} keyExtractor={(item) => item._id.toString()} renderItem={renderItem} contentContainerStyle={styles.listContainer} ListEmptyComponent={<Text style={styles.emptyText}>No products found.</Text>} />}
      <FAB icon="plus" style={styles.fab} color="white" onPress={() => openModal()} />
      <Portal>
        <Modal visible={visible} onDismiss={closeModal} contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingId ? 'Edit Product' : 'Add New Product'}</Text>
          <TextInput label="Product Name" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} style={styles.input} mode="outlined" activeOutlineColor="#4A2E1B" />
          <TextInput label="Description" value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} style={styles.input} mode="outlined" activeOutlineColor="#4A2E1B" multiline />
          <View style={styles.row}>
            <TextInput label="Price" value={formData.price} onChangeText={(text) => setFormData({ ...formData, price: text })} style={[styles.input, { flex: 1, marginRight: 5 }]} mode="outlined" keyboardType="numeric" activeOutlineColor="#4A2E1B" />
            <TextInput label="Stock" value={formData.countInStock} onChangeText={(text) => setFormData({ ...formData, countInStock: text })} style={[styles.input, { flex: 1, marginLeft: 5 }]} mode="outlined" keyboardType="numeric" activeOutlineColor="#4A2E1B" />
          </View>
          <Button mode="contained" onPress={handleSave} style={styles.saveButton} buttonColor="#4A2E1B">{editingId ? 'Update Product' : 'Save Product'}</Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#4A2E1B', padding: 20, paddingTop: 50, backgroundColor: '#FFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } },
  loader: { flex: 1, justifyContent: 'center' },
  listContainer: { padding: 15, paddingBottom: 80 },
  card: { marginBottom: 10, backgroundColor: '#FFF' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#4A2E1B' },
  modalContainer: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#4A2E1B' },
  input: { marginBottom: 10, backgroundColor: '#FFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  saveButton: { marginTop: 15, paddingVertical: 5 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 }
});