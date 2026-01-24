import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Image, Pressable, Modal, Dimensions, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Card} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { styles } from './app_styles.styles';
import { Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';


// Define the navigation parameter list
export type RootParamList = {
  Home: undefined;
  Recommendations: {recommendations: Recommendation[]};
  Liked: undefined;
};

interface Recommendation {
  city_id: string;
  city_name: string;
  country: string;
  score: number;
  description?: string;
  image?: string;
}

type City = {
    city_name: string;
    country_name: string;
    score: number;
    };

// Define the type for Home screen navigation prop
type RecommendationScreenProp = NativeStackNavigationProp<RootParamList, 'Recommendations'>;

// Cute spinning globe loader
const GlobeLoader = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.globeLoaderContainer}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <MaterialCommunityIcons name="earth" size={40} color="#6540D8" />
      </Animated.View>
    </View>
  );
};


// Home component
const Recommendations = () => {
  // Initialize navigation with type safety
  const navigation = useNavigation<RecommendationScreenProp>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<Recommendation | null>(null);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const screenWidth = Dimensions.get('window').width;
  const position = useRef(new Animated.ValueXY()).current;
  const doubleTap = useRef<number | null>(null);
  const [currentCity, setCurrentCity] = useState<Recommendation | null>(null);
  const currentCityRef = useRef<Recommendation | null>(null);

  useEffect(() => {
    currentCityRef.current = currentCity;
  }, [currentCity]);

  const fetchWikivoyageIntro = async ( cityName: string, country: string): Promise<string | null> => {
    const titlesToTry = [
      cityName,
      `${cityName}, ${country}`,
      `${cityName} (${country})`,
    ];
  
    for (const title of titlesToTry) {
      try {
        const url =
          `https://en.wikivoyage.org/w/api.php` +
          `?action=query&format=json&origin=*` +
          `&prop=extracts&exintro=1&explaintext=1&redirects=1` +
          `&titles=${encodeURIComponent(title)}`;
  
        const res = await fetch(url);
        const data = await res.json();
  
        const pages = data?.query?.pages;
        if (!pages) continue;
  
        const page = pages[Object.keys(pages)[0]];
        const extract = page?.extract;
  
        if (
          extract &&
          !extract.toLowerCase().includes('more than one place') &&
          !extract.toLowerCase().includes('may refer to')
        ) {
          return extract;
        }
      } catch {
        continue;
      }
    }
  
    return null;
  };
  
  const shorten = (text: string, sentences = 3) => {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return '';
    const parts = cleaned.split('. ');
    const sliced = parts.slice(0, sentences).join('. ');
    return sliced.endsWith('.') ? sliced : sliced + '.';
  };
  
  const fetchWikipediaSummary = async (title: string) => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  };

  const isFlagImage = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('flag') || lower.includes('flag_of');
  };  
  
  const fetchCityInfo = async (cityName: string, country: string) => {
    try {
      // 1) Travel-style text first from Wikivoyage
      const voyText = await fetchWikivoyageIntro(cityName, country);
      // 2) Wikipedia fallback
      let wikiData = await fetchWikipediaSummary(cityName);
      if (!wikiData) {
        wikiData = await fetchWikipediaSummary(`${cityName}, ${country}`);
      }
  
      const wikiText: string | null = wikiData?.extract || null;
      const rawImage =
        wikiData?.originalimage?.source ||
        wikiData?.thumbnail?.source;
        
      const image = isFlagImage(rawImage) ? undefined : rawImage;
  
      const descriptionRaw = voyText || wikiText || '';
      const description = descriptionRaw
        ? shorten(descriptionRaw, 3)
        : 'No description available.';
  
      return { description, image };
    } catch (err) {
      console.error('Error fetching city info:', err);
      return { description: 'No description available.', image: undefined };
    }
  };  

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("No user");

        const city = await fetchNextCity(user.uid);
        const extra = await fetchCityInfo(city.city_name, city.country);
        setCurrentCity({ ...city, ...extra });
        console.log(currentCity)

      } catch (err) {
        console.error(err);
        setError("Failed to get recommendations");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  const rightSwipe = async (cityId: string, city: City) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      alert('Error, User must be signed in!');
      return;
    }

    try {
      const userDocRef = doc(FIREBASE_DB, 'userFavorites', user.uid);
      await setDoc(userDocRef, {[`${cityId}`]: city}, {merge: true});
      // await sendSwipe(user.uid, cityId, true); // Update backend with the swipe
      const nextCity = await fetchNextCity(user.uid);
      const extra = await fetchCityInfo(nextCity.city_name, nextCity.country);
      setCurrentCity({ ...nextCity, ...extra });
    }
    catch (error) {
      console.error('Encountered an error while saving your favorites:', error);
      alert('Error, There was an error while saving your favorites.')
    }
  }

  const leftSwipe = async (cityId: string, city: City) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('Error, User must be signed in!');
      return;
    }

    try{
      const userDocRef = doc(FIREBASE_DB, 'userDislikes', user.uid);
      await setDoc(userDocRef, {[`${cityId}`]: city}, {merge: true});
      // await sendSwipe(user.uid, cityId, false); // Update backend with the swipe
      const nextCity = await fetchNextCity(user.uid);
      const extra = await fetchCityInfo(nextCity.city_name, nextCity.country);
      setCurrentCity({ ...nextCity, ...extra });
    }
    catch (error) {
      console.error('Encountered an error while saving your dislikes:', error);
      alert('Error, There was an error while saving your dislikes.')
    }
  }

async function getUserProfileAnswers(userId: string) {
  const ref = doc(FIREBASE_DB, "userProfiles", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("User profile not found");
  }

  const data = snap.data();
  const responses = data.responses;

  return {
    origin_country: responses[0],
    vacation_types: responses[1] || [],
    seasons: responses[2] || [],
    budget: responses[3] || [],
    favorite_country_visited: responses[4],
    place_type: responses[5] || []
  };
}

  async function fetchNextCity(userId: string) {
    // You need to supply the same profile answers you used to generate recs.
    // If you stored them in Firestore, read them here; for now assume you have them.
    const profile = await getUserProfileAnswers(userId);

    const res = await fetch('https://capstone-team-generated-group30-project.onrender.com/next_city', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user_id: userId,
        ...profile,
      }),
    });

    if (!res.ok) throw new Error('Failed to fetch next city');
    const json = await res.json();
    return json.city as Recommendation;
  }

  // async function sendSwipe(userId: string, cityId: string, liked: boolean) {
  //   await fetch('https://capstone-team-generated-group30-project.onrender.com/swipe', {
  //     method: 'POST',
  //     headers: {'Content-Type': 'application/json'},
  //     body: JSON.stringify({ user_id: userId, city_id: cityId, liked }),
  //   });
  // }

  const swipeFunction = (direction: 'left' | 'right') => {
    if (!currentCityRef.current) return;

    const x = direction === 'right' ? screenWidth : -screenWidth;
    Animated.timing(position, {
      toValue: {x, y: 0},
      duration: 300,
      useNativeDriver: false,
    }).start(() => {

    const city = currentCityRef.current;
    if (!city) return;

    if (direction === 'right'){
      rightSwipe(city.city_id, {
        city_name: city.city_name,
        country_name: city.country,
        score: city.score,
      });
    }
    else {
      leftSwipe(city.city_id, {
        city_name: city.city_name,
        country_name: city.country,
        score: city.score,
      });
    }
    position.setValue({x:0, y:0});
    });
  };

  const swipeAction = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          swipeFunction('right');
        }
        else if (gesture.dx < -120){
          swipeFunction('left');
        }
        else {
          Animated.spring(position, {
            toValue: {x:0, y:0}, 
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.homeContainer}>
        {/* Title */}
        <Text variant="headlineLarge" style={styles.homeTitle}>
          Recommendations
        </Text>

        {/* Loading */}
        {loading && (
          <Text style={styles.sectionTitle}>Loading recommendation...</Text>
        )}

        {/* Error */}
        {error && !loading && <Text>{error}</Text>}

        {/* Current City Card */}
        {!loading && !error && (
          <View style={styles.resultsContainer}>
            {currentCity ? (
              <Animated.View
                style={[
                  styles.cityCard,
                  {
                    transform: [
                      { translateX: position.x },
                      { translateY: position.y },
                      {
                        rotate: position.x.interpolate({
                          inputRange: [-screenWidth, 0, screenWidth],
                          outputRange: ['-15deg', '0deg', '15deg'],
                        }),
                      },
                    ],
                  },
                ]}
                {...swipeAction.panHandlers}
              >
                <Pressable
                  onPress={() => {
                    const now = Date.now();
                    if (doubleTap.current && now - doubleTap.current < 300) {
                      setSelectedCity(currentCity);
                      setCityModalOpen(true);
                    }
                    doubleTap.current = now;
                  }}
                >
                  <View style={styles.cityCardInner}>
                    {currentCity.image ? (
                      <Image
                        source={{ uri: currentCity.image }}
                        style={styles.cityImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.cityImagePlaceholder} />
                    )}

                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>
                        {currentCity.city_name}, {currentCity.country}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ) : (
              <Text>No more recommendations!</Text>
            )}
          </View>
        )}
      </View>

      {/* City Modal */}
      <Modal
        visible={cityModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setCityModalOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
          }}
          onPress={() => setCityModalOpen(false)}
        >
          <Pressable style={styles.cityModalContainer}>
            {selectedCity && (
              <View>
                <Text style={styles.cityModalTitle}>
                  {selectedCity.city_name}, {selectedCity.country}
                </Text>

                {selectedCity.image && (
                  <Image
                    source={{ uri: selectedCity.image }}
                    style={styles.cityModalImage}
                    resizeMode="cover"
                  />
                )}

                <Text style={styles.cityModalDescription}>
                  {selectedCity.description || 'No description available.'}
                </Text>

                <Button
                  mode="contained"
                  onPress={() => setCityModalOpen(false)}
                  style={styles.cityModalCloseBtn}
                >
                  Close
                </Button>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};
export default Recommendations;