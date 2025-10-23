import { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { styles } from './landing_page.styles';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/sign_in');
    }, 3000); // Router to sign in page after 3 seconds

    return() => clearTimeout(timer);
  }, [router]);
  
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Elysian</Text>
      <Image
        source={require('../assets/images/landing-page-image.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}
