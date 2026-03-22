import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import HomePage from "../screens/Customer/HomePage";
import OrderPage from "../screens/Customer/OrderPage";
import StoresPage from "../screens/Customer/StoresPage";
import FavoritesPage from "../screens/Customer/FavoritesPage";
import ProfilePage from "../Shared/ProfilePage";
import NotificationPage from "../screens/Customer/NotificationPage"; 
import PromoList from "../screens/Customer/PromoList"; 
import PromoDetail from "../screens/Customer/PromoDetail";
import PlaceOrderPage from "../screens/Customer/PlaceOrderPage";
import OrderDetailPage from "../screens/Customer/OrderDetailPage";
import ProductDetailModal from "../components/ProductDetailModal";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#6F4E37",
      tabBarInactiveTintColor: "gray",
      tabBarStyle: { paddingBottom: 5, height: 60 },
      tabBarIcon: ({ color, size }) => {
        const icons = { Home: 'home', Orders: 'coffee', Stores: 'store', Favorites: 'heart', Profile: 'account' };
        return <MaterialCommunityIcons name={icons[route.name]} size={size} color={color} />;
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

export default function UserStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={TabNavigator} />
      
      <Stack.Screen name="Notifications" component={NotificationPage} />
      <Stack.Screen name="PromoList" component={PromoList} />
      <Stack.Screen name="PromoDetail" component={PromoDetail} />
      <Stack.Screen name="PlaceOrder" component={PlaceOrderPage} />
      <Stack.Screen name="OrderDetail" component={OrderDetailPage} />
      <Stack.Screen name="ProductDetail" component={ProductDetailModal} />
    </Stack.Navigator>
  );
}