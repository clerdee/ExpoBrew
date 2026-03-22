import React,{useState,useEffect,useRef} from "react";import {View,ActivityIndicator,StyleSheet,Platform} from "react-native";
import {NavigationContainer} from "@react-navigation/native";import {createStackNavigator} from "@react-navigation/stack";
import {Provider as PaperProvider} from "react-native-paper";import {Provider as ReduxProvider} from 'react-redux';
import * as SecureStore from 'expo-secure-store';import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';import * as Device from 'expo-device';import Constants from 'expo-constants';import axios from 'axios';
import UserStackNavigator from "./src/Navigators/UserStackNavigator";import AuthStackNavigator from "./src/Navigators/AuthStackNavigator";
import AdminStackNavigator from "./src/Navigators/AdminStackNavigator";import store from './src/redux/store';import {API_BASE_URL} from './src/configs/config';

Notifications.setNotificationHandler({handleNotification:async()=>({shouldShowAlert:true,shouldPlaySound:true,shouldSetBadge:false})});
const Stack=createStackNavigator();

export default function App(){
  const [isLoading,setIsLoading]=useState(true);const [initialRoute,setInitialRoute]=useState("Auth");const navigationRef=useRef();
  
  useEffect(()=>{
    const init=async()=>{
      try{
        const userToken=await SecureStore.getItemAsync('userToken');const userInfoString=await SecureStore.getItemAsync('userInfo');
        if(userToken&&userInfoString){
          const userInfo=JSON.parse(userInfoString);setInitialRoute(userInfo.role==='admin'?"AdminHome":"Home");
          if(Device.isDevice){
            registerForPushNotificationsAsync().then(token=>{
              if(token){
                console.log("Got token from Apple:",token);
                axios.post(`${API_BASE_URL}/users/push-token`,{token},{headers:{Authorization:`Bearer ${userToken}`}})
                .then(()=>console.log("✅ SUCCESS: Token saved to Render Database!"))
                .catch(err=>console.log("❌ ERROR saving token to Render:",err.message));
              }
            });
          }
        }else setInitialRoute("Auth");
      }catch(e){setInitialRoute("Auth");}finally{setIsLoading(false);}
    };
    init();
    const sub=Notifications.addNotificationResponseReceivedListener(res=>{const data=res.notification.request.content.data;if(data?.orderId&&navigationRef.current)navigationRef.current.navigate('Home',{screen:'OrderDetailPage',params:{orderId:data.orderId}});});
    return ()=>sub.remove();
  },[]);

  if(isLoading)return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6F4E37"/></View>;
  return(<ReduxProvider store={store}><PaperProvider><NavigationContainer ref={navigationRef}><Stack.Navigator initialRouteName={initialRoute} screenOptions={{headerShown:false}}><Stack.Screen name="Auth" component={AuthStackNavigator}/><Stack.Screen name="Home" component={UserStackNavigator}/><Stack.Screen name="AdminHome" component={AdminStackNavigator}/></Stack.Navigator></NavigationContainer><Toast/></PaperProvider></ReduxProvider>);
}

async function registerForPushNotificationsAsync(){
  let token;
  if(Platform.OS==='android'&&!Device.isDevice){console.log("Running on Android Emulator: Skipping push setup.");return null;}
  if(Platform.OS==='android')await Notifications.setNotificationChannelAsync('default',{name:'default',importance:Notifications.AndroidImportance.MAX,vibrationPattern:[0,250,250,250],lightColor:'#FF231F7C'});
  if(Device.isDevice){
    const {status:existingStatus}=await Notifications.getPermissionsAsync();let finalStatus=existingStatus;
    if(existingStatus!=='granted'){const {status}=await Notifications.requestPermissionsAsync();finalStatus=status;}
    if(finalStatus!=='granted')return null;
    try{
      const projectId=Constants?.expoConfig?.extra?.eas?.projectId??Constants?.easConfig?.projectId??"expobrew-local-dev";
      token=(await Notifications.getExpoPushTokenAsync({projectId})).data;console.log("My Push Token:",token);
    }catch(error){console.log("Push token error:",error.message);}
  }
  return token;
}
const styles=StyleSheet.create({loadingContainer:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#FAF5F0'}});