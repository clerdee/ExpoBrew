import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image } from 'react-native';
import { Text, Searchbar, Card, Button, Divider, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- DUMMY STORE DATA ---
const STORES = [
  {
    id: '1',
    name: 'Downtown Brew',
    address: '123 Coffee Street, Taguig',
    distance: '0.8 km',
    isOpen: true,
    hours: '07:00 AM - 10:00 PM',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&q=80',
  },
  {
    id: '2',
    name: 'BGC High Street Cafe',
    address: '5th Avenue, Bonifacio Global City',
    distance: '1.5 km',
    isOpen: true,
    hours: '06:00 AM - 11:00 PM',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80',
  },
  {
    id: '3',
    name: 'Uptown Corner',
    address: '9th Ave, Uptown Mall',
    distance: '3.2 km',
    isOpen: false,
    hours: '08:00 AM - 09:00 PM',
    image: 'https://images.unsplash.com/photo-1600093463712-37055379f82d?w=500&q=80',
  },
];

const StoresPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // --- RENDER STORE CARD ---
  const renderStoreItem = ({ item }) => (
    <Card style={styles.storeCard} mode="elevated">
      {/* Top Image Section */}
      <Card.Cover source={{ uri: item.image }} style={styles.storeImage} />
      
      {/* Floating Distance Badge */}
      <View style={styles.distanceBadge}>
        <MaterialCommunityIcons name="map-marker-distance" size={14} color="#6F4E37" />
        <Text style={styles.distanceText}>{item.distance}</Text>
      </View>

      <Card.Content style={styles.cardContent}>
        {/* Title and Status */}
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={styles.storeName}>{item.name}</Text>
          <Chip 
            mode="flat" 
            textStyle={{ color: item.isOpen ? '#27AE60' : '#E74C3C', fontWeight: 'bold', fontSize: 10 }}
            style={{ backgroundColor: item.isOpen ? '#E8F6EF' : '#FDEDEC', height: 24 }}
          >
            {item.isOpen ? 'OPEN' : 'CLOSED'}
          </Chip>
        </View>

        {/* Info Rows */}
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={16} color="#888" style={styles.icon} />
          <Text variant="bodySmall" style={styles.infoText}>{item.address}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#888" style={styles.icon} />
          <Text variant="bodySmall" style={styles.infoText}>{item.hours}</Text>
        </View>

        <Divider style={styles.divider} />

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button 
            mode="outlined" 
            icon="navigation-variant-outline"
            textColor="#6F4E37"
            style={styles.directionsBtn}
            onPress={() => console.log('Get Directions')}
          >
            Directions
          </Button>

          <Button 
            mode="contained" 
            icon="coffee"
            buttonColor="#6F4E37"
            disabled={!item.isOpen}
            style={styles.orderBtn}
            onPress={() => console.log('Order at this store')}
          >
            Order Here
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* --- PAGE HEADER --- */}
      <View style={styles.headerContainer}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Find a Store</Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>Discover your perfect coffee spot</Text>
      </View>

      {/* --- SEARCH BAR --- */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by city or zip code..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#6F4E37"
          inputStyle={{ fontSize: 14 }}
        />
      </View>

      {/* --- STORE LIST --- */}
      <FlatList
        data={STORES}
        renderItem={renderStoreItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F0', // Matches app theme
    paddingTop: 50,
  },
  headerContainer: {
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
    paddingBottom: 100, // Space for Bottom Tab
  },

  // --- STORE CARD STYLES ---
  storeCard: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  storeImage: {
    height: 150,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  distanceBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 3,
  },
  distanceText: {
    fontWeight: 'bold',
    color: '#6F4E37',
    fontSize: 12,
    marginLeft: 4,
  },
  cardContent: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  storeName: {
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    color: '#666',
  },
  divider: {
    marginVertical: 15,
    backgroundColor: '#EFEFEF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  directionsBtn: {
    flex: 1,
    marginRight: 10,
    borderColor: '#6F4E37',
  },
  orderBtn: {
    flex: 1,
  },
});

export default StoresPage;