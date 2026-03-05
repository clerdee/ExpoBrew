import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import UserStackNavigator from "./src/Navigators/UserStackNavigator";
import AuthStackNavigator from "./src/Navigators/AuthStackNavigator";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
          <Stack.Screen
            name="Home"
            component={UserStackNavigator}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
