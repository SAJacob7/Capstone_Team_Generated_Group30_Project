import { useState } from 'react';
import { View, StyleSheet, Alert} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { styles, inputTheme } from './app_styles.styles'; 

export default function CreateAccountScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateAccount = async () => {
    if (!name || !email || !password || !confirmPassword) { 
        Alert.alert("Mising Information", "Please fill in all fields.");
        return; 
    }
    
    if (password !== confirmPassword) { 
        Alert.alert("Passwords do not match", "Re-enter your password.")
    }
  };

  //sign up logic here ???

  const goToSignIn = () => {
    router.push("/sign_in");
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Sign Up Now</Text>
            <Text variant="bodyLarge" style={styles.subtext}>Fill in the details and create account.</Text>
      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        theme={inputTheme}
      />
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        style={styles.input}
        autoCapitalize="none"
        theme={inputTheme}
      />
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
        label="Create Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
        theme={inputTheme}
      />
        <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
        theme={inputTheme}
      />
      <Button
        mode="contained" 
        onPress={handleCreateAccount} 
        style={styles.button} 
        labelStyle={styles.buttonLabel}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>

      <View style={styles.signupContainer}>
        <Text>
          Already have an account?{" "}
          <Text style={styles.signupLink} onPress={goToSignIn}>Sign in</Text>
        </Text>
      </View>
    </View>
  );
}

