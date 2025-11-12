/* 
File: profile_setup.tsx
Function: This is the Profile Setup screen component for the app. Users answer questions to curate their travel profile.
*/

import { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { inputTheme, styles, selectedColors } from './app_styles.styles';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { getAuth } from 'firebase/auth';

// Define the type for Home screen navigation prop
export type RootParamList = {
  ProfileSetup: undefined;
  Home: undefined;
  NavigationBar: undefined;
};

// Define the type for Home screen navigation prop
type ProfileSetUpScreenProp = NativeStackNavigationProp<RootParamList, 'ProfileSetup'>;

// Profile Setup component
const ProfileSetup = () => {
  // Initialize navigation with type safety
  // test
  const navigation = useNavigation<ProfileSetUpScreenProp>();

  // List of questions for user
  const questions = [{question: "Where are you traveling from?", answer: []},
    {question: "What type of vacation are you looking for?", answer: ["Beach", "City", "Historical", "Adventure", "Nature", "Religious"]},
    {question: "What seasons do you like?", answer: ["Spring", "Summer", "Fall", "Winter"]},
    {question: "What is your budget?", answer: ["Budget Friendly", "Mid-Range", "Luxury", "Premium"]},
    {question: "What has been your favorite country you've visted?", answer: []},
    {question: "How far do you want to travel?", answer: ["Within your Country", "Within your Continent", "Outside of your Continent", "Anywhere"]},
    {question: "What type of place do you like?", answer: ["Quiet", "Moderate", "Busy"]},
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Stores the index of the current question
  const [chosenAnswers, setChosenAnswers] = useState<{ [key: number]: string[] }>({}); // Stores the choosen answer for each multi-select questions
  const [typedAnswer, setTypedAnswer] = useState(""); // Stores the typed answer for the short answer questions 
  const [responses, setResponses] = useState<{ [key: number]: string[] | string }>({}); // Stores all the responses the user has made (typed + multiple choice)
  
  const currentQuestion = questions[currentQuestionIndex]; // Sets the current question based on current inde
  const isShortAnswer = currentQuestion.answer.length === 0; // If there is no answers to display, it is a short answer question; otherwise, it's multi-select

  // Count how many previous questions have answer buttons
  const buttonQuestionIndex = questions
    .slice(0, currentQuestionIndex)
    .filter(q => q.answer.length > 0).length;

  // Pick color from the 4-color cycle
  const currentSelectedColor = selectedColors[buttonQuestionIndex % selectedColors.length];


  // Handles user selection for mutli-select questions
  const answerSelected = (answer: string) => {
    const currentAnswers = chosenAnswers[currentQuestionIndex] || []; // Get the current list of answers if any are selected; otherwise, current list is empty
    // If the user is clicking on an answer already selected, then unselect it.
    if (currentAnswers.includes(answer)) {
        setChosenAnswers({
            ...chosenAnswers,[currentQuestionIndex]: currentAnswers.filter((a) => a!== answer), // Update the current answer to remove the unselected answer
        });
    }
    
    // Otherwise, the user wants to select this answer, so add it to the selection
    else {
        setChosenAnswers({
            ...chosenAnswers, [currentQuestionIndex]: [...currentAnswers, answer]
        })
    }
  };

  // Handles submission of answers and stores it in Firebase
  const handleSubmit = async (finalResponses: { [key: number]: string[] | string }) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Error, User must be signed in!');
      return;
    }

    try{
      const userDocRef = doc(FIREBASE_DB, 'userProfiles', user.uid);
      await setDoc(userDocRef, {responses: finalResponses}, {merge: true});
      alert('Success, Your Answers have been saved!');
    }
    catch (error) {
      console.error('Encountered an error while saving your answer:', error);
      alert('Error, There was an werror while saving your answers.')
    }
  };

  // Handles action when next button is selected
  const nextQuestion = () => {
    // Check that there is an answer typed for short answer questions
    if (isShortAnswer && typedAnswer.trim() === "") {
      alert("Answer required. Please type an answer.")
      return;
    }
    
    // Check that there is an answer selected for multi-select questions
    if (!isShortAnswer && (!chosenAnswers[currentQuestionIndex] || chosenAnswers[currentQuestionIndex].length === 0)){
      alert("Answer required. Please select an answer.")
      return;
    }

    // Now, save the reponse of the user for the current question before going to the next question
    setResponses((current) => ({
        ...current, [currentQuestionIndex]: isShortAnswer ? typedAnswer : chosenAnswers[currentQuestionIndex],
    }));
    
    // Go to the next question after saving the response of the current question
    // Ensure that this is not the final question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((current) => current + 1); // Set the current question index to the next index
      setTypedAnswer(""); // Reset the typed answer to empty so that the user can type in new answers
    } 
    
    // Otherwise, the user has answered all questions
    // Navigate to home page
    else {
      const finalResponses = {
        ...responses, [currentQuestionIndex]: isShortAnswer ? typedAnswer : chosenAnswers[currentQuestionIndex],
      }
      handleSubmit(finalResponses);
      console.log("All User Responses: ", responses); // Print response
      navigation.replace("NavigationBar"); // Navigate to NavigationBar once user is done with questions
    }
  };

  return (
    <View style={styles.container}>
      {/* Display the question. */}
      <Text style={styles.questionText}>{currentQuestion.question}</Text>

      {/* If the question is a short answer question, display like this: */}
      {isShortAnswer ? (
        <TextInput
          label="Type Answer: "
          value={typedAnswer}
          onChangeText={setTypedAnswer}
          mode="outlined"
          style={styles.input}
          theme={inputTheme}
        />
      ) : (
      <View style={styles.gridContainer}>
        {currentQuestion.answer.map((answer, index) => {
          const selected = chosenAnswers[currentQuestionIndex]?.includes(answer);

        return (
          <TouchableOpacity
            key={index}
            onPress={() => answerSelected(answer)}
            activeOpacity={0.8}
            style={[
              styles.answerButton,
              selected && styles.answerButtonSelected,
              selected && selected && { backgroundColor: currentSelectedColor },
            ]}
          >
          <Text
            style={[
              styles.answerText,
              selected && styles.answerTextSelected,
            ]}
          >
            {answer}
          </Text>
          </TouchableOpacity>
        );
        })}
      </View>
      )}

      {/* Next or Finish button */}
        <Button
          mode="contained"
          onPress={nextQuestion}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          {currentQuestionIndex < questions.length - 1 ? "Next" : "Generate Recommendations!"}
        </Button>
    </View>
  );
};

export default ProfileSetup;
