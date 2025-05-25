import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// --- Interfaces pour l'état Redux ---
export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  age: string; // Stocké comme chaîne pour la simplicité, mais peut être number
  sexe: string;
  // Ajoutez d'autres champs de profil si nécessaire
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// --- Actions Redux ---
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const SET_USER_PROFILE = 'SET_USER_PROFILE';
export const AUTH_START = 'AUTH_START';
export const AUTH_ERROR = 'AUTH_ERROR';

interface LoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  payload: UserProfile;
}

interface LogoutAction {
  type: typeof LOGOUT;
}

interface SetUserProfile {
  type: typeof SET_USER_PROFILE;
  payload: UserProfile;
}

interface AuthStartAction {
  type: typeof AUTH_START;
}

interface AuthErrorAction {
  type: typeof AUTH_ERROR;
  payload: string;
}

export type AuthActionTypes =
  | LoginSuccessAction
  | LogoutAction
  | SetUserProfile
  | AuthStartAction
  | AuthErrorAction;

// --- Reducer d'authentification ---
const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true, // Pour gérer l'état initial de chargement de Firebase
  error: null,
};

function authReducer(state: AuthState = initialAuthState, action: AuthActionTypes): AuthState {
  switch (action.type) {
    case AUTH_START:
      return { ...state, loading: true, error: null };
    case LOGIN_SUCCESS:
      return { ...state, isAuthenticated: true, user: action.payload, loading: false, error: null };
    case LOGOUT:
      return { ...state, isAuthenticated: false, user: null, loading: false, error: null };
    case SET_USER_PROFILE:
      return { ...state, user: { ...state.user, ...action.payload }, loading: false, error: null };
    case AUTH_ERROR:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// --- Combinaison des reducers ---
const rootReducer = combineReducers({
  auth: authReducer,
  // Ajoutez d'autres reducers ici si votre application en a besoin (ex: products, cart)
});

export type RootState = ReturnType<typeof rootReducer>;

// --- Configuration de la persistance Redux ---
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // La whitelist permet de spécifier quelles parties de l'état Redux doivent être persistées.
  // Nous persistons uniquement l'état d'authentification pour se souvenir de l'utilisateur.
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// --- Création du store Redux ---
export const store = createStore(persistedReducer);
export const persistor = persistStore(store);

// --- Fonctions d'interaction avec Firebase ---

/**
 * Enregistre un nouvel utilisateur avec Firebase Authentication et stocke ses infos dans Firestore.
 * @param email L'adresse e-mail de l'utilisateur.
 * @param password Le mot de passe de l'utilisateur.
 * @param userData Les données supplémentaires de l'utilisateur (fullName, age, sexe).
 */
export const registerUser = async (email: string, password: string, userData: Omit<UserProfile, 'uid' | 'email'>) => {
  store.dispatch({ type: AUTH_START });
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    const userProfile: UserProfile = {
      uid,
      email,
      ...userData,
    };

    // Sauvegarder les informations supplémentaires dans Firestore
    await firestore().collection('users').doc(uid).set(userProfile);

    // Dispatch l'action de succès de connexion
    store.dispatch({ type: LOGIN_SUCCESS, payload: userProfile });
    return userProfile;
  } catch (error: any) {
    console.error("Erreur lors de l'inscription:", error);
    store.dispatch({ type: AUTH_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Connecte un utilisateur existant avec Firebase Authentication et charge son profil depuis Firestore.
 * @param email L'adresse e-mail de l'utilisateur.
 * @param password Le mot de passe de l'utilisateur.
 */
export const loginUser = async (email: string, password: string) => {
  store.dispatch({ type: AUTH_START });
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;

    // Charger les informations supplémentaires de l'utilisateur depuis Firestore
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userProfile: UserProfile = userDoc.data() as UserProfile;
      store.dispatch({ type: LOGIN_SUCCESS, payload: userProfile });
      return userProfile;
    } else {
      // Si le profil n'existe pas (ce qui ne devrait pas arriver après inscription),
      // vous pourriez choisir de le créer ou de gérer l'erreur.
      console.warn("Profil utilisateur non trouvé dans Firestore pour l'UID:", uid);
      // Dans ce cas, on peut au moins dispatcher l'email et l'uid si c'est suffisant
      const basicProfile: UserProfile = {
        uid: uid,
        email: email,
        fullName: '', // ou gérer un état "profil incomplet"
        age: '',
        sexe: '',
      };
      store.dispatch({ type: LOGIN_SUCCESS, payload: basicProfile });
      return basicProfile;
    }
  } catch (error: any) {
    console.error("Erreur lors de la connexion:", error);
    store.dispatch({ type: AUTH_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Déconnecte l'utilisateur de Firebase.
 */
export const logoutUser = async () => {
  try {
    await auth().signOut();
    store.dispatch({ type: LOGOUT });
  } catch (error: any) {
    console.error("Erreur lors de la déconnexion:", error);
    Alert.alert('Erreur de déconnexion', error.message);
  }
};

// Fonction pour récupérer le profil utilisateur depuis Firestore (utile si l'utilisateur est déjà connecté)
export const fetchUserProfile = async (uid: string) => {
  try {
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (userDoc.exists) {
      const userProfile: UserProfile = userDoc.data() as UserProfile;
      store.dispatch({ type: SET_USER_PROFILE, payload: userProfile });
      return userProfile;
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil utilisateur:", error);
    return null;
  }
};