import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { styles } from './app_styles.styles';

export default function HomePage() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Your Adventure Starts Here!</Text>
    </View>
  );
}
