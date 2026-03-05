import React from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 25;

const renderItems  = (item)=>{
  
}

 function CardComponent({ item }) {
  return (
    <Card style={styles.gridCard} mode="elevated">
      <View style={styles.imageContainer}>
        <Card.Cover source={item.image} style={styles.gridImage} />
      </View>
      <Card.Content style={styles.gridContent}>
        <Text
          variant="titleMedium"
          numberOfLines={1}
          style={styles.productName}
        >
          {item.name}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={styles.productDesc}>
          {item.desc}
        </Text>
        <View style={styles.gridPriceRow}>
          <Text variant="titleMedium" style={styles.price}>
            {item.price}
          </Text>
          <TouchableOpacity
            style={styles.addBtnCircle}
            onPress={() => setIsCartVisible(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
}

export default CardComponent;

const styles = StyleSheet.create({
  gridCard: {
    width: CARD_WIDTH,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    elevation: 2,
  },
  imageContainer: { padding: 8 },
  gridImage: { height: 120, borderRadius: 12, backgroundColor: "#f0f0f0" },
  gridContent: { paddingHorizontal: 12, paddingBottom: 15, paddingTop: 5 },
  productName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
    marginBottom: 2,
  },
  productDesc: { fontSize: 11, color: "#999", marginBottom: 10 },
  gridPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { fontWeight: "bold", fontSize: 16, color: "#4A3B32" },
  addBtnCircle: {
    backgroundColor: "#6F4E37",
    borderRadius: 50,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
