// src/appState.ts
// Fonctions liées à l'état de l'application, y compris la logique d'authentification Firebase.
// Ce fichier contient la fonction loginUser et gère les interactions Firebase.

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './navigation/firebaseConfig'; // Importe auth et db de Firebase
import { Alert } from 'react-native'; // Importe Alert de React Native

/**
 * Interface pour les données utilisateur stockées dans Firestore.
 */
interface UserData {
  email: string;
  // Ajoutez d'autres champs utilisateur si nécessaire
}

/**
 * Connecte un utilisateur avec son email et son mot de passe.
 * @param email L'email de l'utilisateur.
 * @param password Le mot de passe de l'utilisateur.
 * @returns Une promesse qui se résout en void ou rejette une erreur.
 */
export const loginUser = async (email: string, password: string): Promise<void> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Vérifie si l'utilisateur existe dans Firestore (facultatif, mais bonne pratique)
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    // Appelle la méthode exists() pour vérifier l'existence du document
    if (!userDoc.exists()) {
      // Si l'utilisateur n'existe pas dans Firestore, vous pouvez le créer ici
      // Ou simplement ignorer si vous ne stockez pas de données utilisateur supplémentaires
      console.warn("User data not found in Firestore. This might be expected.");
      // Exemple de création de données utilisateur si elles n'existent pas
      await setDoc(userDocRef, { email: user.email });
    }
  } catch (error: any) {
    console.error("Erreur lors de la connexion :", error);
    Alert.alert('Erreur de connexion', error.message);
    throw error; // Rejette l'erreur pour qu'elle soit gérée par l'appelant
  }
};

/**
 * Enregistre un nouvel utilisateur avec son email et son mot de passe.
 * @param email L'email du nouvel utilisateur.
 * @param password Le mot de passe du nouvel utilisateur.
 * @returns Une promesse qui se résout en void ou rejette une erreur.
 */
export const registerUser = async (email: string, password: string): Promise<void> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Stocke les données utilisateur initiales dans Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      createdAt: new Date().toISOString(), // Ajoute un horodatage de création
      // Ajoutez d'autres champs par défaut ici
    } as UserData); // Assurez-vous que les données correspondent à l'interface UserData

    Alert.alert('Succès', 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error);
    Alert.alert('Erreur d\'inscription', error.message);
    throw error; // Rejette l'erreur pour qu'elle soit gérée par l'appelant
  }
};

/**
 * Déconnecte l'utilisateur actuel.
 * @returns Une promesse qui se résout en void ou rejette une erreur.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await auth.signOut();
    Alert.alert('Succès', 'Déconnexion réussie.');
  } catch (error: any) {
    console.error("Erreur lors de la déconnexion :", error);
    Alert.alert('Erreur de déconnexion', error.message);
    throw error;
  }
};
