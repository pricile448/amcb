#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC: Statut KYC et création automatique des comptes
 * 
 * Ce script diagnostique pourquoi la création automatique des comptes ne fonctionne pas
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, arrayUnion } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "amcbunq.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "amcbunq",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "amcbunq.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Diagnostiquer le statut KYC d'un utilisateur
 */
async function diagnoseKycStatus(userId) {
  try {
    console.log(`\n🔍 DIAGNOSTIC pour userId: ${userId}`);
    console.log('=' .repeat(60));
    
    // Récupérer le document utilisateur
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('❌ Document utilisateur non trouvé');
      return;
    }
    
    const userData = userDoc.data();
    console.log('\n📊 DONNÉES UTILISATEUR:');
    console.log(`   ID: ${userDoc.id}`);
    console.log(`   Email: ${userData.email || 'Non défini'}`);
    console.log(`   Prénom: ${userData.firstName || 'Non défini'}`);
    console.log(`   Nom: ${userData.lastName || 'Non défini'}`);
    
    // Vérifier le statut KYC
    console.log('\n🔐 STATUT KYC:');
    console.log(`   kycStatus: ${userData.kycStatus || 'Non défini'}`);
    console.log(`   verificationStatus: ${userData.verificationStatus || 'Non défini'}`);
    console.log(`   emailVerified: ${userData.emailVerified || 'Non défini'}`);
    console.log(`   isEmailVerified: ${userData.isEmailVerified || 'Non défini'}`);
    
    // Vérifier les comptes
    console.log('\n🏦 COMPTES:');
    console.log(`   Nombre de comptes: ${userData.accounts?.length || 0}`);
    console.log(`   Comptes par défaut créés: ${userData.defaultAccountsCreated || 'Non défini'}`);
    console.log(`   Date création comptes: ${userData.defaultAccountsCreatedAt || 'Non défini'}`);
    
    if (userData.accounts && userData.accounts.length > 0) {
      console.log('\n   📋 Détail des comptes:');
      userData.accounts.forEach((account, index) => {
        console.log(`      Compte ${index + 1}: ${account.name} (${account.type}) - Solde: ${account.balance} ${account.currency}`);
      });
    }
    
    // Vérifier les autres champs
    console.log('\n📋 AUTRES CHAMPS:');
    console.log(`   Créé le: ${userData.createdAt || 'Non défini'}`);
    console.log(`   Mis à jour le: ${userData.updatedAt || 'Non défini'}`);
    console.log(`   Dernière connexion: ${userData.lastSignInTime || 'Non défini'}`);
    
    // Diagnostic de la création automatique
    console.log('\n🚀 DIAGNOSTIC CRÉATION AUTOMATIQUE:');
    
    const kycStatus = userData.kycStatus;
    const hasAccounts = userData.accounts && userData.accounts.length > 0;
    const defaultAccountsCreated = userData.defaultAccountsCreated;
    
    console.log(`   ✅ Statut KYC vérifié: ${kycStatus === 'verified' ? 'OUI' : 'NON (${kycStatus})'}`);
    console.log(`   ✅ Comptes existants: ${hasAccounts ? 'OUI' : 'NON'}`);
    console.log(`   ✅ Comptes par défaut créés: ${defaultAccountsCreated ? 'OUI' : 'NON'}`);
    
    if (kycStatus === 'verified' && !hasAccounts && !defaultAccountsCreated) {
      console.log('\n🎯 CONDITIONS REMPLIES POUR CRÉATION AUTOMATIQUE !');
      console.log('   - Utilisateur vérifié ✅');
      console.log('   - Aucun compte existant ✅');
      console.log('   - Comptes par défaut non créés ✅');
      console.log('\n❓ POURQUOI LA CRÉATION NE SE DÉCLENCHE PAS ?');
      console.log('   Vérifiez la console du navigateur pour les erreurs');
      console.log('   Vérifiez que AccountService est bien importé');
    } else if (kycStatus !== 'verified') {
      console.log('\n⚠️  PROBLÈME IDENTIFIÉ:');
      console.log(`   Le statut KYC n'est pas 'verified' mais '${kycStatus}'`);
      console.log('   La création automatique ne se déclenchera pas');
    } else if (hasAccounts) {
      console.log('\nℹ️  SITUATION NORMALE:');
      console.log('   L\'utilisateur a déjà des comptes');
      console.log('   Aucune création automatique nécessaire');
    } else if (defaultAccountsCreated) {
      console.log('\nℹ️  SITUATION NORMALE:');
      console.log('   Les comptes par défaut ont déjà été créés');
      console.log('   Aucune création automatique nécessaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

/**
 * Créer manuellement les comptes par défaut
 */
async function createManualAccounts(userId) {
  try {
    console.log('\n🧪 CRÉATION MANUELLE des comptes pour userId:', userId);
    console.log('=' .repeat(60));
    
    const defaultAccounts = [
      {
        id: `checking-${userId}`,
        name: 'Compte Courant',
        accountType: 'checking',
        type: 'current',
        balance: 0,
        currency: 'EUR',
        status: 'active',
        accountNumber: `CC-${userId.slice(-8)}`,
        createdAt: new Date()
      },
      {
        id: `savings-${userId}`,
        name: 'Compte Épargne',
        accountType: 'savings',
        type: 'savings',
        balance: 0,
        currency: 'EUR',
        status: 'active',
        accountNumber: `CE-${userId.slice(-8)}`,
        createdAt: new Date()
      },
      {
        id: `credit-${userId}`,
        name: 'Carte de Crédit',
        accountType: 'credit',
        type: 'credit',
        balance: 0,
        currency: 'EUR',
        status: 'active',
        accountNumber: `CCR-${userId.slice(-8)}`,
        createdAt: new Date()
      }
    ];
    
    console.log('📝 Création de 3 comptes par défaut...');
    console.log('   1. Compte Courant (0,00 €)');
    console.log('   2. Compte Épargne (0,00 €)');
    console.log('   3. Carte de Crédit (0,00 €)');
    
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      accounts: arrayUnion(...defaultAccounts),
      defaultAccountsCreated: true,
      defaultAccountsCreatedAt: new Date()
    });
    
    console.log('\n✅ SUCCÈS ! Comptes créés manuellement');
    console.log('🔄 Rechargez votre application pour voir les comptes');
    
  } catch (error) {
    console.error('❌ ERREUR lors de la création:', error);
    console.log('\n💡 Vérifiez que:');
    console.log('   1. Votre userId est correct');
    console.log('   2. Vous avez les permissions Firestore');
    console.log('   3. La connexion Firebase fonctionne');
  }
}

/**
 * Lister tous les utilisateurs pour diagnostic
 */
async function listAllUsers() {
  try {
    console.log('\n👥 LISTE DE TOUS LES UTILISATEURS:');
    console.log('=' .repeat(60));
    
    // Note: Cette fonction nécessite des permissions admin
    // En production, utilisez la console Firebase ou un script admin
    console.log('⚠️  Pour lister tous les utilisateurs, utilisez la console Firebase');
    console.log('   https://console.firebase.google.com/project/amcbunq/firestore');
    
  } catch (error) {
    console.error('❌ Erreur lors de la liste des utilisateurs:', error);
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🔍 DIAGNOSTIC: Statut KYC et création automatique des comptes');
  console.log('=' .repeat(80));
  
  // Récupérer l'userId depuis les arguments
  const userId = process.argv[2];
  
  if (!userId) {
    console.log('\n❌ USAGE: node debug-kyc-status.cjs <userId>');
    console.log('\n📋 Exemples:');
    console.log('   node debug-kyc-status.cjs user123');
    console.log('   node debug-kyc-status.cjs test-user-default-accounts');
    console.log('\n💡 Pour trouver un userId:');
    console.log('   1. Ouvrez la console Firebase');
    console.log('   2. Allez dans Firestore > users');
    console.log('   3. Copiez l\'ID d\'un utilisateur');
    return;
  }
  
  // Diagnostiquer l'utilisateur spécifique
  await diagnoseKycStatus(userId);
  
  // Lister tous les utilisateurs (si possible)
  await listAllUsers();
  
  // Demander si l'utilisateur veut créer les comptes manuellement
  console.log('\n🧪 Voulez-vous créer les comptes manuellement ?');
  console.log('   Ajoutez --create à la commande pour créer les comptes');
  console.log('   Exemple: node debug-kyc-status.cjs <userId> --create');
  
  // Si l'option --create est présente, créer les comptes
  if (process.argv.includes('--create')) {
    console.log('\n🚀 CRÉATION MANUELLE DES COMPTES...');
    await createManualAccounts(userId);
  }
  
  console.log('\n🏁 Diagnostic terminé');
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  diagnoseKycStatus,
  listAllUsers,
  createManualAccounts
}; 