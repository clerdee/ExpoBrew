import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

import Dashboard from "../screens/Admin/Dashboard";
import Products from "../screens/Admin/Products";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const [adminInfo, setAdminInfo] = useState({ name: 'Loading...', email: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfoString = await SecureStore.getItemAsync('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          setAdminInfo({ name: userInfo.name || 'Admin User', email: userInfo.email || 'admin@expobrew.com' });
        }
      } catch (error) { console.error("Error fetching admin details:", error); }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userInfo');
      
      Toast.show({ type: 'success', text1: 'Logged Out', text2: 'You have been successfully logged out.' });
      props.navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    } catch (error) { 
      console.error("Error logging out: ", error); 
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to log out.' });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.drawerHeader}>
          <View style={styles.profileImageContainer}><MaterialCommunityIcons name="account-tie" size={45} color="#4A2E1B" /></View>
          <Text style={styles.adminName}>{adminInfo.name}</Text>
          <Text style={styles.adminEmail}>{adminInfo.email}</Text>
          <View style={styles.badgeContainer}><Text style={styles.badgeText}>Administrator</Text></View>
        </View>
        <View style={styles.drawerItemsContainer}><DrawerItemList {...props} /></View>
      </DrawerContentScrollView>
      <View style={styles.bottomSection}>
        <DrawerItem label="Log Out" icon={({ color }) => <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" />} labelStyle={{ color: '#D32F2F', fontSize: 16, fontWeight: "600", marginLeft: -15 }} onPress={handleLogout} />
      </View>
    </View>
  );
}

export default function AdminStackNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Dashboard" drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{ headerShown: false, drawerStyle: { backgroundColor: '#FAFAFA', width: 280 }, drawerActiveBackgroundColor: "#4A2E1B", drawerActiveTintColor: "#FFF", drawerInactiveTintColor: "#555", drawerLabelStyle: { fontSize: 15, fontWeight: "600", marginLeft: -10 }, drawerItemStyle: { borderRadius: 12, paddingHorizontal: 5, marginVertical: 4 } }}>
      <Drawer.Screen name="Dashboard" component={Dashboard} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="view-dashboard" size={22} color={color} /> }} />
      <Drawer.Screen name="Products" component={Products} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="coffee" size={22} color={color} /> }} />
      <Drawer.Screen name="Users" component={Dashboard} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={22} color={color} /> }} />
      <Drawer.Screen name="Orders" component={Dashboard} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="clipboard-list" size={22} color={color} /> }} />
      <Drawer.Screen name="Settings" component={Dashboard} options={{ drawerIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={22} color={color} /> }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerHeader: { backgroundColor: '#4A2E1B', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomRightRadius: 30, marginBottom: 15 },
  profileImageContainer: { width: 70, height: 70, backgroundColor: '#FFF', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  adminName: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 2 },
  adminEmail: { color: '#D3C4B7', fontSize: 14, marginBottom: 12 },
  badgeContainer: { backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15, alignSelf: 'flex-start' },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  drawerItemsContainer: { paddingHorizontal: 10 },
  bottomSection: { paddingBottom: 30, paddingTop: 10, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#FAFAFA' }
});