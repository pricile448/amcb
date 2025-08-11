#!/usr/bin/env node

/**
 * Script pour vérifier le statut d'un utilisateur
 * Usage: node check-user-status.cjs <email>
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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
const db = getFirestore(app);

console.log('🔍 Vérification du statut utilisateur');
console.log('=====================================\n');

async function checkUserStatus(email) {
  try {
    console.log(`📧 Recherche de l'utilisateur: ${email}`);
    
    // Rechercher l'utilisateur dans Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Utilisateur non trouvé dans Firestore');
      return;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log('✅ Utilisateur trouvé dans Firestore:');
    console.log(`   - UID: ${userDoc.id}`);
    console.log(`   - Email: ${userData.email}`);
    console.log(`   - emailVerified: ${userData.emailVerified}`);
    console.log(`   - isEmailVerified: ${userData.isEmailVerified}`);
    console.log(`   - kycStatus: ${userData.kycStatus}`);
    console.log(`   - status: ${userData.status}`);
    console.log(`   - verificationStatus: ${userData.verificationStatus}`);
    console.log(`   - Créé le: ${userData.createdAt?.toDate?.() || userData.createdAt}`);
    
    // Diagnostic
    console.log('\n🔍 Diagnostic:');
    if (userData.emailVerified === false && userData.isEmailVerified === false) {
      console.log('❌ Problème: emailVerified et isEmailVerified sont false');
      console.log('💡 Solution: L\'utilisateur doit se connecter pour synchroniser');
    } else if (userData.emailVerified === true || userData.isEmailVerified === true) {
      console.log('✅ Email vérifié dans Firestore');
      console.log('💡 L\'utilisateur peut se connecter normalement');
    } else {
      console.log('⚠️  Statut indéterminé');
    }
    
    console.log('\n💡 Actions recommandées:');
    console.log('1. L\'utilisateur doit se connecter directement sur /connexion');
    console.log('2. Le système synchronisera automatiquement le statut');
    console.log('3. Plus besoin de cliquer sur le lien de vérification');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

// Exécution du script
const email = process.argv[2];

if (email) {
  checkUserStatus(email);
} else {
  console.log('💡 Usage:');
  console.log('   node check-user-status.cjs <email>');
  console.log('   Exemple: node check-user-status.cjs chapelleolivier00@gmail.com');
}

console.log('\n✅ Script terminé');
