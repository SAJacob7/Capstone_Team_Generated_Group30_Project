import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
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
    color: '#7D848D',
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
    fontWeight: 'bold',
  },

  signupContainer: {
    marginTop: 30,
    alignItems: 'center',
  },

  signupLink: {
    color: '#95CD00',
    fontWeight: '600',
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

  globeLoaderContainer: {
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // --- HOME / RECOMMENDATIONS SCREEN STYLES ---

  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  homeContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  homeTitle: {
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 34,
    color: '#008CFF',
    marginBottom: 24,
  },

  recommendButton: {
    alignSelf: 'center',
    width: '100%',
    borderRadius: 999,
    paddingVertical: 8,
    marginBottom: 24,
    backgroundColor: '#6540D8',
  },

  recommendButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },

  loader: {
    marginTop: 20,
  },

  resultsContainer: {
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1B1E28',
  },

  cityCard: {
    marginBottom: 18,
    borderRadius: 20, // Rounded corners
    backgroundColor: '#F7F4FF',
    elevation: 2,  // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },

  removeIconBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    padding: 6,
  },  

  removeIconBtnShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },  

  imageWrapper: {
    position: 'relative',
  },
  
  cityCardInner: {
    borderRadius: 20, // Clips content for rounded edges
    overflow: 'hidden', // Keeps image within rounded corners
  },

  cityImage: {
    width: '100%',
    height: 140,
  },

  cityImagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#E2DDFF',
  },

  cityInfo: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },

  cityScore: {
    fontSize: 13,
    color: '#666',
  },

  // --- CITY INFO MODAL ---

  cityModalContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },  

  cityModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1E28',
    marginBottom: 10,
  },

  cityModalImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },

  cityModalDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 14,
  },

  cityModalCloseBtn: {
    borderRadius: 999,
    backgroundColor: '#008CFF',
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
