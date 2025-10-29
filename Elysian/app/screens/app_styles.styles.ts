import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF'
  },

  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#008CFF',
  },

  subtext: {
    marginBottom: 24,
    textAlign: 'center',
    color: "#7D848D"
  },

  input: {
    marginBottom: 16,
    paddingHorizontal: 10,
    height: 60,
    fontSize: 18,
  },

  button: {
    borderRadius: 50,
    marginTop: 8,
    paddingVertical: 6,
    height: 60,
    backgroundColor: '#008CFF',
    justifyContent: 'center',
  },

  buttonLabel: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: "bold"
  },

  signupContainer: {
    marginTop: 30,
    alignItems: "center",
  },

  signupLink: {
    color: "#95CD00",
    fontWeight: "600",
  },

  image: {
    width: 350,
    height: 350,
    marginTop: 20,
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10, // Minimal vertical spacing
    columnGap: 10, // Consistent spacing between columns (if RN 0.71+)

  },

  answerButton: {
    flexBasis: '48%', // Two buttons per row
    height: 120,
    backgroundColor: '#F7F7F9', // Same light gray as input background
    borderColor: '#E5E5E5',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // Subtle shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  answerButtonSelected: {
    backgroundColor: '#008CFF', // Brand blue when selected
    shadowOpacity: 0.2,
  },

  answerText: {
    color: '#1B1E28',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },

  answerTextSelected: {
    color: '#FFFFFF', // White text on blue button
    fontWeight: '700',
  },

  questionText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1B1E28',
    marginBottom: 24,
    paddingHorizontal: 10,
  },

});

export const inputTheme = {
  roundness: 50,
  colors: {
    primary: '#008CFF', // Underline and label when focused
    background: '#F7F7F9', // Input background color
    text: '#1B1E28', // Input text color
    placeholder: '#807f7fff', // Label/placeholder color
    outline: 'transparent',
  },
};

export const selectedColors = [
  '#95CD00',
  '#F49F9A',
  '#FBD605',
];