#!/usr/bin/env node

/**
 * Script de déploiement rapide des règles Firestore avec support admin
 * Usage: node deploy-admin-rules.cjs
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Déploiement des règles Firestore avec support admin...');

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

  console.log('✅ Fichier firestore.rules trouvé');
  console.log('📋 Nouvelles règles à déployer:');
  
  // Afficher les nouvelles règles
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');
  
  if (rulesContent.includes('Collection admins')) {
    console.log('✅ Collection admins incluse');
  }
  
  if (rulesContent.includes('NOUVEAUX CHAMPS AUTORISÉS')) {
    console.log('✅ Champs de facturation autorisés');
  }
  
  if (rulesContent.includes('billingBic')) {
    console.log('✅ Champs billing inclus');
  }

  // Demander confirmation
  console.log('\n⚠️  ATTENTION: Ce déploiement va mettre à jour les règles de sécurité Firestore');
  console.log('📝 Les nouvelles règles incluent:');
  console.log('   • Collection admins pour votre app admin');
  console.log('   • Champs de facturation (billingBic, billingHolder, billingIban, billingText, billingVisible)');
  console.log('   • Champs de vérification email');
  console.log('   • Accès admin à toutes les collections');
  
  console.log('\n🔄 Déploiement en cours...');
  
  // Déployer les règles
  execSync('firebase deploy --only firestore:rules', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('\n✅ Règles Firestore déployées avec succès !');
  console.log('🔒 Les nouvelles permissions sont maintenant actives');
  console.log('👮‍♂️ Votre app admin devrait maintenant fonctionner');
  
  console.log('\n🧪 Test recommandé:');
  console.log('1. Redémarrez votre app admin');
  console.log('2. Essayez de vous connecter avec un compte admin');
  console.log('3. Vérifiez que vous pouvez accéder aux données utilisateur');
  
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
