import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../../configs/config'; 

const AdminHomePage = ({ navigation }) => {

  const showDevToast = (moduleName) => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: `The ${moduleName} management module is under construction.`,
      position: 'top'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your ExpoBrew systems</Text>
      </View>

      <View style={styles.grid}>
        {/* Products Management */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => Toast.show({ type: 'success', text1: 'Routing to Products...' })} 
        >
          <Text style={styles.icon}>☕</Text>
          <Text style={styles.cardTitle}>Manage Products</Text>
        </TouchableOpacity>

        {/* Users Management */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => showDevToast('Users')}
        >
          <Text style={styles.icon}>👥</Text>
          <Text style={styles.cardTitle}>Manage Users</Text>
        </TouchableOpacity>

        {/* Orders Management */}
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => showDevToast('Orders')}
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
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#FFFFFF' 
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#D3C4B7',
    marginTop: 5
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

export default AdminHomePage;