/**
 * Script de test pour la synchronisation KYC en temps réel
 * Teste les changements de statut et la mise à jour immédiate de l'UI
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, serverTimestamp } = require('firebase/firestore');
require('dotenv').config();

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ID utilisateur de test (remplacer par un vrai ID)
const TEST_USER_ID = process.env.TEST_USER_ID || 'test-user-id';

// Constantes KYC (doit correspondre au frontend)
const KYC_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

const KYC_STATUS_LABELS = {
  [KYC_STATUS.UNVERIFIED]: 'Non vérifié',
  [KYC_STATUS.PENDING]: 'En attente',
  [KYC_STATUS.APPROVED]: 'Vérifié',
  [KYC_STATUS.REJECTED]: 'Rejeté'
};

/**
 * Mettre à jour le statut KYC d'un utilisateur
 */
async function updateKYCStatus(userId, newStatus, rejectionReason = null) {
  try {
    console.log(`🔄 Mise à jour du statut KYC vers: ${newStatus} (${KYC_STATUS_LABELS[newStatus]})`);
    
    const userRef = doc(db, 'users', userId);
    
    // Créer l'objet de statut complet
    const kycStatusDetails = {
      status: newStatus,
      lastUpdated: new Date(),
      submittedAt: newStatus === KYC_STATUS.PENDING ? new Date() : null,
      approvedAt: newStatus === KYC_STATUS.APPROVED ? new Date() : null,
      rejectedAt: newStatus === KYC_STATUS.REJECTED ? new Date() : null,
      rejectionReason: rejectionReason
    };

    // Mettre à jour dans Firestore
    await updateDoc(userRef, {
      kycStatus: newStatus, // Statut simple pour compatibilité UI
      kycStatusDetails: kycStatusDetails, // Détails complets pour historique
      updatedAt: serverTimestamp()
    });

    console.log(`✅ Statut KYC mis à jour avec succès vers: ${newStatus}`);
    console.log(`📊 Détails:`, kycStatusDetails);
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour du statut:`, error);
    return false;
  }
}

/**
 * Simuler une séquence de changements de statut
 */
async function simulateKYCWorkflow() {
  console.log('🚀 Démarrage de la simulation du workflow KYC...\n');
  
  // 1. Statut initial: unverified
  console.log('📋 Étape 1: Statut initial (unverified)');
  await updateKYCStatus(TEST_USER_ID, KYC_STATUS.UNVERIFIED);
  await delay(3000); // Attendre 3 secondes
  
  // 2. Soumission de documents: pending
  console.log('\n📋 Étape 2: Soumission de documents (pending)');
  await updateKYCStatus(TEST_USER_ID, KYC_STATUS.PENDING);
  await delay(3000); // Attendre 3 secondes
  
  // 3. Vérification approuvée: approved
  console.log('\n📋 Étape 3: Vérification approuvée (approved)');
  await updateKYCStatus(TEST_USER_ID, KYC_STATUS.APPROVED);
  await delay(3000); // Attendre 3 secondes
  
  // 4. Test de rejet: rejected
  console.log('\n📋 Étape 4: Test de rejet (rejected)');
  await updateKYCStatus(TEST_USER_ID, KYC_STATUS.REJECTED, 'Document d\'identité illisible');
  await delay(3000); // Attendre 3 secondes
  
  // 5. Retour à pending après nouvelle soumission
  console.log('\n📋 Étape 5: Nouvelle soumission après rejet (pending)');
  await updateKYCStatus(TEST_USER_ID, KYC_STATUS.PENDING);
  await delay(3000); // Attendre 3 secondes
  
  // 6. Final: approved
  console.log('\n📋 Étape 6: Vérification finale approuvée (approved)');
  await updateKYCStatus(TEST_USER_ID, KYC_STATUS.APPROVED);
  
  console.log('\n🎉 Simulation du workflow KYC terminée !');
}

/**
 * Test rapide d'un changement de statut spécifique
 */
async function testSpecificStatus(status) {
  if (!KYC_STATUS[status.toUpperCase()]) {
    console.error(`❌ Statut invalide: ${status}`);
    console.log(`📋 Statuts valides:`, Object.keys(KYC_STATUS));
    return;
  }
  
  console.log(`🧪 Test du statut: ${status}`);
  const success = await updateKYCStatus(TEST_USER_ID, status);
  
  if (success) {
    console.log(`✅ Test réussi pour le statut: ${status}`);
  } else {
    console.log(`❌ Test échoué pour le statut: ${status}`);
  }
}

/**
 * Fonction utilitaire pour attendre
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Afficher l'aide
 */
function showHelp() {
  console.log(`
🔧 Script de test pour la synchronisation KYC en temps réel

📋 Utilisation:
  node test-kyc-realtime-enhanced.js [commande]

📋 Commandes disponibles:
  workflow    - Simuler le workflow KYC complet
  unverified  - Tester le statut "unverified"
  pending     - Tester le statut "pending"
  approved    - Tester le statut "approved"
  rejected    - Tester le statut "rejected"
  help        - Afficher cette aide

📋 Variables d'environnement requises:
  TEST_USER_ID - ID de l'utilisateur de test
  REACT_APP_FIREBASE_* - Configuration Firebase

📋 Exemples:
  node test-kyc-realtime-enhanced.js workflow
  node test-kyc-realtime-enhanced.js approved
  node test-kyc-realtime-enhanced.js pending
`);
}

/**
 * Point d'entrée principal
 */
async function main() {
  const command = process.argv[2] || 'workflow';
  
  console.log('🧪 Test de synchronisation KYC en temps réel');
  console.log('=============================================\n');
  
  // Vérifier la configuration
  if (!process.env.REACT_APP_FIREBASE_API_KEY) {
    console.error('❌ Configuration Firebase manquante. Vérifiez votre fichier .env');
    process.exit(1);
  }
  
  if (!TEST_USER_ID || TEST_USER_ID === 'test-user-id') {
    console.error('❌ TEST_USER_ID non défini. Définissez cette variable dans votre .env');
    process.exit(1);
  }
  
  console.log(`👤 Utilisateur de test: ${TEST_USER_ID}`);
  console.log(`🔗 Projet Firebase: ${process.env.REACT_APP_FIREBASE_PROJECT_ID}\n`);
  
  try {
    switch (command.toLowerCase()) {
      case 'workflow':
        await simulateKYCWorkflow();
        break;
      case 'unverified':
        await testSpecificStatus(KYC_STATUS.UNVERIFIED);
        break;
      case 'pending':
        await testSpecificStatus(KYC_STATUS.PENDING);
        break;
      case 'approved':
        await testSpecificStatus(KYC_STATUS.APPROVED);
        break;
      case 'rejected':
        await testSpecificStatus(KYC_STATUS.REJECTED);
        break;
      case 'help':
        showHelp();
        break;
      default:
        console.log(`❌ Commande inconnue: ${command}`);
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  updateKYCStatus,
  simulateKYCWorkflow,
  testSpecificStatus
};
