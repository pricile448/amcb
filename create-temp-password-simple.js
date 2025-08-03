// Script simplifié pour créer un mot de passe temporaire
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔄 Création d\'un mot de passe temporaire (version simplifiée):');
console.log('============================================================');

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

// Données utilisateur connues
const userEmail = 'erich3schubert@gmx.at';
const tempPassword = 'TempPass123!';

async function createTempPassword() {
  try {
    console.log('📧 Email:', userEmail);
    console.log('🔑 Mot de passe temporaire:', tempPassword);
    
    console.log('\n🔄 Tentative de création dans Firebase Authentication...');
    
    try {
      // Essayer de créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userEmail, 
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
            userEmail, 
            tempPassword
          );
          console.log('✅ Connexion réussie avec le mot de passe temporaire');
          console.log('User ID:', signInResult.user.uid);
          
        } catch (signInError) {
          console.log('❌ Erreur de connexion:', signInError.code);
          console.log('Le mot de passe temporaire ne fonctionne pas');
          console.log('L\'utilisateur existe mais avec un mot de passe différent');
        }
      }
    }
    
    console.log('\n📋 Informations de connexion:');
    console.log('Email:', userEmail);
    console.log('Mot de passe temporaire:', tempPassword);
    console.log('\n💡 Utilisez ces identifiants pour vous connecter à l\'application');
    console.log('🌐 Allez sur: http://localhost:5173/connexion');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter la création
createTempPassword(); 