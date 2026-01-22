/*
File: favorites.tsx
Function: Displays users liked places loaded from Firebase userFavorites.
*/

import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card } from 'react-native-paper';
import { styles } from './app_styles.styles';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { FIREBASE_DB } from '../../FirebaseConfig';

// Same interface as Home ... maybe change ?
interface Recomendation {
  city_id: string;
  city_name: string;
  country: string;
  score?: number; // Score is optional here
  description?: string;
  image?: string;
}

// Favorites component 
const Favorites = () => {
  const [favorites, setFavorites] = useState<Recomendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only uses Wikipedia REST API 
  const fetchCityImage = async (cityName: string, country: string) => {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cityName)}`;
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

    // Handles unfavoriting cities and stores it in Firebase
    const removeFavoriteCity = async (cityId: string) => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert('Error, User must be signed in!');
        return;
      }

      try {
        const userDocRef = doc(FIREBASE_DB, 'userFavorites', user.uid);
        await setDoc(userDocRef, { [`${cityId}`]: deleteField() }, { merge: true });
        alert('Success, your favorite has been removed!');
      } catch (error) {
        console.error('Error removing favorite city:', error);
        alert('Error removing favorite city.');
      }
    };
  };

  // Load liked locations from Firestore 
  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setError('No user signed in.');
          setLoading(false);
          return;
        }

        const favoritesRef = doc(FIREBASE_DB, 'userFavorites', user.uid);
        const snapshot = await getDoc(favoritesRef);

        if (snapshot.exists()) {
          const cityData = snapshot.data() || {};
          const favoritesArray: Recomendation[] = await Promise.all(
            Object.keys(cityData).map(async (key) => {
              const city = cityData[key];
              const image = await fetchCityImage(city.city_name, city.country_name);
              return {
                city_id: key,
                city_name: city.city_name,
                country: city.country_name,
                image,
              };
            })
          );
          setFavorites(favoritesArray);
        } else {
          setError('No favorites found.');
        }
      } catch (err) {
        console.error('Error loading favorites from Firestore:', err);
        setError('Failed to load liked places.');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
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
              <Card key={city.city_id} style={styles.cityCard}>
                <View style={styles.cityCardInner}>
                  {/* Show image if available */}
                  {city.image ? (
                    <Image
                      source={{ uri: city.image }}
                      style={styles.cityImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.cityImagePlaceholder} />
                  )}

                  {/* City and country name */}
                  <View style={styles.cityInfo}>
                    <Text style={styles.cityName}>
                      {city.city_name}, {city.country}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Favorites;
