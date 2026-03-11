import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Toast from 'react-native-toast-message'; 

import UserStackNavigator from "./src/Navigators/UserStackNavigator";
import AuthStackNavigator from "./src/Navigators/AuthStackNavigator";
import AdminStackNavigator from "./src/Navigators/AdminStackNavigator";

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Auth"); 

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const userToken = await SecureStore.getItemAsync('userToken');
        const userInfoString = await SecureStore.getItemAsync('userInfo');

        if (userToken && userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          
          if (userInfo.role === 'admin') {
            setInitialRoute("AdminHome"); 
          } else {
            setInitialRoute("Home");
          }
        } else {
          setInitialRoute("Auth");
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setInitialRoute("Auth"); 
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6F4E37" />
      </View>
    );
  }

return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }} >
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
          <Stack.Screen name="Home" component={UserStackNavigator} />
          <Stack.Screen name="AdminHome" component={AdminStackNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast /> 
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF5F0',
  }
});