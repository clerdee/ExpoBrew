import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, IconButton, Avatar, Badge } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from "../configs/config";
import NotificationModal from "./NotificationModal";

const Header = ({ user, cartItemCount = 0, onAvatarPress, onCartPress }) => {
  const [notifVisible, setNotifVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isLoggedIn = !!user;

  useEffect(() => {
    if (isLoggedIn) fetchUnreadCount();
  }, [isLoggedIn]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/users/notifications`);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (e) { console.log("Notif count error"); }
  };

  if (!isLoggedIn) return (
    <View style={styles.gWrapper}><View style={styles.gContainer}><View style={styles.gContent}>
      <Text style={styles.gGreet}>It's a great day{"\n"}for coffee ☕️</Text>
      <TouchableOpacity style={styles.sBtn} onPress={onAvatarPress} activeOpacity={0.8}>
        <MaterialCommunityIcons name="login" size={18} color="#fff" /><Text style={styles.sText}>Sign In</Text>
      </TouchableOpacity>
    </View><MaterialCommunityIcons name="coffee" size={150} color="rgba(111,78,55,0.05)" style={styles.gDeco} /></View></View>
  );

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.hLeft} activeOpacity={0.7} onPress={onAvatarPress}>
        {user.profileImage ? <Avatar.Image size={40} source={{uri:user.profileImage}} /> : <Avatar.Icon size={40} icon="account" color="#fff" style={{backgroundColor:"#A0A0A0"}} />}
        <View style={{marginLeft:10}}><Text style={styles.greet}>Good Morning,</Text><Text style={styles.uName}>{user.name}</Text></View>
      </TouchableOpacity>
      <View style={styles.hRight}>
        <View style={styles.iCont}>
          <IconButton icon="bell-outline" size={24} iconColor="#4A3B32" onPress={()=>setNotifVisible(true)} />
          {unreadCount > 0 && <View style={styles.nDot} />}
        </View>
        <View style={styles.iCont}>
          <IconButton icon="basket-outline" size={24} iconColor="#4A3B32" onPress={onCartPress} />
          {cartItemCount > 0 && <Badge style={styles.cBadge} size={16}>{cartItemCount}</Badge>}
        </View>
      </View>
      <NotificationModal visible={notifVisible} onClose={()=>{setNotifVisible(false); fetchUnreadCount();}} />
    </View>
  );
};

const styles = StyleSheet.create({
  gWrapper: { marginHorizontal:-20, marginTop:-50, marginBottom:25, elevation:5 },
  gContainer: { backgroundColor:'#EBE1D7', paddingTop:85, paddingBottom:40, paddingHorizontal:25, flexDirection:'row', overflow:'hidden', borderBottomLeftRadius:40, borderBottomRightRadius:40 },
  gContent: { zIndex:2, flex:1 }, gGreet: { fontWeight:"900", color:"#4A3B32", marginBottom:20, fontSize:28, lineHeight:34 },
  sBtn: { flexDirection:'row', alignItems:'center', backgroundColor:'#6F4E37', paddingHorizontal:22, paddingVertical:12, borderRadius:25, alignSelf:'flex-start' },
  sText: { color:'#fff', fontWeight:'bold', marginLeft:8 }, gDeco: { position:'absolute', right:-25, bottom:-30, transform:[{rotate:'-15deg'}] },
  header: { flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  hLeft: { flexDirection:"row", alignItems:"center" }, hRight: { flexDirection:"row", alignItems:"center" },
  greet: { color:"#888", fontSize:12 }, uName: { fontWeight:"bold", color:"#4A3B32", fontSize:18 },
  iCont: { position:"relative", marginLeft:5 }, nDot: { position:"absolute", top:8, right:12, width:8, height:8, borderRadius:4, backgroundColor:"#E74C3C" },
  cBadge: { position:"absolute", top:5, right:5, backgroundColor:"#6F4E37" },
});
export default Header;