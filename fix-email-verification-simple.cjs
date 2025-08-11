#!/usr/bin/env node

/**
 * Script simple pour corriger le statut de vérification email
 * Usage: node fix-email-verification-simple.cjs <email>
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
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
const db = getFirestore(app);

console.log('🔧 Correction Email Verification');
console.log('================================\n');

async function fixEmailVerification(email) {
  try {
    console.log(`📧 Recherche de l'utilisateur: ${email}`);
    
    // 1. Rechercher l'utilisateur dans Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Utilisateur non trouvé dans Firestore');
      return;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;
    
    console.log(`✅ Utilisateur trouvé:`);
    console.log(`   - UID: ${userId}`);
    console.log(`   - Email: ${userData.email}`);
    console.log(`   - emailVerified: ${userData.emailVerified}`);
    console.log(`   - isEmailVerified: ${userData.isEmailVerified}`);
    console.log(`   - kycStatus: ${userData.kycStatus}`);
    
    // 2. Vérifier si une correction est nécessaire
    const needsFix = userData.emailVerified === false || userData.isEmailVerified === false;
    
    if (needsFix) {
      console.log('\n🔧 Correction nécessaire...');
      
      const updates = {
        emailVerified: true,
        isEmailVerified: true
      };
      
      console.log(`   - emailVerified: ${userData.emailVerified} → true`);
      console.log(`   - isEmailVerified: ${userData.isEmailVerified} → true`);
      
      // Mettre à jour Firestore
      await updateDoc(userDoc.ref, updates);
      console.log('✅ Firestore mis à jour avec succès');
      
      // Vérifier la mise à jour
      const updatedDoc = await getDoc(userDoc.ref);
      const updatedData = updatedDoc.data();
      console.log('\n📊 Statut après correction:');
      console.log(`   - emailVerified: ${updatedData.emailVerified}`);
      console.log(`   - isEmailVerified: ${updatedData.isEmailVerified}`);
      
    } else {
      console.log('\n✅ Le statut est déjà correct');
    }
    
    // 3. Recommandations
    console.log('\n💡 Recommandations:');
    console.log('   - L\'utilisateur peut maintenant se connecter directement');
    console.log('   - Pas besoin de cliquer sur le lien de vérification');
    console.log('   - Le statut KYC peut être vérifié séparément');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    
    if (error.code === 'permission-denied') {
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
    
    console.log(`\n📋 Utilisateurs avec emailVerified = false (${querySnapshot.size} trouvés):`);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.email} (${doc.id})`);
    });
    
    const q2 = query(usersRef, where('isEmailVerified', '==', false));
    const querySnapshot2 = await getDocs(q2);
    
    console.log(`\n📋 Utilisateurs avec isEmailVerified = false (${querySnapshot2.size} trouvés):`);
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
  console.log(`🎯 Correction pour: ${email}`);
  fixEmailVerification(email);
} else {
  console.log('📋 Liste des utilisateurs avec des problèmes de vérification:');
  listUsersWithVerificationIssues();
  
  console.log('\n💡 Usage:');
  console.log('   node fix-email-verification-simple.cjs <email>');
  console.log('   Exemple: node fix-email-verification-simple.cjs chapelleolivier00@gmail.com');
}

console.log('\n✅ Script terminé');
