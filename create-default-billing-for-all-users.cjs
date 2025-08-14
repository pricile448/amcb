#!/usr/bin/env node

/**
 * Script pour créer des données de facturation par défaut pour tous les utilisateurs
 * Usage: node create-default-billing-for-all-users.cjs
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, setDoc } = require('firebase/firestore');
require('dotenv').config();

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Données de facturation par défaut
const DEFAULT_BILLING_DATA = {
  billingBic: 'SMOEFRP1',
  billingHolder: 'AmCbunq Client',
  billingIban: 'FR76 1234 5678 9012 3456 7890 123',
  billingText: 'Bienvenue dans votre espace de facturation AmCbunq. Utilisez ce RIB pour vos opérations de facturation et de validation de compte.',
  billingVisible: true
};

async function createDefaultBillingForUser(userId, userData) {
  try {
    console.log(`🔄 Création des données de facturation pour l'utilisateur ${userId}...`);
    
    // Vérifier si l'utilisateur a déjà des données de facturation
    const hasExistingBilling = userData.billingIban || userData.billingBic || userData.billingHolder;
    
    if (hasExistingBilling) {
      console.log(`ℹ️  L'utilisateur ${userId} a déjà des données de facturation, mise à jour...`);
    } else {
      console.log(`✅ Création de nouvelles données de facturation pour ${userId}`);
    }

    // Préparer les données de facturation
    const billingData = {
      billingBic: userData.billingBic || DEFAULT_BILLING_DATA.billingBic,
      billingHolder: userData.billingHolder || `${userData.firstName || 'Client'} ${userData.lastName || 'AmCbunq'}`,
      billingIban: userData.billingIban || DEFAULT_BILLING_DATA.billingIban,
      billingText: userData.billingText || DEFAULT_BILLING_DATA.billingText,
      billingVisible: userData.billingVisible !== undefined ? userData.billingVisible : DEFAULT_BILLING_DATA.billingVisible
    };

    // Mettre à jour l'utilisateur avec les données de facturation
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, billingData);

    console.log(`✅ Données de facturation créées/mises à jour pour ${userId}:`, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      billingBic: billingData.billingBic,
      billingHolder: billingData.billingHolder,
      billingIban: billingData.billingIban,
      billingVisible: billingData.billingVisible
    });

    return true;

  } catch (error) {
    console.error(`❌ Erreur lors de la création des données de facturation pour ${userId}:`, error);
    return false;
  }
}

async function createDefaultBillingForAllUsers() {
  try {
    console.log('🚀 Début de la création des données de facturation par défaut pour tous les utilisateurs...');
    
    // Récupérer tous les utilisateurs
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    if (usersSnapshot.empty) {
      console.log('ℹ️  Aucun utilisateur trouvé dans la base de données');
      return;
    }

    console.log(`📋 ${usersSnapshot.size} utilisateurs trouvés`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    // Traiter chaque utilisateur
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Vérifier si l'utilisateur a déjà des données de facturation complètes
      const hasCompleteBilling = userData.billingIban && userData.billingBic && userData.billingHolder;
      
      if (hasCompleteBilling && userData.billingVisible !== undefined) {
        console.log(`⏭️  L'utilisateur ${userId} a déjà des données de facturation complètes, ignoré`);
        skippedCount++;
        continue;
      }

      const success = await createDefaultBillingForUser(userId, userData);
      
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }

      // Petite pause pour éviter de surcharger Firestore
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Résumé
    console.log('\n📊 RÉSUMÉ DE L\'OPÉRATION:');
    console.log(`✅ Succès: ${successCount} utilisateurs`);
    console.log(`❌ Erreurs: ${errorCount} utilisateurs`);
    console.log(`⏭️  Ignorés: ${skippedCount} utilisateurs`);
    console.log(`📋 Total traité: ${successCount + errorCount + skippedCount} utilisateurs`);

  } catch (error) {
    console.error('❌ Erreur fatale lors de la création des données de facturation:', error);
  }
}

async function createDefaultBillingForSpecificUser(userId) {
  try {
    console.log(`🎯 Création des données de facturation pour l'utilisateur spécifique ${userId}...`);
    
    // Récupérer les données de l'utilisateur
    const userDoc = await getDocs(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.error(`❌ Utilisateur ${userId} non trouvé`);
      return;
    }

    const userData = userDoc.data();
    await createDefaultBillingForUser(userId, userData);

  } catch (error) {
    console.error(`❌ Erreur lors de la création des données de facturation pour ${userId}:`, error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 Usage: node create-default-billing-for-all-users.cjs [userId]');
    console.log('');
    console.log('📝 Exemples:');
    console.log('  node create-default-billing-for-all-users.cjs');
    console.log('  node create-default-billing-for-all-users.cjs abc123');
    console.log('');
    console.log('📋 Données de facturation par défaut qui seront créées:');
    console.log('  - billingBic: SMOEFRP1');
    console.log('  - billingHolder: [Prénom] [Nom] ou "AmCbunq Client"');
    console.log('  - billingIban: FR76 1234 5678 9012 3456 7890 123');
    console.log('  - billingText: Message de bienvenue personnalisé');
    console.log('  - billingVisible: true (par défaut)');
    console.log('');
    console.log('⚠️  ATTENTION: Ce script va modifier tous les utilisateurs sans données de facturation');
    return;
  }

  if (args.length === 1) {
    const userId = args[0];
    // Créer les données de facturation pour un utilisateur spécifique
    await createDefaultBillingForSpecificUser(userId);
  } else {
    console.error('❌ Nombre d\'arguments incorrect');
  }
}

// Exécuter le script
if (require.main === module) {
  main().then(() => {
    console.log('✅ Script terminé');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
} else {
  // Si le script est importé comme module
  module.exports = {
    createDefaultBillingForAllUsers,
    createDefaultBillingForSpecificUser,
    DEFAULT_BILLING_DATA
  };
}
