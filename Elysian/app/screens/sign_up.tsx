import { View, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import React, { useState, useEffect } from 'react';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { styles, inputTheme } from './app_styles.styles';
import { 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define your navigation param list
export type RootParamList = {
  login: undefined;
  home: undefined;
  signUp: undefined;
  profileLanding: undefined;
};

type SignUpScreenProp = NativeStackNavigationProp<RootParamList, 'signUp'>;

const signUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation<SignUpScreenProp>();

  const handleCreateAccount = async () => {
    if (!name || !email || !password || !confirmPassword) { 
        Alert.alert("Mising Information", "Please fill in all fields.");
        return; 
    }
    
    if (password !== confirmPassword) { 
        Alert.alert("Passwords do not match", "Re-enter your password.")
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
      const user = userCredential.user;
      // Below line should remember user name in session, but not sure if working.
      // await updateProfile(user, { displayName: name });
      navigation.push('profileLanding'); // Navigate to profile page set up once account created.
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Commented out for now, because it doesn't work fully.
  // Auto-login / session persistence
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
  //     if (currentUser) {
  //       navigation.replace('home'); // Navigate to Home if already logged in
  //     }
  //   });

  //   return () => unsubscribe();
  // }, []);

  const goToSignIn = async () => {
    navigation.push('login')
  }

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
        textContentType="newPassword"
        theme={inputTheme}
      />
        <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
        textContentType="newPassword"
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
};

export default signUp;