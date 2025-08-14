#!/usr/bin/env node

/**
 * Script de Démarrage Rapide pour la Migration (ES Module)
 * 
 * Ce script vous guide étape par étape pour configurer et lancer la migration
 * Usage: node start-migration.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 DÉMARRAGE RAPIDE - Migration des Utilisateurs Existants\n');
console.log('='.repeat(60));

// Vérifier les fichiers nécessaires
console.log('📁 Vérification des fichiers nécessaires...\n');

const requiredFiles = [
  'migrate-existing-users.mjs',
  'migration-config.mjs',
  'test-migration-setup.mjs'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Présent`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Certains fichiers sont manquants !');
  console.log('Veuillez vous assurer que tous les fichiers de migration sont présents.');
  process.exit(1);
}

console.log('\n✅ Tous les fichiers sont présents !');

// Vérifier la configuration
console.log('\n🔧 Vérification de la configuration...\n');

try {
  const config = await import('./migration-config.mjs');
  
  // Vérifier la configuration Firebase
  const firebaseConfig = config.default.firebase;
  const missingFields = [];
  
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (!value || value.includes('your-')) {
      missingFields.push(key);
    }
  });
  
  if (missingFields.length > 0) {
    console.log('⚠️  Configuration Firebase incomplète !');
    console.log(`Champs manquants: ${missingFields.join(', ')}`);
    console.log('\n📝 Actions requises:');
    console.log('1. Ouvrez migration-config.mjs');
    console.log('2. Remplacez les valeurs "your-..." par vos vraies clés Firebase');
    console.log('3. Sauvegardez le fichier');
    console.log('4. Relancez ce script');
    
    console.log('\n🔑 Exemple de configuration:');
    console.log('firebase: {');
    console.log('  apiKey: "AIzaSyC...",');
    console.log('  authDomain: "mon-projet.firebaseapp.com",');
    console.log('  projectId: "mon-projet-123",');
    console.log('  // ... autres valeurs');
    console.log('}');
    
    process.exit(1);
  }
  
  console.log('✅ Configuration Firebase valide');
  
  // Vérifier la configuration de migration
  if (config.default.migration.dryRun) {
    console.log('⚠️  Mode DRY RUN activé (aucune modification)');
  } else {
    console.log('✅ Mode migration réel activé');
  }
  
} catch (error) {
  console.log('❌ Erreur lors du chargement de la configuration:', error.message);
  process.exit(1);
}

// Afficher les étapes suivantes
console.log('\n🎯 PROCHAINES ÉTAPES\n');
console.log('1️⃣  TESTER LA CONFIGURATION:');
console.log('   node test-migration-setup.mjs');
console.log('');

console.log('2️⃣  TESTER SUR UN UTILISATEUR (recommandé):');
console.log('   node migrate-existing-users.mjs test USER_ID');
console.log('   (remplacez USER_ID par l\'ID d\'un vrai utilisateur)');
console.log('');

console.log('3️⃣  LANCER LA MIGRATION COMPLÈTE:');
console.log('   node migrate-existing-users.mjs');
console.log('');

// Vérifier si les dépendances sont installées
console.log('📦 Vérification des dépendances...\n');

try {
  await import('firebase/app');
  await import('firebase/firestore');
  console.log('✅ Dépendances Firebase installées');
} catch (error) {
  console.log('❌ Dépendances Firebase manquantes !');
  console.log('\n🔧 Installation requise:');
  console.log('npm install firebase firebase-admin');
  console.log('\nAprès installation, relancez ce script.');
  process.exit(1);
}

// Menu interactif
console.log('\n🎮 MENU INTERACTIF\n');
console.log('Que souhaitez-vous faire ?\n');

console.log('1. Tester la configuration');
console.log('2. Tester sur un utilisateur spécifique');
console.log('3. Lancer la migration complète');
console.log('4. Afficher l\'aide');
console.log('5. Quitter');

// Simuler une interaction (en vrai, vous devrez lancer les commandes manuellement)
console.log('\n💡 Pour continuer, utilisez les commandes suivantes:');
console.log('');

console.log('🧪 Test de configuration:');
console.log('   node test-migration-setup.mjs');
console.log('');

console.log('🔍 Test sur un utilisateur:');
console.log('   node migrate-existing-users.mjs test VOTRE_USER_ID');
console.log('');

console.log('🚀 Migration complète:');
console.log('   node migrate-existing-users.mjs');
console.log('');

console.log('📚 Aide:');
console.log('   node migrate-existing-users.mjs help');
console.log('');

console.log('='.repeat(60));
console.log('🎉 Vous êtes prêt à migrer vos utilisateurs existants !');
console.log('Commencez par tester la configuration, puis testez sur un utilisateur avant la migration complète.');
console.log('='.repeat(60));
