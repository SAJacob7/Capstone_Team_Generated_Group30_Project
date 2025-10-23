import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from 'expo-router';

const LandingPage = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* App logo */}
      {/* <Image
        source={require("../assets/react-logo.png")}
        style={styles.logo}
        resizeMode="contain"
      /> */}

      {/* Title and tagline */}
      <Text style={styles.title}>Welcome to Elysian ✈️</Text>
      <Text style={styles.subtitle}>
        Your personalized travel companion - discover new places made just for you.
      </Text>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/create_account")}
      >
        <Text style={styles.primaryText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.navigate("Login" as never)}
      >
        <Text style={styles.secondaryText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LandingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#11181C",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#687076",
    textAlign: "center",
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: "#00A7A4",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 15,
  },
  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    borderColor: "#00A7A4",
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  secondaryText: {
    color: "#00A7A4",
    fontSize: 16,
    fontWeight: "600",
  },
});
