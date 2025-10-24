import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { styles, inputTheme } from './app_styles.styles';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Logging in with:', email, password);
    // Replace with real auth logic
    router.push('/home_page');
  };
  const signUp = () => {
    router.push("/sign_up");
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Sign In Now</Text>
      <Text variant="bodyLarge" style={styles.subtext}>Please sign in to start your adventure!</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        theme={inputTheme}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
        theme={inputTheme}
      />
      <Button 
        mode="contained" 
        onPress={handleLogin} 
        style={styles.button} 
        labelStyle={styles.buttonLabel}>
        Login
      </Button>
      
      <View style={styles.signupContainer}>
        <Text>
          Don't have an account?{" "}
          <Text style={styles.signupLink} onPress={signUp}>
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
}
