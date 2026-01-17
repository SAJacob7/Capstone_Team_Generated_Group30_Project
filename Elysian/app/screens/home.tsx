import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './app_styles.styles';

const Home = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.subtext}>Home Screen</Text>
    </View>
  );
};

export default Home;