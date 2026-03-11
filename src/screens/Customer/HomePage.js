import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text, Card } from "react-native-paper";
import * as SecureStore from "expo-secure-store";

import CardComponent from "../../components/CardComponent";
import CartModal from "../../components/CartModal";
import AuthModal from "../../components/AuthModal";
import Header from "../../components/Header";
import ProfileModal from "../../components/ProfileModal";

const CATEGORIES = ["Cakes", "Desserts", "Sweet Surprises", "Drinks"];
const COFFEE_MENU = [
  {
    id: "1",
    name: "Fruity Summer",
    desc: "with buttery layer",
    price: "$ 7.60",
    image: {
      uri: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80",
    },
  },
  {
    id: "2",
    name: "Brownie Cake",
    desc: "with buttery layer",
    price: "$ 5.00",
    image: {
      uri: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80",
    },
  },
  {
    id: "3",
    name: "Sweet Lemon",
    desc: "Fresh & Sweet",
    price: "$ 4.50",
    image: {
      uri: "https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=500&q=80",
    },
  },
  {
    id: "4",
    name: "Mochaccino",
    desc: "Rich Chocolate",
    price: "$ 3.80",
    image: {
      uri: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80",
    },
  },
];

const { width } = Dimensions.get("window");

const HomePage = () => {
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfoString = await SecureStore.getItemAsync("userInfo");
        if (userInfoString) {
          setCurrentUser(JSON.parse(userInfoString));
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const cartItemCount = 2;

  const handleAvatarClick = () => {
    if (!currentUser) {
      setIsAuthModalVisible(true);
    } else {
      setIsProfileModalVisible(true);
    }
  };

  const renderHeader = () => (
    <View>
      <Header
        user={currentUser}
        cartItemCount={cartItemCount}
        onAvatarPress={handleAvatarClick}
        onCartPress={() => setIsCartVisible(true)}
        onNotificationPress={() => console.log("Notifications clicked!")}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Daily discounts
      </Text>
      <Card style={styles.bannerCard}>
        <Card.Cover
          source={{
            uri: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
          }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>SALE</Text>
          <Text style={styles.bannerSubtitle}>UP TO 50% OFF</Text>
          <View style={styles.bannerButton}>
            <Text
              style={{ fontWeight: "bold", fontSize: 10, color: "#4A3B32" }}
            >
              ORDER NOW
            </Text>
          </View>
        </View>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Categories
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
      >
        {CATEGORIES.map((cat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.categoryPill,
              index === 0 ? styles.activeCategory : null,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                index === 0 ? styles.activeCategoryText : null,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={COFFEE_MENU}
        renderItem={({ item }) => <CardComponent item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <CartModal
        visible={isCartVisible}
        onClose={() => setIsCartVisible(false)}
      />
      <AuthModal
        visible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
      />

      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
        user={currentUser}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5F0", paddingTop: 50 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionTitle: {
    fontWeight: "bold",
    color: "#4A3B32",
    marginBottom: 12,
    marginTop: 5,
  },
  bannerCard: {
    marginBottom: 25,
    borderRadius: 15,
    overflow: "hidden",
    height: 140,
    justifyContent: "center",
  },
  bannerImage: { height: 140 },
  bannerOverlay: { position: "absolute", left: 20, justifyContent: "center" },
  bannerTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 24,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 5,
  },
  bannerSubtitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 5,
  },
  bannerButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  categoryContainer: { flexDirection: "row", marginBottom: 20 },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },
  activeCategory: { backgroundColor: "#6F4E37", borderColor: "#6F4E37" },
  categoryText: { color: "#6F4E37", fontWeight: "600" },
  activeCategoryText: { color: "#fff" },
  columnWrapper: { justifyContent: "space-between" },
});

export default HomePage;
