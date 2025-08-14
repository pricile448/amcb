#!/usr/bin/env node

/**
 * Script d'administration pour modifier le champ billingVisible dans Firestore
 * SEULS LES ADMINISTRATEURS PEUVENT UTILISER CE SCRIPT
 * Usage: node admin-billing-visibility.cjs <userId> <true|false>
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');
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

async function updateBillingVisibility(userId, billingVisible) {
  try {
    console.log(`🔄 Mise à jour ADMIN du champ billingVisible pour l'utilisateur ${userId}...`);
    
    // Vérifier que l'utilisateur existe
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.error(`❌ Utilisateur ${userId} non trouvé`);
      return;
    }

    const userData = userDoc.data();
    console.log(`📋 Données utilisateur actuelles:`, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      kycStatus: userData.kycStatus || userData.verificationStatus,
      billingVisible: userData.billingVisible
    });

    // ⚠️ VÉRIFICATION DE SÉCURITÉ: Seuls les admins peuvent activer la facturation
    if (billingVisible === true) {
      const kycStatus = userData.kycStatus || userData.verificationStatus;
      if (kycStatus === 'verified') {
        console.log(`⚠️  ATTENTION: L'utilisateur ${userId} a le statut KYC 'verified'`);
        console.log(`⚠️  La facturation sera masquée automatiquement lors de la prochaine connexion`);
        console.log(`⚠️  Seul un administrateur peut maintenir billingVisible = true pour un utilisateur vérifié`);
      }
    }

    // Mettre à jour le champ billingVisible
    await updateDoc(doc(db, 'users', userId), {
      billingVisible: billingVisible
    });

    console.log(`✅ Champ billingVisible mis à jour par ADMIN: ${billingVisible}`);
    
    // Vérifier la mise à jour
    const updatedDoc = await getDoc(doc(db, 'users', userId));
    const updatedData = updatedDoc.data();
    console.log(`📋 Données utilisateur après mise à jour:`, {
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      email: updatedData.email,
      kycStatus: updatedData.kycStatus || updatedData.verificationStatus,
      billingVisible: updatedData.billingVisible
    });

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
  }
}

async function checkBillingVisibility(userId) {
  try {
    console.log(`🔍 Vérification du champ billingVisible pour l'utilisateur ${userId}...`);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.error(`❌ Utilisateur ${userId} non trouvé`);
      return;
    }

    const userData = userDoc.data();
    const kycStatus = userData.kycStatus || userData.verificationStatus;
    
    console.log(`📋 Données utilisateur:`, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      kycStatus: kycStatus,
      billingVisible: userData.billingVisible,
      billingIban: userData.billingIban ? 'Présent' : 'Absent'
    });

    // Afficher des informations sur le comportement attendu
    if (kycStatus === 'verified') {
      if (userData.billingVisible === true) {
        console.log(`⚠️  ATTENTION: L'utilisateur est vérifié mais billingVisible = true`);
        console.log(`⚠️  La facturation sera automatiquement masquée lors de la prochaine connexion`);
        console.log(`⚠️  Utilisez ce script pour maintenir billingVisible = true si nécessaire`);
      } else {
        console.log(`✅ Comportement normal: Utilisateur vérifié avec billingVisible = false`);
      }
    } else {
      console.log(`ℹ️  Utilisateur non vérifié - billingVisible peut être true ou false`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🚨 SCRIPT D\'ADMINISTRATION - SEULS LES ADMINS PEUVENT L\'UTILISER');
    console.log('');
    console.log('📖 Usage: node admin-billing-visibility.cjs <userId> [true|false]');
    console.log('📖 Si aucun booléen n\'est fourni, affiche la valeur actuelle');
    console.log('');
    console.log('📝 Exemples:');
    console.log('  node admin-billing-visibility.cjs abc123');
    console.log('  node admin-billing-visibility.cjs abc123 true');
    console.log('  node admin-billing-visibility.cjs abc123 false');
    console.log('');
    console.log('⚠️  ATTENTION:');
    console.log('  - billingVisible sera automatiquement false pour les utilisateurs vérifiés');
    console.log('  - Seuls les admins peuvent maintenir billingVisible = true');
    console.log('  - Ce script est réservé aux administrateurs');
    return;
  }

  const userId = args[0];
  
  if (args.length === 1) {
    // Afficher la valeur actuelle
    await checkBillingVisibility(userId);
  } else if (args.length === 2) {
    const billingVisible = args[1] === 'true';
    // Mettre à jour la valeur
    await updateBillingVisibility(userId, billingVisible);
  } else {
    console.error('❌ Nombre d\'arguments incorrect');
  }
}

// Exécuter le script
main().then(() => {
  console.log('✅ Script d\'administration terminé');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
