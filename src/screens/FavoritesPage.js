import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Text, Card, IconButton, Searchbar, Button, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CartModal from '../components/CartModal'; 

const INITIAL_FAVORITES = [
  {
    id: '1',
    name: 'Caramel Macchiato',
    customization: 'Iced • Oat Milk • Less Sugar',
    price: '$5.50',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80',
  },
  {
    id: '2',
    name: 'Iced Americano',
    customization: 'Extra Shot • No Sugar',
    price: '$3.50',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&q=80',
  },
  {
    id: '3',
    name: 'Brownie Cake',
    customization: 'Warmed up',
    price: '$5.00',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80',
  },
];

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState(INITIAL_FAVORITES);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCartVisible, setIsCartVisible] = useState(false);
  const cartItemCount = 2;

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const renderFavItem = ({ item }) => (
    <Card style={styles.favCard} mode="elevated">
      <View style={styles.cardRow}>
        {/* Left: Product Image */}
        <Image source={{ uri: item.image }} style={styles.productImage} />

        {/* Center: Product Details */}
        <View style={styles.cardInfo}>
          <Text variant="titleMedium" style={styles.productName}>{item.name}</Text>
          <Text variant="bodySmall" style={styles.customizationText}>{item.customization}</Text>
          <Text variant="titleMedium" style={styles.price}>{item.price}</Text>
        </View>

        {/* Right: Actions */}
        <View style={styles.actionColumn}>
          <IconButton 
            icon="heart" 
            iconColor="#E74C3C" 
            size={22} 
            onPress={() => removeFavorite(item.id)}
            style={styles.heartBtn}
          />
          <TouchableOpacity 
            style={styles.addToCartBtn} 
            onPress={() => {
              console.log('Added to cart');
              setIsCartVisible(true); 
            }}
          >
            <MaterialCommunityIcons name="basket-plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* --- 3. UPDATED PAGE HEADER WITH CART --- */}
      <View style={styles.headerContainer}>
        <View>
          <Text variant="headlineMedium" style={styles.headerTitle}>My Favorites</Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>Your go-to orders, just a tap away.</Text>
        </View>

        {/* Cart Icon */}
        <View style={styles.iconContainer}>
          <IconButton 
            icon="basket-outline" 
            size={24} 
            iconColor="#4A3B32" 
            onPress={() => setIsCartVisible(true)} 
          />
          {cartItemCount > 0 && (
            <Badge style={styles.cartBadge} size={16}>{cartItemCount}</Badge>
          )}
        </View>
      </View>

      {/* --- SEARCH BAR --- */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search favorites..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#6F4E37"
          inputStyle={{ fontSize: 14 }}
        />
      </View>

      {/* --- FAVORITES LIST --- */}
      <FlatList
        data={favorites}
        renderItem={renderFavItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="heart-broken-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>You haven't added any favorites yet.</Text>
            <Button mode="contained" buttonColor="#6F4E37" style={{marginTop: 20}} onPress={() => console.log('Go to Menu')}>
              Browse Menu
            </Button>
          </View>
        }
      />

      {/* --- 4. CART MODAL --- */}
      <CartModal visible={isCartVisible} onClose={() => setIsCartVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F0', 
    paddingTop: 50,
  },
  
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: '#4A3B32',
  },
  headerSubtitle: {
    color: '#888',
    marginTop: 5,
  },
  iconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#6F4E37',
    color: '#fff',
    fontWeight: 'bold',
  },

  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 15,
    height: 50,
    elevation: 2,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, 
  },

  favCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 15,
    padding: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#EFEFEF',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  productName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  customizationText: {
    color: '#888',
    marginBottom: 6,
    fontSize: 11,
  },
  price: {
    fontWeight: 'bold',
    color: '#6F4E37', 
  },
  actionColumn: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 70,
  },
  heartBtn: {
    margin: 0, 
    height: 24,
  },
  addToCartBtn: {
    backgroundColor: '#6F4E37',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
  },
});

export default FavoritesPage;