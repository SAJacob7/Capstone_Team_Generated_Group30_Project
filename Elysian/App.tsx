import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import login from './app/screens/login';
import home from './app/screens/home';
import landing from './app/screens/landing';
import signUp from './app/screens/sign_up';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer> 
      <Stack.Navigator initialRouteName = 'landing'>
        <Stack.Screen name='landing' component={landing} options={({ headerShown: false})} />
        <Stack.Screen name='login' component={login} options={({ headerShown: false})} />
        <Stack.Screen name='home' component={home} options={({ headerShown: false})} />
        <Stack.Screen name='signUp' component={signUp} options={({ headerShown: false})} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

