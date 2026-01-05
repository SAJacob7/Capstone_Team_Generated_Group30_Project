/* 
File: profile_landing.tsx
Function: This is the Profile Landing screen component for the app before displaying the Profile Setup screen component.
*/

import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { styles } from './app_styles.styles';

// Define the navigation parameter list
export type RootParamList = {
  ProfileSetup: undefined;
  ProfileLanding: undefined;
};

// Define the type for Home screen navigation prop
type ProfileLandingScreenProp = NativeStackNavigationProp<RootParamList, 'ProfileLanding'>;

// Profile Landing component
const ProfileLanding = () => {
  // Initialize navigation with type safety
  const navigation = useNavigation<ProfileLandingScreenProp>();
  
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
        navigation.push('ProfileSetup');
      });
    }, 500); // Delay duration before starting fade out animation

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text variant="headlineMedium" style={styles.title}>Let's get to know you better!</Text>
      
      <Text variant="bodyLarge" style={styles.title}>Answers these questions so we can curate the best places for you!</Text>
    </Animated.View>
  );
}

export default ProfileLanding;
