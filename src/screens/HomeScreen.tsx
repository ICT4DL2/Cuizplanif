// src/screens/HomeScreen.tsx
// Composant d'écran d'accueil.

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigationProp } from '../navigation/types'; // Importe le type de navigation
import { useDispatch } from 'react-redux';
import { logoutUser } from '../navigation/store'; // Importe l'action de déconnexion
import { logoutUser as firebaseLogoutUser } from '../appState'; // Importe la fonction de déconnexion Firebase

/**
 * Composant de l'écran d'accueil.
 */
function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await firebaseLogoutUser(); // Déconnecte de Firebase
      dispatch(logoutUser()); // Met à jour l'état Redux
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      // Alert.alert est déjà géré dans appState.ts
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur l'écran d'accueil !</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#ff6347',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
