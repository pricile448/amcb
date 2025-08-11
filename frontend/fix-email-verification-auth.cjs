#!/usr/bin/env node

/**
 * Script pour corriger le statut de vérification email via l'authentification
 * Usage: node fix-email-verification-auth.cjs <email> <password>
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
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

console.log('🔧 Correction Email Verification via Auth');
console.log('=========================================\n');

async function fixEmailVerificationWithAuth(email, password) {
  try {
    console.log(`📧 Connexion avec: ${email}`);
    
    // 1. Se connecter avec l'utilisateur
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`✅ Connexion réussie:`);
    console.log(`   - UID: ${user.uid}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Email Verified (Auth): ${user.emailVerified}`);
    
    // 2. Vérifier le statut dans Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ Document utilisateur non trouvé dans Firestore');
      await signOut(auth);
      return;
    }
    
    const userData = userDoc.data();
    console.log(`✅ Document Firestore trouvé:`);
    console.log(`   - emailVerified: ${userData.emailVerified}`);
    console.log(`   - isEmailVerified: ${userData.isEmailVerified}`);
    console.log(`   - kycStatus: ${userData.kycStatus}`);
    
    // 3. Comparer les statuts
    const authVerified = user.emailVerified;
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
      
      // Mettre à jour Firestore (maintenant autorisé car l'utilisateur est connecté)
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
    
    // 5. Se déconnecter
    await signOut(auth);
    console.log('✅ Déconnexion réussie');
    
    // 6. Recommandations
    console.log('\n💡 Recommandations:');
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
    console.error('❌ Erreur lors de la correction:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Solution: Utilisateur non trouvé');
    } else if (error.code === 'auth/wrong-password') {
      console.log('💡 Solution: Mot de passe incorrect');
    } else if (error.code === 'auth/invalid-email') {
      console.log('💡 Solution: Email invalide');
    } else if (error.code === 'permission-denied') {
      console.log('💡 Solution: Problème de permissions Firestore');
    } else {
      console.log('💡 Solution: Vérifier la configuration Firebase');
    }
  }
}

// Exécution du script
const email = process.argv[2];
const password = process.argv[3];

if (email && password) {
  console.log(`🎯 Correction pour: ${email}`);
  fixEmailVerificationWithAuth(email, password);
} else {
  console.log('💡 Usage:');
  console.log('   node fix-email-verification-auth.cjs <email> <password>');
  console.log('   Exemple: node fix-email-verification-auth.cjs chapelleolivier00@gmail.com motdepasse123');
  console.log('\n⚠️  Note: Vous devez connaître le mot de passe de l\'utilisateur');
}

console.log('\n✅ Script terminé');
