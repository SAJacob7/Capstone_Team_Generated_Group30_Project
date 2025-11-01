/* 
File: App.tsx
Function: This is the main entry point of the React Native app. It defines the app's navigation structure using React Navigation's Native Stack Navigator. Each screen is registered here and can be navigated between throughout the app.
*/

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './app/screens/login';
import Home from './app/screens/home';
import Landing from './app/screens/landing';
import SignUp from './app/screens/sign_up';
import ProfileLanding from './app/screens/profile_landing';
import ProfileSetup from './app/screens/profile_setup';
import Profile from './app/screens/profile';
import NavigationBar from './app/screens/navigation_bar';

// Create a stack navigator instance
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // NavigationContainer manages the navigation tree and history
    <NavigationContainer> 
      <Stack.Navigator initialRouteName = 'Landing'>
        <Stack.Screen name='Landing' component={Landing} options={({ headerShown: false})} />
        <Stack.Screen name='Login' component={Login} options={({ headerShown: false})} />
        <Stack.Screen name='Home' component={Home} options={({ headerShown: false})} />
        <Stack.Screen name='SignUp' component={SignUp} options={({ headerShown: false})} />
        <Stack.Screen name='ProfileLanding' component={ProfileLanding} options={({ headerShown: false})} />
        <Stack.Screen name='ProfileSetup' component={ProfileSetup} options={({ headerShown: false})} />
        <Stack.Screen name='Profile' component={Profile} options={({ headerShown: false})} />
        <Stack.Screen name='NavigationBar' component={NavigationBar} options={({ headerShown: false})} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
