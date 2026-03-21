import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message"; 

const { width } = Dimensions.get("window");

export default function CardComponent({ item, onAddToCart, onFavorite, isFavorite, isGuest }) {
  const handleFavoritePress = () => {
    if (onFavorite) {
      onFavorite(item); 
      if (!isGuest) {
        Toast.show({
          type: isFavorite ? "info" : "success",
          text1: isFavorite ? "Removed from Favorites" : "Added to Favorites",
          text2: isFavorite 
            ? `${item.name} has been removed.` 
            : `${item.name} saved to your favorites! ☕`,
          visibilityTime: 2500,
        });
      }
    }
  };

  return (
    <Card style={styles.card} mode="elevated">
      <View style={styles.imgContainer}>
        <Card.Cover source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/150' }} style={styles.img} />
        <TouchableOpacity activeOpacity={0.7} style={styles.favBtn} onPress={handleFavoritePress}>
          <MaterialCommunityIcons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#E74C3C" : "#666"} />
        </TouchableOpacity>
      </View>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.name}>{item.name}</Text>
        <Text variant="bodySmall" numberOfLines={1} style={styles.desc}>{item.description}</Text>
        <View style={styles.priceRow}>
          <Text variant="titleMedium" style={styles.price}>₱{Number(item.price).toFixed(2)}</Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.addBtn} onPress={() => onAddToCart && onAddToCart(item)}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { width: width / 2 - 25, marginBottom: 15, backgroundColor: "#fff", borderRadius: 15, elevation: 2 },
  imgContainer: { padding: 8, position: 'relative' }, 
  img: { height: 120, borderRadius: 12, backgroundColor: "#f0f0f0" },
  favBtn: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  content: { paddingHorizontal: 12, paddingBottom: 15, paddingTop: 5 },
  name: { fontWeight: "bold", fontSize: 15, color: "#333" },
  desc: { fontSize: 11, color: "#999", marginBottom: 10 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontWeight: "bold", fontSize: 16, color: "#4A3B32" },
  addBtn: { backgroundColor: "#6F4E37", borderRadius: 14, width: 28, height: 28, justifyContent: "center", alignItems: "center" },
});