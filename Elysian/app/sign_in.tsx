import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { styles } from './sign_in.styles';

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
      <Text variant="headlineMedium" style={styles.title}>Welcome to Elysian!</Text>
      <Text variant="headlineSmall" style={styles.title}>Your Go-To Travel App</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button mode="contained" onPress={handleLogin}>
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
