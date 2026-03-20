import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';
import { Portal, Modal, Text, TextInput, Button, Menu } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

const CATEGORIES = ['Brewed', 'Espresso', 'Frappuccino', 'Refreshers', 'Non-Coffee', 'Tea'];

export default function AddProduct({ visible, onClose, product, onSuccess }) {
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: CATEGORIES[0] });
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropDown, setShowDropDown] = useState(false); // Controls the new dropdown menu

  useEffect(() => {
    if (product) { setFormData({ name: product.name, description: product.description, price: product.price.toString(), category: product.category || CATEGORIES[0] }); setImageUri(product.imageUrl || product.image || null); } 
    else { setFormData({ name: '', description: '', price: '', category: CATEGORIES[0] }); setImageUri(null); setShowDropDown(false); }
  }, [product, visible]);

  const pickImage = async (useCamera = false) => {
    const permissionResult = useCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) return Toast.show({ type: 'error', text1: 'Permission required' });
    const result = useCamera ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return Toast.show({ type: 'error', text1: 'Name and Price required' });
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const data = new FormData();
      data.append('name', formData.name); data.append('description', formData.description); data.append('price', formData.price); data.append('category', formData.category);
      if (imageUri && !imageUri.startsWith('http')) {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        data.append('image', { uri: imageUri, name: filename, type: match ? `image/${match[1]}` : `image` });
      }
      const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } };
      if (product) { await axios.put(`${API_BASE_URL}/products/${product._id}`, data, config); Toast.show({ type: 'success', text1: 'Coffee updated' }); } 
      else { await axios.post(`${API_BASE_URL}/products`, data, config); Toast.show({ type: 'success', text1: 'Coffee created' }); }
      onSuccess(); onClose();
    } catch (error) { console.error("Save error:", error); Toast.show({ type: 'error', text1: 'Failed to save coffee' }); } 
    finally { setLoading(false); }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalWrapper}>
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" enableOnAndroid={true} extraScrollHeight={20} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.modalTitle}>{product ? 'Edit Coffee' : 'Add New Coffee'}</Text>
          
          <View style={styles.imageSection}>
            <Image source={{ uri: imageUri || 'https://via.placeholder.com/150?text=No+Image' }} style={styles.previewImage} />
            <View style={styles.imageButtons}>
              <Button icon="camera" mode="outlined" onPress={() => pickImage(true)} style={styles.imgBtn} textColor="#4A2E1B">Camera</Button>
              <Button icon="image" mode="outlined" onPress={() => pickImage(false)} style={styles.imgBtn} textColor="#4A2E1B">Gallery</Button>
            </View>
          </View>

          <TextInput label="Coffee Name" value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} style={styles.input} mode="outlined" activeOutlineColor="#4A2E1B" />
          <TextInput label="Description" value={formData.description} onChangeText={(text) => setFormData({ ...formData, description: text })} style={styles.input} mode="outlined" activeOutlineColor="#4A2E1B" multiline numberOfLines={2} />
          
          <View style={styles.row}>
            <TextInput label="Price (₱)" value={formData.price} onChangeText={(text) => setFormData({ ...formData, price: text })} style={[styles.input, { flex: 1, marginRight: 8 }]} mode="outlined" keyboardType="numeric" activeOutlineColor="#4A2E1B" left={<TextInput.Affix text="₱" />} />
            
            {/* New True Dropdown Menu */}
            <View style={{ flex: 1.2, marginLeft: 8 }}>
              <Menu visible={showDropDown} onDismiss={() => setShowDropDown(false)} anchor={
                <TouchableOpacity onPress={() => setShowDropDown(true)}>
                  <View pointerEvents="none">
                    <TextInput label="Category" value={formData.category} style={styles.input} mode="outlined" activeOutlineColor="#4A2E1B" right={<TextInput.Icon icon="menu-down" />} editable={false} />
                  </View>
                </TouchableOpacity>
              }>
                {CATEGORIES.map(cat => (
                  <Menu.Item key={cat} onPress={() => { setFormData({ ...formData, category: cat }); setShowDropDown(false); }} title={cat} titleStyle={{ color: formData.category === cat ? '#4A2E1B' : '#333', fontWeight: formData.category === cat ? 'bold' : 'normal' }} />
                ))}
              </Menu>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Button mode="text" onPress={onClose} textColor="#666" style={{ flex: 1 }} disabled={loading}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} style={styles.saveButton} buttonColor="#4A2E1B" loading={loading} disabled={loading}>{product ? 'Update' : 'Save'}</Button>
          </View>
        </KeyboardAwareScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: { backgroundColor: 'white', margin: 20, borderRadius: 20, elevation: 5, maxHeight: '90%' },
  scrollContent: { padding: 25, flexGrow: 1 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 15, color: '#4A2E1B', textAlign: 'center' },
  imageSection: { alignItems: 'center', marginBottom: 15 },
  previewImage: { width: 120, height: 120, borderRadius: 15, backgroundColor: '#E0E0E0', marginBottom: 10 },
  imageButtons: { flexDirection: 'row', gap: 10 },
  imgBtn: { borderColor: '#4A2E1B', flex: 1 },
  input: { marginBottom: 12, backgroundColor: '#FFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modalActions: { flexDirection: 'row', marginTop: 10, gap: 10 },
  saveButton: { flex: 1, borderRadius: 8, paddingVertical: 4 }
});