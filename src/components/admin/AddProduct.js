import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, Text, TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

export default function AddProduct({ visible, onClose, product, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', countInStock: '' });

  useEffect(() => {
    if (product) setFormData({ name: product.name, description: product.description, price: product.price.toString(), countInStock: product.countInStock.toString() });
    else setFormData({ name: '', description: '', price: '', countInStock: '' });
  }, [product, visible]);

  const handleSave = async () => {
    if (!formData.name || !formData.price) return Toast.show({ type: 'error', text1: 'Name and Price required' });
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (product) { await axios.put(`${API_BASE_URL}/products/${product._id}`, formData, config); Toast.show({ type: 'success', text1: 'Product updated' }); } 
      else { await axios.post(`${API_BASE_URL}/products`, formData, config); Toast.show({ type: 'success', text1: 'Product created' }); }
      onSuccess(); 
      onClose();  
    } catch (error) { console.error("Save error:", error); Toast.show({ type: 'error', text1: 'Failed to save product' }); }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <Text style={styles.modalTitle}>{product ? 'Edit Product' : 'Add New Product'}</Text>
        <TextInput label="Product Name" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} style={styles.input} mode="outlined" activeOutlineColor="#4A2E1B" />
        <TextInput label="Description" value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} style={styles.input} mode="outlined" activeOutlineColor="#4A2E1B" multiline numberOfLines={3} />
        <View style={styles.row}>
          <TextInput label="Price ($)" value={formData.price} onChangeText={(text) => setFormData({ ...formData, price: text })} style={[styles.input, { flex: 1, marginRight: 8 }]} mode="outlined" keyboardType="numeric" activeOutlineColor="#4A2E1B" left={<TextInput.Affix text="$" />} />
          <TextInput label="Stock Qty" value={formData.countInStock} onChangeText={(text) => setFormData({ ...formData, countInStock: text })} style={[styles.input, { flex: 1, marginLeft: 8 }]} mode="outlined" keyboardType="numeric" activeOutlineColor="#4A2E1B" />
        </View>
        <View style={styles.modalActions}>
          <Button mode="text" onPress={onClose} textColor="#666" style={{ flex: 1 }}>Cancel</Button>
          <Button mode="contained" onPress={handleSave} style={styles.saveButton} buttonColor="#4A2E1B">{product ? 'Update' : 'Save'}</Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { backgroundColor: 'white', padding: 25, margin: 20, borderRadius: 20, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 20, color: '#4A2E1B', textAlign: 'center' },
  input: { marginBottom: 12, backgroundColor: '#FFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  modalActions: { flexDirection: 'row', marginTop: 20, gap: 10 },
  saveButton: { flex: 1, borderRadius: 8, paddingVertical: 4 }
});