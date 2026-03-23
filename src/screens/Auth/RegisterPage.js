import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput, Button, IconButton, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../configs/config';

const RegisterPage = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmSecure, setIsConfirmSecure] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Toast.show({ type: 'error', text1: 'Permission Required', text2: 'Allow photo access.' });
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Toast.show({ type: 'error', text1: 'Permission Required', text2: 'Allow camera access.' });
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const showImageOptions = () => {
    Alert.alert('Profile Picture', 'Choose an option to set your profile picture', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) return Toast.show({ type: 'error', text1: 'Wait!', text2: 'Fill in all fields.' });
    if (password !== confirmPassword) return Toast.show({ type: 'error', text1: 'Oops!', text2: 'Passwords do not match.' });

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);

      if (profileImage) {
        const filename = profileImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        formData.append('profileImage', { uri: profileImage, name: filename, type: match ? `image/${match[1]}` : 'image' });
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) return Toast.show({ type: 'error', text1: 'Failed', text2: data.message || 'Registration failed.' });

      Toast.show({ type: 'success', text1: 'Account Created', text2: 'You can now log in.' });
      navigation.replace('Login');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not connect to server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} iconColor="#4A3B32" onPress={() => navigation.goBack()} style={styles.backBtn} />
        </View>

        <View style={styles.content}>
          <Text variant="displaySmall" style={styles.title}>Join Brew</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Create an account to start earning coffee rewards today.</Text>

          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={showImageOptions} activeOpacity={0.8}>
              {profileImage ? (
                <Avatar.Image size={100} source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={40} color="#888" />
                  <Text style={styles.avatarText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.editBadge}><MaterialCommunityIcons name="pencil" size={16} color="#fff" /></View>
            </TouchableOpacity>
          </View>

          <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" left={<TextInput.Icon icon="account-outline" color="#888" />} />
          <TextInput label="Email Address" value={email} onChangeText={setEmail} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email-outline" color="#888" />} />
          <TextInput label="Password" value={password} onChangeText={setPassword} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" secureTextEntry={isPasswordSecure} left={<TextInput.Icon icon="lock-outline" color="#888" />} right={<TextInput.Icon icon={isPasswordSecure ? 'eye-off' : 'eye'} color="#888" onPress={() => setIsPasswordSecure(!isPasswordSecure)} />} />
          <TextInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" secureTextEntry={isConfirmSecure} left={<TextInput.Icon icon="lock-check-outline" color="#888" />} right={<TextInput.Icon icon={isConfirmSecure ? 'eye-off' : 'eye'} color="#888" onPress={() => setIsConfirmSecure(!isConfirmSecure)} />} />

          <Button mode="contained" buttonColor="#6F4E37" style={styles.registerBtn} contentStyle={styles.registerBtnContent} labelStyle={styles.registerBtnLabel} onPress={handleRegister} loading={isLoading} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0' },
  scrollContent: { flexGrow: 1, paddingTop: 50, paddingBottom: 20 },
  header: { paddingHorizontal: 10, marginBottom: 5 },
  backBtn: { margin: 0 },
  content: { flex: 1, paddingHorizontal: 25 },
  title: { fontWeight: 'bold', color: '#4A3B32', marginBottom: 5 },
  subtitle: { color: '#666', marginBottom: 25 },
  avatarContainer: { alignItems: 'center', marginBottom: 25 },
  avatarImage: { backgroundColor: '#EBE1D7' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F2E8DD', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E0D2C2' },
  avatarText: { marginTop: 6, color: '#666', fontSize: 12 },
  editBadge: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#6F4E37', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FAF5F0' },
  input: { backgroundColor: '#fff', marginBottom: 15 },
  registerBtn: { borderRadius: 12, marginTop: 10, marginBottom: 30 },
  registerBtnContent: { height: 55 },
  registerBtnLabel: { fontSize: 16, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#666' },
  loginText: { color: '#6F4E37', fontWeight: 'bold' },
});

export default RegisterPage;