#!/usr/bin/env node

/**
 * 🔧 FIX: Correction du statut de vérification pour permettre la création automatique des comptes
 * 
 * Ce script corrige le statut verificationStatus pour qu'il soit cohérent avec kycStatus
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "amcbunq.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "amcbunq",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "amcbunq.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Corriger le statut de vérification d'un utilisateur
 */
async function fixVerificationStatus(userId) {
  try {
    console.log(`\n🔧 CORRECTION du statut de vérification pour userId: ${userId}`);
    console.log('=' .repeat(70));
    
    // Mettre à jour le document utilisateur
    const userDocRef = doc(db, 'users', userId);
    
    const updates = {
      verificationStatus: 'verified', // ✅ Corriger le statut de vérification
      status: 'verified', // ✅ Corriger le statut général
      updatedAt: new Date(), // ✅ Mettre à jour la date
      lastUpdated: new Date() // ✅ Mettre à jour la date
    };
    
    console.log('📝 Mise à jour des champs:');
    console.log(`   verificationStatus: "unverified" → "verified"`);
    console.log(`   status: "pending" → "verified"`);
    console.log(`   updatedAt: ${new Date().toISOString()}`);
    console.log(`   lastUpdated: ${new Date().toISOString()}`);
    
    // Appliquer les mises à jour
    await updateDoc(userDocRef, updates);
    
    console.log('\n✅ Statut de vérification corrigé avec succès !');
    console.log('\n🎯 MAINTENANT la création automatique des comptes devrait fonctionner !');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    return false;
  }
}

/**
 * Vérifier que la correction a bien fonctionné
 */
async function verifyFix(userId) {
  try {
    console.log('\n🔍 VÉRIFICATION de la correction...');
    
    const { getDoc } = require('firebase/firestore');
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      console.log('\n📊 STATUTS APRÈS CORRECTION:');
      console.log(`   kycStatus: ${userData.kycStatus}`);
      console.log(`   verificationStatus: ${userData.verificationStatus}`);
      console.log(`   status: ${userData.status}`);
      console.log(`   emailVerified: ${userData.emailVerified}`);
      
      // Vérifier la cohérence
      const isConsistent = userData.kycStatus === 'verified' && 
                          userData.verificationStatus === 'verified' && 
                          userData.status === 'verified';
      
      if (isConsistent) {
        console.log('\n🎉 SUCCÈS ! Tous les statuts sont maintenant cohérents !');
        console.log('   La création automatique des comptes devrait fonctionner.');
      } else {
        console.log('\n⚠️  ATTENTION: Les statuts ne sont pas encore tous cohérents');
        console.log('   Vérifiez manuellement dans Firestore.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🔧 FIX: Correction du statut de vérification');
  console.log('=' .repeat(80));
  
  // Récupérer l'userId depuis les arguments
  const userId = process.argv[2];
  
  if (!userId) {
    console.log('\n❌ USAGE: node fix-verification-status.cjs <userId>');
    console.log('\n📋 Exemple:');
    console.log('   node fix-verification-status.cjs <votre-user-id>');
    console.log('\n💡 Pour trouver votre userId:');
    console.log('   1. Ouvrez la console Firebase');
    console.log('   2. Allez dans Firestore > users');
    console.log('   3. Copiez l\'ID de votre utilisateur');
    return;
  }
  
  // Corriger le statut
  const success = await fixVerificationStatus(userId);
  
  if (success) {
    // Vérifier que la correction a fonctionné
    await verifyFix(userId);
    
    console.log('\n🚀 PROCHAINES ÉTAPES:');
    console.log('   1. Rechargez votre application');
    console.log('   2. Allez sur la page "Mes Comptes"');
    console.log('   3. Les comptes devraient se créer automatiquement !');
  }
  
  console.log('\n🏁 Correction terminée');
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fixVerificationStatus,
  verifyFix
};
