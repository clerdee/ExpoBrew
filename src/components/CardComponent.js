import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function CardComponent({ item, onAddToCart }) {
  return (
    <Card style={styles.card} mode="elevated">
      <View style={styles.imgContainer}>
        <Card.Cover source={{ uri: item.imageUrl || item.image || 'https://via.placeholder.com/150?text=No+Image' }} style={styles.img} />
      </View>
      <Card.Content style={styles.content}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.name}>{item.name}</Text>
        <Text variant="bodySmall" numberOfLines={1} style={styles.desc}>{item.description}</Text>
        <View style={styles.priceRow}>
          <Text variant="titleMedium" style={styles.price}>₱{Number(item.price).toFixed(2)}</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => onAddToCart && onAddToCart(item)}>
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { width: width / 2 - 25, marginBottom: 15, backgroundColor: "#fff", borderRadius: 15, elevation: 2 },
  imgContainer: { padding: 8 }, img: { height: 120, borderRadius: 12, backgroundColor: "#f0f0f0" },
  content: { paddingHorizontal: 12, paddingBottom: 15, paddingTop: 5 },
  name: { fontWeight: "bold", fontSize: 15, color: "#333", marginBottom: 2 },
  desc: { fontSize: 11, color: "#999", marginBottom: 10 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontWeight: "bold", fontSize: 16, color: "#4A3B32" },
  addBtn: { backgroundColor: "#6F4E37", borderRadius: 14, width: 28, height: 28, justifyContent: "center", alignItems: "center" },
});