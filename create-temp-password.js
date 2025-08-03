// Script pour créer un mot de passe temporaire depuis Firestore
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

console.log('🔄 Création d\'un mot de passe temporaire:');
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

// ID de l'utilisateur dans Firestore
const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';

async function createTempPassword() {
  try {
    console.log('🔍 Récupération des données utilisateur depuis Firestore...');
    
    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.log('❌ Utilisateur non trouvé dans Firestore');
      return;
    }
    
    const userData = userDoc.data();
    console.log('✅ Utilisateur trouvé dans Firestore:');
    console.log('Email:', userData.email);
    console.log('Nom:', userData.firstName, userData.lastName);
    
    // Mot de passe temporaire
    const tempPassword = 'TempPass123!';
    
    console.log('\n🔄 Tentative de création dans Firebase Authentication...');
    
    try {
      // Essayer de créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        tempPassword
      );
      
      console.log('✅ Utilisateur créé dans Firebase Authentication');
      console.log('User ID:', userCredential.user.uid);
      console.log('Email vérifié:', userCredential.user.emailVerified);
      
    } catch (authError) {
      console.log('❌ Erreur lors de la création:', authError.code);
      
      if (authError.code === 'auth/email-already-in-use') {
        console.log('💡 L\'utilisateur existe déjà dans Firebase Auth');
        console.log('Tentative de connexion avec le mot de passe temporaire...');
        
        try {
          const signInResult = await signInWithEmailAndPassword(
            auth, 
            userData.email, 
            tempPassword
          );
          console.log('✅ Connexion réussie avec le mot de passe temporaire');
          console.log('User ID:', signInResult.user.uid);
          
        } catch (signInError) {
          console.log('❌ Erreur de connexion:', signInError.code);
          console.log('Le mot de passe temporaire ne fonctionne pas');
        }
      }
    }
    
    console.log('\n📋 Informations de connexion:');
    console.log('Email:', userData.email);
    console.log('Mot de passe temporaire:', tempPassword);
    console.log('\n💡 Utilisez ces identifiants pour vous connecter à l\'application');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la création
createTempPassword(); 