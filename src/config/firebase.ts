import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Debug des variables d'environnement
console.log('🔍 Variables d\'environnement Firebase:');
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log('Storage Bucket:', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET);
console.log('Messaging Sender ID:', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
console.log('App ID:', import.meta.env.VITE_FIREBASE_APP_ID);

// Configuration Firebase (avec fallback temporaire)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "amcbunq.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "amcbunq",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "amcbunq.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "466533825569",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:466533825569:web:873294f84a51aee5f63760"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
