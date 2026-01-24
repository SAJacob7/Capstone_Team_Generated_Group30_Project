/*
File: favorites.tsx
Function: Displays users liked places loaded from Firebase userFavorites.
*/

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Modal, Button } from 'react-native-paper';
import { styles } from './app_styles.styles';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, deleteField } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';


// Same interface as Home ... maybe change ?
interface Recomendation {
  city_id: string;
  city_name: string;
  country: string;
  score?: number; // Score is optional here
  description?: string;
  image?: string;
}

// Likes component 
const Favorites = () => {
  const [favorites, setFavorites] = useState<Recomendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCity, setSelectedCity] = useState<Recomendation | null>(null);
  const [cityModalOpen, setCityModalOpen] = useState(false);


  // Only uses Wikipedia REST API 
  const fetchCityImage = async (cityName: string, country: string) => {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(`${cityName}, ${country}`)}`;
      const res = await fetch(url);
      if (!res.ok) return undefined;
      const data = await res.json();

      // Avoid flag images
      const rawImage = data.originalimage?.source || data.thumbnail?.source;
      if (!rawImage) return undefined;
      const lower = rawImage.toLowerCase();
      if (lower.includes('flag') || lower.includes('flag_of')) return undefined;

      return rawImage;
    } catch (err) {
      console.error('Error fetching city image:', err);
      return undefined;
    }
  };
  const fetchCityDescription = async (cityName: string, country: string) => {
    try {
      // 1) We try the Wikivoyage first (it's more travel/aesthetic)
      const tryTitles = [
        cityName,
        `${cityName} (${country})`,
        `${cityName}, ${country}`,
      ];
  
      for (const title of tryTitles) {
        const voyageUrl =
          `https://en.wikivoyage.org/w/api.php` +
          `?action=query&prop=extracts&exintro=1&explaintext=1` +
          `&titles=${encodeURIComponent(title)}` +
          `&format=json&origin=*`;
  
        const voyageRes = await fetch(voyageUrl);
        if (voyageRes.ok) {
          const voyageData = await voyageRes.json();
          const pages = voyageData?.query?.pages;
          const firstPage = pages ? pages[Object.keys(pages)[0]] : null;
          const extract = firstPage?.extract;
  
          if (extract && extract.trim().length > 0) {
            return extract;
          }
        }
      }
  
      // 2) If Wikivoyage doesn't work then we fallback to Wikipedia (reliable if Wikivoyage has no page)
      const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        `${cityName}, ${country}`
      )}`;
  
      const wikiRes = await fetch(wikiUrl);
      if (!wikiRes.ok) return undefined;
  
      const wikiData = await wikiRes.json();
      return wikiData.extract || undefined;
    } catch (err) {
      console.error('Error fetching city description:', err);
      return undefined;
    }
  };
  const removeFavorite = async (cityId: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
  
      const favoritesRef = doc(FIREBASE_DB, 'userFavorites', user.uid);
  
      await updateDoc(favoritesRef, {
        [cityId]: deleteField(),
      });
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Could not remove that place.');
    }
  };  

  // Load liked locations from Firestore 
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      setError('No user signed in.');
      return;
    }
  
    setLoading(true);
  
    const favoritesRef = doc(FIREBASE_DB, 'userFavorites', user.uid);
  
    const unsubscribe = onSnapshot(
      favoritesRef,
      async (snapshot) => {
        try {
          if (!snapshot.exists()) {
            setFavorites([]);
            setError('No favorites found.');
            setLoading(false);
            return;
          }
  
          setError(null);
  
          const cityData = snapshot.data() || {};
  
          const favoritesArray: Recomendation[] = await Promise.all(
            Object.keys(cityData).map(async (key) => {
              const city = cityData[key];
              const image = await fetchCityImage(city.city_name, city.country_name);
              const description = await fetchCityDescription(city.city_name, city.country_name);
  
              return {
                city_id: key,
                city_name: city.city_name,
                country: city.country_name,
                image,
                description,
              };
            })
          );
  
          setFavorites(favoritesArray);
        } catch (err) {
          console.error('Error building favorites array:', err);
          setError('Failed to load liked places.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('onSnapshot error:', err);
        setError('Failed to load liked places.');
        setLoading(false);
      }
    );
  
    return () => unsubscribe();
  }, []);
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.homeContainer}>
        <Text variant="headlineLarge" style={styles.homeTitle}>
          Your Favorite Locations!
        </Text>

        {loading && <Text style={styles.sectionTitle}>Loading favorites...</Text>}
        {error && !loading && <Text>{error}</Text>}

        {!loading && favorites.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Liked Cities:</Text>

            {favorites.map((city) => (
              <Pressable
                key={city.city_id}
                onPress={() => {
                  setSelectedCity(city);
                  setCityModalOpen(true);
                }}
              >
                <Card style={styles.cityCard}>
                  <View style={styles.cityCardInner}>
                    {/* Remove button (top-right) */}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        removeFavorite(city.city_id);
                      }}
                      style={[styles.removeIconBtn, styles.removeIconBtnShadow]}
                    >
                      <MaterialCommunityIcons name="close" size={18} color="#222" />
                    </Pressable>

                    {/* Image */}
                    {city.image ? (
                      <Image
                        source={{ uri: city.image }}
                        style={styles.cityImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.cityImagePlaceholder} />
                    )}

                    {/* City name */}
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>
                        {city.city_name}, {city.country}
                      </Text>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal
        visible={cityModalOpen}
        onDismiss={() => setCityModalOpen(false)}
        contentContainerStyle={styles.cityModalContainer}
      >
        {selectedCity && (
          <View>
            <Text style={styles.cityModalTitle}>
              {selectedCity.city_name}, {selectedCity.country}
            </Text>

            {selectedCity.image ? (
              <Image
                source={{ uri: selectedCity.image }}
                style={styles.cityModalImage}
                resizeMode="cover"
              />
            ) : null}

            <Text style={styles.cityModalDescription}>
              {selectedCity.description || 'No description available.'}
            </Text>

            <Button
                mode="outlined"
                onPress={() => removeFavorite(selectedCity.city_id)}
                style={{ marginBottom: 10 }}
              >
                Remove from favorites
              </Button>

              <Button
                mode="contained"
                onPress={() => setCityModalOpen(false)}
                style={styles.cityModalCloseBtn}
              >
                Close
            </Button>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default Favorites;
