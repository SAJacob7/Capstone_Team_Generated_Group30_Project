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
  const questions = [{question: "Where are you traveling from?", answer: []},
    {question: "What type of vacation are you looking for?", answer: ["Beach", "City", "Historical", "Adventure", "Nature", "Religious"]},
    {question: "What seasons do you like?", answer: ["Spring", "Summer", "Fall", "Winter"]},
    {question: "What is your budget?", answer: ["Budget Friendly", "Mid-Range", "Luxury", "Premium"]},
    {question: "What has been your favorite country you've visted?", answer: []},
    {question: "How far do you want to travel?", answer: ["Within your Country", "Within your Continent", "Outside of your Continent", "Anywhere"]},
    {question: "What type of place do you like?", answer: ["Quiet", "Moderate", "Busy"]},
  ];
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>Profile Set Up Page</Text>
      <Text variant="headlineMedium" style={styles.title}>Answer the following questions for your reccomendations!</Text>
    </View>
  );
}
export default profileSetUp;