#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

// Structure attendue pour tous les utilisateurs
const EXPECTED_STRUCTURE = {
  // Champs de base
  email: { type: 'string', required: true },
  firstName: { type: 'string', required: true },
  lastName: { type: 'string', required: true },
  phone: { type: 'string', required: true },
  address: { type: 'string', required: true },
  advisorId: { type: 'string', required: true },
  birthDate: { type: 'string', required: true },
  birthPlace: { type: 'string', required: true },
  dob: { type: 'string', required: true },
  nationality: { type: 'string', required: true },
  residenceCountry: { type: 'string', required: true },
  profession: { type: 'string', required: true },
  salary: { type: 'string', required: true },
  postalCode: { type: 'string', required: true },
  city: { type: 'string', required: true },
  pob: { type: 'string', required: true },
  role: { type: 'string', required: true },
  uid: { type: 'string', required: true },
  
  // Champs de vérification
  emailVerified: { type: 'boolean', required: true },
  isEmailVerified: { type: 'boolean', required: true },
  isPhoneVerified: { type: 'boolean', required: true },
  kycStatus: { type: 'string', required: true },
  verificationStatus: { type: 'string', required: true },
  
  // Champs de configuration
  hasPendingVirtualCardRequest: { type: 'boolean', required: true },
  inactivityTimeout: { type: 'number', required: true },
  
  // Champs de dates
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true },
  lastSignInTime: { type: 'timestamp', required: true },
  emailVerifiedAt: { type: 'timestamp', required: true },
  validatedAt: { type: 'timestamp', required: true },
  verifiedAt: { type: 'timestamp', required: true },
  rejectedAt: { type: 'timestamp', required: true },
  
  // Objets imbriqués
  accounts: { type: 'array', required: true, minLength: 3 },
  beneficiaries: { type: 'array', required: true },
  budgets: { type: 'array', required: true },
  billing: { type: 'object', required: true, fields: ['billingBic', 'billingHolder', 'billingIban', 'billingText', 'billingVisible'] },
  cardLimits: { type: 'object', required: true, fields: ['monthly', 'withdrawal', 'cardRequestedAt', 'cardStatus', 'cardType'] },
  documents: { type: 'array', required: true },
  notificationPrefs: { type: 'object', required: true, fields: ['email', 'promotions', 'security'] },
  notifications: { type: 'array', required: true },
  transactions: { type: 'array', required: true },
  virtualCards: { type: 'array', required: true }
};

async function compareAllUsersStructure() {
  try {
    console.log('🔍 Comparaison complète de la structure de tous les utilisateurs...\n');
    
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
    
    console.log(`📊 Total d'utilisateurs analysés: ${users.length}\n`);
    
    // Analyser chaque utilisateur
    const analysisResults = [];
    let totalIssues = 0;
    
    for (const user of users) {
      const userAnalysis = analyzeUserStructure(user);
      analysisResults.push(userAnalysis);
      totalIssues += userAnalysis.issues.length;
      
      // Afficher le résumé de l'utilisateur
      const status = userAnalysis.issues.length === 0 ? '✅ COMPLET' : `⚠️  ${userAnalysis.issues.length} PROBLÈMES`;
      console.log(`${user.email || user.id}: ${status}`);
      
      if (userAnalysis.issues.length > 0) {
        userAnalysis.issues.forEach(issue => {
          console.log(`   • ${issue}`);
        });
      }
    }
    
    // Résumé global
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ GLOBAL DE LA COMPARAISON');
    console.log('='.repeat(80));
    
    const completeUsers = analysisResults.filter(r => r.issues.length === 0).length;
    const incompleteUsers = analysisResults.filter(r => r.issues.length > 0).length;
    
    console.log(`🎯 Utilisateurs avec structure complète: ${completeUsers}/${users.length} (${Math.round(completeUsers/users.length*100)}%)`);
    console.log(`⚠️  Utilisateurs avec problèmes: ${incompleteUsers}/${users.length} (${Math.round(incompleteUsers/users.length*100)}%)`);
    console.log(`🔍 Total de problèmes détectés: ${totalIssues}`);
    
    if (incompleteUsers > 0) {
      console.log('\n📋 Utilisateurs à corriger :');
      analysisResults
        .filter(r => r.issues.length > 0)
        .forEach(result => {
          console.log(`\n👤 ${result.email}:`);
          result.issues.forEach(issue => console.log(`   • ${issue}`));
        });
    } else {
      console.log('\n🎉 FÉLICITATIONS ! Tous les utilisateurs ont la structure complète !');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la comparaison:', error.message);
  }
}

function analyzeUserStructure(user) {
  const issues = [];
  
  // Vérifier chaque champ attendu
  for (const [fieldName, fieldConfig] of Object.entries(EXPECTED_STRUCTURE)) {
    const fieldValue = user[fieldName];
    
    if (fieldConfig.required && fieldValue === undefined) {
      issues.push(`Champ manquant: ${fieldName}`);
      continue;
    }
    
    if (fieldConfig.required && fieldValue === null && fieldConfig.type !== 'timestamp') {
      issues.push(`Champ null: ${fieldName}`);
      continue;
    }
    
    if (fieldConfig.required && fieldValue === "" && fieldConfig.type === 'string') {
      issues.push(`Champ vide: ${fieldName}`);
      continue;
    }
    
    // Vérifier le type
    if (fieldValue !== undefined && fieldValue !== null) {
      if (fieldConfig.type === 'array' && !Array.isArray(fieldValue)) {
        issues.push(`Type incorrect pour ${fieldName}: attendu array, reçu ${typeof fieldValue}`);
      } else if (fieldConfig.type === 'object' && typeof fieldValue !== 'object') {
        issues.push(`Type incorrect pour ${fieldName}: attendu object, reçu ${typeof fieldValue}`);
      } else if (fieldConfig.type === 'boolean' && typeof fieldValue !== 'boolean') {
        issues.push(`Type incorrect pour ${fieldName}: attendu boolean, reçu ${typeof fieldValue}`);
      } else if (fieldConfig.type === 'number' && typeof fieldValue !== 'number') {
        issues.push(`Type incorrect pour ${fieldName}: attendu number, reçu ${typeof fieldValue}`);
      } else if (fieldConfig.type === 'string' && typeof fieldValue !== 'string') {
        issues.push(`Type incorrect pour ${fieldName}: attendu string, reçu ${typeof fieldValue}`);
      }
    }
    
    // Vérifications spéciales
    if (fieldName === 'accounts' && Array.isArray(fieldValue)) {
      if (fieldValue.length < 3) {
        issues.push(`Comptes insuffisants: ${fieldValue.length}/3 (attendu: checking, savings, credit)`);
      } else {
        const accountTypes = fieldValue.map(acc => acc.name);
        if (!accountTypes.includes('checking')) issues.push('Compte checking manquant');
        if (!accountTypes.includes('savings')) issues.push('Compte savings manquant');
        if (!accountTypes.includes('credit')) issues.push('Compte credit manquant');
      }
    }
    
    if (fieldName === 'billing' && typeof fieldValue === 'object') {
      const requiredFields = fieldConfig.fields;
      for (const requiredField of requiredFields) {
        if (!(requiredField in fieldValue)) {
          issues.push(`Champ billing.${requiredField} manquant`);
        }
      }
    }
    
    if (fieldName === 'cardLimits' && typeof fieldValue === 'object') {
      const requiredFields = fieldConfig.fields;
      for (const requiredField of requiredFields) {
        if (!(requiredField in fieldValue)) {
          issues.push(`Champ cardLimits.${requiredField} manquant`);
        }
      }
    }
    
    if (fieldName === 'notificationPrefs' && typeof fieldValue === 'object') {
      const requiredFields = fieldConfig.fields;
      for (const requiredField of requiredFields) {
        if (!(requiredField in fieldValue)) {
          issues.push(`Champ notificationPrefs.${requiredField} manquant`);
        }
      }
    }
  }
  
  return {
    email: user.email || user.id,
    issues: issues,
    isComplete: issues.length === 0
  };
}

// Lancer la comparaison
compareAllUsersStructure().then(() => {
  console.log('\n🏁 Comparaison terminée !');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error.message);
  process.exit(1);
});
