// Script de test pour l'API utilisateur
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env
dotenv.config({ path: join(__dirname, '.env') });

console.log('🧪 Test de l\'API utilisateur:');
console.log('=============================');

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

async function testUserApi() {
  console.log('\n📋 1. Test de l\'API utilisateur:');
  console.log('----------------------------------');
  
  // Test avec un userId connu
  const testUserId = 'YWu55QljgEM4J350kB7aKGf03TS2'; // Erich Schubert
  
  try {
    console.log('🔍 Test avec userId:', testUserId);
    
    // Test local
    const localResponse = await fetch(`http://localhost:3000/api/user/${testUserId}`);
    console.log('Local API Status:', localResponse.status);
    
    if (localResponse.ok) {
      const localData = await localResponse.json();
      console.log('✅ Données locales récupérées:', localData);
    } else {
      console.log('❌ Erreur API locale:', localResponse.status);
    }
    
    // Test Vercel (si déployé)
    const vercelResponse = await fetch(`https://studio-pricile448.vercel.app/api/user/${testUserId}`);
    console.log('Vercel API Status:', vercelResponse.status);
    
    if (vercelResponse.ok) {
      const vercelData = await vercelResponse.json();
      console.log('✅ Données Vercel récupérées:', vercelData);
    } else {
      console.log('❌ Erreur API Vercel:', vercelResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test API:', error);
  }
  
  console.log('\n📋 2. Test de Firebase Auth:');
  console.log('----------------------------');
  
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Utilisateur connecté dans Firebase Auth:');
        console.log('  UID:', user.uid);
        console.log('  Email:', user.email);
        
        // Test de l'API avec l'utilisateur connecté
        testUserApiWithAuth(user.uid);
      } else {
        console.log('❌ Aucun utilisateur connecté dans Firebase Auth');
        console.log('💡 Connectez-vous d\'abord à l\'application');
      }
      
      unsubscribe();
      resolve();
    });
  });
}

async function testUserApiWithAuth(userId) {
  console.log('\n📋 3. Test API avec authentification:');
  console.log('--------------------------------------');
  
  try {
    // Récupérer le token d'authentification
    const token = await auth.currentUser?.getIdToken();
    
    if (!token) {
      console.log('❌ Pas de token d\'authentification disponible');
      return;
    }
    
    console.log('🔑 Token récupéré, test de l\'API authentifiée...');
    
    const response = await fetch(`http://localhost:3000/api/user/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Données utilisateur récupérées:', data);
      
      if (data.user) {
        console.log('✅ Données complètes:', {
          id: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          kycStatus: data.user.kycStatus
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur API:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test API authentifiée:', error);
  }
}

// Exécuter le test
testUserApi(); 