#!/usr/bin/env node

/**
 * Script de Migration des Utilisateurs Existants avec Firebase Admin SDK
 * 
 * Ce script migre tous les utilisateurs existants vers la nouvelle structure
 * de sous-documents imbriqués dans le document utilisateur principal.
 * 
 * Usage: node migrate-existing-users-admin.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Configuration Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "amcbunq",
  private_key_id: "9d1db9a2146a57391679cfa7907c2cf4b3863e44",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDqmT6oKPmU5RBT\nKFejWOyBd0WHsqjI7RBZ2c8WAZIBZb0lv2/5PBm9tpULSHsuUG6inZLbfUGhD7N0\nZ8vYECjv1TYC0aqNTHoUS438hiLhaaGVGoU/9UKgRW0YsTCIJoEV08vDbOS7WXMi\nv8/Ka6w8EIy2xqPvsR/+QqC6md0O58NIkqd3Gf0nS9yD6IL+tcllH5qXIB75a4so\n5WkkHNi+X1NUGAQoJRBxTVxPNGnv1d7xv8ppvNWx1PPpz93khA6hHjQStm1ptVtp\nQ6xTImoXwKFCPDJjtj4lSwlKZMBqpTWE/5EbJQnkYFcwEtyCds6w2Ln+7PrBtWV+\n40P6x6dHAgMBAAECggEAB4gT8uId4SHZfFH3Pk9EiIODv++Ea67wr3HGrDYwscrK\nX8PdnGrJiMWr00joa3w5kQ7uAA3tZXZTlJEggjdCmTCHI2AH0bF62dvzGwBTblkt\nztOjI4KEOREBh6FopXZW/pRmHkgIr9sXTy5JRX5fcS421kdaS/+rv0X0UwlNh4Tp\nirCRgxtYktAVwfjHpbNhHnctnkPn+TWN8+OpQiT3/DsHCzEubfOcKILVospGJxsJ\nVUSjV0ennzOLtmJJXgywRaZ5SX9OFyawP3LbqIASgu4JXe658hflbO7PvUxYGoea\nOpkbc4OoHmagQAf7UAOLv8KRgpHsVB4qkvsMstneAQKBgQD65oE7zf8433avxbcJ\nirQt7GJgy2ivXVZ9CujWJ1nGrkL58BDLvrXTzERVB5jtZtJ9TE1uV4lj4O8NhH8Q\nzSX0B6wQe+azsxKTwxg7sVClDwDapsPrKn1s7yeXVqcFenLBu8yiDlwH6FlZGc/V\nAuorDQ8d2Nbwl9DX2bbu0PFkYQKBgQDvXeryg4ZdU27maLahi/j9jxdA66caTYn2\nlIsJCKiHskyet7Y7cAADr91znUav9OoFI0KW+IdKC+OZQ32baGUfLoa1majXGlAd\niJcbigEZWnJbDVgr3nkefqBxc7sgTqat69W57MWlQzyxWl7Zv+5+P7vT+tbnXDSH\nqlRHyp6spwKBgQDazKlmvf4UWsvl/UXhzFPUuJASWVCxnXQPF7R1DVv9J3rA+9mp\n1GY8jaYJgNacMU7edewQjcYCk+Xko+crf7vZU9d5iJNnooJQ2ZIIfFkXmD3mcAfq\nzOMUXHrqP2boICBzUpLhwCQBwV4plZjo6eHMKVdFcBQBPGOj2Pjuyse4AQKBgFgn\ndoep+KoWOBmTJu+H5UM8l4vJPdlqBQ1S14GUNr0C5UTu06ZAMUEqW5xgp8/VmvoZ\nakS/ctPKXR/swy2g3N0G/YWT+aJ+hlLaIwx5Xr4/mS3/VCGT5XddmyktPhU/4hLb\nb/LxSDj88jU+2v/Gt8a3Ii2Hi+3Y/1+XU0K9VIKxAoGBAIZ0sQDMdQCjagCb49A1\nj55cHMqnt8VSPihtWvy74FjFuBnUAKCDFxIQna/qPwaEakC6mMdZ36EPgo69ywH+\nar8A1q+GNsOge67L2O4ordsimreLgoRBoewAqd0YX8LfbX8RjnnPVoL43450V5Fs\n9AZ8V4xU6If/vTJZLm15lPrL\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@amcbunq.iam.gserviceaccount.com",
  client_id: "117639555901342878348",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40amcbunq.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialiser Firebase Admin
const adminApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'amcbunq'
});

const db = getFirestore(adminApp);

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

// Structure des sous-documents à créer (imbriqués dans le document utilisateur)
const REQUIRED_SUBDOCUMENTS = {
  accounts: {
    path: 'accounts',
    required: true,
    defaultData: () => [
      {
        id: "checking-1",
        name: "checking",
        accountNumber: "**** **** **** 1234",
        balance: 0,
        currency: "EUR",
        status: "active"
      },
      {
        id: "savings-1", 
        name: "savings",
        accountNumber: "**** **** **** 5678",
        balance: 0,
        currency: "EUR",
        status: "active"
      },
      {
        id: "credit-1",
        name: "credit",
        accountNumber: "**** **** **** 9010",
        balance: 0,
        currency: "EUR",
        status: "active"
      }
    ]
  },
  beneficiaries: {
    path: 'beneficiaries',
    required: true,
    defaultData: () => []
  },
  budgets: {
    path: 'budgets',
    required: true,
    defaultData: () => []
  },
  billing: {
    path: 'billing',
    required: true,
    defaultData: () => ({
      billingBic: "",
      billingHolder: "",
      billingIban: "",
      billingText: "",
      billingVisible: false
    })
  },
  cardLimits: {
    path: 'cardLimits',
    required: true,
    defaultData: () => ({
      monthly: 2000,
      withdrawal: 500,
      cardRequestedAt: null,
      cardStatus: "not_requested",
      cardType: "standard"
    })
  },
  documents: {
    path: 'documents',
    required: true,
    defaultData: () => []
  },
  notificationPrefs: {
    path: 'notificationPrefs',
    required: true,
    defaultData: () => ({
      email: true,
      promotions: false,
      security: true
    })
  },
  notifications: {
    path: 'notifications',
    required: true,
    defaultData: () => []
  },
  transactions: {
    path: 'transactions',
    required: true,
    defaultData: () => []
  },
  virtualCards: {
    path: 'virtualCards',
    required: true,
    defaultData: () => []
  },
  // Champs de profil supplémentaires pour correspondre à Erich
  address: {
    path: 'address',
    required: true,
    defaultData: () => ""
  },
  advisorId: {
    path: 'advisorId',
    required: true,
    defaultData: () => ""
  },
  birthDate: {
    path: 'birthDate',
    required: true,
    defaultData: () => ""
  },
  birthPlace: {
    path: 'birthPlace',
    required: true,
    defaultData: () => ""
  },
  dob: {
    path: 'dob',
    required: true,
    defaultData: () => ""
  },
  hasPendingVirtualCardRequest: {
    path: 'hasPendingVirtualCardRequest',
    required: true,
    defaultData: () => false
  },
  inactivityTimeout: {
    path: 'inactivityTimeout',
    required: true,
    defaultData: () => 5
  },
  isPhoneVerified: {
    path: 'isPhoneVerified',
    required: true,
    defaultData: () => false
  },
  lastSignInTime: {
    path: 'lastSignInTime',
    required: true,
    defaultData: () => null
  },
  pob: {
    path: 'pob',
    required: true,
    defaultData: () => ""
  },
  rejectedAt: {
    path: 'rejectedAt',
    required: true,
    defaultData: () => null
  },
  role: {
    path: 'role',
    required: true,
    defaultData: () => "user"
  },
  uid: {
    path: 'uid',
    required: true,
    defaultData: () => (userId) => userId // Fonction qui retourne l'ID de l'utilisateur
  },
  validatedAt: {
    path: 'validatedAt',
    required: true,
    defaultData: () => null
  },
  verifiedAt: {
    path: 'verifiedAt',
    required: true,
    defaultData: () => null
  }
};

/**
 * Vérifier si un utilisateur a déjà la structure complète
 */
async function checkUserStructure(userId) {
  const missingDocuments = [];
  const existingDocuments = [];
  const needsCleanup = false;
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const userData = userDoc.data();
    
    // Vérifier les champs de base
    for (const [key, config] of Object.entries(REQUIRED_SUBDOCUMENTS)) {
      if (userData[config.path] === undefined) {
        missingDocuments.push(key);
        logger.debug(`Champ ${key} manquant pour l'utilisateur ${userId}`);
      } else {
        existingDocuments.push(key);
        logger.debug(`Champ ${key} existe pour l'utilisateur ${userId}`);
      }
    }
    
    // Vérifier spécifiquement les comptes
    if (userData.accounts && Array.isArray(userData.accounts)) {
      const accountTypes = userData.accounts.map(acc => acc.name);
      const missingAccounts = [];
      
      if (!accountTypes.includes('checking')) missingAccounts.push('checking');
      if (!accountTypes.includes('savings')) missingAccounts.push('savings');
      if (!accountTypes.includes('credit')) missingAccounts.push('credit');
      
      if (missingAccounts.length > 0) {
        logger.info(`🏦 Comptes manquants pour ${userId}: ${missingAccounts.join(', ')}`);
        // Ajouter le champ accounts aux champs manquants pour le recréer
        if (!missingDocuments.includes('accounts')) {
          missingDocuments.push('accounts');
        }
      }
    }
    
      // Vérifier s'il y a des anciens champs billing au niveau racine
  const oldBillingFields = ['billingBic', 'billingHolder', 'billingIban', 'billingText', 'billingVisible'];
  const hasOldBillingFields = oldBillingFields.some(field => userData[field] !== undefined);
  
  if (hasOldBillingFields) {
    logger.info(`🧹 Nettoyage nécessaire pour ${userId}: anciens champs billing détectés`);
    // Forcer la mise à jour pour nettoyer
    missingDocuments.push('_cleanup_billing');
  }
  
  // Vérifier si l'objet billing existe et a des données
  if (userData.billing && typeof userData.billing === 'object') {
    const billingData = userData.billing;
    const hasBillingData = billingData.billingBic || billingData.billingHolder || billingData.billingIban || billingData.billingText;
    
    if (hasBillingData) {
      logger.info(`💰 Données billing existantes détectées pour ${userId}, préservation des données`);
      // Ne pas recréer l'objet billing s'il a déjà des données
      if (missingDocuments.includes('billing')) {
        missingDocuments.splice(missingDocuments.indexOf('billing'), 1);
      }
    }
  }
    
  } catch (error) {
    logger.error(`Erreur lors de la vérification de l'utilisateur ${userId}:`, error.message);
    // Si erreur, considérer tous les champs comme manquants
    Object.keys(REQUIRED_SUBDOCUMENTS).forEach(key => missingDocuments.push(key));
  }
  
  return { missingDocuments, existingDocuments };
}

/**
 * Créer les sous-documents manquants pour un utilisateur
 */
async function createMissingDocuments(userId, missingDocuments) {
  if (missingDocuments.length === 0) {
    logger.debug(`Aucun champ manquant pour l'utilisateur ${userId}`);
    return { created: 0, errors: 0 };
  }
  
  try {
    const userRef = db.collection('users').doc(userId);
    const updateData = {};
    
         // Nettoyer les anciens champs billing au niveau racine si nécessaire
     if (missingDocuments.includes('_cleanup_billing')) {
       const oldBillingFields = ['billingBic', 'billingHolder', 'billingIban', 'billingText', 'billingVisible'];
       oldBillingFields.forEach(field => {
         updateData[field] = FieldValue.delete(); // Supprimer complètement les anciens champs
       });
       logger.info(`🧹 Suppression complète des anciens champs billing pour ${userId}`);
     }
    
    for (const docKey of missingDocuments) {
      // Ignorer les champs spéciaux de nettoyage
      if (docKey.startsWith('_cleanup_')) {
        continue;
      }
      
      const config = REQUIRED_SUBDOCUMENTS[docKey];
      const defaultValue = config.defaultData();
      
      // Si c'est une fonction, l'exécuter avec l'userId
      if (typeof defaultValue === 'function') {
        updateData[config.path] = defaultValue(userId);
      } else {
        updateData[config.path] = defaultValue;
      }
    }
    
    if (MIGRATION_CONFIG.dryRun) {
      logger.debug(`[DRY RUN] Créerait ${missingDocuments.length} champs pour l'utilisateur ${userId}`);
      return { created: missingDocuments.length, errors: 0 };
    } else {
      await userRef.update(updateData);
      logger.success(`✅ ${missingDocuments.length} champs créés pour l'utilisateur ${userId}`);
      return { created: missingDocuments.length, errors: 0 };
    }
    
  } catch (error) {
    logger.error(`Erreur lors de la création des champs pour l'utilisateur ${userId}:`, error.message);
    return { created: 0, errors: 1 };
  }
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
    
    logger.info(`📋 Champs manquants: ${missingDocuments.join(', ')}`);
    logger.info(`📋 Champs existants: ${existingDocuments.join(', ')}`);
    
    // Créer les champs manquants
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
         const usersSnapshot = await db.collection('users').get();
     
     const users = [];
     usersSnapshot.forEach((doc) => {
       // Ignorer les documents de statistiques et de sauvegarde
       if (doc.id.startsWith('stats_') || doc.id.startsWith('backup_')) {
         logger.debug(`⏭️  Ignoré: ${doc.id} (document système)`);
         return;
       }
       
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
    
    // Sauvegarder dans la collection users avec un ID spécial
    const backupRef = db.collection('users').doc(`backup_${Date.now()}`);
    await backupRef.set(backupData);
    
    logger.success(`✅ Sauvegarde créée: ${backupRef.id}`);
    
  } catch (error) {
    logger.error('Erreur lors de la création de la sauvegarde:', error.message);
  }
}

/**
 * Fonction principale de migration
 */
async function runMigration() {
  console.log('🚀 Début de la migration des utilisateurs existants avec structure imbriquée\n');
  
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
    logger.info(`   • Champs créés: ${stats.totalCreated}`);
    logger.info(`   • Erreurs totales: ${stats.totalErrors}`);
    
    if (MIGRATION_CONFIG.dryRun) {
      logger.warn('\n⚠️  MODE DRY RUN - Aucune modification n\'a été effectuée');
      logger.info('Pour effectuer la vraie migration, changez dryRun: false dans la configuration');
    }
    
    // Sauvegarder les statistiques dans la collection users
    const statsRef = db.collection('users').doc(`stats_${Date.now()}`);
    await statsRef.set({
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
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
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
Usage: node migrate-existing-users-admin.mjs [command]

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
  node migrate-existing-users-admin.mjs           # Migration complète
  node migrate-existing-users-admin.mjs test abc123  # Test sur un utilisateur
  node migrate-existing-users-admin.mjs help     # Aide
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
