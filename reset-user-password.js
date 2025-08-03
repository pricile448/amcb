// Script pour réinitialiser le mot de passe d'un utilisateur Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, updatePassword, signInWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔄 Réinitialisation du mot de passe:');
console.log('==================================');

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

// Identifiants de l'utilisateur
const userEmail = 'erich3schubert@gmx.at';
const oldPassword = 'Lookmandat100@'; // Ancien mot de passe (si connu)
const newPassword = 'Lookmandat100@'; // Nouveau mot de passe

async function resetPassword() {
  try {
    console.log('🔐 Tentative de connexion avec l\'ancien mot de passe...');
    
    // Essayer de se connecter avec l'ancien mot de passe
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, oldPassword);
    console.log('✅ Connexion réussie avec l\'ancien mot de passe');
    
    // Mettre à jour le mot de passe
    console.log('🔄 Mise à jour du mot de passe...');
    await updatePassword(userCredential.user, newPassword);
    console.log('✅ Mot de passe mis à jour avec succès');
    console.log('Nouveau mot de passe:', newPassword);
    
  } catch (error) {
    console.error('❌ Erreur:', error.code);
    console.error('Message:', error.message);
    
    if (error.code === 'auth/wrong-password') {
      console.log('\n💡 L\'ancien mot de passe est incorrect.');
      console.log('Utilisez la page "Mot de passe oublié" dans l\'application ou');
      console.log('réinitialisez directement depuis la console Firebase.');
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n❌ Utilisateur non trouvé dans Firebase Authentication');
    } else {
      console.log('\n💡 Utilisez la page "Mot de passe oublié" dans l\'application');
    }
  }
}

// Exécuter la réinitialisation
resetPassword(); 