import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back Button */}
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          iconColor="#4A3B32" 
          onPress={() => navigation.goBack()} 
        />
      </View>

      <View style={styles.content}>
        {/* Title Section */}
        <Text variant="displaySmall" style={styles.title}>Welcome Back</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Sign in to your account and get your daily dose of coffee.
        </Text>

        {/* Form Inputs */}
        <TextInput
          label="Email or Phone Number"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          left={<TextInput.Icon icon="email-outline" color="#888" />}
          outlineColor="#EBE1D7"
          activeOutlineColor="#6F4E37"
          style={styles.input}
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={isPasswordSecure}
          mode="outlined"
          left={<TextInput.Icon icon="lock-outline" color="#888" />}
          right={
            <TextInput.Icon 
              icon={isPasswordSecure ? "eye-off" : "eye"} 
              onPress={() => setIsPasswordSecure(!isPasswordSecure)} 
              color="#888"
            />
          }
          outlineColor="#EBE1D7"
          activeOutlineColor="#6F4E37"
          style={styles.input}
        />

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotBtn} onPress={() => console.log('Forgot Password')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <Button 
          mode="contained" 
          buttonColor="#6F4E37" 
          contentStyle={styles.loginBtnContent}
          labelStyle={styles.loginBtnLabel}
          style={styles.loginBtn}
          onPress={() => {
            console.log('Logging in...');
            // In the future: Redux dispatch here, then:
            navigation.navigate('Home'); 
          }}
        >
          Log In
        </Button>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Logins */}
        <View style={styles.socialRow}>
          <IconButton icon="google" size={30} iconColor="#DB4437" style={styles.socialBtn} onPress={() => console.log('Google')} />
          <IconButton icon="facebook" size={30} iconColor="#4267B2" style={styles.socialBtn} onPress={() => console.log('Facebook')} />
          <IconButton icon="apple" size={30} iconColor="#000" style={styles.socialBtn} onPress={() => console.log('Apple')} />
        </View>

        {/* Bottom Signup Link */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => console.log('Navigate to Register')}>
            <Text style={styles.signupText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5F0', // Cream Background
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
  },
  title: {
    fontWeight: 'bold',
    color: '#4A3B32',
    marginBottom: 10,
  },
  subtitle: {
    color: '#666',
    marginBottom: 40,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotText: {
    color: '#6F4E37',
    fontWeight: 'bold',
  },
  loginBtn: {
    borderRadius: 12,
    marginBottom: 30,
  },
  loginBtnContent: {
    height: 55,
  },
  loginBtnLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBE1D7',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#888',
    fontWeight: '600',
  },

  // Socials
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  socialBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EBE1D7',
    marginHorizontal: 10,
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  footerText: {
    color: '#666',
  },
  signupText: {
    color: '#6F4E37',
    fontWeight: 'bold',
  },
});

export default LoginPage;