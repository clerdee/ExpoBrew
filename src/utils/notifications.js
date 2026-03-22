import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from '../configs/config';

const LOCAL_PUSH_TOKEN_KEY = 'expoPushToken';

export const notificationProjectId =
  Constants?.expoConfig?.extra?.eas?.projectId ||
  Constants?.easConfig?.projectId ||
  null;

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    return { token: null, error: 'Push notifications require a physical device.' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6F4E37',
    });
  }

  const permissions = await Notifications.getPermissionsAsync();
  let finalStatus = permissions.status;

  if (finalStatus !== 'granted') {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermissions.status;
  }

  if (finalStatus !== 'granted') {
    return { token: null, error: 'Notification permission was not granted.' };
  }

  if (!notificationProjectId) {
    return { token: null, error: 'Missing EAS projectId for Expo push notifications.' };
  }

  try {
    const expoToken = await Notifications.getExpoPushTokenAsync({ projectId: notificationProjectId });
    return { token: expoToken.data, error: null };
  } catch (error) {
    return { token: null, error: error.message || 'Failed to get Expo push token.' };
  }
}

export async function syncPushTokenToBackend(authToken) {
  if (!authToken) {
    return { token: null, saved: false, error: 'Missing auth token.' };
  }

  const { token, error } = await registerForPushNotificationsAsync();
  if (!token) {
    return { token: null, saved: false, error };
  }

  await axios.post(
    `${API_BASE_URL}/users/push-token`,
    { token },
    { headers: { Authorization: `Bearer ${authToken}` } }
  );

  await SecureStore.setItemAsync(LOCAL_PUSH_TOKEN_KEY, token);
  return { token, saved: true, error: null };
}

export async function clearPushTokenFromBackend(authToken) {
  const localToken = await SecureStore.getItemAsync(LOCAL_PUSH_TOKEN_KEY);

  if (!authToken || !localToken) {
    if (localToken) {
      await SecureStore.deleteItemAsync(LOCAL_PUSH_TOKEN_KEY);
    }
    return { cleared: false, error: !authToken ? 'Missing auth token.' : 'No local push token saved.' };
  }

  await axios.delete(`${API_BASE_URL}/users/push-token`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { token: localToken },
  });

  await SecureStore.deleteItemAsync(LOCAL_PUSH_TOKEN_KEY);
  return { cleared: true, error: null };
}
