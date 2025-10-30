/* 
File: profile.tsx
Function: This is the user Profile screen component for the app. 
*/

import { View } from 'react-native';
import { Text, } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from './app_styles.styles';

// Define the navigation parameter list
export type RootParamList = {
  Profile: undefined;
};

// Define the type for Profile screen navigation prop
type ProfileScreenProp = NativeStackNavigationProp<RootParamList, 'Profile'>;

// Profile component
const Profile = () => {
  // Initialize navigation with type safety
  const navigation = useNavigation<ProfileScreenProp>();
  return (
    <View style={[styles.container, { flex: 1 }]}>
      <Text variant="headlineLarge" style={styles.title}>Profile</Text>
    </View>
  );
}

export default Profile;