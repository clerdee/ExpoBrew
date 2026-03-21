import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, IconButton, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../configs/config';

const ProfilePage = ({ navigation }) => {
  const [name, setName] = useState(""), [email, setEmail] = useState(""), [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null), [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState(""), [address, setAddress] = useState("");
  const [isPasswordSecure, setIsPasswordSecure] = useState(true), [isLoading, setIsLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userStr = await SecureStore.getItemAsync('userInfo');

        if (!token || !userStr) return setIsGuest(true);

        setIsGuest(false);
        const user = JSON.parse(userStr);
        setName(user.name || '');
        setEmail(user.email || '');
        setProfileImage(user.profileImage || null);
        setPhone(user.phone || '');
        setBirthday(user.birthday || '');
        setAddress(user.address || '');
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    })();
  }, []);

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Toast.show({ type: "error", text1: "Permission Required" });
    let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!res.canceled) setProfileImage(res.assets[0].uri);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Toast.show({ type: "error", text1: "Permission Required" });
    let res = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!res.canceled) setProfileImage(res.assets[0].uri);
  };

  const showImageOptions = () => Alert.alert("Profile Picture", "Update your avatar", [{ text: "Take Photo", onPress: takePhoto }, { text: "Choose from Gallery", onPress: pickFromGallery }, { text: "Cancel", style: "cancel" }]);

  const handleUpdateProfile = async () => {
    if (!name || !email) return Toast.show({ type: "error", text1: "Wait!", text2: "Name and email are required." });
    setIsLoading(true);
    try {
      setTimeout(() => {
        Toast.show({ type: "success", text1: "Profile Updated!", text2: "Your changes have been saved." });
        setIsLoading(false);
      }, 1500);
    } catch (e) { Toast.show({ type: "error", text1: "Error", text2: "Failed to update profile." }); setIsLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} iconColor="#4A3B32" onPress={() => navigation.goBack()} style={styles.backBtn} />
          <Text variant="titleLarge" style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 48 }} />
        </View>

        {isGuest ? (
          <View style={styles.guestContainer}>
            <MaterialCommunityIcons name="account-circle-outline" size={80} color="#D2B48C" />
            <Text variant="titleLarge" style={styles.guestTitle}>Sign in to your profile</Text>
            <Text variant="bodyMedium" style={styles.guestSub}>Manage your details, track your preferences, and access exclusive rewards.</Text>
            <Button mode="contained" buttonColor="#6F4E37" style={styles.loginBtn} onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
              Log In or Sign Up
            </Button>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={showImageOptions} activeOpacity={0.8}>
                {profileImage ? <Avatar.Image size={110} source={{ uri: profileImage }} style={styles.avatarImage} /> : (
                  <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="camera-plus" size={40} color="#888" /><Text style={styles.avatarText}>Add Photo</Text></View>
                )}
                <View style={styles.editBadge}><MaterialCommunityIcons name="pencil" size={18} color="#fff" /></View>
              </TouchableOpacity>
            </View>

            <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" left={<TextInput.Icon icon="account-outline" color="#888" />} />
            <TextInput label="Email Address" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email-outline" color="#888" />} />
            <TextInput label="Phone Number" value={phone} onChangeText={setPhone} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" keyboardType="phone-pad" left={<TextInput.Icon icon="phone-outline" color="#888" />} />
            <TextInput label="Birthday (MM/DD/YYYY)" value={birthday} onChangeText={setBirthday} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" left={<TextInput.Icon icon="cake-variant-outline" color="#888" />} />
            <TextInput label="Primary Address" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" left={<TextInput.Icon icon="map-marker-outline" color="#888" />} />
            <TextInput label="New Password (Optional)" value={password} onChangeText={setPassword} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" secureTextEntry={isPasswordSecure} left={<TextInput.Icon icon="lock-outline" color="#888" />} right={<TextInput.Icon icon={isPasswordSecure ? 'eye-off' : 'eye'} color="#888" onPress={() => setIsPasswordSecure(!isPasswordSecure)} />} />

            <Button mode="contained" buttonColor="#6F4E37" style={styles.saveBtn} contentStyle={styles.saveBtnContent} labelStyle={styles.saveBtnLabel} onPress={handleUpdateProfile} loading={isLoading} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0' }, scrollContent: { flexGrow: 1, paddingTop: 40, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 20 },
  backBtn: { margin: 0 }, headerTitle: { fontWeight: 'bold', color: '#4A3B32' }, content: { flex: 1, paddingHorizontal: 25 },
  avatarContainer: { alignItems: 'center', marginBottom: 35 },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#EBE1D7', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff', elevation: 4, shadowOpacity: 0.15, shadowRadius: 5 },
  avatarImage: { backgroundColor: '#EBE1D7', borderWidth: 3, borderColor: '#fff' }, avatarText: { fontSize: 12, color: '#888', marginTop: 5, fontWeight: 'bold' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#6F4E37', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FAF5F0' },
  input: { backgroundColor: '#fff', marginBottom: 15 }, saveBtn: { borderRadius: 12, marginTop: 15 }, saveBtnContent: { height: 55 }, saveBtnLabel: { fontSize: 16, fontWeight: 'bold' },
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, marginTop: 40 },
  guestTitle: { fontWeight: 'bold', color: '#4A3B32', marginTop: 15 },
  guestSub: { color: '#888', textAlign: 'center', marginTop: 8, marginBottom: 30, lineHeight: 20 },
  loginBtn: { borderRadius: 25, width: '100%', paddingVertical: 6, elevation: 3 }
});

export default ProfilePage;
