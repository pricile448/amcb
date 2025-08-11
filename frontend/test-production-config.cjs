#!/usr/bin/env node

/**
 * Script pour tester la configuration Firebase de production
 * Usage: node test-production-config.cjs
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

console.log('🚀 Test de configuration Firebase Production');
console.log('============================================\n');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

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

let allVarsPresent = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Définie' : '❌ Manquante';
  console.log(`- ${varName}: ${status}`);
  if (!value) allVarsPresent = false;
});

console.log('\n🌐 Configuration URL d\'action:');
console.log('================================');

// Détecter l'environnement
const isProduction = process.env.NODE_ENV === 'production' || 
                    process.env.VITE_APP_ENV === 'production' ||
                    !process.env.VITE_FIREBASE_AUTH_DOMAIN?.includes('localhost');

if (isProduction) {
  console.log('✅ Environnement de production détecté');
  console.log('💡 URL d\'action recommandée:');
  console.log('   https://votre-domaine.com/auth/action');
} else {
  console.log('🔧 Environnement de développement détecté');
  console.log('💡 URL d\'action actuelle:');
  console.log('   http://localhost:5174/auth/action');
}

console.log('\n📧 Configuration Email Templates:');
console.log('==================================');

console.log('1. **Firebase Console > Authentication > Settings > Email Templates**');
console.log('2. **URL d\'action :** Mettre à jour avec votre domaine de production');
console.log('3. **Template HTML :** Utiliser le template personnalisé fourni');
console.log('4. **Objet :** "Vérifiez votre compte AmCbunq"');

console.log('\n🌐 Configuration Domaines autorisés:');
console.log('=====================================');

console.log('1. **Firebase Console > Authentication > Settings > Authorized domains**');
console.log('2. **Ajouter vos domaines de production :**');
console.log('   - votre-domaine.com');
console.log('   - www.votre-domaine.com');
console.log('   - amcbunq.vercel.app (si Vercel)');
console.log('   - amcbunq.netlify.app (si Netlify)');

console.log('\n🔧 Actions recommandées:');
console.log('=======================');

if (!allVarsPresent) {
  console.log('❌ **Variables d\'environnement manquantes**');
  console.log('💡 Créer un fichier .env.production avec toutes les variables');
} else {
  console.log('✅ **Configuration Firebase complète**');
}

if (!isProduction) {
  console.log('🔧 **URL d\'action à mettre à jour**');
  console.log('💡 Changer localhost:5174 par votre domaine de production');
} else {
  console.log('✅ **Environnement de production détecté**');
}

console.log('\n📋 Checklist de vérification:');
console.log('============================');

const checklist = [
  'URL d\'action mise à jour pour la production',
  'Template email personnalisé configuré',
  'Domaines autorisés ajoutés',
  'Variables d\'environnement de production configurées',
  'Test de création de compte avec le nouveau template',
  'Test de vérification email en production',
  'Test de connexion après vérification'
];

checklist.forEach((item, index) => {
  console.log(`${index + 1}. [ ] ${item}`);
});

console.log('\n🔍 Tests à effectuer:');
console.log('====================');

console.log('1. **Test de création de compte :**');
console.log('   - Créer un nouveau compte en production');
console.log('   - Vérifier que l\'email reçu utilise le nouveau template');

console.log('\n2. **Test de vérification email :**');
console.log('   - Cliquer sur le lien de vérification');
console.log('   - Vérifier la redirection vers la page de connexion');
console.log('   - Vérifier l\'accès au dashboard');

console.log('\n3. **Test de connexion :**');
console.log('   - Se connecter avec les identifiants');
console.log('   - Vérifier l\'accès au dashboard');
console.log('   - Vérifier la synchronisation emailVerified');

console.log('\n📁 Fichiers de référence:');
console.log('=========================');

console.log('- `email-template-production.html` : Template email personnalisé');
console.log('- `CONFIGURATION_PRODUCTION.md` : Guide complet de configuration');
console.log('- `SOLUTION_VERIFICATION_EMAIL.md` : Solution pour les problèmes de vérification');

console.log('\n✅ Test de configuration terminé');
console.log('💡 Suivez le guide CONFIGURATION_PRODUCTION.md pour la mise en place');
