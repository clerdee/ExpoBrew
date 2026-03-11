import React, { useState, useEffect } from "react";
import {
  View, StyleSheet, TouchableOpacity, KeyboardAvoidingView,
  Platform, ScrollView, Alert, Modal,
} from "react-native";
import { Text, TextInput, Button, IconButton, Avatar } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";

import { API_BASE_URL } from "../../configs/config"; 

const RegisterPage = ({ navigation }) => {
  // --- USER DATA STATE ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);

  // --- UI STATE ---
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isConfirmSecure, setIsConfirmSecure] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // --- OTP & RESEND STATE ---
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Timer logic for resend OTP cooldown
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // --- IMAGE HANDLING ---
  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Permission Required", text2: "Allow photo access." });
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Permission Required", text2: "Allow camera access." });
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  };

  const showImageOptions = () => {
    Alert.alert("Profile Picture", "Choose an option to set your profile picture", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: pickFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

// --- STEP 1: INITIAL REGISTER ---
  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({ type: "error", text1: "Wait!", text2: "Fill in all fields." });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Oops!", text2: "Passwords do not match." });
      return;
    }

    setIsLoading(true);

    try {
      // 🌟 MUST BE PURE JSON AND HAVE THIS EXACT HEADER! 🌟
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" // <- This tells express.json() to wake up!
        },
        body: JSON.stringify({ name, email, password }), // <- No FormData here!
      });
      
      const data = await response.json();

      if (response.ok) {
        Toast.show({ type: "success", text1: "Code Sent!", text2: "Check your email." });
        setIsOtpModalVisible(true);
        setResendTimer(30); 
      } else {
        Toast.show({ type: "error", text1: "Failed", text2: data.message });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Could not connect to server." });
    } finally {
      setIsLoading(false);
    }
  };

// --- STEP 2: VERIFY OTP ---
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      Toast.show({ type: "error", text1: "Invalid Code", text2: "Enter the 6-digit code." });
      return;
    }

    setIsVerifying(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("otp", otpCode);

      if (profileImage) {
        const filename = profileImage.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        formData.append("profileImage", { 
          uri: profileImage, name: filename, type: match ? `image/${match[1]}` : `image` 
        });
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        body: formData, 
      });
      
      const data = await response.json();

      if (response.ok) {
        setIsOtpModalVisible(false);
        Toast.show({ type: "success", text1: "Welcome to Brew!", text2: "Account verified." });
        navigation.replace("Login");
      } else {
        Toast.show({ type: "error", text1: "Failed", text2: data.message });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Server connection failed." });
    } finally {
      setIsVerifying(false);
    }
  };

// --- RESEND OTP LOGIC ---
  const handleResendOtp = async () => {
    if (resendTimer > 0) return; 
    setIsResending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ name, email, password }) 
      });
      
      if (response.ok) {
        Toast.show({ type: "success", text1: "Sent!", text2: "Check your email again." });
        setOtpCode(""); 
        setResendTimer(30); 
      } else {
        const data = await response.json();
        Toast.show({ type: "error", text1: "Failed", text2: data.message });
      }
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: "Server connection failed." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <IconButton icon="arrow-left" size={24} iconColor="#4A3B32" 
            onPress={() => navigation.goBack()} style={styles.backBtn} />
        </View>

        <View style={styles.content}>
          <Text variant="displaySmall" style={styles.title}>Join Brew</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Create an account to start earning coffee rewards today.
          </Text>

          {/* Avatar Uploader */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={showImageOptions} activeOpacity={0.8}>
              {profileImage ? (
                <Avatar.Image size={100} source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={40} color="#888" />
                  <Text style={styles.avatarText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <MaterialCommunityIcons name="pencil" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <TextInput 
            label="Full Name" value={name} onChangeText={setName} 
            mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" 
            left={<TextInput.Icon icon="account-outline" color="#888" />} 
          />
          <TextInput 
            label="Email Address" value={email} onChangeText={setEmail} 
            mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37"
            keyboardType="email-address" autoCapitalize="none" 
            left={<TextInput.Icon icon="email-outline" color="#888" />} 
          />
          <TextInput 
            label="Password" value={password} onChangeText={setPassword} 
            mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37"
            secureTextEntry={isPasswordSecure} 
            left={<TextInput.Icon icon="lock-outline" color="#888" />} 
            right={<TextInput.Icon icon={isPasswordSecure ? "eye-off" : "eye"} color="#888"
              onPress={() => setIsPasswordSecure(!isPasswordSecure)} />} 
          />
          <TextInput 
            label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} 
            mode="outlined" style={styles.input} outlineColor="#EBE1D7" activeOutlineColor="#6F4E37"
            secureTextEntry={isConfirmSecure} 
            left={<TextInput.Icon icon="lock-check-outline" color="#888" />} 
            right={<TextInput.Icon icon={isConfirmSecure ? "eye-off" : "eye"} color="#888"
              onPress={() => setIsConfirmSecure(!isConfirmSecure)} />} 
          />

          <Button 
            mode="contained" buttonColor="#6F4E37" style={styles.registerBtn} 
            contentStyle={styles.registerBtnContent} labelStyle={styles.registerBtnLabel} 
            onPress={handleRegister} loading={isLoading} disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Social Auth */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="google" size={24} color="#DB4437" />
              <Text style={styles.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <MaterialCommunityIcons name="facebook" size={24} color="#4267B2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* --- OTP MODAL --- */}
      <Modal animationType="fade" transparent={true} visible={isOtpModalVisible}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalFloating}>
              <IconButton icon="close" size={24} style={styles.closeModalBtn} 
                onPress={() => setIsOtpModalVisible(false)} />
              
              <View style={styles.modalIconCircle}>
                <MaterialCommunityIcons name="email-check-outline" size={40} color="#6F4E37" />
              </View>

              <Text variant="titleLarge" style={styles.modalTitle}>Check your Email</Text>
              <Text variant="bodyMedium" style={styles.modalSubtitle}>
                We sent a 6-digit code to{"\n"}
                <Text style={{fontWeight: 'bold', color: '#4A3B32'}}>{email}</Text>
              </Text>

              <TextInput 
                mode="outlined" label="6-Digit Code" value={otpCode} onChangeText={setOtpCode} 
                keyboardType="number-pad" maxLength={6} style={styles.otpInput}
                outlineColor="#EBE1D7" activeOutlineColor="#6F4E37" 
              />

              <Button 
                mode="contained" buttonColor="#6F4E37" style={styles.verifyBtn} 
                contentStyle={{ height: 50 }} labelStyle={{ fontSize: 16, fontWeight: 'bold' }} 
                onPress={handleVerifyOtp} loading={isVerifying} disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Verify & Create Account"}
              </Button>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={resendTimer > 0 || isResending}>
                  <Text style={[styles.resendLink, (resendTimer > 0 || isResending) && styles.resendLinkDisabled]}>
                    {isResending ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5F0" },
  scrollContent: { flexGrow: 1, paddingTop: 50, paddingBottom: 20 },
  header: { paddingHorizontal: 10, marginBottom: 5 }, backBtn: { margin: 0 },
  content: { flex: 1, paddingHorizontal: 25 },
  title: { fontWeight: "bold", color: "#4A3B32", marginBottom: 5 },
  subtitle: { color: "#666", marginBottom: 25 },

  avatarContainer: { alignItems: "center", marginBottom: 30 },
  avatarPlaceholder: { 
    width: 100, height: 100, borderRadius: 50, backgroundColor: "#EBE1D7", 
    justifyContent: "center", alignItems: "center", borderWidth: 2, 
    borderColor: "#fff", elevation: 3, shadowOpacity: 0.1, shadowRadius: 3 
  },
  avatarImage: { backgroundColor: "#EBE1D7", borderWidth: 2, borderColor: "#fff" },
  avatarText: { fontSize: 12, color: "#888", marginTop: 5, fontWeight: "bold" },
  editBadge: { 
    position: "absolute", bottom: 0, right: 0, backgroundColor: "#6F4E37", 
    width: 32, height: 32, borderRadius: 16, justifyContent: "center", 
    alignItems: "center", borderWidth: 2, borderColor: "#FAF5F0" 
  },

  input: { backgroundColor: "#fff", marginBottom: 15 },
  registerBtn: { borderRadius: 12, marginTop: 10 },
  registerBtnContent: { height: 55 }, registerBtnLabel: { fontSize: 16, fontWeight: "bold" },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 25 },
  line: { flex: 1, height: 1, backgroundColor: '#EBE1D7' },
  orText: { marginHorizontal: 15, color: '#888', fontWeight: 'bold' },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  socialBtn: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    backgroundColor: '#fff', paddingVertical: 12, borderRadius: 12, 
    borderWidth: 1, borderColor: '#EBE1D7', marginHorizontal: 5 
  },
  socialText: { fontWeight: 'bold', color: '#333', marginLeft: 10 },

  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: "auto", marginBottom: 10 },
  footerText: { color: "#666" }, loginText: { color: "#6F4E37", fontWeight: "bold" },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
  modalFloating: { 
    backgroundColor: '#FAF5F0', borderRadius: 25, paddingHorizontal: 25, 
    paddingBottom: 30, paddingTop: 10, alignItems: 'center', elevation: 10, 
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 
  },
  closeModalBtn: { alignSelf: 'flex-end', margin: 0, marginRight: -15 },
  modalIconCircle: { 
    backgroundColor: '#EBE1D7', width: 80, height: 80, borderRadius: 40, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 15 
  },
  modalTitle: { fontWeight: 'bold', color: '#4A3B32', marginBottom: 10 },
  modalSubtitle: { color: '#666', textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  otpInput: { width: '100%', backgroundColor: '#fff', marginBottom: 20, textAlign: 'center', fontSize: 24, letterSpacing: 8 },
  verifyBtn: { width: '100%', borderRadius: 12 },

  resendContainer: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  resendText: { color: '#888', fontSize: 13 },
  resendLink: { color: '#6F4E37', fontWeight: 'bold', fontSize: 13 },
  resendLinkDisabled: { color: '#CCC' },
});

export default RegisterPage;