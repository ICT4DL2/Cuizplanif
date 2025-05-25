// src/navigation/firebaseConfig.ts
// Initialisation de Firebase.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase (remplacez ces valeurs par les vôtres)
const firebaseConfig = {
  apiKey: "AIzaSyBe8n99cMmDMB4_w1x0q_DGOJycQL4xjbY",
  authDomain: "cuizplanif.firebaseapp.com",
  projectId: "cuizplanif",
  storageBucket: "cuizplanif.firebasestorage.app",
  appId: "1:1019287297747:android:5b47ef2b079e1403c57e26"
};

// Initialise l'application Firebase
const app = initializeApp(firebaseConfig);
// Obtient l'instance d'authentification
const auth = getAuth(app);
// Obtient l'instance de Firestore
const db = getFirestore(app);

// Exporte les instances d'authentification et de base de données
export { auth, db };
