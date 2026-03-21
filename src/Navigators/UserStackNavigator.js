import { View, Text } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HomePage from "../screens/Customer/HomePage";
import OrderPage from "../screens/Customer/OrderPage";
import StoresPage from "../screens/Customer/StoresPage";
import FavoritesPage from "../screens/Customer/FavoritesPage";
import ProfilePage from "../Shared/ProfilePage";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function UserStackNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#6F4E37",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Orders") iconName = "coffee";
          else if (route.name === "Stores") iconName = "store";
          else if (route.name === "Favorites") iconName = "heart";
          else if (route.name === "Profile") iconName = "account";

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Orders" component={OrderPage} />
      <Tab.Screen name="Stores" component={StoresPage} />
      <Tab.Screen name="Favorites" component={FavoritesPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
}
