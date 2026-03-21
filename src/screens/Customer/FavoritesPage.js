import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text, Card, IconButton, Searchbar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../../configs/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const FavoritesPage = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.get(`${API_BASE_URL}/api/users/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const removeFavorite = async (productId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.post(`${API_BASE_URL}/api/users/favorites/${productId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(prev => prev.filter(item => item._id !== productId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const filteredFavorites = favorites.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFavItem = ({ item }) => (
    <Card style={styles.favCard} mode="elevated">
      <View style={styles.cardRow}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
          style={styles.productImage} 
        />
        <View style={styles.cardInfo}>
          <Text variant="titleMedium" style={styles.productName}>{item.name}</Text>
          <Text variant="bodySmall" style={styles.customizationText}>{item.category}</Text>
          <Text variant="titleMedium" style={styles.price}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.actionColumn}>
          <IconButton 
            icon="heart" 
            iconColor="#E74C3C" 
            size={22} 
            onPress={() => removeFavorite(item._id)}
            style={styles.heartBtn}
          />
          <TouchableOpacity 
            style={styles.addToCartBtn} 
            onPress={() => console.log('Added to cart', item.name)}
          >
            <MaterialCommunityIcons name="basket-plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#6F4E37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text variant="headlineMedium" style={styles.headerTitle}>My Favorites</Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>Your go-to orders, just a tap away.</Text>
        </View>
      </View>

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

      <FlatList
        data={filteredFavorites}
        renderItem={renderFavItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="heart-broken-outline" size={60} color="#CCC" />
            <Text style={styles.emptyText}>You haven't added any favorites yet.</Text>
            <Button 
              mode="contained" 
              buttonColor="#6F4E37" 
              style={{marginTop: 20}} 
              onPress={() => navigation.navigate('Home')}
            >
              Browse Menu
            </Button>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0', paddingTop: 50 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  headerTitle: { fontWeight: 'bold', color: '#4A3B32' },
  headerSubtitle: { color: '#888', marginTop: 5 },
  searchContainer: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: { backgroundColor: '#fff', borderRadius: 15, height: 50, elevation: 2 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  favCard: { backgroundColor: '#fff', marginBottom: 15, borderRadius: 15, padding: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  productImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#EFEFEF' },
  cardInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  productName: { fontWeight: 'bold', color: '#333', marginBottom: 2 },
  customizationText: { color: '#888', marginBottom: 6, fontSize: 11 },
  price: { fontWeight: 'bold', color: '#6F4E37' },
  actionColumn: { justifyContent: 'space-between', alignItems: 'center', height: 70 },
  heartBtn: { margin: 0, height: 24 },
  addToCartBtn: { backgroundColor: '#6F4E37', borderRadius: 8, width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { marginTop: 10, color: '#888', fontSize: 16 },
});

export default FavoritesPage;