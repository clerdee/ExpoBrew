import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import Toast from "react-native-toast-message";

import { API_BASE_URL } from "../../configs/config";

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordSecure, setIsPasswordSecure] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Details",
        text2: "Please enter both email and password.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync("userToken", data.token);
        await SecureStore.setItemAsync("userInfo", JSON.stringify(data.user));

        Toast.show({
          type: "success",
          text1: "Welcome back!",
          text2: `Good to see you, ${data.user.name}!`,
        });

        if (data.user.role === 'admin') {
          navigation.replace('AdminHome');
        } else {
          navigation.replace('Home');
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: data.message,
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      Toast.show({
        type: "error",
        text1: "Connection Error",
        text2: "Could not connect to the server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="#4A3B32"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="coffee" size={60} color="#6F4E37" />
        </View>

        <Text variant="displaySmall" style={styles.title}>
          Welcome Back
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Log in to continue your coffee journey.
        </Text>

        <TextInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
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

        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          buttonColor="#6F4E37"
          contentStyle={styles.loginBtnContent}
          labelStyle={styles.loginBtnLabel}
          style={styles.loginBtn}
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </Button>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace("Register")}>
            <Text style={styles.registerText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5F0" },
  header: { paddingTop: 50, paddingHorizontal: 10, marginBottom: 10 },
  backBtn: { margin: 0 },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
    paddingBottom: 50,
  },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  title: {
    fontWeight: "bold",
    color: "#4A3B32",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: { color: "#666", marginBottom: 35, textAlign: "center" },
  input: { backgroundColor: "#fff", marginBottom: 15 },
  forgotPasswordContainer: { alignSelf: "flex-end", marginBottom: 25 },
  forgotPasswordText: { color: "#6F4E37", fontWeight: "600" },
  loginBtn: { borderRadius: 12, marginBottom: 30 },
  loginBtnContent: { height: 55 },
  loginBtnLabel: { fontSize: 16, fontWeight: "bold" },
  footerRow: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: "#666" },
  registerText: { color: "#6F4E37", fontWeight: "bold" },
});

export default LoginPage;
