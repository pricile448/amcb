#!/usr/bin/env node

/**
 * Script de Test de la Configuration de Migration
 * 
 * Ce script teste la configuration avant de lancer la migration complète
 * Usage: node test-migration-setup.cjs
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Charger la configuration
let config;
try {
  config = require('./migration-config.js');
  console.log('✅ Configuration chargée depuis migration-config.js');
} catch (error) {
  console.log('⚠️  Configuration non trouvée, utilisation des valeurs par défaut');
  config = {
    firebase: {
      apiKey: "your-api-key-here",
      authDomain: "your-project.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "your-sender-id",
      appId: "your-app-id"
    }
  };
}

// Vérifier la configuration Firebase
function checkFirebaseConfig() {
  console.log('\n🔍 Vérification de la configuration Firebase...');
  
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    if (!config.firebase[field] || config.firebase[field].includes('your-')) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    console.log(`❌ Champs manquants ou non configurés: ${missingFields.join(', ')}`);
    console.log('   Modifiez migration-config.js avec vos vraies valeurs Firebase');
    return false;
  }
  
  console.log('✅ Configuration Firebase valide');
  return true;
}

// Tester la connexion Firebase
async function testFirebaseConnection() {
  console.log('\n🔌 Test de connexion Firebase...');
  
  try {
    const app = initializeApp(config.firebase);
    const db = getFirestore(app);
    
    console.log('✅ Connexion Firebase établie');
    
    // Tester l'accès à Firestore
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`✅ Accès Firestore réussi - ${snapshot.size} utilisateurs trouvés`);
    
    return { success: true, userCount: snapshot.size };
    
  } catch (error) {
    console.log(`❌ Erreur de connexion Firebase: ${error.message}`);
    
    if (error.message.includes('invalid-api-key')) {
      console.log('   Vérifiez votre clé API Firebase');
    } else if (error.message.includes('permission-denied')) {
      console.log('   Vérifiez vos règles de sécurité Firestore');
    } else if (error.message.includes('project-not-found')) {
      console.log('   Vérifiez votre ID de projet Firebase');
    }
    
    return { success: false, error: error.message };
  }
}

// Vérifier la structure des collections
async function checkCollectionStructure() {
  console.log('\n📋 Vérification de la structure des collections...');
  
  try {
    const app = initializeApp(config.firebase);
    const db = getFirestore(app);
    
    const requiredCollections = [
      'accounts', 'beneficiaries', 'budgets', 'billing',
      'cardLimits', 'documents', 'notifications', 'transactions', 'transfers'
    ];
    
    const existingCollections = [];
    const missingCollections = [];
    
    for (const collectionName of requiredCollections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        existingCollections.push(collectionName);
        console.log(`   ✅ ${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        missingCollections.push(collectionName);
        console.log(`   ❌ ${collectionName}: Erreur d'accès`);
      }
    }
    
    console.log(`\n📊 Résumé des collections:`);
    console.log(`   • Existantes: ${existingCollections.length}/${requiredCollections.length}`);
    console.log(`   • Manquantes: ${missingCollections.length}/${requiredCollections.length}`);
    
    if (missingCollections.length > 0) {
      console.log(`   • Collections à créer: ${missingCollections.join(', ')}`);
    }
    
    return { existing: existingCollections, missing: missingCollections };
    
  } catch (error) {
    console.log(`❌ Erreur lors de la vérification des collections: ${error.message}`);
    return { existing: [], missing: [], error: error.message };
  }
}

// Vérifier un utilisateur spécifique
async function checkUserStructure(userId) {
  console.log(`\n👤 Vérification de la structure de l'utilisateur ${userId}...`);
  
  try {
    const app = initializeApp(config.firebase);
    const db = getFirestore(app);
    
    // Vérifier que l'utilisateur existe
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.log(`❌ Utilisateur ${userId} non trouvé`);
      return false;
    }
    
    console.log(`✅ Utilisateur trouvé: ${userDoc.data().email || 'Email non défini'}`);
    
    // Vérifier les sous-documents
    const subCollections = [
      'accounts', 'beneficiaries', 'budgets', 'billing',
      'cardLimits', 'documents', 'notifications', 'transactions', 'transfers'
    ];
    
    const existingSubDocs = [];
    const missingSubDocs = [];
    
    for (const subCollection of subCollections) {
      try {
        const subDoc = await getDoc(doc(db, subCollection, userId));
        if (subDoc.exists()) {
          existingSubDocs.push(subCollection);
          console.log(`   ✅ ${subCollection}: Document existant`);
        } else {
          missingSubDocs.push(subCollection);
          console.log(`   ❌ ${subCollection}: Document manquant`);
        }
      } catch (error) {
        missingSubDocs.push(subCollection);
        console.log(`   ❌ ${subCollection}: Erreur d'accès`);
      }
    }
    
    console.log(`\n📋 Structure de l'utilisateur ${userId}:`);
    console.log(`   • Documents existants: ${existingSubDocs.length}/${subCollections.length}`);
    console.log(`   • Documents manquants: ${missingSubDocs.length}/${subCollections.length}`);
    
    if (missingSubDocs.length > 0) {
      console.log(`   • À créer: ${missingSubDocs.join(', ')}`);
    }
    
    return { existing: existingSubDocs, missing: missingSubDocs };
    
  } catch (error) {
    console.log(`❌ Erreur lors de la vérification de l'utilisateur: ${error.message}`);
    return false;
  }
}

// Fonction principale de test
async function runTests() {
  console.log('🧪 Test de la Configuration de Migration\n');
  console.log('='.repeat(50));
  
  let allTestsPassed = true;
  
  // Test 1: Configuration Firebase
  const configValid = checkFirebaseConfig();
  if (!configValid) {
    allTestsPassed = false;
    console.log('\n❌ Configuration Firebase invalide - Migration impossible');
    return;
  }
  
  // Test 2: Connexion Firebase
  const connectionResult = await testFirebaseConnection();
  if (!connectionResult.success) {
    allTestsPassed = false;
    console.log('\n❌ Connexion Firebase échouée - Migration impossible');
    return;
  }
  
  // Test 3: Structure des collections
  const collectionStructure = await checkCollectionStructure();
  if (collectionStructure.error) {
    allTestsPassed = false;
    console.log('\n❌ Erreur lors de la vérification des collections');
  }
  
  // Test 4: Structure d'un utilisateur (si spécifié)
  const userId = process.argv[2];
  if (userId) {
    const userStructure = await checkUserStructure(userId);
    if (!userStructure) {
      allTestsPassed = false;
    }
  }
  
  // Résumé final
  console.log('\n' + '='.repeat(50));
  
  if (allTestsPassed) {
    console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('✅ Votre configuration est prête pour la migration');
    console.log('\n📋 Prochaines étapes:');
    console.log('   1. Vérifiez que la configuration vous convient');
    console.log('   2. Lancez un test de migration: node migrate-existing-users.cjs test USER_ID');
    console.log('   3. Lancez la migration complète: node migrate-existing-users.cjs');
  } else {
    console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('⚠️  Corrigez les problèmes avant de lancer la migration');
    console.log('\n🔧 Actions recommandées:');
    console.log('   1. Vérifiez votre configuration Firebase');
    console.log('   2. Vérifiez vos règles de sécurité Firestore');
    console.log('   3. Relancez ce test: node test-migration-setup.cjs');
  }
  
  console.log('\n📚 Consultez MIGRATION_GUIDE.md pour plus de détails');
}

// Gestion des arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node test-migration-setup.cjs [userId]

Ce script teste la configuration de migration avant de lancer la migration complète.

Arguments:
  userId    - ID d'un utilisateur spécifique à tester (optionnel)

Exemples:
  node test-migration-setup.cjs                    # Test complet
  node test-migration-setup.cjs abc123             # Test avec un utilisateur spécifique
  node test-migration-setup.cjs --help             # Afficher cette aide

Le script vérifie:
  ✅ Configuration Firebase
  ✅ Connexion à Firebase
  ✅ Accès à Firestore
  ✅ Structure des collections
  ✅ Structure d'un utilisateur (si spécifié)
  `);
  process.exit(0);
}

// Lancer les tests
runTests().catch((error) => {
  console.error('\n💥 Erreur fatale lors des tests:', error.message);
  process.exit(1);
});
