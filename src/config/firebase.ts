import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// 🔍 DEBUG TEMPORAIRE - TOUTES les variables d'environnement disponibles
console.log('🔍 TOUTES les variables d\'environnement disponibles:');
console.log(import.meta.env);

console.log('🔍 Variables Firebase spécifiques:');
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('Storage Bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
console.log('Messaging Sender ID:', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
console.log('App ID:', import.meta.env.VITE_FIREBASE_APP_ID);

// Configuration Firebase avec fallbacks pour diagnostic
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'API_KEY_MISSING',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'AUTH_DOMAIN_MISSING',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'PROJECT_ID_MISSING',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'STORAGE_BUCKET_MISSING',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'SENDER_ID_MISSING',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'APP_ID_MISSING'
};

console.log('🔍 Configuration Firebase finale:', firebaseConfig);

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
