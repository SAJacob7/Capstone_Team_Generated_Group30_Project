/* 
File: navigation_bar.tsx
Function: This is the Navigation Bar component for the Home and Profile screen. 
*/

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { inputTheme } from './app_styles.styles';
import Icon from 'react-native-vector-icons/Ionicons';
import Home from './home';
import Profile from './profile';

// Define the navigation parameter list
export type RootTabParamList = {
  Home: undefined;
  Profile: undefined;
  Profile1: undefined;
};

// Define the type for Navigation bar screen navigation prop
const Tab = createBottomTabNavigator<RootTabParamList>();

export default function NavigationBar() {
  // Dictionary to map page screens to icon names from Ionicons. https://ionic.io/ionicons
  const icons: { [key: string]: string } = { 
    Home: "home-outline",
    Profile: "person-circle-outline",
    Profile1: "heart-circle-outline", // Update
    };
    
    return (
    // Create the navigation bar 
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => <Icon name={icons[route.name]} size={30} color={color} />, // tabBarIcon looksup what key from icons, sets size, and color. 
        tabBarActiveTintColor: inputTheme.colors.primary, 
        tabBarInactiveTintColor: inputTheme.colors.placeholder,
        headerShown: false, // Remove header 
        tabBarShowLabel: false, // Remove labels below icon
      })}
    >
      {/* Define individual tab pages */}
      <Tab.Screen name="Home" component={Home} /> 
      <Tab.Screen name="Profile" component={Profile} />
      {/* Update */}
      <Tab.Screen name="Profile1" component={Profile} /> 
    </Tab.Navigator>
  );
}