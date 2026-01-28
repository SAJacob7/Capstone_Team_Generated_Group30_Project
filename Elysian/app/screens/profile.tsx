/* 
File: profile.tsx
Function: This is the user Profile screen component for the app. 
*/

import React, { useEffect, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { onAuthStateChanged, signOut, User, updateProfile } from 'firebase/auth';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { query, where, collection, getDocs } from 'firebase/firestore';
import { styles, inputTheme } from './app_styles.styles';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// List of questions in questionaire 
const questions = [
  "Where are you traveling from?",
  "What type of vacation are you looking for?",
  "What seasons do you like?",
  "What is your budget?",
  "What has been your favorite country you've visited?",
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
  const [user, setUser] = useState<User | null>(null); // Stores the user 
  const [username, setUsername] = useState<string | null>(null); // Stores the username 
  const [responses, setResponses] = useState<{ [key: string]: string[] | string }>({}); // Stores the user responses to the questionnaire 
  const [isEditing, setIsEditing] = useState(false); // False: user is viewing profile and True: user is editing profile 
  const [editedName, setEditedName] = useState(''); // Temporary value for when user is editing 
  const [editedUsername, setEditedUsername] = useState(''); // Temporary value for when user is editing 
  const [error, setError] = useState(''); // Stores error 
  const [questionsVisible, setQuestionsVisible] = useState(false); // Pop up is open or closed 

  // Function to check if username is already taken 
  const isUsernameTaken = async (usernameCheck: string) => { // usernameCheck = username user wants to change to 
    const q = query( // Queries users database and checks if username is equal usernameCheck
      collection(FIREBASE_DB, 'users'), 
      where('username', '==', usernameCheck)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if username exists
  };

  // Edit profile logic 
  const handleEditProfile = () => {
    setEditedName(user?.displayName || '');
    setEditedUsername(username || '');
    setIsEditing(true); // User is editing 
  };

  // Save profile logic 
  const handleSaveProfile = async () => {
    if (!user) return;

    setError(''); // Clear any errors 

    if (!editedName.trim() || !editedUsername.trim()) { // No blank names or usernames 
      setError('Name and username cannot be empty.');
      return;
    }

    if (editedUsername !== username && await isUsernameTaken(editedUsername)) { // No duplicate usernames 
      setError('This username is already taken.');
      return;
    }

    try { 
      await updateProfile(user, { displayName: editedName }); // Update Firebase displayName
      await updateDoc(doc(FIREBASE_DB, 'users', user.uid), {username: editedUsername,}); // Update Firestore username
      setUsername(editedUsername);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile. Please try again.');
    }
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (currentUser) => {
      if (!currentUser) {
        navigation.push('Login');
        return;
      }

      setUser(currentUser);

      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', currentUser.uid));
      setUsername(userDoc.exists() ? userDoc.data().username : null);

      const profileDoc = await getDoc(doc(FIREBASE_DB, 'userProfiles', currentUser.uid));
      if (profileDoc.exists()) {
        setResponses(profileDoc.data()?.responses || {});
      }
    });

    return unsubscribe;
  }, );

  return (
    <View style={styles.container}>
      <View style={{ position: 'absolute', top: 60, right: 15, zIndex: 10 }}>
        <TouchableOpacity onPress={() => setQuestionsVisible(true)}>
          {/* Menu button */}
          <MaterialCommunityIcons name="menu" size={25} color="#000" /> 
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Profile image and edit button */}
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../../assets/profile.jpg')}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={handleEditProfile}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Name and username */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{user?.displayName}</Text>
          <Text style={styles.username}>@{username}</Text>
        </View>

        {/* Name and username edit fields */}
        {isEditing && (
          <View style={styles.container}>
            <TextInput
              value={editedName}
              onChangeText={setEditedName}
              style={styles.input}
              placeholder="Name"
              theme={inputTheme}
              mode='outlined'
            />

            <TextInput
              value={editedUsername}
              onChangeText={setEditedUsername}
              style={styles.input}
              placeholder="Username"
              autoCapitalize="none"
              theme={inputTheme}
              mode="outlined"
            />

            {error ? (
              <Text style={styles.editError}>{error}</Text>
            ) : null}

            <Button
              mode="contained" 
              onPress={handleSaveProfile} 
              style={styles.button} 
              labelStyle={styles.buttonLabel}
            >
              Save
            </Button>
          </View>
        )}

        {/* Menu pop up */} 
        <Modal 
          visible={questionsVisible}
          onRequestClose={() => setQuestionsVisible(false)} 
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={{ position: 'absolute', top: 10, right: 15, zIndex: 10 }}
                onPress={() => setQuestionsVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={28} color="#000" />
              </TouchableOpacity>
              <ScrollView style={{ paddingTop: 20 }}>
                {questions.map((q, index) => {
                  const answer = responses[index] ?? responses[index.toString()];
                  return (
                    <View key={index} style={styles.answerButton}>
                      <Text style={styles.answerText}>{q}</Text>
                      <Text>
                        {Array.isArray(answer) ? answer.join('\n') : answer || 'No answer yet'}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
              
              {/* Logout button */} 
              <Button
                mode="contained"
                onPress={() => signOut(FIREBASE_AUTH)}
                style={[styles.button]}
                labelStyle={styles.buttonLabel}
              >
                Logout
              </Button>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default Profile;
