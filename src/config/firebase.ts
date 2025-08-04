import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Vérifier que toutes les variables Firebase sont présentes
const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Vérifier les variables manquantes
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement Firebase manquantes:', missingVars);
  console.error('💡 Créez un fichier .env dans le dossier frontend/ avec les variables suivantes:');
  console.error('VITE_FIREBASE_API_KEY=your-api-key');
  console.error('VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com');
  console.error('VITE_FIREBASE_PROJECT_ID=your-project-id');
  console.error('VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com');
  console.error('VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id');
  console.error('VITE_FIREBASE_APP_ID=your-app-id');
}

// Configuration Firebase
const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey,
  authDomain: requiredEnvVars.authDomain,
  projectId: requiredEnvVars.projectId,
  storageBucket: requiredEnvVars.storageBucket,
  messagingSenderId: requiredEnvVars.messagingSenderId,
  appId: requiredEnvVars.appId
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
