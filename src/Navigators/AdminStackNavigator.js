import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';

import Dashboard from "../screens/Admin/Dashboard";
import Products from "../screens/Admin/Products";
import Users from '../screens/Admin/Users';
import Orders from '../screens/Admin/Orders';
import Promos from '../screens/Admin/Promos';
import OrderDetail from '../components/admin/OrderDetail';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const [adminInfo, setAdminInfo] = useState({ name: 'Loading...', email: '' });

  useEffect(() => {
    (async () => {
      try {
        const uInfo = await SecureStore.getItemAsync('userInfo');
        if (uInfo) {
          const u = JSON.parse(uInfo);
          setAdminInfo({ name: u.name || 'Admin User', email: u.email || 'admin@expobrew.com' });
        }
      } catch (e) { console.error("Admin fetch error:", e); }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userInfo');
      Toast.show({ type: 'success', text1: 'Logged Out', text2: 'You have been securely logged out.' });
      props.navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    } catch (e) { Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to log out.' }); }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        <View style={styles.head}>
          <View style={styles.avatar}><MaterialCommunityIcons name="account-tie" size={45} color="#4A2E1B" /></View>
          <Text style={styles.aName}>{adminInfo.name}</Text>
          <Text style={styles.aEmail}>{adminInfo.email}</Text>
          <View style={styles.badge}><Text style={styles.bTxt}>Administrator</Text></View>
        </View>
        <View style={styles.items}><DrawerItemList {...props} /></View>
      </DrawerContentScrollView>
      <View style={styles.foot}>
        <DrawerItem label="Switch to Customer" icon={({color}) => <MaterialCommunityIcons name="swap-horizontal" size={24} color="#6F4E37" />} labelStyle={{color: '#6F4E37', fontWeight: '600'}} onPress={() => props.navigation.navigate('User')} />
        <DrawerItem label="Log Out" icon={({color}) => <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" />} labelStyle={styles.logout} onPress={handleLogout} />
      </View>
    </View>
  );
}

export default function AdminStackNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Dashboard" drawerContent={(p) => <CustomDrawerContent {...p} />} screenOptions={{ headerShown: false, drawerStyle: { backgroundColor: '#FAFAFA', width: 280 }, drawerActiveBackgroundColor: "#4A2E1B", drawerActiveTintColor: "#FFF", drawerInactiveTintColor: "#555", drawerLabelStyle: { fontSize: 15, fontWeight: "600", marginLeft: -10 }, drawerItemStyle: { borderRadius: 12, paddingHorizontal: 5, marginVertical: 4 } }}>
      <Drawer.Screen name="Dashboard" component={Dashboard} options={{ drawerIcon: ({color}) => <MaterialCommunityIcons name="view-dashboard" size={22} color={color} /> }} />
      <Drawer.Screen name="Products" component={Products} options={{ drawerIcon: ({color}) => <MaterialCommunityIcons name="coffee" size={22} color={color} /> }} />
      <Drawer.Screen name="Users" component={Users} options={{ drawerIcon: ({color}) => <MaterialCommunityIcons name="account-group" size={22} color={color} /> }} />
      <Drawer.Screen name="Orders" component={Orders} options={{ drawerIcon: ({color}) => <MaterialCommunityIcons name="clipboard-list" size={22} color={color} /> }} />
      <Drawer.Screen name="Promos" component={Promos} options={{ drawerIcon: ({color}) => <MaterialCommunityIcons name="ticket-percent" size={22} color={color} /> }} />
      <Drawer.Screen name="Settings" component={Dashboard} options={{ drawerIcon: ({color}) => <MaterialCommunityIcons name="cog" size={22} color={color} /> }} />

      <Drawer.Screen name="OrderDetail" component={OrderDetail} options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  head: { backgroundColor: '#4A2E1B', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomRightRadius: 30, marginBottom: 15 },
  avatar: { width: 70, height: 70, backgroundColor: '#FFF', borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 5 },
  aName: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 2 }, aEmail: { color: '#D3C4B7', fontSize: 14, marginBottom: 12 },
  badge: { backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15, alignSelf: 'flex-start' },
  bTxt: { color: '#FFF', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 }, items: { paddingHorizontal: 10 },
  foot: { paddingBottom: 30, paddingTop: 10, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#FAFAFA' },
  logout: { color: '#D32F2F', fontSize: 16, fontWeight: "600", marginLeft: -15 }
});