import { useEffect, useRef } from 'react';
import { Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from 'react-native-paper';
import { styles } from './app_styles.styles';

type LandingScreenProp = NativeStackNavigationProp<RootParamList, 'landing'>;
export type RootParamList = {
  login: undefined;
  home: undefined;
  landing: undefined;
};

const landing = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start fully visible
  const navigation = useNavigation<LandingScreenProp>();
  

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fade out animation before navigating
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000, // Fade out duration (ms)
        useNativeDriver: true,
      }).start(() => {
        navigation.push('login');
      });
    }, 3000);

    return () => clearTimeout(timer);
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
export default landing;
