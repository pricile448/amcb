#!/usr/bin/env node

/**
 * Script de diagnostic pour les problèmes de liens d'action Firebase
 * Usage: node diagnose-firebase-action.cjs
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth, applyActionCode, checkActionCode } = require('firebase/auth');

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

console.log('🔍 Diagnostic Firebase Action Links');
console.log('=====================================\n');

// Vérifier la configuration
console.log('📋 Configuration Firebase:');
console.log(`- Project ID: ${firebaseConfig.projectId}`);
console.log(`- Auth Domain: ${firebaseConfig.authDomain}`);
console.log(`- API Key: ${firebaseConfig.apiKey ? '✅ Présent' : '❌ Manquant'}`);
console.log(`- App ID: ${firebaseConfig.appId ? '✅ Présent' : '❌ Manquant'}\n`);

// Vérifier les variables d'environnement
console.log('🔧 Variables d\'environnement:');
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`- ${varName}: ${value ? '✅ Définie' : '❌ Manquante'}`);
});

console.log('\n🚨 Problèmes courants et solutions:');
console.log('====================================');

console.log('\n1. **Lien expiré (24h)**');
console.log('   - Cause: Le lien de vérification a expiré');
console.log('   - Solution: L\'utilisateur doit se connecter directement');
console.log('   - Ou demander un nouveau lien de vérification');

console.log('\n2. **Email déjà vérifié**');
console.log('   - Cause: L\'email était déjà vérifié');
console.log('   - Solution: L\'utilisateur peut se connecter directement');
console.log('   - Le système détecte automatiquement le statut vérifié');

console.log('\n3. **URL d\'action incorrecte**');
console.log('   - Cause: Configuration Firebase incorrecte');
console.log('   - Solution: Vérifier dans Firebase Console > Authentication > Settings');
console.log('   - Action URL doit être: http://localhost:5174/auth/action (dev)');
console.log('   - Ou: https://votre-domaine.com/auth/action (prod)');

console.log('\n4. **Code d\'action invalide**');
console.log('   - Cause: Le code oobCode est corrompu ou invalide');
console.log('   - Solution: Générer un nouveau lien de vérification');

console.log('\n5. **Domaines non autorisés**');
console.log('   - Cause: Le domaine n\'est pas dans la liste autorisée');
console.log('   - Solution: Ajouter le domaine dans Firebase Console > Authentication > Settings');

console.log('\n🔧 Actions recommandées:');
console.log('=======================');

console.log('\n1. **Vérifier la configuration Firebase Console:**');
console.log('   - Aller sur: https://console.firebase.google.com/');
console.log(`   - Projet: ${firebaseConfig.projectId}`);
console.log('   - Authentication > Settings > Authorized domains');
console.log('   - Ajouter: localhost, 127.0.0.1 (pour le développement)');

console.log('\n2. **Vérifier l\'Action URL:**');
console.log('   - Authentication > Settings > Action URL');
console.log('   - Dev: http://localhost:5174/auth/action');
console.log('   - Prod: https://votre-domaine.com/auth/action');

console.log('\n3. **Tester avec un utilisateur existant:**');
console.log('   - Se connecter directement sur /connexion');
console.log('   - Si l\'email est déjà vérifié, la connexion fonctionnera');

console.log('\n4. **Pour les nouveaux utilisateurs:**');
console.log('   - Créer un nouveau compte');
console.log('   - Vérifier l\'email dans les 24h');
console.log('   - Se connecter après vérification');

console.log('\n📊 Test de diagnostic:');
console.log('=====================');

// Fonction pour tester un code d'action
async function testActionCode(oobCode, mode = 'verifyEmail') {
  if (!oobCode) {
    console.log('❌ Aucun code d\'action fourni');
    return;
  }

  try {
    console.log(`🔍 Test du code d'action (${mode}):`);
    console.log(`- Code: ${oobCode.substring(0, 10)}...`);
    console.log(`- Longueur: ${oobCode.length} caractères`);

    if (mode === 'verifyEmail') {
      await applyActionCode(auth, oobCode);
      console.log('✅ Code d\'action valide');
    } else if (mode === 'resetPassword') {
      await checkActionCode(auth, oobCode);
      console.log('✅ Code de réinitialisation valide');
    }
  } catch (error) {
    console.log(`❌ Erreur: ${error.code}`);
    console.log(`   Message: ${error.message}`);
    
    switch (error.code) {
      case 'auth/invalid-action-code':
        console.log('   💡 Solution: Lien expiré ou email déjà vérifié');
        break;
      case 'auth/expired-action-code':
        console.log('   💡 Solution: Lien expiré, demander un nouveau lien');
        break;
      case 'auth/user-disabled':
        console.log('   💡 Solution: Compte désactivé');
        break;
      case 'auth/user-not-found':
        console.log('   💡 Solution: Utilisateur non trouvé');
        break;
      default:
        console.log('   💡 Solution: Vérifier la configuration Firebase');
    }
  }
}

// Si un code d'action est fourni en argument
const testCode = process.argv[2];
if (testCode) {
  console.log('\n🧪 Test du code d\'action fourni:');
  testActionCode(testCode);
}

console.log('\n✅ Diagnostic terminé');
console.log('💡 Pour plus d\'aide, consultez: TROUBLESHOOTING_EMAIL_VERIFICATION.md');
