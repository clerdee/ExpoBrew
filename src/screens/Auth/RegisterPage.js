import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
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

  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: 'error', text1: 'Permission Required', text2: 'Allow photo access.' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: 'error', text1: 'Permission Required', text2: 'Allow camera access.' });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert('Profile Picture', 'Choose an option to set your profile picture', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };


  const handleSocialLoginPress = async (provider) => {
    Toast.show({
      type: 'info',
      text1: `${provider} login needs provider setup`,
      text2: 'Use email/password for grading unless OAuth client keys are added.',
    });

    try {
      await Linking.openURL('https://developers.google.com/identity');
    } catch (error) {
      console.log(`${provider} setup link error:`, error.message);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Wait!', text2: 'Fill in all fields.' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Oops!', text2: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Toast.show({ type: 'error', text1: 'Failed', text2: data.message || 'Registration failed.' });
        return;
      }

      if (data.requiresOtp) {
        Toast.show({ type: 'success', text1: 'Code Sent!', text2: 'Check your email.' });
        setIsOtpModalVisible(true);
        setResendTimer(30);
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Account Created',
        text2: data.message || 'You can now log in.',
      });
      navigation.replace('Login');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not connect to server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      Toast.show({ type: 'error', text1: 'Invalid Code', text2: 'Enter the 6-digit code.' });
      return;
    }

    setIsVerifying(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otp', otpCode);

      if (profileImage) {
        const filename = profileImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        formData.append('profileImage', {
          uri: profileImage,
          name: filename,
          type: match ? `image/${match[1]}` : 'image',
        });
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        Toast.show({ type: 'error', text1: 'Failed', text2: data.message || 'OTP verification failed.' });
        return;
      }

      setIsOtpModalVisible(false);
      Toast.show({ type: 'success', text1: 'Welcome to Brew!', text2: 'Account verified.' });
      navigation.replace('Login');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Server connection failed.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsResending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        Toast.show({ type: 'error', text1: 'Failed', text2: data.message || 'Could not resend OTP.' });
        return;
      }

      if (!data.requiresOtp) {
        Toast.show({ type: 'success', text1: 'Account Created', text2: data.message || 'You can now log in.' });
        setIsOtpModalVisible(false);
        navigation.replace('Login');
        return;
      }

      Toast.show({ type: 'success', text1: 'Sent!', text2: 'Check your email again.' });
      setOtpCode('');
      setResendTimer(30);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Server connection failed.' });
    } finally {
      setIsResending(false);
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
              <View style={styles.editBadge}>
                <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor="#EBE1D7"
            activeOutlineColor="#6F4E37"
            left={<TextInput.Icon icon="account-outline" color="#888" />}
          />
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            outlineColor="#EBE1D7"
            activeOutlineColor="#6F4E37"
            keyboardType="email-address"
            autoCapitalize="none"
            left={<TextInput.Icon icon="email-outline" color="#888" />}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            outlineColor="#EBE1D7"
            activeOutlineColor="#6F4E37"
            secureTextEntry={isPasswordSecure}
            left={<TextInput.Icon icon="lock-outline" color="#888" />}
            right={<TextInput.Icon icon={isPasswordSecure ? 'eye-off' : 'eye'} color="#888" onPress={() => setIsPasswordSecure(!isPasswordSecure)} />}
          />
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            style={styles.input}
            outlineColor="#EBE1D7"
            activeOutlineColor="#6F4E37"
            secureTextEntry={isConfirmSecure}
            left={<TextInput.Icon icon="lock-check-outline" color="#888" />}
            right={<TextInput.Icon icon={isConfirmSecure ? 'eye-off' : 'eye'} color="#888" onPress={() => setIsConfirmSecure(!isConfirmSecure)} />}
          />

          <Button
            mode="contained"
            buttonColor="#6F4E37"
            style={styles.registerBtn}
            contentStyle={styles.registerBtnContent}
            labelStyle={styles.registerBtnLabel}
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8} onPress={() => handleSocialLoginPress('Google')}>
              <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8} onPress={() => handleSocialLoginPress('Facebook')}>
              <MaterialCommunityIcons name="facebook" size={24} color="#4267B2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent visible={isOtpModalVisible}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalFloating}>
              <IconButton icon="close" size={24} style={styles.closeModalBtn} onPress={() => setIsOtpModalVisible(false)} />

              <View style={styles.modalIconCircle}>
                <MaterialCommunityIcons name="email-check-outline" size={40} color="#6F4E37" />
              </View>

              <Text variant="titleLarge" style={styles.modalTitle}>Check your Email</Text>
              <Text variant="bodyMedium" style={styles.modalSubtitle}>
                We sent a 6-digit code to{`\n`}
                <Text style={{ fontWeight: 'bold', color: '#4A3B32' }}>{email}</Text>
              </Text>

              <TextInput
                mode="outlined"
                label="6-Digit Code"
                value={otpCode}
                onChangeText={setOtpCode}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.otpInput}
                outlineColor="#EBE1D7"
                activeOutlineColor="#6F4E37"
              />

              <Button
                mode="contained"
                buttonColor="#6F4E37"
                style={styles.verifyBtn}
                contentStyle={{ height: 50 }}
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                onPress={handleVerifyOtp}
                loading={isVerifying}
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify & Create Account'}
              </Button>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={resendTimer > 0 || isResending}>
                  <Text style={[styles.resendLink, (resendTimer > 0 || isResending) && styles.resendLinkDisabled]}>
                    {isResending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2E8DD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0D2C2',
  },
  avatarText: { marginTop: 6, color: '#666', fontSize: 12 },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#6F4E37',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAF5F0',
  },
  input: { backgroundColor: '#fff', marginBottom: 15 },
  registerBtn: { borderRadius: 12, marginTop: 10 },
  registerBtnContent: { height: 55 },
  registerBtnLabel: { fontSize: 16, fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: '#E0D2C2' },
  orText: { marginHorizontal: 15, color: '#888', fontWeight: '600' },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  socialBtn: {
    flex: 0.48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0D2C2',
  },
  socialText: { fontWeight: 'bold', color: '#333', marginLeft: 10 },
  footerRow: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#666' },
  loginText: { color: '#6F4E37', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  modalFloating: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 25,
    alignItems: 'center',
  },
  closeModalBtn: { position: 'absolute', top: 8, right: 8 },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2E8DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  modalTitle: { fontWeight: 'bold', color: '#4A3B32', marginBottom: 8 },
  modalSubtitle: { color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  otpInput: { width: '100%', backgroundColor: '#fff', marginBottom: 20 },
  verifyBtn: { width: '100%', borderRadius: 12 },
  resendContainer: { flexDirection: 'row', marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' },
  resendText: { color: '#666' },
  resendLink: { color: '#6F4E37', fontWeight: 'bold' },
  resendLinkDisabled: { color: '#AAA' },
});

export default RegisterPage;
