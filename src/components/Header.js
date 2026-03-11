import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, IconButton, Avatar, Badge } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Header = ({ 
  user,              
  cartItemCount = 0, 
  onAvatarPress,     
  onCartPress,       
  onNotificationPress
}) => {
  
  const isLoggedIn = !!user;

  if (!isLoggedIn) {
    return (
      <View style={styles.guestShadowWrapper}>
        <View style={styles.guestHeaderContainer}>
          <View style={styles.guestContent}>
            <Text variant="headlineMedium" style={styles.starbucksGreeting}>
              It's a great day{"\n"}for coffee ☕️
            </Text>
            <TouchableOpacity 
              style={styles.signInButton} 
              onPress={onAvatarPress} 
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="login" size={18} color="#fff" />
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
          
          {/* Decorative background icon */}
          <MaterialCommunityIcons 
            name="coffee" 
            size={150} 
            color="rgba(111, 78, 55, 0.05)" 
            style={styles.guestDecoIcon} 
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.header}>
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

      {/* RIGHT SIDE: ICONS */}
      <View style={styles.headerRight}>
        <View style={styles.iconContainer}>
          <IconButton icon="bell-outline" size={24} iconColor="#4A3B32" onPress={onNotificationPress} />
          <View style={styles.notificationDot} />
        </View>

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

  guestShadowWrapper: {
    marginHorizontal: -20, 
    marginTop: -50,
    marginBottom: 25,
    elevation: 5,
    shadowColor: '#6F4E37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  guestHeaderContainer: {
    backgroundColor: '#EBE1D7', 
    paddingTop: 85,
    paddingBottom: 40,
    paddingHorizontal: 25,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  guestContent: {
    zIndex: 2, 
    flex: 1,
  },
  starbucksGreeting: { 
    fontWeight: "900", 
    color: "#4A3B32", 
    marginBottom: 20, 
    lineHeight: 34 
  },
  signInButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#6F4E37', 
    paddingHorizontal: 22, 
    paddingVertical: 12, 
    borderRadius: 25, 
    alignSelf: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  signInText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    marginLeft: 8, 
    fontSize: 15 
  },
  guestDecoIcon: {
    position: 'absolute',
    right: -25,
    bottom: -30,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }]
  },

  // --- Logged In Styles ---
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