import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Text, IconButton, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const ProfileModal = ({ visible, onClose, user }) => {
  const navigation = useNavigation();

  const handleSignOut = async () => {
    try {
      // 1. Delete the secure data
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userInfo');
      
      // 2. Close the modal
      onClose();
      
      // 3. Show a nice goodbye message
      Toast.show({ type: 'success', text1: 'Signed Out', text2: 'See you next time!' });
      
      // 4. Force a hard reload of the Home screen to trigger Guest mode
      navigation.replace('Home');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Reusable component for the menu rows
  const MenuRow = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuIconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color="#6F4E37" />
      </View>
      <View style={styles.menuTextContainer}>
        <Text variant="titleMedium" style={styles.menuTitle}>{title}</Text>
        <Text variant="bodySmall" style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text variant="headlineSmall" style={styles.title}>My Profile</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>{user?.email}</Text>
            </View>
            <IconButton icon="close" size={24} onPress={onClose} style={styles.closeBtn} />
          </View>

          <Divider style={styles.divider} />

          {/* Menu Options */}
          <MenuRow 
            icon="receipt-text-outline" 
            title="Transaction History" 
            subtitle="View your past orders and receipts"
            onPress={() => { onClose(); console.log("Navigate to Transactions"); }}
          />
          <MenuRow 
            icon="star-outline" 
            title="Rewards" 
            subtitle="Check your points and offers"
            onPress={() => { onClose(); console.log("Navigate to Rewards"); }}
          />
          <MenuRow 
            icon="account-cog-outline" 
            title="Personal Details" 
            subtitle="Update your name, email, or password"
            onPress={() => { onClose(); console.log("Navigate to Personal"); }}
          />

          {/* Sign Out Button */}
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <MaterialCommunityIcons name="logout" size={20} color="#E74C3C" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetContainer: { 
    backgroundColor: '#FAF5F0', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    paddingHorizontal: 25, 
    paddingBottom: 40, 
    paddingTop: 20, 
    elevation: 10, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5 
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  title: { fontWeight: 'bold', color: '#4A3B32' },
  subtitle: { color: '#888' },
  closeBtn: { margin: 0, marginTop: -5, marginRight: -10 },
  divider: { backgroundColor: '#EBE1D7', height: 1, marginBottom: 15 },
  
  menuRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 10 },
  menuIconContainer: { backgroundColor: '#FAF5F0', padding: 10, borderRadius: 12, marginRight: 15 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontWeight: 'bold', color: '#333' },
  menuSubtitle: { color: '#888', marginTop: 2 },
  
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, padding: 15, backgroundColor: '#FFEEEE', borderRadius: 15 },
  signOutText: { color: '#E74C3C', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
});

export default ProfileModal;