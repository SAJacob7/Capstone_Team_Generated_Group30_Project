/* 
File: landing.tsx
Function: This is the Sign Up screen component for the app that allows users to create an account. Firebase is used to store new user credentials.
*/

import { useEffect, useRef } from 'react';
import { Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { styles } from './app_styles.styles';

// Define the navigation parameter list
export type RootParamList = {
  Login: undefined;
  Home: undefined;
  Landing: undefined;
};

// Define the type for Home screen navigation prop
type LandingScreenProp = NativeStackNavigationProp<RootParamList, 'Landing'>;

// Landing component
const Landing = () => {
  // Initialize navigation with type safety
  const navigation = useNavigation<LandingScreenProp>();

  const fadeAnim = useRef(new Animated.Value(1)).current; // Start fully visible
  
  useEffect(() => {
    // Set a timer to start fade out after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0, // Fade to invisible
        duration: 1000, // Fade out duration (ms)
        useNativeDriver: true,
      }).start(() => {
        // Navigate to Login screen after fading out
        navigation.push('Login');
      });
    }, 3000); // Delay duration before starting fade out animation

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text variant="displayMedium" style={styles.title}>Elysian</Text>

      <Image
        source={require('../../assets/landing-page-image.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

export default Landing;
