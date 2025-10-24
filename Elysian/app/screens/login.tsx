import { View, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import React, { useState, useEffect } from 'react';
import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { styles, inputTheme } from './app_styles.styles';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged
} from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define your navigation param list
export type RootParamList = {
  login: undefined;
  home: undefined;
  signUp: undefined;
};

type LoginScreenProp = NativeStackNavigationProp<RootParamList, 'login'>;

const login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<LoginScreenProp>();

  // Auto-login / session persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      if (currentUser) {
        navigation.replace('home'); // Navigate to Home if already logged in
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email.trim(),
        password.trim()
      );
      console.log('Signed in user:', response.user);
      Alert.alert('Success', `Welcome back, ${response.user.email}`);
    } catch (error: any) {
      console.log('Sign-in error:', error.code, error.message);
      Alert.alert('Sign-in Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () =>{
    navigation.push('signUp')
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
        onPress={signIn} 
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
};

export default login;


