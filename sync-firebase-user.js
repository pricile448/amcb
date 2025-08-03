// Script pour synchroniser un utilisateur Firestore avec Firebase Authentication
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔄 Synchronisation Firebase Auth/Firestore:');
console.log('==========================================');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Identifiants de l'utilisateur existant
const userEmail = 'erich3schubert@gmx.at';
const userPassword = 'Lookmandat100@';
const userId = 'YWu55QljgEM4J350kB7aKGf03TS2'; // ID de l'utilisateur dans Firestore

async function syncUser() {
  try {
    console.log('🔍 Vérification de l\'utilisateur dans Firestore...');
    
    // Vérifier si l'utilisateur existe dans Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.log('❌ Utilisateur non trouvé dans Firestore');
      return;
    }
    
    console.log('✅ Utilisateur trouvé dans Firestore');
    console.log('Email:', userDoc.data().email);
    console.log('Nom:', userDoc.data().firstName, userDoc.data().lastName);
    
    // Tenter de se connecter pour vérifier si l'utilisateur existe dans Auth
    console.log('\n🔍 Vérification dans Firebase Authentication...');
    
    try {
      const signInResult = await signInWithEmailAndPassword(auth, userEmail, userPassword);
      console.log('✅ Utilisateur existe dans Firebase Authentication');
      console.log('User ID:', signInResult.user.uid);
      console.log('Email vérifié:', signInResult.user.emailVerified);
      
    } catch (authError) {
      console.log('❌ Utilisateur non trouvé dans Firebase Authentication');
      console.log('Erreur:', authError.code);
      
      if (authError.code === 'auth/user-not-found') {
        console.log('\n🔄 Création de l\'utilisateur dans Firebase Authentication...');
        
        try {
          const createResult = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
          console.log('✅ Utilisateur créé dans Firebase Authentication');
          console.log('User ID:', createResult.user.uid);
          console.log('Email vérifié:', createResult.user.emailVerified);
          
        } catch (createError) {
          console.log('❌ Erreur lors de la création:', createError.code);
          console.log('Message:', createError.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la synchronisation
syncUser(); 