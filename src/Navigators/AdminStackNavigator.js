import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Dashboard from "../screens/Admin/Dashboard";

const Drawer = createDrawerNavigator();

export default function AdminStackNavigator() {
  return (
    <Drawer.Navigator
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