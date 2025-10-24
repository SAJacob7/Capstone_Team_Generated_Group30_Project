import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from './app_styles.styles';

type ProfileSetUpScreenProp = NativeStackNavigationProp<RootParamList, 'profileSetUp'>;
export type RootParamList = {
  profileSetUp: undefined;
};
const profileSetUp = () => {
  const navigation = useNavigation<ProfileSetUpScreenProp>();
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Profile Set Up Page</Text>
    </View>
  );
}
export default profileSetUp;