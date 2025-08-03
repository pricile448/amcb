#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration des variables d\'environnement Vercel...\n');

// Variables Firebase à configurer
const firebaseVars = {
  'VITE_FIREBASE_API_KEY': 'AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI',
  'VITE_FIREBASE_AUTH_DOMAIN': 'amcbunq.firebaseapp.com',
  'VITE_FIREBASE_PROJECT_ID': 'amcbunq',
  'VITE_FIREBASE_STORAGE_BUCKET': 'amcbunq.firebasestorage.app',
  'VITE_FIREBASE_MESSAGING_SENDER_ID': '466533825569',
  'VITE_FIREBASE_APP_ID': '1:466533825569:web:873294f84a51aee5f63760'
};

// Variables SMTP à configurer
const smtpVars = {
  'SMTP_HOST': 'mail.amccredit.com',
  'SMTP_PORT': '465',
  'SMTP_SECURE': 'ssl',
  'SMTP_USER': 'amcbunq@amccredit.com',
  'SMTP_PASS': 'VOTRE_MOT_DE_PASSE_EMAIL' // À remplacer par le vrai mot de passe
};

// Fonction pour exécuter une commande Vercel
function runVercelCommand(command) {
  try {
    console.log(`📝 Exécution: ${command}`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ Succès: ${output.trim()}`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    return false;
  }
}

// Configurer les variables Firebase
console.log('🔧 Configuration des variables Firebase...');
Object.entries(firebaseVars).forEach(([key, value]) => {
  const command = `vercel env add ${key} production`;
  console.log(`\n📋 Variable: ${key}`);
  console.log(`💡 Valeur: ${value}`);
  
  // Note: Cette commande nécessite une interaction manuelle
  console.log(`⚠️  Exécutez manuellement: ${command}`);
  console.log(`   Puis entrez la valeur: ${value}`);
});

// Configurer les variables SMTP
console.log('\n🔧 Configuration des variables SMTP...');
Object.entries(smtpVars).forEach(([key, value]) => {
  console.log(`\n📋 Variable: ${key}`);
  console.log(`💡 Valeur: ${value}`);
  
  if (key === 'SMTP_PASS') {
    console.log(`⚠️  IMPORTANT: Remplacez 'VOTRE_MOT_DE_PASSE_EMAIL' par le vrai mot de passe SMTP`);
  }
  
  console.log(`⚠️  Exécutez manuellement: vercel env add ${key} production`);
  console.log(`   Puis entrez la valeur: ${value}`);
});

console.log('\n📋 Instructions manuelles:');
console.log('1. Allez sur https://vercel.com/dashboard');
console.log('2. Sélectionnez votre projet "studio"');
console.log('3. Allez dans "Settings" > "Environment Variables"');
console.log('4. Ajoutez chaque variable une par une');
console.log('5. Ou utilisez la CLI Vercel: vercel env add NOM_VARIABLE production');

console.log('\n🔍 Vérification de la configuration:');
console.log('1. Testez la connexion avec un compte existant');
console.log('2. Vérifiez les logs dans la console du navigateur');
console.log('3. Vérifiez les logs Vercel dans le dashboard');

console.log('\n✅ Configuration terminée !');
console.log('📧 N\'oubliez pas de configurer le mot de passe SMTP réel !'); 