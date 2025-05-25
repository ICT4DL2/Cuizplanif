// src/screens/LoginScreen.tsx
// Composant d'écran de connexion.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LoginScreenNavigationProp } from '../navigation/types'; // Importe le type de navigation
import { loginUser } from '../appState'; // Importe la fonction de connexion depuis appState (chemin corrigé)

/**
 * Composant de l'écran de connexion.
 */
function LoginScreen() {
  // Utilise le type LoginScreenNavigationProp pour le hook useNavigation
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Gère la tentative de connexion de l'utilisateur.
   */
  const handleLogin = async () => {
    Keyboard.dismiss(); // Cache le clavier
    if (email === '' || password === '') {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    try {
      await loginUser(email, password);
      // La connexion réussie sera gérée par l'écouteur d'état Firebase dans App.tsx
      // qui mettra à jour Redux et déclenchera la navigation vers l'écran Home.
      Alert.alert('Succès', 'Connexion réussie !');
    } catch (error: any) {
      console.error(error);
      // L'erreur est déjà gérée et affichée par Alert dans appState.ts
      // Vous pouvez choisir de ne pas la réafficher ici si vous préférez
      // une gestion centralisée des erreurs dans appState.ts.
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}> Connexion </Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          // Utilise navigation.navigate avec un nom de route valide
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.signUpText}>
            Vous n'avez pas de compte ?
            <Text style={styles.signupLink}> Créer un compte</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'beige',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    // fontFamily: 'Circular-Std', // Assurez-vous que cette police est chargée
    textTransform: 'capitalize',
    fontStyle: 'italic',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
    alignSelf: 'auto',
    width: '80%',
    fontWeight: '500',
  },
  input: {
    height: 50,
    width: '80%',
    borderColor: '#9DD02C',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 20,
    elevation: 2,
  },
  button: {
    width: '50%',
    height: 50,
    padding: 10,
    borderRadius: 15,
    borderColor: '#151515',
    borderWidth: 1,
    margin: 15,
    elevation: 2,
    backgroundColor: '#9DD02C',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpText: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  signupLink: {
    color: 'green',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
