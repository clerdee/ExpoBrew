import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';
import { Text, TextInput, Button, IconButton, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 

import { BASE_URL } from '../configs/config';

const RegisterPage = ({ navigation }) => {
  // --- FORM STATES ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmSecure, setIsConfirmSecure] = useState(true);

  // --- 2. PROFILE IMAGE STATE ---
  const [profileImage, setProfileImage] = useState(null);

  // --- 3. IMAGE PICKER FUNCTIONS ---
  const pickFromGallery = async () => {
    // Request permission first
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow access to your photos to select an image.");
      return;
    }

    // Launch gallery
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pic
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission first
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Please allow camera access to take a photo.");
      return;
    }

    // Launch camera
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // --- 4. SHOW OPTIONS ALERT ---
  const showImageOptions = () => {
    Alert.alert(
      "Profile Picture",
      "Choose an option to set your profile picture",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickFromGallery },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Back Button */}
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} iconColor="#4A3B32" onPress={() => navigation.goBack()} style={styles.backBtn} />
        </View>

        <View style={styles.content}>
          <Text variant="displaySmall" style={styles.title}>Join Brew</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Create an account to start earning coffee rewards today.</Text>

          {/* --- 5. PROFILE PICTURE UPLOADER UI --- */}
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
              {/* Little Edit Badge */}
              <View style={styles.editBadge}>
                <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Form Inputs */}
          <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" left={<TextInput.Icon icon="account-outline" color="#888" />} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" style={styles.input} />
          <TextInput label="Email Address" value={email} onChangeText={setEmail} mode="outlined" keyboardType="email-address" autoCapitalize="none" left={<TextInput.Icon icon="email-outline" color="#888" />} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" style={styles.input} />
          
          <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry={isPasswordSecure} mode="outlined" left={<TextInput.Icon icon="lock-outline" color="#888" />} right={<TextInput.Icon icon={isPasswordSecure ? "eye-off" : "eye"} onPress={() => setIsPasswordSecure(!isPasswordSecure)} color="#888" />} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" style={styles.input} />
          <TextInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={isConfirmSecure} mode="outlined" left={<TextInput.Icon icon="lock-check-outline" color="#888" />} right={<TextInput.Icon icon={isConfirmSecure ? "eye-off" : "eye"} onPress={() => setIsConfirmSecure(!isConfirmSecure)} color="#888" />} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" style={styles.input} />

          {/* Register Button */}
          <Button mode="contained" buttonColor="#6F4E37" contentStyle={styles.registerBtnContent} labelStyle={styles.registerBtnLabel} style={styles.registerBtn} onPress={() => console.log('Registering user...')}>
            Create Account
          </Button>

          {/* Login Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
  
  // --- AVATAR STYLES ---
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EBE1D7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  avatarImage: {
    backgroundColor: '#EBE1D7',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontWeight: 'bold',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6F4E37',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAF5F0',
  },

  input: { backgroundColor: '#fff', marginBottom: 15 },
  registerBtn: { borderRadius: 12, marginTop: 15, marginBottom: 30 },
  registerBtnContent: { height: 55 },
  registerBtnLabel: { fontSize: 16, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', marginBottom: 10 },
  footerText: { color: '#666' },
  loginText: { color: '#6F4E37', fontWeight: 'bold' },
});

export default RegisterPage;