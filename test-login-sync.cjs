#!/usr/bin/env node

/**
 * Script pour tester la synchronisation email lors de la connexion
 * Usage: node test-login-sync.cjs <email> <password>
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, getDoc, updateDoc, collection, query, getDocs } = require('firebase/firestore');

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

console.log('🧪 Test de synchronisation email lors de la connexion');
console.log('===================================================\n');

async function testLoginSync(email, password) {
  try {
    console.log(`📧 Test de connexion pour: ${email}`);
    
    // 1. Vérifier le statut avant connexion
    console.log('\n1. 📊 Statut avant connexion:');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Utilisateur non trouvé dans Firestore');
      return;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userDataBefore = userDoc.data();
    
    console.log(`   - UID: ${userDoc.id}`);
    console.log(`   - emailVerified: ${userDataBefore.emailVerified}`);
    console.log(`   - isEmailVerified: ${userDataBefore.isEmailVerified}`);
    
    // 2. Se connecter
    console.log('\n2. 🔐 Connexion Firebase Auth...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`   ✅ Connexion réussie:`);
    console.log(`   - UID: ${user.uid}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Email Verified (Auth): ${user.emailVerified}`);
    
    // 3. Vérifier le statut après connexion
    console.log('\n3. 📊 Statut après connexion:');
    const userDocAfter = await getDoc(doc(db, 'users', user.uid));
    const userDataAfter = userDocAfter.data();
    
    console.log(`   - emailVerified: ${userDataAfter.emailVerified}`);
    console.log(`   - isEmailVerified: ${userDataAfter.isEmailVerified}`);
    
    // 4. Comparaison
    console.log('\n4. 🔍 Comparaison:');
    console.log(`   - Firebase Auth: ${user.emailVerified}`);
    console.log(`   - Firestore emailVerified: ${userDataAfter.emailVerified}`);
    console.log(`   - Firestore isEmailVerified: ${userDataAfter.isEmailVerified}`);
    
    const authVerified = user.emailVerified;
    const firestoreVerified = userDataAfter.emailVerified || false;
    const firestoreIsVerified = userDataAfter.isEmailVerified || false;
    
    if (authVerified === firestoreVerified && authVerified === firestoreIsVerified) {
      console.log('\n✅ Synchronisation réussie !');
      console.log('💡 L\'utilisateur peut maintenant accéder au dashboard');
    } else {
      console.log('\n❌ Problème de synchronisation détecté');
      console.log('💡 Vérifier les règles Firestore et la logique de synchronisation');
    }
    
    // 5. Se déconnecter
    await signOut(auth);
    console.log('\n✅ Déconnexion réussie');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    
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
  console.log(`🎯 Test pour: ${email}`);
  testLoginSync(email, password);
} else {
  console.log('💡 Usage:');
  console.log('   node test-login-sync.cjs <email> <password>');
  console.log('   Exemple: node test-login-sync.cjs chapelleolivier00@gmail.com motdepasse123');
}

console.log('\n✅ Script terminé');
