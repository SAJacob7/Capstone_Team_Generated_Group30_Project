import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { styles } from './app_styles.styles';

type ProfileLandingScreenProp = NativeStackNavigationProp<RootParamList, 'profileLanding'>;
export type RootParamList = {
  profileSetUp: undefined;
  profileLanding: undefined;
};

const profileLanding = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start fully visible
  const navigation = useNavigation<ProfileLandingScreenProp>();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Fade out animation before navigating
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300, // Fade out duration (ms)
        useNativeDriver: true,
      }).start(() => {
        navigation.push('profileSetUp');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text variant="headlineMedium" style={styles.title}>Let's get to know you better!</Text>
      <Text variant="bodyLarge" style={styles.title}>Answers these questions so we can curate the best places for you!</Text>
    </Animated.View>
  );
}

export default profileLanding;