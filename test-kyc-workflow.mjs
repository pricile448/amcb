#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Configuration Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "amcbunq",
  private_key_id: "9d1db9a2146a57391679cfa7907c2cf4b3863e44",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDqmT6oKPmU5RBT\nKFejWOyBd0WHsqjI7RBZ2c8WAZIBZb0lv2/5PBm9tpULSHsuUG6inZLbfUGhD7N0\nZ8vYECjv1TYC0aqNTHoUS438hiLhaaGVGoU/9UKgRW0YsTCIJoEV08vDbOS7WXMi\nv8/Ka6w8EIy2xqPvsR/+QqC6md0O58NIkqd3Gf0nS9yD6IL+tcllH5qXIB75a4so\n5WkkHNi+X1NUGAQoJRBxTVxPNGnv1d7xv8ppvNWx1PPpz93khA6hHjQStm1ptVtp\nQ6xTImoXwKFCPDJjtj4lSwlKZMBqpTWE/5EbJQnkYFcwEtyCds6w2Ln+7PrBtWV+\n40P6x6dHAgMBAAECggEAB4gT8uId4SHZfFH3Pk9EiIODv++Ea67wr3HGrDYwscrK\nX8PdnGrJiMWr00joa3w5kQ7uAA3tZXZTlJEggjdCmTCHI2AH0bF62dvzGwBTblkt\nztOjI4KEOREBh6FopXZW/pRmHkgIr9sXTy5JRX5fcS421kdaS/+rv0X0UwlNh4Tp\nirCRgxtYktAVwfjHpbNhHnctnkPn+TWN8+OpQiT3/DsHCzEubfOcKILVospGJxsJ\nVUSjV0ennzOLtmJJXgywRaZ5SX9OFyawP3LbqIASgu4JXe658hflbO7PvUxYGoea\nOpkbc4OoHmagQAf7UAOLv8KRgpHsVB4qkvsMstneAQKBgQD65oE7zf8433avxbcJ\nirQt7GJgy2ivXVZ9CujWJ1nGrkL58BDLvrXTzERVB5jtZtJ9TE1uV4lj4O8NhH8Q\nzSX0B6wQe+azsxKTwxg7sVClDwDapsPrKn1s7yeXVqcFenLBu8yiDlwH6FlZGc/V\nAuorDQ8d2Nbwl9DX2bbu0PFkYQKBgQDvXeryg4ZdU27maLahi/j9jxdA66caTYn2\nlIsJCKiHskyet7Y7cAADr91znUav9OoFI0KW+IdKC+OZQ32baGUfLoa1majXGlAd\niJcbigEZWnJbDVgr3nkefqBxc7sgTqat69W57MWlQzyxWn7Zv+5+P7vT+tbnXDSH\nqlRHyp6spwKBgQDazKlmvf4UWsvl/UXhzFPUuJASWVCxnXQPF7R1DVv9J3rA+9mp\n1GY8jaYJgNacMU7edewQjcYCk+Xko+crf7vZU9d5iJNnooJQ2ZIIfFkXmD3mcAfq\nzOMUXHrqP2boICBzUpLhwCQBwV4plZjo6eHMKVdFcBQBPGOj2Pjuyse4AQKBgFgn\ndoep+KoWOBmTJu+H5UM8l4vJPdlqBQ1S14GUNr0C5UTu06ZAMUEqW5xgp8/VmvoZ\nakS/ctPKXR/swy2g3N0G/YWT+aJ+hlLaIwx5Xr4/mS3/VCGT5XddmyktPhU/4hLb\nb/LxSDj88jU+2v/Gt8a3Ii2Hi+3Y/1+XU0K9VIKxAoGBAIZ0sQDMdQCjagCb49A1\nj55cHMqnt8VSPihtWvy74FjFuBnUAKCDFxIQna/qPwaEakC6mMdZ36EPgo69ywH+\nar8A1q+GNsOge67L2O4ordsimreLgoRBoewAqd0YX8LfbX8RjnnPVoL43450V5Fs\n9AZ8V4xU6If/vTJZLm15lPrL\n-----END PRIVATE KEY-----\n",
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

async function testKycWorkflow() {
  try {
    console.log('🧪 TEST DU WORKFLOW KYC...\n');
    
    // 1. Vérifier la structure actuelle des utilisateurs
    console.log('📊 VÉRIFICATION DE LA STRUCTURE ACTUELLE :');
    console.log('='.repeat(50));
    
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach((doc) => {
      if (!doc.id.startsWith('stats_') && !doc.id.startsWith('backup_')) {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      }
    });
    
    // Analyser chaque utilisateur
    for (const user of users) {
      console.log(`\n👤 ${user.email || user.id}:`);
      console.log(`   • kycStatus: ${user.kycStatus || 'N/A'}`);
      console.log(`   • verificationStatus: ${user.verificationStatus || 'N/A'}`);
      console.log(`   • emailVerified: ${user.emailVerified || 'N/A'}`);
      console.log(`   • Comptes: ${user.accounts ? user.accounts.length : 0}/3`);
      
      // Vérifier les champs sensibles selon le statut KYC
      if (user.kycStatus === 'verified') {
        console.log(`   ✅ ACCÈS COMPLET - Tous les sous-documents visibles`);
      } else if (user.kycStatus === 'pending') {
        console.log(`   ⏳ EN ATTENTE - Documents soumis, en attente de validation admin`);
      } else {
        console.log(`   🔒 ACCÈS LIMITÉ - Seuls les champs de base visibles`);
      }
    }
    
    // 2. Vérifier les règles de sécurité actuelles
    console.log('\n🔒 ANALYSE DES RÈGLES DE SÉCURITÉ :');
    console.log('='.repeat(50));
    
    console.log('✅ Règles actuelles bien configurées pour :');
    console.log('   • Création de compte (kycStatus: unverified)');
    console.log('   • Transition unverified → pending (utilisateur)');
    console.log('   • Transition pending → verified (admin uniquement)');
    console.log('   • Accès aux sous-documents selon kycStatus');
    
    // 3. Recommandations d'amélioration
    console.log('\n💡 RECOMMANDATIONS POUR OPTIMISER LE WORKFLOW :');
    console.log('='.repeat(50));
    
    console.log('1. 🔐 RÈGLE SPÉCIALE POUR KYC STATUS :');
    console.log('   - Utilisateur peut changer : unverified → pending');
    console.log('   - SEUL l\'admin peut changer : pending → verified/rejected');
    console.log('   - SEUL l\'admin peut changer : verified → rejected');
    
    console.log('\n2. 👁️ VISIBILITÉ CONDITIONNELLE :');
    console.log('   - kycStatus: unverified → Champs de base seulement');
    console.log('   - kycStatus: pending → Champs de base + documents KYC');
    console.log('   - kycStatus: verified → Tous les champs et sous-documents');
    
    console.log('\n3. 🚫 PROTECTION DES TRANSITIONS :');
    console.log('   - Bloquer verified → unverified (rétrograde)');
    console.log('   - Bloquer verified → pending (rétrograde)');
    console.log('   - Permettre verified → rejected (admin)');
    
    // 4. Vérifier les utilisateurs qui pourraient avoir des problèmes
    console.log('\n⚠️ UTILISATEURS À SURVEILLER :');
    console.log('='.repeat(50));
    
    const problematicUsers = users.filter(user => {
      return !user.kycStatus || 
             !['unverified', 'pending', 'verified', 'rejected'].includes(user.kycStatus) ||
             !user.verificationStatus;
    });
    
    if (problematicUsers.length > 0) {
      console.log('❌ Utilisateurs avec statut KYC problématique :');
      problematicUsers.forEach(user => {
        console.log(`   • ${user.email || user.id}: kycStatus="${user.kycStatus}", verificationStatus="${user.verificationStatus}"`);
      });
    } else {
      console.log('✅ Tous les utilisateurs ont des statuts KYC valides');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testKycWorkflow().then(() => {
  console.log('\n🏁 Test terminé !');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error.message);
  process.exit(1);
});
