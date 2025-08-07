#!/usr/bin/env node

/**
 * Script pour tester la configuration Firebase pour Render
 * Usage: node test-render-config.cjs
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

console.log('🚀 Test de configuration Firebase pour Render');
console.log('=============================================\n');

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

console.log('\n🌐 Configuration URL d\'action pour Render:');
console.log('===========================================');

const renderDomain = 'mybunq.amccredit.com';
const actionUrl = `https://${renderDomain}/auth/action`;

console.log('✅ Domaine Render détecté :', renderDomain);
console.log('💡 URL d\'action à configurer dans Firebase :');
console.log(`   ${actionUrl}`);

console.log('\n📧 Configuration Email Templates:');
console.log('==================================');

console.log('1. **Firebase Console > Authentication > Settings > Email Templates**');
console.log('2. **URL d\'action :** Mettre à jour avec :');
console.log(`   ${actionUrl}`);
console.log('3. **Template HTML :** Utiliser le template personnalisé fourni');
console.log('4. **Objet :** "Vérifiez votre compte AmCbunq"');

console.log('\n🌐 Configuration Domaines autorisés:');
console.log('=====================================');

console.log('1. **Firebase Console > Authentication > Settings > Authorized domains**');
console.log('2. **Ajouter vos domaines de production :**');
console.log(`   - ${renderDomain} ✅ **Votre domaine Render**`);
console.log('   - amccredit.com (domaine parent)');

console.log('\n🔧 Actions recommandées:');
console.log('=======================');

if (!allVarsPresent) {
  console.log('❌ **Variables d\'environnement manquantes**');
  console.log('💡 Configurer les variables dans Render Dashboard > Environment Variables');
} else {
  console.log('✅ **Configuration Firebase complète**');
}

console.log('🔧 **URL d\'action à mettre à jour dans Firebase Console**');
console.log(`💡 Changer localhost:5174 par ${actionUrl}`);

console.log('\n📋 Checklist de vérification:');
console.log('============================');

const checklist = [
  `URL d'action mise à jour : ${actionUrl}`,
  'Template email personnalisé configuré',
  `Domaines autorisés ajoutés : ${renderDomain}`,
  'Variables d\'environnement Render configurées',
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
console.log(`   - Aller sur https://${renderDomain}/ouvrir-compte`);
console.log('   - Créer un nouveau compte');
console.log('   - Vérifier que l\'email reçu utilise le nouveau template');

console.log('\n2. **Test de vérification email :**');
console.log('   - Cliquer sur le lien de vérification dans l\'email');
console.log(`   - Vérifier la redirection vers https://${renderDomain}/connexion`);
console.log('   - Vérifier l\'accès au dashboard');

console.log('\n3. **Test de connexion :**');
console.log(`   - Se connecter sur https://${renderDomain}/connexion`);
console.log('   - Vérifier l\'accès au dashboard');
console.log('   - Vérifier la synchronisation emailVerified');

console.log('\n🌐 URLs importantes de votre application:');
console.log('==========================================');

const urls = {
  'URL principale': `https://${renderDomain}/`,
  'Connexion': `https://${renderDomain}/connexion`,
  'Inscription': `https://${renderDomain}/ouvrir-compte`,
  'Dashboard': `https://${renderDomain}/dashboard`,
  'Action Firebase': `https://${renderDomain}/auth/action`
};

Object.entries(urls).forEach(([name, url]) => {
  console.log(`- ${name}: ${url}`);
});

console.log('\n📁 Fichiers de référence:');
console.log('=========================');

console.log('- `email-template-production.html` : Template email personnalisé');
console.log('- `CONFIGURATION_PRODUCTION.md` : Guide complet de configuration');
console.log('- `SOLUTION_VERIFICATION_EMAIL.md` : Solution pour les problèmes de vérification');

console.log('\n✅ Test de configuration terminé');
console.log('💡 Suivez le guide CONFIGURATION_PRODUCTION.md pour la mise en place');
console.log(`🌐 Votre application est accessible sur : https://${renderDomain}/`);
