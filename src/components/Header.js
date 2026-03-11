import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, IconButton, Avatar, Badge, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Header = ({ 
  user,              
  cartItemCount = 0, 
  onAvatarPress,     
  onCartPress,       
  onNotificationPress
}) => {
  
  const isLoggedIn = !!user;

  return (
    <View style={styles.header}>
      {/* --- GUEST MODE HEADER --- */}
      {!isLoggedIn ? (
        <View style={styles.headerLeft}>
          <Text variant="titleLarge" style={styles.starbucksGreeting}>
            It's a great day for coffee ☕️
          </Text>
          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={onAvatarPress} 
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="login" size={16} color="#6F4E37" />
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : (

        <TouchableOpacity
          style={styles.headerLeft}
          activeOpacity={0.7}
          onPress={onAvatarPress}
        >
          {user.profileImage ? (
            <Avatar.Image size={40} source={{ uri: user.profileImage }} style={styles.avatarLogged} />
          ) : (
            <Avatar.Icon size={40} icon="account" color="#fff" style={styles.avatarGuest} />
          )}
          <View style={styles.headerTextContainer}>
            <Text variant="bodyMedium" style={styles.greetingText}>Good Morning,</Text>
            <Text variant="headlineSmall" style={styles.username}>{user.name}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* --- RIGHT SIDE: ICONS --- */}
      <View style={styles.headerRight}>
        {isLoggedIn && (
          <View style={styles.iconContainer}>
            <IconButton icon="bell-outline" size={24} iconColor="#4A3B32" onPress={onNotificationPress} />
            <View style={styles.notificationDot} />
          </View>
        )}

        <View style={styles.iconContainer}>
          <IconButton icon="basket-outline" size={24} iconColor="#4A3B32" onPress={onCartPress} />
          {cartItemCount > 0 && (
            <Badge style={styles.cartBadge} size={16}>{cartItemCount}</Badge>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  headerLeft: { flex: 1, paddingRight: 10 },
  
  starbucksGreeting: { fontWeight: "900", color: "#4A3B32", marginBottom: 8, lineHeight: 28 },
  signInButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EBE1D7', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  signInText: { color: '#6F4E37', fontWeight: 'bold', marginLeft: 5, fontSize: 13 },

  avatarLogged: { backgroundColor: "#EFEFEF" },
  avatarGuest: { backgroundColor: "#A0A0A0" },
  headerTextContainer: { marginLeft: 10, marginTop: -4 },
  greetingText: { color: "#888" },
  username: { fontWeight: "bold", color: "#4A3B32", fontSize: 18 },
  
  headerRight: { flexDirection: "row", alignItems: "center" },
  iconContainer: { position: "relative", marginLeft: 5 },
  notificationDot: { position: "absolute", top: 8, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: "#E74C3C" },
  cartBadge: { position: "absolute", top: 5, right: 5, backgroundColor: "#6F4E37", color: "#fff", fontWeight: "bold" },
});

export default Header;