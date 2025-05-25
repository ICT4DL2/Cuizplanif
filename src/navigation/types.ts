// src/navigation/types.ts
// Définitions de types pour React Navigation.

import { StackScreenProps } from '@react-navigation/stack';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Définit les noms de route et leurs paramètres.
// 'undefined' signifie que la route ne prend pas de paramètres.
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  // Ajoutez d'autres écrans ici si nécessaire
  // Exemple: Profile: { userId: string; };
};

// Types pour les props de navigation spécifiques à chaque écran
export type LoginScreenNavigationProp = StackScreenProps<RootStackParamList, 'Login'>['navigation'];
export type RegisterScreenNavigationProp = StackScreenProps<RootStackParamList, 'Register'>['navigation'];
export type HomeScreenNavigationProp = StackScreenProps<RootStackParamList, 'Home'>['navigation'];
