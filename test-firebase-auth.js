// Script de test pour diagnostiquer l'authentification Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 Diagnostic de l\'authentification Firebase:');
console.log('============================================');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('Configuration Firebase:');
console.log('API Key:', process.env.VITE_FIREBASE_API_KEY ? '✅ Définie' : '❌ Manquante');
console.log('Auth Domain:', process.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', process.env.VITE_FIREBASE_PROJECT_ID);

try {
  // Initialiser Firebase
  console.log('\n🔄 Initialisation Firebase...');
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  console.log('✅ Firebase initialisé avec succès');

  // Test avec des identifiants de test
  const testEmail = 'test@example.com';
  const testPassword = 'testpassword123';

  console.log('\n🔄 Test de création de compte...');
  console.log('Email:', testEmail);
  console.log('Password:', testPassword);

  try {
    // Tenter de créer un compte de test
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Compte créé avec succès');
    console.log('User ID:', userCredential.user.uid);
    
    // Tenter de se connecter avec le compte créé
    console.log('\n🔄 Test de connexion...');
    const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Connexion réussie');
    console.log('User ID:', signInCredential.user.uid);
    
  } catch (authError) {
    console.log('❌ Erreur d\'authentification:');
    console.log('Code:', authError.code);
    console.log('Message:', authError.message);
    
    if (authError.code === 'auth/email-already-in-use') {
      console.log('\n💡 Le compte existe déjà, test de connexion...');
      try {
        const signInCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('✅ Connexion réussie avec le compte existant');
        console.log('User ID:', signInCredential.user.uid);
      } catch (signInError) {
        console.log('❌ Erreur de connexion:');
        console.log('Code:', signInError.code);
        console.log('Message:', signInError.message);
      }
    }
  }

} catch (error) {
  console.error('\n❌ Erreur lors de l\'initialisation Firebase:');
  console.error('Message:', error.message);
  console.error('Code:', error.code);
  process.exit(1);
} 