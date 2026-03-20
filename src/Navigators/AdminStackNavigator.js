import React from "react";
import { View, Alert } from "react-native";
import { 
  createDrawerNavigator, 
  DrawerContentScrollView, 
  DrawerItemList, 
  DrawerItem 
} from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';

import Dashboard from "../screens/Admin/Dashboard";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive", 
        onPress: async () => {
          try {
            await SecureStore.deleteItemAsync('userToken');
            await SecureStore.deleteItemAsync('userInfo');
            
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          } catch (error) {
            console.error("Error logging out: ", error);
          }
        }
      }
    ]);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}>
      {/* Top section: Renders all the Drawer.Screen items automatically */}
      <View>
        <DrawerItemList {...props} />
      </View>

      {/* Bottom section: Custom Log Out Button */}
      <View style={{ paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
        <DrawerItem
          label="Log Out"
          icon={({ color }) => <MaterialCommunityIcons name="logout" size={24} color="#D32F2F" />}
          labelStyle={{ color: '#D32F2F', fontSize: 16, fontWeight: "bold" }}
          onPress={handleLogout}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function AdminStackNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard" 
      drawerContent={(props) => <CustomDrawerContent {...props} />} 
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: "#4A2E1B",
        drawerActiveTintColor: "#FFF",
        drawerInactiveTintColor: "#333",
        drawerLabelStyle: { fontSize: 16, fontWeight: "bold" },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={24} color={color} />
          ),
        }}
      />
  
      <Drawer.Screen
        name="Products"
        component={Dashboard} 
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="coffee-outline" size={24} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="Users"
        component={Dashboard} 
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group-outline" size={24} color={color} />
          ),
        }}
      />
      
      <Drawer.Screen
        name="Orders"
        component={Dashboard} 
        options={{
          drawerIcon: ({ color }) => (
            <MaterialCommunityIcons name="clipboard-list-outline" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}