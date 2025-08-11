#!/usr/bin/env node

/**
 * Script pour synchroniser le statut de vérification email
 * entre Firebase Auth et Firestore
 * Usage: node fix-email-verification-sync.cjs <email>
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getAuth as getAdminAuth } = require('firebase-admin/auth');
const { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } = require('firebase/firestore');

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

console.log('🔄 Synchronisation Email Verification');
console.log('=====================================\n');

async function syncEmailVerification(email) {
  try {
    console.log(`📧 Recherche de l'utilisateur: ${email}`);
    
    // 1. Vérifier le statut dans Firebase Auth
    console.log('\n1. 🔍 Vérification Firebase Auth...');
    const userRecord = await getUserByEmail(auth, email);
    
    if (!userRecord) {
      console.log('❌ Utilisateur non trouvé dans Firebase Auth');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé dans Firebase Auth:`);
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Email: ${userRecord.email}`);
    console.log(`   - Email Verified (Auth): ${userRecord.emailVerified}`);
    
    // 2. Vérifier le statut dans Firestore
    console.log('\n2. 🔍 Vérification Firestore...');
    const userDocRef = doc(db, 'users', userRecord.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ Document utilisateur non trouvé dans Firestore');
      return;
    }
    
    const userData = userDoc.data();
    console.log(`✅ Document Firestore trouvé:`);
    console.log(`   - emailVerified: ${userData.emailVerified}`);
    console.log(`   - isEmailVerified: ${userData.isEmailVerified}`);
    console.log(`   - kycStatus: ${userData.kycStatus}`);
    
    // 3. Comparer les statuts
    const authVerified = userRecord.emailVerified;
    const firestoreVerified = userData.emailVerified || false;
    const firestoreIsVerified = userData.isEmailVerified || false;
    
    console.log('\n3. 🔄 Comparaison des statuts:');
    console.log(`   - Firebase Auth: ${authVerified}`);
    console.log(`   - Firestore emailVerified: ${firestoreVerified}`);
    console.log(`   - Firestore isEmailVerified: ${firestoreIsVerified}`);
    
    // 4. Synchroniser si nécessaire
    if (authVerified !== firestoreVerified || authVerified !== firestoreIsVerified) {
      console.log('\n4. 🔧 Synchronisation nécessaire...');
      
      const updates = {};
      
      if (authVerified !== firestoreVerified) {
        updates.emailVerified = authVerified;
        console.log(`   - emailVerified: ${firestoreVerified} → ${authVerified}`);
      }
      
      if (authVerified !== firestoreIsVerified) {
        updates.isEmailVerified = authVerified;
        console.log(`   - isEmailVerified: ${firestoreIsVerified} → ${authVerified}`);
      }
      
      // Mettre à jour Firestore
      await updateDoc(userDocRef, updates);
      console.log('✅ Firestore mis à jour avec succès');
      
      // Vérifier la mise à jour
      const updatedDoc = await getDoc(userDocRef);
      const updatedData = updatedDoc.data();
      console.log('\n📊 Statut après synchronisation:');
      console.log(`   - emailVerified: ${updatedData.emailVerified}`);
      console.log(`   - isEmailVerified: ${updatedData.isEmailVerified}`);
      
    } else {
      console.log('\n✅ Les statuts sont déjà synchronisés');
    }
    
    // 5. Recommandations
    console.log('\n5. 💡 Recommandations:');
    if (authVerified) {
      console.log('   - L\'email est vérifié dans Firebase Auth');
      console.log('   - L\'utilisateur peut se connecter directement');
      console.log('   - Pas besoin de cliquer sur le lien de vérification');
    } else {
      console.log('   - L\'email n\'est pas vérifié dans Firebase Auth');
      console.log('   - L\'utilisateur doit cliquer sur le lien de vérification');
      console.log('   - Ou demander un nouveau lien de vérification');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Solution: L\'utilisateur n\'existe pas dans Firebase Auth');
    } else if (error.code === 'permission-denied') {
      console.log('💡 Solution: Problème de permissions Firestore');
    } else {
      console.log('💡 Solution: Vérifier la configuration Firebase');
    }
  }
}

async function listUsersWithVerificationIssues() {
  try {
    console.log('\n🔍 Recherche d\'utilisateurs avec des problèmes de vérification...');
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('emailVerified', '==', false));
    const querySnapshot = await getDocs(q);
    
    console.log(`\n📋 Utilisateurs avec emailVerified = false:`);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.email} (${doc.id})`);
    });
    
    const q2 = query(usersRef, where('isEmailVerified', '==', false));
    const querySnapshot2 = await getDocs(q2);
    
    console.log(`\n📋 Utilisateurs avec isEmailVerified = false:`);
    querySnapshot2.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.email} (${doc.id})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error);
  }
}

// Exécution du script
const email = process.argv[2];

if (email) {
  console.log(`🎯 Synchronisation pour: ${email}`);
  syncEmailVerification(email);
} else {
  console.log('📋 Liste des utilisateurs avec des problèmes de vérification:');
  listUsersWithVerificationIssues();
  
  console.log('\n💡 Usage:');
  console.log('   node fix-email-verification-sync.cjs <email>');
  console.log('   Exemple: node fix-email-verification-sync.cjs chapelleolivier00@gmail.com');
}

console.log('\n✅ Script terminé');
