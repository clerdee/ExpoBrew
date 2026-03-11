import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; 

const AuthModal = ({ visible, onClose }) => {
  const navigation = useNavigation(); 

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          
          <IconButton icon="close" size={24} onPress={onClose} style={styles.closeBtn} />

          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="coffee-to-go" size={50} color="#6F4E37" />
          </View>

          <Text variant="headlineSmall" style={styles.title}>Welcome to Brew</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Log in to track your orders, save your favorites, and earn rewards!
          </Text>

          <Button 
            mode="contained" 
            buttonColor="#6F4E37" 
            style={styles.loginBtn}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
            onPress={() => {
              onClose(); 
              navigation.navigate('Auth', { screen: 'Login' });
            }}
          >
            Log In
          </Button>

          <Button 
            mode="outlined" 
            textColor="#6F4E37" 
            style={styles.registerBtn}
            contentStyle={{ height: 50 }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
            onPress={() => {
              onClose();
              navigation.navigate('Auth', { screen: 'Register' });
            }}
          >
            Create an Account
          </Button>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#FAF5F0', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingBottom: 40, paddingTop: 10, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 5 },
  closeBtn: { alignSelf: 'flex-end', marginRight: -10 },
  iconCircle: { backgroundColor: '#EBE1D7', width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  title: { fontWeight: 'bold', color: '#4A3B32', marginBottom: 10 },
  subtitle: { color: '#666', textAlign: 'center', marginBottom: 30, paddingHorizontal: 10, lineHeight: 22 },
  loginBtn: { width: '100%', borderRadius: 12, marginBottom: 15 },
  registerBtn: { width: '100%', borderRadius: 12, borderColor: '#6F4E37', borderWidth: 1.5 },
});

export default AuthModal;