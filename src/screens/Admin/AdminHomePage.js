import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Card } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';

import Header from "../../components/Header"; 
import ProfileModal from "../../components/ProfileModal"; 

const AdminHomePage = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userInfoString = await SecureStore.getItemAsync('userInfo');
        if (userInfoString) {
          setCurrentUser(JSON.parse(userInfoString));
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchUserData();
  }, []);

  // --- REUSABLE DASHBOARD CARD ---
  const DashboardCard = ({ title, icon, color, onPress, badgeCount }) => (
    <TouchableOpacity style={styles.cardWrapper} activeOpacity={0.8} onPress={onPress}>
      <Card style={styles.dashCard}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
          {badgeCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeCount}</Text>
            </View>
          )}
        </View>
        <Text variant="titleMedium" style={styles.cardTitle}>{title}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 🌟 Reusing our smart Header! (Hiding cart logic for Admin) */}
      <Header 
        user={currentUser} 
        cartItemCount={0} 
        onAvatarPress={() => setIsProfileModalVisible(true)}
        onNotificationPress={() => console.log("Admin Notifications")}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text variant="headlineMedium" style={styles.mainTitle}>Admin Dashboard</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Overview of your coffee shop today.</Text>
        </View>

        {/* Quick Stats Banner */}
        <Card style={styles.statsBanner}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>124</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>$845</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>
        </Card>

        {/* Admin Action Grid */}
        <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.gridContainer}>
          <DashboardCard 
            title="Live Orders" 
            icon="clipboard-list-outline" 
            color="#E67E22" 
            badgeCount={5} // Shows active orders needing attention
            onPress={() => console.log("Go to Manage Orders")} 
          />
          <DashboardCard 
            title="Manage Menu" 
            icon="coffee-maker-outline" 
            color="#6F4E37" 
            onPress={() => console.log("Go to Manage Menu")} 
          />
          <DashboardCard 
            title="Customers" 
            icon="account-group-outline" 
            color="#27AE60" 
            onPress={() => console.log("Go to Users")} 
          />
          <DashboardCard 
            title="Analytics" 
            icon="chart-bar" 
            color="#2980B9" 
            onPress={() => console.log("Go to Analytics")} 
          />
        </View>

      </ScrollView>

      {/* Profile/Logout Modal */}
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },
  
  welcomeSection: { marginBottom: 20 },
  mainTitle: { fontWeight: "bold", color: "#4A3B32" },
  subtitle: { color: "#888", marginTop: 4 },

  statsBanner: { backgroundColor: '#6F4E37', borderRadius: 15, marginBottom: 30, elevation: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', paddingVertical: 20 },
  statItem: { alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#EBE1D7', fontSize: 12, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },

  sectionTitle: { fontWeight: "bold", color: "#4A3B32", marginBottom: 15 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', marginBottom: 15 },
  dashCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
  iconBox: { width: 60, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12, position: 'relative' },
  cardTitle: { fontWeight: '600', color: '#333', textAlign: 'center' },
  
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#E74C3C', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' }
});

export default AdminHomePage;