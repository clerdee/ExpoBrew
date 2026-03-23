import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

import { API_BASE_URL } from '../../configs/config';
import { syncPushTokenToBackend } from '../../utils/notifications';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please enter your email and password.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Toast.show({ type: 'error', text1: 'Login failed', text2: data.message || 'Please try again.' });
        return;
      }

      await Promise.all([
        SecureStore.setItemAsync('userToken', data.token),
        SecureStore.setItemAsync('userInfo', JSON.stringify(data.user)),
      ]);

      try {
        const pushSync = await syncPushTokenToBackend(data.token);
        if (!pushSync.saved && pushSync.error) {
          console.log('Push token sync skipped after login:', pushSync.error);
        }
      } catch (pushError) {
        console.log('Push token sync failed after login:', pushError.message);
      }

      Toast.show({ type: 'success', text1: 'Welcome back!', text2: 'Login successful.' });
      navigation.reset({ index: 0, routes: [{ name: data.user.role === 'admin' ? 'AdminHome' : 'Home' }] });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Connection error', text2: 'Could not connect to server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} iconColor="#4A3B32" onPress={() => navigation.goBack()} style={styles.backBtn} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="coffee" size={60} color="#6F4E37" />
        </View>
        <Text variant="displaySmall" style={styles.title}>Welcome Back</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Log in to continue your ExpoBrew journey.</Text>

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

        <Button
          mode="contained"
          buttonColor="#6F4E37"
          contentStyle={styles.loginBtnContent}
          labelStyle={styles.loginBtnLabel}
          style={styles.loginBtn}
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Register')}>
            <Text style={styles.registerText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0' },
  header: { paddingTop: 50, paddingHorizontal: 10, marginBottom: 10 },
  backBtn: { margin: 0 },
  content: { flex: 1, paddingHorizontal: 25, justifyContent: 'center', paddingBottom: 50 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontWeight: 'bold', color: '#4A3B32', marginBottom: 5, textAlign: 'center' },
  subtitle: { color: '#666', marginBottom: 35, textAlign: 'center' },
  input: { backgroundColor: '#fff', marginBottom: 15 },
  loginBtn: { borderRadius: 12, marginBottom: 30 },
  loginBtnContent: { height: 55 },
  loginBtnLabel: { fontSize: 16, fontWeight: 'bold' },
  footerRow: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#666' },
  registerText: { color: '#6F4E37', fontWeight: 'bold' },
});

export default LoginPage;
