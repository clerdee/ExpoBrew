import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Avatar, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { API_BASE_URL } from '../configs/config';

export default function ProfilePage({ navigation }) {
  const [activeTab, setActiveTab] = useState('details');
  const [name, setName] = useState(""), [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""), [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null), [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState(""), [addresses, setAddresses] = useState([""]);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true), [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false), [orig, setOrig] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken'), userStr = await SecureStore.getItemAsync('userInfo');
        if (!token || !userStr) return setIsGuest(true);
        setIsGuest(false);
        const u = JSON.parse(userStr);
        const init = { name: u.name||'', email: u.email||'', profileImage: u.profileImage||null, phone: u.phone||'', birthday: u.birthday||'', addresses: u.addresses?.length ? u.addresses : [''] };
        setOrig(init); setName(init.name); setEmail(init.email); setProfileImage(init.profileImage);
        setPhone(init.phone); setBirthday(init.birthday); setAddresses([...init.addresses]);
      } catch (e) { console.error('Error loading profile:', e); }
    })();
  }, []);

  const hasChanges = name !== orig.name || email !== orig.email || profileImage !== orig.profileImage || phone !== orig.phone || birthday !== orig.birthday || JSON.stringify(addresses) !== JSON.stringify(orig.addresses) || currentPassword !== "" || newPassword !== "";

  const handleCancel = () => {
    setName(orig.name); setEmail(orig.email); setProfileImage(orig.profileImage); setPhone(orig.phone);
    setBirthday(orig.birthday); setAddresses([...orig.addresses]); setCurrentPassword(""); setNewPassword("");
  };

  const handleUpdateProfile = async () => {
    if (!name || !email) return Toast.show({ type: "error", text1: "Wait!", text2: "Name and email are required." });
    if (newPassword && !currentPassword) return Toast.show({ type: "error", text1: "Wait!", text2: "Enter current password to set a new one." });
    
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('birthday', birthday);
      formData.append('addresses', JSON.stringify(addresses.filter(a => a.trim() !== '')));
      
      if (newPassword) {
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }

      if (profileImage && profileImage !== orig.profileImage) {
        const filename = profileImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('profileImage', { uri: profileImage, name: filename, type });
      }

      const res = await axios.put(`${API_BASE_URL}/users/profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });

      await SecureStore.setItemAsync('userInfo', JSON.stringify(res.data));
      setOrig({ name, email, profileImage: res.data.profileImage || profileImage, phone, birthday, addresses: res.data.addresses?.length ? res.data.addresses : [''] });
      setCurrentPassword(""); setNewPassword("");
      Toast.show({ type: "success", text1: "Profile Updated!", text2: "Your changes have been saved." });
    } catch (e) { 
      Toast.show({ type: "error", text1: "Error", text2: e.response?.data?.message || "Failed to update profile." }); 
    } finally {
      setIsLoading(false);
    }
  };

  const pickImg = async (type) => {
    const perm = type === 'cam' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Toast.show({ type: "error", text1: "Permission Required" });
    let res = type === 'cam' ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!res.canceled) setProfileImage(res.assets[0].uri);
  };
  const showImgOpt = () => Alert.alert("Profile Picture", "Update your avatar", [{ text: "Take Photo", onPress: () => pickImg('cam') }, { text: "Gallery", onPress: () => pickImg('gal') }, { text: "Cancel", style: "cancel" }]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}><Text variant="titleLarge" style={styles.headerTitle}>My Profile</Text></View>

        {isGuest ? (
          <View style={styles.guestContainer}>
            <MaterialCommunityIcons name="account-circle-outline" size={80} color="#D2B48C" />
            <Text variant="titleLarge" style={styles.guestTitle}>Sign in to your profile</Text>
            <Text variant="bodyMedium" style={styles.guestSub}>Manage your details, track your preferences, and access exclusive rewards.</Text>
            <Button mode="contained" buttonColor="#6F4E37" style={styles.loginBtn} onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>Log In or Sign Up</Button>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.tabBar}>
              <TouchableOpacity style={[styles.tab, activeTab === 'details' && styles.activeTab]} onPress={() => setActiveTab('details')}><Text style={activeTab === 'details' ? styles.activeTabText : styles.tabText}>Account Details</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.tab, activeTab === 'info' && styles.activeTab]} onPress={() => setActiveTab('info')}><Text style={activeTab === 'info' ? styles.activeTabText : styles.tabText}>Account Info</Text></TouchableOpacity>
            </View>

            {activeTab === 'details' ? (
              <View>
                <View style={styles.avatarContainer}>
                  <TouchableOpacity onPress={showImgOpt} activeOpacity={0.8}>
                    {profileImage ? <Avatar.Image size={110} source={{ uri: profileImage }} style={styles.avatarImage} /> : <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="camera-plus" size={40} color="#888" /><Text style={styles.avatarText}>Add Photo</Text></View>}
                    <View style={styles.editBadge}><MaterialCommunityIcons name="pencil" size={18} color="#fff" /></View>
                  </TouchableOpacity>
                </View>
                <TextInput label="Full Name / Username" value={name} onChangeText={setName} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" left={<TextInput.Icon icon="account-outline" color="#888" />} />
                <TextInput label="Email Address" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email-outline" color="#888" />} />
                <View style={{flexDirection: 'row', gap: 10}}>
                  <TextInput label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} mode="outlined" style={[styles.input, {flex: 1}]} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" secureTextEntry={isPasswordSecure} left={<TextInput.Icon icon="lock-outline" color="#888" />} />
                  <TextInput label="New Password" value={newPassword} onChangeText={setNewPassword} mode="outlined" style={[styles.input, {flex: 1}]} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" secureTextEntry={isPasswordSecure} right={<TextInput.Icon icon={isPasswordSecure ? 'eye-off' : 'eye'} color="#888" onPress={() => setIsPasswordSecure(!isPasswordSecure)} />} />
                </View>
              </View>
            ) : (
              <View>
                <TextInput label="Phone Number" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" keyboardType="phone-pad" left={<TextInput.Icon icon="phone-outline" color="#888" />} />
                <TextInput label="Birthday (MM/DD/YYYY)" value={birthday} onChangeText={setBirthday} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" left={<TextInput.Icon icon="cake-variant-outline" color="#888" />} />
                
                {addresses.map((addr, index) => (
                  <View key={index} style={styles.addressRow}>
                    <TextInput label={`Address ${index + 1}`} value={addr} onChangeText={(txt) => { const a = [...addresses]; a[index] = txt; setAddresses(a); }} mode="outlined" style={[styles.input, {flex: 1, marginBottom: 0}]} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" left={<TextInput.Icon icon="map-marker-outline" color="#888" />} />
                    {index > 0 && <IconButton icon="trash-can-outline" iconColor="#D32F2F" size={24} onPress={() => setAddresses(addresses.filter((_, i) => i !== index))} style={{marginTop: 5}} />}
                  </View>
                ))}
                <Button mode="text" icon="plus" textColor="#6F4E37" onPress={() => setAddresses([...addresses, ""])} style={{alignSelf: 'flex-start', marginBottom: 15}}>Add Another Address</Button>
              </View>
            )}

            {hasChanges && (
              <View style={styles.actionRow}>
                <Button mode="outlined" textColor="#6F4E37" style={styles.cancelBtn} onPress={handleCancel} disabled={isLoading}>Cancel</Button>
                <Button mode="contained" buttonColor="#6F4E37" style={styles.saveBtn} onPress={handleUpdateProfile} loading={isLoading} disabled={isLoading}>Save Changes</Button>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0' }, scrollContent: { flexGrow: 1, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 }, headerTitle: { fontWeight: 'bold', color: '#4A3B32', fontSize: 22 },
  content: { flex: 1, paddingHorizontal: 25 },
  tabBar: { flexDirection: 'row', backgroundColor: '#EBE1D7', borderRadius: 25, padding: 4, marginBottom: 25 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20 },
  activeTab: { backgroundColor: '#6F4E37', elevation: 2 },
  tabText: { color: '#888', fontWeight: 'bold' }, activeTabText: { color: '#fff', fontWeight: 'bold' },
  avatarContainer: { alignItems: 'center', marginBottom: 25 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#EBE1D7', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  avatarImage: { backgroundColor: '#EBE1D7', borderWidth: 3, borderColor: '#fff' }, avatarText: { fontSize: 12, color: '#888', marginTop: 5, fontWeight: 'bold' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#6F4E37', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FAF5F0' },
  input: { backgroundColor: '#fff', marginBottom: 15 }, addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  cancelBtn: { flex: 1, borderColor: '#6F4E37', borderRadius: 10 }, saveBtn: { flex: 1, borderRadius: 10 },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, marginTop: 40 },
  guestTitle: { fontWeight: 'bold', color: '#4A3B32', marginTop: 15 }, guestSub: { color: '#888', textAlign: 'center', marginTop: 8, marginBottom: 30, lineHeight: 20 }, loginBtn: { borderRadius: 25, width: '100%', paddingVertical: 6 }
});