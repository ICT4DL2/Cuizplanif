// src/screens/RegisterScreen.tsx
// Composant d'écran d'inscription.

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
import { RegisterScreenNavigationProp } from '../navigation/types'; // Importe le type de navigation
import { registerUser } from '../appState'; // Importe la fonction d'inscription

/**
 * Composant de l'écran d'inscription.
 */
function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Gère la tentative d'inscription de l'utilisateur.
   */
  const handleRegister = async () => {
    Keyboard.dismiss();
    if (email === '' || password === '' || confirmPassword === '') {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await registerUser(email, password);
      // Après l'inscription réussie, naviguer vers l'écran de connexion
      navigation.navigate('Login');
    } catch (error: any) {
      console.error(error);
      // L'erreur est déjà gérée et affichée par Alert dans appState.ts
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}> Inscription </Text>

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

        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          secureTextEntry
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signUpText}>
            Vous avez déjà un compte ?
            <Text style={styles.signupLink}> Se connecter</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

// Réutilise les styles de LoginScreen pour cohérence
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
    // fontFamily: 'Circular-Std',
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

export default RegisterScreen;
