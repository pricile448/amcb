#!/usr/bin/env node

/**
 * Script de déploiement des règles Firestore
 * Usage: node deploy-firestore-rules.cjs
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Déploiement des règles Firestore...');

try {
  // Vérifier que firebase CLI est installé
  try {
    execSync('firebase --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Firebase CLI non trouvé. Installez-le avec: npm install -g firebase-tools');
    process.exit(1);
  }

  // Vérifier que le fichier firestore.rules existe
  const rulesPath = path.join(__dirname, 'firestore.rules');
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ Fichier firestore.rules non trouvé');
    process.exit(1);
  }

  // Vérifier que firebase.json existe
  const firebaseConfigPath = path.join(__dirname, 'firebase.json');
  if (!fs.existsSync(firebaseConfigPath)) {
    console.error('❌ Fichier firebase.json non trouvé');
    process.exit(1);
  }

  console.log('✅ Configuration Firebase trouvée');
  console.log('📋 Règles Firestore à déployer:');
  
  // Afficher les nouvelles règles
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  const newRules = rulesContent.match(/\/\/ 🆕 NOUVEAUX CHAMPS AUTORISÉS[\s\S]*?\]\)/);
  if (newRules) {
    console.log('🆕 Nouveaux champs autorisés:');
    console.log(newRules[0]);
  }

  // Demander confirmation
  console.log('\n⚠️  ATTENTION: Ce déploiement va mettre à jour les règles de sécurité Firestore');
  console.log('📝 Les nouvelles règles autorisent:');
  console.log('   • Champs de facturation (billingBic, billingHolder, billingIban, billingText, billingVisible)');
  console.log('   • Champs de vérification email (emailVerificationCode, emailVerifiedAt, etc.)');
  console.log('   • Champs de validation (phoneVerified, validatedAt, verifiedAt)');
  console.log('   • Accès admin aux données de facturation de tous les utilisateurs');
  
  console.log('\n🔄 Déploiement en cours...');
  
  // Déployer les règles
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('\n✅ Règles Firestore déployées avec succès !');
  console.log('🔒 Les nouvelles permissions sont maintenant actives');
  
} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error.message);
  
  if (error.message.includes('Not logged in')) {
    console.log('\n🔑 Vous devez d\'abord vous connecter à Firebase:');
    console.log('   firebase login');
  } else if (error.message.includes('No project')) {
    console.log('\n🏗️  Vous devez d\'abord configurer le projet Firebase:');
    console.log('   firebase use --add');
  }
  
  process.exit(1);
}
