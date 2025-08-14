#!/usr/bin/env node

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

// Configuration
const MIGRATION_CONFIG = {
  dryRun: false, // Mettre à true pour tester sans modifier les données
  batchSize: 10, // Taille des lots pour les opérations en batch
  createBackup: true // Créer une sauvegarde avant correction
};

// Logger personnalisé
const logger = {
  info: (msg, ...args) => console.log(`ℹ️  ${msg}`, ...args),
  success: (msg, ...args) => console.log(`✅ ${msg}`, ...args),
  warn: (msg, ...args) => console.log(`⚠️  ${msg}`, ...args),
  error: (msg, ...args) => console.log(`❌ ${msg}`, ...args)
};

// Valeurs par défaut pour les corrections
const DEFAULT_VALUES = {
  // Champs de base manquants
  birthDate: "01/01/1990",
  birthPlace: "Non spécifié",
  pob: "Non spécifié",
  uid: (userId) => userId, // Fonction pour utiliser l'ID de l'utilisateur
  
  // Champs de vérification manquants
  verificationStatus: "unverified",
  emailVerifiedAt: (user) => user.createdAt || new Date(),
  
  // Champs cardLimits manquants
  cardLimits: {
    cardRequestedAt: null,
    cardStatus: "not_requested",
    cardType: "standard"
  },
  
  // Conversion de types
  dob: (user) => {
    if (user.dob && typeof user.dob === 'object' && user.dob.toDate) {
      // Convertir Timestamp en string
      const date = user.dob.toDate();
      return date.toLocaleDateString('fr-FR');
    }
    return user.dob || "01/01/1990";
  },
  
  salary: (user) => {
    if (typeof user.salary === 'number') {
      return user.salary.toString();
    }
    return user.salary || "0";
  }
};

async function fixAllUsersStructure() {
  try {
    console.log('🔧 CORRECTION AUTOMATIQUE DE TOUS LES UTILISATEURS...\n');
    
    if (MIGRATION_CONFIG.dryRun) {
      logger.warn('⚠️  MODE DRY RUN - Aucune modification ne sera effectuée');
    }
    
    // Créer une sauvegarde si demandé
    if (MIGRATION_CONFIG.createBackup) {
      await createBackup();
    }
    
    // Récupérer tous les utilisateurs
    const usersSnapshot = await db.collection('users').get();
    
    const users = [];
    usersSnapshot.forEach((doc) => {
      // Ignorer les documents de statistiques et de sauvegarde
      if (doc.id.startsWith('stats_') || doc.id.startsWith('backup_')) {
        return;
      }
      
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    logger.info(`📊 Total d'utilisateurs à corriger: ${users.length}`);
    
    // Traiter les utilisateurs par lots
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < users.length; i += MIGRATION_CONFIG.batchSize) {
      const batch = users.slice(i, i + MIGRATION_CONFIG.batchSize);
      
      logger.info(`\n🔄 Traitement du lot ${Math.floor(i/MIGRATION_CONFIG.batchSize) + 1}/${Math.ceil(users.length/MIGRATION_CONFIG.batchSize)}`);
      
      for (const user of batch) {
        try {
          await fixUserStructure(user);
          successCount++;
          logger.success(`✅ ${user.email || user.id} corrigé`);
        } catch (error) {
          errorCount++;
          logger.error(`❌ Erreur pour ${user.email || user.id}: ${error.message}`);
        }
        processedCount++;
      }
      
      // Pause entre les lots pour éviter la surcharge
      if (i + MIGRATION_CONFIG.batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Résumé final
    console.log('\n' + '='.repeat(80));
    logger.success('🎯 CORRECTION TERMINÉE !');
    console.log('='.repeat(80));
    console.log(`📊 Résumé de la correction:`);
    console.log(`   • Utilisateurs traités: ${processedCount}`);
    console.log(`   • Corrections réussies: ${successCount}`);
    console.log(`   • Erreurs: ${errorCount}`);
    
    if (MIGRATION_CONFIG.dryRun) {
      logger.warn('\n⚠️  MODE DRY RUN - Aucune modification n\'a été effectuée');
      logger.info('Pour effectuer la vraie correction, changez dryRun: false dans la configuration');
    }
    
  } catch (error) {
    logger.error('💥 Erreur fatale:', error.message);
  }
}

async function createBackup() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup_correction_${timestamp}`;
    
    logger.info('💾 Création de la sauvegarde...');
    
    // Récupérer tous les utilisateurs
    const usersSnapshot = await db.collection('users').get();
    const usersData = {};
    
    usersSnapshot.forEach((doc) => {
      if (!doc.id.startsWith('stats_') && !doc.id.startsWith('backup_')) {
        usersData[doc.id] = doc.data();
      }
    });
    
    // Sauvegarder dans la collection users
    await db.collection('users').doc(backupId).set({
      type: 'backup',
      description: 'Sauvegarde avant correction automatique de la structure',
      timestamp: new Date(),
      userCount: Object.keys(usersData).length,
      users: usersData
    });
    
    logger.success(`✅ Sauvegarde créée: ${backupId}`);
    
  } catch (error) {
    logger.error('❌ Erreur lors de la création de la sauvegarde:', error.message);
  }
}

async function fixUserStructure(user) {
  const updateData = {};
  
  // 1. Corriger les champs manquants
  if (!user.verificationStatus) {
    updateData.verificationStatus = DEFAULT_VALUES.verificationStatus;
  }
  
  if (!user.emailVerifiedAt) {
    updateData.emailVerifiedAt = DEFAULT_VALUES.emailVerifiedAt(user);
  }
  
  // 2. Corriger les champs vides
  if (!user.birthDate || user.birthDate === "") {
    updateData.birthDate = DEFAULT_VALUES.birthDate;
  }
  
  if (!user.birthPlace || user.birthPlace === "") {
    updateData.birthPlace = DEFAULT_VALUES.birthPlace;
  }
  
  if (!user.pob || user.pob === "") {
    updateData.pob = DEFAULT_VALUES.pob;
  }
  
  if (!user.uid || user.uid === "") {
    updateData.uid = DEFAULT_VALUES.uid(user.id);
  }
  
  // 3. Corriger les types incorrects
  if (user.dob && typeof user.dob === 'object') {
    updateData.dob = DEFAULT_VALUES.dob(user);
  } else if (user.dob === null) {
    // Corriger les valeurs null
    updateData.dob = DEFAULT_VALUES.dob(user);
  }
  
  if (user.salary && typeof user.salary === 'number') {
    updateData.salary = DEFAULT_VALUES.salary(user);
  }
  
  // 4. Corriger cardLimits
  if (!user.cardLimits || typeof user.cardLimits !== 'object') {
    updateData.cardLimits = {
      monthly: 2000,
      withdrawal: 500,
      ...DEFAULT_VALUES.cardLimits
    };
  } else {
    // Ajouter les champs manquants à cardLimits existant
    const cardLimitsUpdate = {};
    if (!('cardRequestedAt' in user.cardLimits)) {
      cardLimitsUpdate.cardRequestedAt = DEFAULT_VALUES.cardLimits.cardRequestedAt;
    }
    if (!('cardStatus' in user.cardLimits)) {
      cardLimitsUpdate.cardStatus = DEFAULT_VALUES.cardLimits.cardStatus;
    }
    if (!('cardType' in user.cardLimits)) {
      cardLimitsUpdate.cardType = DEFAULT_VALUES.cardLimits.cardType;
    }
    
    if (Object.keys(cardLimitsUpdate).length > 0) {
      updateData.cardLimits = {
        ...user.cardLimits,
        ...cardLimitsUpdate
      };
    }
  }
  
  // 5. S'assurer que tous les comptes sont présents
  if (!user.accounts || !Array.isArray(user.accounts) || user.accounts.length < 3) {
    const existingAccounts = user.accounts || [];
    const accountNames = existingAccounts.map(acc => acc.name);
    
    const requiredAccounts = [
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
    ];
    
    // Ajouter seulement les comptes manquants
    const missingAccounts = requiredAccounts.filter(acc => !accountNames.includes(acc.name));
    
    if (missingAccounts.length > 0) {
      updateData.accounts = [...existingAccounts, ...missingAccounts];
    }
  }
  
  // Appliquer les corrections si nécessaire
  if (Object.keys(updateData).length > 0) {
    if (MIGRATION_CONFIG.dryRun) {
      logger.info(`[DRY RUN] Corrigerait ${Object.keys(updateData).length} champs pour ${user.email || user.id}`);
    } else {
      await db.collection('users').doc(user.id).update(updateData);
    }
  }
}

// Lancer la correction
fixAllUsersStructure().then(() => {
  logger.success('\n🏁 Correction terminée !');
  process.exit(0);
}).catch((error) => {
  logger.error('\n💥 Correction échouée:', error.message);
  process.exit(1);
});
