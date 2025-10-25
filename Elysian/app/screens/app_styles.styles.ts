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
    flexDirection: "row",
    flexWrap: "wrap", // allows buttons to wrap to new rows automatically
    justifyContent: "space-between",
    marginVertical: 20,
  },

  answerButton: {
    width: "48%",            // fits two buttons per row with a small gap
    aspectRatio: 1,          // keeps them square regardless of screen size
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f5f5f5",
  },

  answerButtonSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },

  answerText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },

  answerTextSelected: {
    color: "#fff",
  },
});

export const inputTheme = {
  roundness: 50,
  colors: {
    primary: '#008CFF',    // Underline and label when focused
    background: '#F7F7F9', // Input background color
    text: '#1B1E28',       // Input text color
    placeholder: '#807f7fff', // label/placeholder color
    outline: 'transparent',
  },
};