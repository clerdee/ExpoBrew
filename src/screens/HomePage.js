import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Searchbar, Card, IconButton, Avatar, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- IMPORT MODALS ---
import CartModal from '../components/CartModal'; 
import AuthModal from '../components/AuthModal'; 

// --- DATA ---
const CATEGORIES = ['Cakes', 'Desserts', 'Sweet Surprises', 'Drinks'];
const COFFEE_MENU = [
  { id: '1', name: 'Fruity Summer', desc: 'with buttery layer', price: '$ 7.60', image: { uri: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&q=80' } },
  { id: '2', name: 'Brownie Cake', desc: 'with buttery layer', price: '$ 5.00', image: { uri: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80' } },
  { id: '3', name: 'Sweet Lemon', desc: 'Fresh & Sweet', price: '$ 4.50', image: { uri: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=500&q=80' } },
  { id: '4', name: 'Mochaccino', desc: 'Rich Chocolate', price: '$ 3.80', image: { uri: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80' } },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width / 2) - 25; 

const HomePage = () => {
  // --- COMPONENT STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  
  const cartItemCount = 2; 

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerLeft} 
          activeOpacity={0.7}
          onPress={() => !isLoggedIn && setIsAuthModalVisible(true)}
        >
          {isLoggedIn ? (
            <Avatar.Image size={40} source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' }} style={{ backgroundColor: '#EFEFEF' }} />
          ) : (
            <Avatar.Icon size={40} icon="account" color="#fff" style={{ backgroundColor: '#A0A0A0' }} />
          )}

          <View style={styles.headerTextContainer}>
            <Text variant="bodyMedium" style={{color: '#888'}}>{isLoggedIn ? 'Good Morning,' : 'Welcome,'}</Text>
            <Text variant="headlineSmall" style={styles.username}>{isLoggedIn ? 'Coffee Lover' : 'Guest'}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <View style={styles.iconContainer}>
             <IconButton icon="bell-outline" size={24} iconColor="#4A3B32" onPress={() => console.log('Notifications')} />
             {isLoggedIn && <View style={styles.notificationDot} />}
          </View>
          <View style={styles.iconContainer}>
             <IconButton icon="basket-outline" size={24} iconColor="#4A3B32" onPress={() => setIsCartVisible(true)} />
             {cartItemCount > 0 && <Badge style={styles.cartBadge} size={16}>{cartItemCount}</Badge>}
          </View>
        </View>
      </View>

      <Searchbar placeholder="Search products..." onChangeText={setSearchQuery} value={searchQuery} style={styles.searchBar} iconColor="#6F4E37" inputStyle={{ fontSize: 14 }} />

      <Text variant="titleMedium" style={styles.sectionTitle}>Daily discounts</Text>
      <Card style={styles.bannerCard}>
        <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80' }} style={styles.bannerImage} />
        <View style={styles.bannerOverlay}>
           <Text style={styles.bannerTitle}>SALE</Text>
           <Text style={styles.bannerSubtitle}>UP TO 50% OFF</Text>
           <View style={styles.bannerButton}><Text style={{fontWeight:'bold', fontSize:10, color: '#4A3B32'}}>ORDER NOW</Text></View>
        </View>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {CATEGORIES.map((cat, index) => (
          <TouchableOpacity key={index} style={[styles.categoryPill, index === 0 ? styles.activeCategory : null]}>
            <Text style={[styles.categoryText, index === 0 ? styles.activeCategoryText : null]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderGridItem = ({ item }) => (
    <Card style={styles.gridCard} mode="elevated">
      <View style={styles.imageContainer}><Card.Cover source={item.image} style={styles.gridImage} /></View>
      <Card.Content style={styles.gridContent}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.productName}>{item.name}</Text>
        <Text variant="bodySmall" numberOfLines={1} style={styles.productDesc}>{item.desc}</Text>
        <View style={styles.gridPriceRow}>
          <Text variant="titleMedium" style={styles.price}>{item.price}</Text>
          <TouchableOpacity style={styles.addBtnCircle} onPress={() => setIsCartVisible(true)}>
             <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={COFFEE_MENU}
        renderItem={renderGridItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper} 
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* MODALS */}
      <CartModal visible={isCartVisible} onClose={() => setIsCartVisible(false)} />
      <AuthModal visible={isAuthModalVisible} onClose={() => setIsAuthModalVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5F0', paddingTop: 50 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerTextContainer: { marginLeft: 10 },
  username: { fontWeight: 'bold', color: '#4A3B32', fontSize: 18 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { position: 'relative', marginLeft: 5 },
  notificationDot: { position: 'absolute', top: 8, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E74C3C' },
  cartBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#6F4E37', color: '#fff', fontWeight: 'bold' },
  searchBar: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 20, height: 50, elevation: 0, borderWidth: 1, borderColor: '#EFEFEF' },
  sectionTitle: { fontWeight: 'bold', color: '#4A3B32', marginBottom: 12, marginTop: 5 },
  bannerCard: { marginBottom: 25, borderRadius: 15, overflow: 'hidden', height: 140, justifyContent: 'center' },
  bannerImage: { height: 140 },
  bannerOverlay: { position: 'absolute', left: 20, justifyContent: 'center' },
  bannerTitle: { color: '#fff', fontWeight: '900', fontSize: 24, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 },
  bannerSubtitle: { color: '#fff', fontSize: 14, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 5 },
  bannerButton: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  categoryContainer: { flexDirection: 'row', marginBottom: 20 },
  categoryPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginRight: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EFEFEF' },
  activeCategory: { backgroundColor: '#6F4E37', borderColor: '#6F4E37' },
  categoryText: { color: '#6F4E37', fontWeight: '600' },
  activeCategoryText: { color: '#fff' },
  columnWrapper: { justifyContent: 'space-between' },
  gridCard: { width: CARD_WIDTH, marginBottom: 15, backgroundColor: '#fff', borderRadius: 15, elevation: 2 },
  imageContainer: { padding: 8 },
  gridImage: { height: 120, borderRadius: 12, backgroundColor: '#f0f0f0' },
  gridContent: { paddingHorizontal: 12, paddingBottom: 15, paddingTop: 5 },
  productName: { fontWeight: 'bold', fontSize: 15, color: '#333', marginBottom: 2 },
  productDesc: { fontSize: 11, color: '#999', marginBottom: 10 },
  gridPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontWeight: 'bold', fontSize: 16, color: '#4A3B32' },
  addBtnCircle: { backgroundColor: '#6F4E37', borderRadius: 50, width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
});

export default HomePage;