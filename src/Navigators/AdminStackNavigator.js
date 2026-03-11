import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AdminHomePage from '../screens/Admin/AdminHomePage';
import ProfilePage from '../Shared/ProfilePage';

const Stack = createStackNavigator();

export default function AdminStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminHomePage} />
      <Stack.Screen name="Profile" component={ProfilePage} />
    </Stack.Navigator>
  );
}