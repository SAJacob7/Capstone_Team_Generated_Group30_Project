import { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { styles } from './app_styles.styles';

export default function LandingPage() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start fully visible

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fade out animation before navigating
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000, // Fade out duration (ms)
        useNativeDriver: true,
      }).start(() => {
        router.push('/sign_in');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text variant="displayMedium" style={styles.title}>Elysian</Text>
      <Image
        source={require('../assets/images/landing-page-image.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}