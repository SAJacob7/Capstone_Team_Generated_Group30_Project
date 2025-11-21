/* 
File: profile.tsx
Function: This is the user Profile screen component for the app. 
*/

import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { styles, inputTheme } from './app_styles.styles';

// List of questions in questionaire 
const questions = [
  "Where are you traveling from?", 
  "What type of vacation are you looking for?", 
  "What seasons do you like?",
  "What is your budget?",
  "What has been your favorite country you've visted?", 
  "How far do you want to travel?", 
  "What type of place do you like?" 
];

// Define the navigation parameter list
export type RootParamList = {
  Profile: undefined;
  Login: undefined;
};

// Define the type for Profile screen navigation prop
type ProfileScreenProp = NativeStackNavigationProp<RootParamList, 'Profile'>;

// Profile component
const Profile = () => {
  // Initialize navigation with type safety
  const navigation = useNavigation<ProfileScreenProp>();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [responses, setResponses] = useState<{ [key: string]: string[] | string }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
      const fetchUserData = async () => {
        if (currentUser) {
          setUser(currentUser);

          const userDoc = await getDoc(doc(FIREBASE_DB, 'users', currentUser.uid)); // Fetch user data from Firestore 
          setUsername(userDoc.exists() ? userDoc.data().username : null);

          const profileDoc = await getDoc(doc(FIREBASE_DB, 'userProfiles', currentUser.uid)); // Fetch questionaire responses 
          if (profileDoc.exists()) {
            setResponses(profileDoc.data()?.responses || {});
          }
        } else {
          navigation.replace('Login');
        }
      };

      fetchUserData();
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {user ? (
            <>
              {/* Profile Picture, Username, Name, and Email */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
                <Image
                  source={
                    user.photoURL
                      ? { uri: user.photoURL }
                      : require('../../assets/profile.jpg')
                  }
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    marginRight: 20,
                    marginLeft: 25,
                  }}
                />
                <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                  <Text style={[styles.title, { fontSize: 30, marginTop: 30, marginBottom: 10 }]}>
                    @{username}
                  </Text>
                  <Text style={[styles.subtext, { fontSize: 20, marginBottom: 10 }]}>
                    {user.displayName}
                  </Text>
                  <Text style={[styles.subtext, { fontSize: 20 }]}>
                    {user.email}
                  </Text>
                </View>
              </View>

              {/* Questions and Reponses */}
              <View>
                {questions.map((q, index) => {
                  const answer = responses[index] ?? responses[index.toString()];

                  return (
                    <View key={index} style={[styles.answerButton]}>
                      <Text style={styles.answerText}>{q}</Text>
                      <Text style={{ fontSize: 15, color: inputTheme.colors.primary, marginTop: 4 }}>
                        {Array.isArray(answer) ? answer.join('\n') : answer || 'No answer yet'}
                      </Text>
                    </View>
                  );
                })}
              </View>
              {/* Logout Button */}
              <Button
                mode="contained"
                onPress={() => signOut(FIREBASE_AUTH)}
                style={[styles.button, { marginTop: 30, marginBottom: 20 }]}
                labelStyle={styles.buttonLabel}
              >
                Logout
              </Button>
            </>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Profile;