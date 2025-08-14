#!/usr/bin/env node

/**
 * Script de Migration des Utilisateurs Existants (ES Module)
 * 
 * Ce script migre tous les utilisateurs existants vers la nouvelle structure
 * de sous-documents tout en préservant leurs données actuelles.
 * 
 * Usage: node migrate-existing-users.mjs
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  listUsers,
  getUsersByEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc,
  query,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

// Configuration Firebase (à adapter selon votre projet)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Configuration de migration
const MIGRATION_CONFIG = {
  batchSize: 50, // Traiter par lots pour éviter les timeouts
  dryRun: false, // Mettre à true pour tester sans modifier les données
  backupBeforeMigration: true, // Créer une sauvegarde avant migration
  skipExistingDocuments: true, // Ne pas écraser les documents existants
  logLevel: 'info' // 'debug', 'info', 'warn', 'error'
};

// Logger personnalisé
const logger = {
  debug: (msg, ...args) => MIGRATION_CONFIG.logLevel === 'debug' && console.log(`🔍 DEBUG: ${msg}`, ...args),
  info: (msg, ...args) => console.log(`ℹ️  ${msg}`, ...args),
  warn: (msg, ...args) => console.log(`⚠️  ${msg}`, ...args),
  error: (msg, ...args) => console.log(`❌ ${msg}`, ...args),
  success: (msg, ...args) => console.log(`✅ ${msg}`, ...args),
  progress: (current, total, msg = '') => {
    const percentage = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
    console.log(`\r🔄 [${bar}] ${percentage}% (${current}/${total}) ${msg}`);
  }
};

// Structure des sous-documents à créer
const REQUIRED_SUBDOCUMENTS = {
  accounts: {
    path: 'accounts',
    required: true,
    defaultData: (userId) => ({
      userId,
      accounts: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },
  beneficiaries: {
    path: 'beneficiaries',
    required: true,
    defaultData: (userId) => ({
      userId,
      beneficiaries: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },
  budgets: {
    path: 'budgets',
    required: true,
    defaultData: (userId) => ({
      userId,
      budgets: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },
  billing: {
    path: 'billing',
    required: true,
    defaultData: (userId) => ({
      userId,
      invoices: [],
      paymentMethods: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },
  cardLimits: {
    path: 'cardLimits',
    required: true,
    defaultData: (userId) => ({
      userId,
      limits: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },
  documents: {
    path: 'documents',
    required: true,
    defaultData: (userId) => ({
      userId,
      documents: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },
  notifications: {
    path: 'notifications',
    required: true,
    defaultData: (userId) => ({
      userId,
      preferences: {
        email: true,
        push: true,
        sms: false
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },
  transactions: {
    path: 'transactions',
    required: true,
    defaultData: (userId) => ({
      userId,
      transactions: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  },
  transfers: {
    path: 'transfers',
    required: true,
    defaultData: (userId) => ({
      userId,
      transfers: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }
};

/**
 * Vérifier si un utilisateur a déjà la structure complète
 */
async function checkUserStructure(userId) {
  const missingDocuments = [];
  const existingDocuments = [];
  
  for (const [key, config] of Object.entries(REQUIRED_SUBDOCUMENTS)) {
    try {
      const docRef = doc(db, config.path, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        existingDocuments.push(key);
        logger.debug(`Document ${key} existe pour l'utilisateur ${userId}`);
      } else {
        missingDocuments.push(key);
        logger.debug(`Document ${key} manquant pour l'utilisateur ${userId}`);
      }
    } catch (error) {
      logger.error(`Erreur lors de la vérification du document ${key}:`, error.message);
      missingDocuments.push(key);
    }
  }
  
  return { missingDocuments, existingDocuments };
}

/**
 * Créer les sous-documents manquants pour un utilisateur
 */
async function createMissingDocuments(userId, missingDocuments) {
  if (missingDocuments.length === 0) {
    logger.debug(`Aucun document manquant pour l'utilisateur ${userId}`);
    return { created: 0, errors: 0 };
  }
  
  const batch = writeBatch(db);
  let created = 0;
  let errors = 0;
  
  for (const docKey of missingDocuments) {
    try {
      const config = REQUIRED_SUBDOCUMENTS[docKey];
      const docRef = doc(db, config.path, userId);
      const defaultData = config.defaultData(userId);
      
      if (MIGRATION_CONFIG.dryRun) {
        logger.debug(`[DRY RUN] Créerait le document ${docKey} pour l'utilisateur ${userId}`);
        created++;
      } else {
        batch.set(docRef, defaultData);
        created++;
        logger.debug(`Document ${docKey} ajouté au batch pour l'utilisateur ${userId}`);
      }
    } catch (error) {
      logger.error(`Erreur lors de la préparation du document ${docKey}:`, error.message);
      errors++;
    }
  }
  
  if (!MIGRATION_CONFIG.dryRun && created > 0) {
    try {
      await batch.commit();
      logger.success(`✅ ${created} documents créés pour l'utilisateur ${userId}`);
    } catch (error) {
      logger.error(`Erreur lors de la création des documents pour l'utilisateur ${userId}:`, error.message);
      errors++;
    }
  }
  
  return { created, errors };
}

/**
 * Migrer un utilisateur spécifique
 */
async function migrateUser(userId, userData) {
  try {
    logger.info(`🔄 Migration de l'utilisateur: ${userData.email || userId}`);
    
    // Vérifier la structure actuelle
    const { missingDocuments, existingDocuments } = await checkUserStructure(userId);
    
    if (missingDocuments.length === 0) {
      logger.info(`✅ Utilisateur ${userId} a déjà la structure complète`);
      return { status: 'already_complete', missing: 0, created: 0, errors: 0 };
    }
    
    logger.info(`📋 Documents manquants: ${missingDocuments.join(', ')}`);
    logger.info(`📋 Documents existants: ${existingDocuments.join(', ')}`);
    
    // Créer les documents manquants
    const { created, errors } = await createMissingDocuments(userId, missingDocuments);
    
    if (errors === 0) {
      logger.success(`✅ Migration réussie pour l'utilisateur ${userId}`);
      return { status: 'success', missing: missingDocuments.length, created, errors };
    } else {
      logger.warn(`⚠️  Migration partielle pour l'utilisateur ${userId} (${errors} erreurs)`);
      return { status: 'partial', missing: missingDocuments.length, created, errors };
    }
    
  } catch (error) {
    logger.error(`💥 Erreur lors de la migration de l'utilisateur ${userId}:`, error.message);
    return { status: 'error', missing: 0, created: 0, errors: 1, error: error.message };
  }
}

/**
 * Récupérer tous les utilisateurs depuis Firestore
 */
async function getAllUsers() {
  try {
    logger.info('🔍 Récupération de tous les utilisateurs...');
    
    // Récupérer depuis la collection users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    logger.success(`✅ ${users.length} utilisateurs trouvés`);
    return users;
    
  } catch (error) {
    logger.error('Erreur lors de la récupération des utilisateurs:', error.message);
    throw error;
  }
}

/**
 * Créer une sauvegarde des utilisateurs existants
 */
async function createBackup(users) {
  if (!MIGRATION_CONFIG.backupBeforeMigration) {
    logger.info('⏭️  Sauvegarde désactivée');
    return;
  }
  
  try {
    logger.info('💾 Création de la sauvegarde...');
    
    const backupData = {
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    };
    
    // Sauvegarder dans Firestore
    const backupRef = doc(db, 'migrations', `backup_${Date.now()}`);
    await setDoc(backupRef, backupData);
    
    logger.success(`✅ Sauvegarde créée: ${backupRef.id}`);
    
  } catch (error) {
    logger.error('Erreur lors de la création de la sauvegarde:', error.message);
  }
}

/**
 * Fonction principale de migration
 */
async function runMigration() {
  console.log('🚀 Début de la migration des utilisateurs existants\n');
  
  try {
    // Vérifier la configuration
    if (MIGRATION_CONFIG.dryRun) {
      logger.warn('⚠️  MODE DRY RUN - Aucune modification ne sera effectuée');
    }
    
    // Récupérer tous les utilisateurs
    const users = await getAllUsers();
    
    if (users.length === 0) {
      logger.info('ℹ️  Aucun utilisateur à migrer');
      return;
    }
    
    // Créer une sauvegarde
    await createBackup(users);
    
    // Statistiques de migration
    const stats = {
      total: users.length,
      success: 0,
      partial: 0,
      error: 0,
      alreadyComplete: 0,
      totalCreated: 0,
      totalErrors: 0
    };
    
    logger.info(`🔄 Début de la migration de ${users.length} utilisateurs...\n`);
    
    // Traiter les utilisateurs par lots
    for (let i = 0; i < users.length; i += MIGRATION_CONFIG.batchSize) {
      const batch = users.slice(i, i + MIGRATION_CONFIG.batchSize);
      
      logger.info(`📦 Traitement du lot ${Math.floor(i / MIGRATION_CONFIG.batchSize) + 1}/${Math.ceil(users.length / MIGRATION_CONFIG.batchSize)}`);
      
      // Traiter chaque utilisateur du lot
      for (let j = 0; j < batch.length; j++) {
        const user = batch[j];
        const currentIndex = i + j + 1;
        
        logger.progress(currentIndex, users.length, `Migration de ${user.email || user.id}`);
        
        const result = await migrateUser(user.id, user);
        
        // Mettre à jour les statistiques
        switch (result.status) {
          case 'success':
            stats.success++;
            break;
          case 'partial':
            stats.partial++;
            break;
          case 'error':
            stats.error++;
            break;
          case 'already_complete':
            stats.alreadyComplete++;
            break;
        }
        
        stats.totalCreated += result.created;
        stats.totalErrors += result.errors;
      }
      
      // Pause entre les lots pour éviter la surcharge
      if (i + MIGRATION_CONFIG.batchSize < users.length) {
        logger.info('⏸️  Pause entre les lots...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Afficher le résumé final
    console.log('\n' + '='.repeat(60));
    logger.success('🎯 MIGRATION TERMINÉE !');
    console.log('='.repeat(60));
    
    logger.info(`📊 Résumé de la migration:`);
    logger.info(`   • Total d'utilisateurs: ${stats.total}`);
    logger.info(`   • Migrations réussies: ${stats.success}`);
    logger.info(`   • Migrations partielles: ${stats.partial}`);
    logger.info(`   • Erreurs: ${stats.error}`);
    logger.info(`   • Déjà complets: ${stats.alreadyComplete}`);
    logger.info(`   • Documents créés: ${stats.totalCreated}`);
    logger.info(`   • Erreurs totales: ${stats.totalErrors}`);
    
    if (MIGRATION_CONFIG.dryRun) {
      logger.warn('\n⚠️  MODE DRY RUN - Aucune modification n\'a été effectuée');
      logger.info('Pour effectuer la vraie migration, changez dryRun: false dans la configuration');
    }
    
    // Sauvegarder les statistiques
    const statsRef = doc(db, 'migrations', `stats_${Date.now()}`);
    await setDoc(statsRef, {
      timestamp: new Date().toISOString(),
      config: MIGRATION_CONFIG,
      stats
    });
    
    logger.success(`📈 Statistiques sauvegardées: ${statsRef.id}`);
    
  } catch (error) {
    logger.error('💥 Erreur fatale lors de la migration:', error.message);
    process.exit(1);
  }
}

/**
 * Fonction de test pour un utilisateur spécifique
 */
async function testMigration(userId) {
  logger.info(`🧪 Test de migration pour l'utilisateur ${userId}`);
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      logger.error(`Utilisateur ${userId} non trouvé`);
      return;
    }
    
    const userData = userDoc.data();
    const result = await migrateUser(userId, userData);
    
    logger.info(`Résultat du test:`, result);
    
  } catch (error) {
    logger.error('Erreur lors du test:', error.message);
  }
}

// Gestion des arguments de ligne de commande
const args = process.argv.slice(2);
const command = args[0];

if (command === 'test' && args[1]) {
  // Test avec un utilisateur spécifique
  testMigration(args[1]).then(() => process.exit(0));
} else if (command === 'help') {
  console.log(`
Usage: node migrate-existing-users.mjs [command]

Commandes disponibles:
  (aucune)     - Lancer la migration complète
  test <id>    - Tester la migration sur un utilisateur spécifique
  help         - Afficher cette aide

Configuration:
  Modifiez MIGRATION_CONFIG dans le script pour:
  - dryRun: true/false (mode test sans modification)
  - batchSize: nombre d'utilisateurs par lot
  - backupBeforeMigration: true/false
  - logLevel: 'debug' | 'info' | 'warn' | 'error'

Exemples:
  node migrate-existing-users.mjs           # Migration complète
  node migrate-existing-users.mjs test abc123  # Test sur un utilisateur
  node migrate-existing-users.mjs help     # Aide
  `);
  process.exit(0);
} else {
  // Migration complète
  runMigration().then(() => {
    logger.success('\n🏁 Migration terminée avec succès !');
    process.exit(0);
  }).catch((error) => {
    logger.error('\n💥 Migration échouée:', error.message);
    process.exit(1);
  });
}
