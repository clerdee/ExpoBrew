import React, { useCallback, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Card, IconButton, Text, TextInput } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

import { API_BASE_URL } from '../../configs/config';

export default function AdminProfile({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const token = await SecureStore.getItemAsync('userToken');
      const { data } = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(data);
      await SecureStore.setItemAsync('userInfo', JSON.stringify(data));
    } catch (error) {
      console.log('Admin profile fetch error:', error.response?.data || error.message);
      Toast.show({ type: 'error', text1: 'Profile Error', text2: 'Failed to load admin profile.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="menu" size={28} iconColor="#FFF" onPress={() => navigation.openDrawer()} style={{ marginLeft: -10 }} />
        <Text style={styles.headerTitle}>Admin Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProfile(true)} />}
      >
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.avatarWrap}>
              {profile?.profileImage ? (
                <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
              ) : (
                <Avatar.Icon size={110} icon="account-tie" style={styles.avatarFallback} />
              )}
            </View>

            <Text style={styles.readonlyLabel}>Read-only account details</Text>
            <TextInput label="Name" value={profile?.name || ''} mode="outlined" editable={false} style={styles.input} />
            <TextInput label="Email" value={profile?.email || ''} mode="outlined" editable={false} style={styles.input} />
            <TextInput label="Role" value={profile?.role || 'admin'} mode="outlined" editable={false} style={styles.input} />
            <TextInput label="Phone" value={profile?.phone || ''} mode="outlined" editable={false} style={styles.input} />
          </Card.Content>
        </Card>

        {!loading && !profile && <Text style={styles.empty}>No profile details available.</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { backgroundColor: '#4A2E1B', paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  content: { padding: 20, paddingBottom: 40 },
  card: { borderRadius: 18, backgroundColor: '#FFF' },
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatarImage: { width: 110, height: 110, borderRadius: 55 },
  avatarFallback: { backgroundColor: '#D9C2AD' },
  readonlyLabel: { textAlign: 'center', color: '#8B6B52', marginBottom: 15, fontWeight: '600' },
  input: { marginBottom: 12, backgroundColor: '#FFF' },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});
