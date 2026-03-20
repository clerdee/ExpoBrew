import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Dashboard = ({ navigation }) => {

  const showDevToast = (moduleName) => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: `The ${moduleName} module is under construction.`,
      position: 'top'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Hamburger Menu Button */}
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.toggleDrawer()}
        >
          <MaterialCommunityIcons name="menu" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage your ExpoBrew systems</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {/* Products Management */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Products')} 
        >
          <Text style={styles.icon}>☕</Text>
          <Text style={styles.cardTitle}>Manage Products</Text>
        </TouchableOpacity>

        {/* Users Management */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Users')}
        >
          <Text style={styles.icon}>👥</Text>
          <Text style={styles.cardTitle}>Manage Users</Text>
        </TouchableOpacity>

        {/* Orders Management */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.icon}>📦</Text>
          <Text style={styles.cardTitle}>Manage Orders</Text>
        </TouchableOpacity>

        {/* Reviews Management */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => showDevToast('Reviews')}
        >
          <Text style={styles.icon}>⭐</Text>
          <Text style={styles.cardTitle}>Manage Reviews</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  header: {
    backgroundColor: '#4A2E1B',
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 15,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D3C4B7',
    marginTop: 2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333',
    textAlign: 'center'
  },
});

export default Dashboard;