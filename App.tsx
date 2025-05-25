// App.tsx
// Fichier principal de l'application, gère la navigation et l'état Redux.

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './src/navigation/store'; // Importe le store Redux
import LoginScreen from './src/screens/LoginScreen'; // Importe l'écran de connexion
import HomeScreen from './src/screens/HomeScreen'; // Importe l'écran d'accueil
import RegisterScreen from './src/screens/RegisterScreen'; // Importe l'écran d'inscription
import { auth } from './src/navigation/firebaseConfig'; // Importe l'instance d'authentification Firebase
import { setUser } from './src/navigation/store'; // Importe l'action setUser du store Redux
import { RootStackParamList } from './src/navigation/types'; // Importe les types de navigation
import { RootState } from './src/navigation/store'; // Importe le type RootState pour useSelector

// Crée un navigateur de pile avec les types définis
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Composant MainNavigator qui gère la logique de navigation
 * en fonction de l'état d'authentification de l'utilisateur.
 */
function MainNavigator() {
  const dispatch = useDispatch();
  // Utilise RootState pour typer correctement l'état du store
  const user = useSelector((state: RootState) => state.auth.user);

  // Effet pour écouter les changements d'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      // Dispatch l'action setUser avec l'utilisateur Firebase (ou null si déconnecté)
      dispatch(setUser(firebaseUser));
    });
    // Nettoyage de l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [dispatch]); // Ajoute dispatch aux dépendances pour éviter les avertissements (bien que stable)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // Si l'utilisateur est connecté, affiche l'écran d'accueil
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        // Si l'utilisateur n'est pas connecté, affiche l'écran de connexion et d'inscription
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

/**
 * Composant racine de l'application.
 * Enveloppe l'application avec le Provider Redux et le NavigationContainer.
 */
export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <MainNavigator />
      </NavigationContainer>
    </Provider>
  );
}
