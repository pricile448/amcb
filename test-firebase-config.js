// Script de test pour diagnostiquer la configuration Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Charger les variables d'environnement
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env depuis le répertoire courant
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 Diagnostic de la configuration Firebase:');
console.log('==========================================');

// Vérifier les variables d'environnement
const envVars = {
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID
};

console.log('Variables d\'environnement:');
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}: ${value ? '✅ Définie' : '❌ Manquante'}`);
  if (value) {
    console.log(`  Valeur: ${key.includes('KEY') || key.includes('PASS') ? '***' : value}`);
  }
});

// Vérifier si toutes les variables sont présentes
const missingVars = Object.entries(envVars).filter(([key, value]) => !value);
if (missingVars.length > 0) {
  console.log('\n❌ Variables manquantes:');
  missingVars.forEach(([key]) => console.log(`  - ${key}`));
  process.exit(1);
}

// Configuration Firebase
const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID
};

console.log('\nConfiguration Firebase:');
console.log(JSON.stringify(firebaseConfig, null, 2));

try {
  // Tenter d'initialiser Firebase
  console.log('\n🔄 Tentative d\'initialisation Firebase...');
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialisé avec succès');
  
  // Tenter d'initialiser Auth
  console.log('🔄 Tentative d\'initialisation Auth...');
  const auth = getAuth(app);
  console.log('✅ Auth initialisé avec succès');
  
  // Tenter d'initialiser Firestore
  console.log('🔄 Tentative d\'initialisation Firestore...');
  const db = getFirestore(app);
  console.log('✅ Firestore initialisé avec succès');
  
  console.log('\n🎉 Tous les services Firebase sont opérationnels!');
  
} catch (error) {
  console.error('\n❌ Erreur lors de l\'initialisation Firebase:');
  console.error('Message:', error.message);
  console.error('Code:', error.code);
  console.error('Stack:', error.stack);
  
  // Suggestions de résolution
  console.log('\n💡 Suggestions de résolution:');
  console.log('1. Vérifiez que l\'API key est correcte dans la console Firebase');
  console.log('2. Vérifiez que le projet Firebase existe et est actif');
  console.log('3. Vérifiez que l\'authentification est activée dans Firebase');
  console.log('4. Vérifiez que le domaine est autorisé dans Firebase Auth');
  
  process.exit(1);
} 