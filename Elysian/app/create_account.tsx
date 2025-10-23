import { useState } from 'react';
import { View, StyleSheet, Alert} from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { styles } from './create_account.styles'; 

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
      <Text variant="headlineMedium" style={styles.title}>Create an Account</Text>
      <TextInput
        label="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Create Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
        <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button
        mode="contained"
        onPress={handleCreateAccount}
        loading={loading}
        style={styles.button}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>

      <View style={styles.signinContainer}>
        <Text>
          Already have an account?{" "}
          <Text style={styles.signinLink} onPress={goToSignIn}>Sign in</Text>
        </Text>
      </View>
    </View>
  );
}

