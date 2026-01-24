import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper'; 
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import your screens
import LandingPage from './src/screens/LandingPage';
import LoginPage from './src/screens/LoginPage';
import HomePage from './src/screens/HomePage';
import OrderPage from './src/screens/OrderPage';
import StoresPage from './src/screens/StoresPage';
import FavoritesPage from './src/screens/FavoritesPage';
// import {FavoritesScreen } from './src/screens/PlaceholderScreens';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6F4E37',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { paddingBottom: 5, height: 60 },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Orders') iconName = 'coffee'; 
          else if (route.name === 'Stores') iconName = 'store';
          else if (route.name === 'Favorites') iconName = 'heart';

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Orders" component={OrderPage} />
      <Tab.Screen name="Stores" component={StoresPage} />
      <Tab.Screen name="Favorites" component={FavoritesPage} />
    </Tab.Navigator>
  );
}

// --- 2. Main App Structure ---
export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">
          <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={MainTabs} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}