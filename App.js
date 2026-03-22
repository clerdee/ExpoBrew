import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

import UserStackNavigator from './src/Navigators/UserStackNavigator';
import AuthStackNavigator from './src/Navigators/AuthStackNavigator';
import AdminStackNavigator from './src/Navigators/AdminStackNavigator';
import store from './src/redux/store';
import { syncPushTokenToBackend } from './src/utils/notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Stack = createStackNavigator();

const buildPromoFromNotificationData = (data = {}) => ({
  _id: data.promoId,
  title: data.title,
  description: data.description,
  code: data.code,
  type: data.promoType,
  value: data.value,
  validUntil: data.validUntil,
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Auth');
  const navigationRef = useRef(null);

  useEffect(() => {
    const handleNotificationNavigation = (data = {}) => {
      if (!navigationRef.current) return;

      if (data?.type === 'order' && data?.orderId) {
        navigationRef.current.navigate('Home', {
          screen: 'OrderDetail',
          params: { orderId: data.orderId },
        });
      }

      if (data?.type === 'promo' && data?.promoId) {
        navigationRef.current.navigate('Home', {
          screen: 'PromoDetail',
          params: { promo: buildPromoFromNotificationData(data) },
        });
      }
    };

    const init = async () => {
      try {
        const userToken = await SecureStore.getItemAsync('userToken');
        const userInfoString = await SecureStore.getItemAsync('userInfo');

        if (userToken && userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          setInitialRoute(userInfo.role === 'admin' ? 'AdminHome' : 'Home');

          const pushSync = await syncPushTokenToBackend(userToken);
          if (!pushSync.saved && pushSync.error) {
            console.log('Push setup skipped:', pushSync.error);
          }
        } else {
          setInitialRoute('Auth');
        }

        const initialResponse = await Notifications.getLastNotificationResponseAsync();
        if (initialResponse?.notification?.request?.content?.data) {
          handleNotificationNavigation(initialResponse.notification.request.content.data);
        }
      } catch (error) {
        console.log('App init error:', error.message);
        setInitialRoute('Auth');
      } finally {
        setIsLoading(false);
      }
    };

    init();

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationNavigation(response.notification.request.content.data);
    });

    return () => {
      responseSubscription.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6F4E37" />
      </View>
    );
  }

  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthStackNavigator} />
            <Stack.Screen name="Home" component={UserStackNavigator} />
            <Stack.Screen name="AdminHome" component={AdminStackNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
      </PaperProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF5F0',
  },
});
