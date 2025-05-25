// src/navigation/store.ts
// Configuration du store Redux avec Redux Toolkit.

import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Définit l'interface pour le type d'utilisateur
interface User {
  uid: string;
  email: string | null;
  // Ajoutez d'autres propriétés utilisateur si nécessaire (par exemple, displayName, photoURL)
}

// Définit l'interface pour l'état du slice d'authentification
interface AuthState {
  user: User | null;
}

// État initial du slice d'authentification
const initialState: AuthState = {
  user: null,
};

// Crée un slice Redux pour l'authentification
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Reducer pour définir l'utilisateur
    setUser: (state: AuthState, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    // Reducer pour déconnecter l'utilisateur
    logoutUser: (state: AuthState) => {
      state.user = null;
    },
  },
});

// Exporte les actions générées par le slice
export const { setUser, logoutUser } = authSlice.actions;

// Configure le store Redux
const store = configureStore({
  reducer: {
    auth: authSlice.reducer, // Associe le reducer d'authentification à la clé 'auth'
  },
});

// Exporte le type RootState pour un typage facile avec useSelector
export type RootState = ReturnType<typeof store.getState>;
// Exporte le type AppDispatch pour un typage facile avec useDispatch
export type AppDispatch = typeof store.dispatch;

// Exporte le store par défaut
export default store;
