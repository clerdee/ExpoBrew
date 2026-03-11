import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, IconButton, Avatar, Badge } from "react-native-paper";

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
      {/* LEFT SIDE: Avatar & Greeting */}
      <TouchableOpacity
        style={styles.headerLeft}
        activeOpacity={0.7}
        onPress={onAvatarPress}
      >
        {isLoggedIn && user.profileImage ? (
          <Avatar.Image
            size={40}
            source={{ uri: user.profileImage }}
            style={styles.avatarLogged}
          />
        ) : (
          <Avatar.Icon
            size={40}
            icon="account"
            color="#fff"
            style={styles.avatarGuest}
          />
        )}

        <View style={styles.headerTextContainer}>
          <Text variant="bodyMedium" style={styles.greetingText}>
            {isLoggedIn ? "Good Morning," : "Welcome,"}
          </Text>
          <Text variant="headlineSmall" style={styles.username}>
            {/* 🌟 Show real name, or "Guest" */}
            {isLoggedIn ? user.name : "Guest"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* RIGHT SIDE: Icons */}
      <View style={styles.headerRight}>
        {/* Only show Notifications if logged in */}
        {isLoggedIn && (
          <View style={styles.iconContainer}>
            <IconButton
              icon="bell-outline"
              size={24}
              iconColor="#4A3B32"
              onPress={onNotificationPress}
            />
            <View style={styles.notificationDot} />
          </View>
        )}

        {/* Cart Icon */}
        <View style={styles.iconContainer}>
          <IconButton
            icon="basket-outline"
            size={24}
            iconColor="#4A3B32"
            onPress={onCartPress}
          />
          {cartItemCount > 0 && (
            <Badge style={styles.cartBadge} size={16}>
              {cartItemCount}
            </Badge>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatarLogged: { backgroundColor: "#EFEFEF" },
  avatarGuest: { backgroundColor: "#A0A0A0" },
  headerTextContainer: { marginLeft: 10 },
  greetingText: { color: "#888" },
  username: { fontWeight: "bold", color: "#4A3B32", fontSize: 18 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  iconContainer: { position: "relative", marginLeft: 5 },
  notificationDot: { position: "absolute", top: 8, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: "#E74C3C" },
  cartBadge: { position: "absolute", top: 5, right: 5, backgroundColor: "#6F4E37", color: "#fff", fontWeight: "bold" },
});

export default Header;