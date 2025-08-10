#!/usr/bin/env node

/**
 * Script de test pour la synchronisation KYC en temps réel
 * 
 * Ce script simule les changements de statut KYC pour tester
 * la synchronisation en temps réel dans l'application.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase (à adapter selon votre projet)
const firebaseConfig = {
  // Remplacez par votre configuration Firebase
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Simuler un changement de statut KYC
 * @param {string} userId - ID de l'utilisateur
 * @param {string} newStatus - Nouveau statut ('unverified', 'pending', 'approved', 'rejected')
 * @param {string} rejectionReason - Raison du rejet (optionnel)
 */
async function simulateKycStatusChange(userId, newStatus, rejectionReason = null) {
  try {
    console.log(`🔄 Simulation changement statut KYC pour l'utilisateur ${userId}:`);
    console.log(`   Ancien statut → Nouveau statut: ${newStatus}`);
    
    const userRef = doc(db, 'users', userId);
    
    // Préparer les données de mise à jour
    const updateData = {
      kycStatus: newStatus,
      updatedAt: serverTimestamp(),
    };
    
    // Ajouter des détails selon le statut
    const kycStatusDetails = {
      status: newStatus,
      lastUpdated: new Date(),
    };
    
    switch (newStatus) {
      case 'pending':
        kycStatusDetails.submittedAt = new Date();
        break;
      case 'approved':
        kycStatusDetails.approvedAt = new Date();
        break;
      case 'rejected':
        kycStatusDetails.rejectedAt = new Date();
        if (rejectionReason) {
          kycStatusDetails.rejectionReason = rejectionReason;
        }
        break;
    }
    
    updateData.kycStatusDetails = kycStatusDetails;
    
    // Mettre à jour dans Firestore
    await updateDoc(userRef, updateData);
    
    console.log(`✅ Statut KYC mis à jour avec succès vers: ${newStatus}`);
    
    if (rejectionReason) {
      console.log(`   Raison du rejet: ${rejectionReason}`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour du statut KYC:`, error);
    return false;
  }
}

/**
 * Test de séquence complète de changements de statut
 * @param {string} userId - ID de l'utilisateur
 */
async function testKycStatusSequence(userId) {
  console.log(`🧪 Démarrage test séquence KYC pour l'utilisateur: ${userId}`);
  console.log('=' .repeat(50));
  
  const delays = [2000, 3000, 2000, 3000]; // Délais entre chaque changement
  
  const statuses = [
    { status: 'unverified', reason: null },
    { status: 'pending', reason: null },
    { status: 'approved', reason: null },
    { status: 'rejected', reason: 'Document expiré' }
  ];
  
  for (let i = 0; i < statuses.length; i++) {
    const { status, reason } = statuses[i];
    
    console.log(`\n📝 Étape ${i + 1}/${statuses.length}: Changement vers ${status}`);
    
    const success = await simulateKycStatusChange(userId, status, reason);
    
    if (success) {
      console.log(`⏳ Attente de ${delays[i] / 1000}s avant le prochain changement...`);
      
      if (i < statuses.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[i]));
      }
    } else {
      console.log(`❌ Échec de l'étape ${i + 1}, arrêt du test`);
      break;
    }
  }
  
  console.log('\n🎯 Test de séquence KYC terminé!');
  console.log('   Vérifiez dans votre application que les changements sont visibles en temps réel.');
}

/**
 * Test de changement rapide de statut (pour tester la réactivité)
 * @param {string} userId - ID de l'utilisateur
 */
async function testRapidStatusChanges(userId) {
  console.log(`⚡ Test de changements rapides de statut pour l'utilisateur: ${userId}`);
  console.log('=' .repeat(50));
  
  const rapidStatuses = ['pending', 'approved', 'pending', 'rejected', 'pending'];
  
  for (let i = 0; i < rapidStatuses.length; i++) {
    const status = rapidStatuses[i];
    
    console.log(`\n🔄 Changement rapide ${i + 1}/${rapidStatuses.length}: ${status}`);
    
    const success = await simulateKycStatusChange(userId, status);
    
    if (success) {
      console.log(`⏳ Attente de 1s...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else {
      console.log(`❌ Échec du changement rapide ${i + 1}`);
      break;
    }
  }
  
  console.log('\n⚡ Test de changements rapides terminé!');
}

// Fonction principale
async function main() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('❌ Usage: node test-kyc-realtime.js <userId>');
    console.error('   Exemple: node test-kyc-realtime.js user123');
    process.exit(1);
  }
  
  console.log('🚀 Script de test KYC en temps réel');
  console.log(`👤 Utilisateur cible: ${userId}`);
  console.log('');
  
  try {
    // Test 1: Séquence normale
    await testKycStatusSequence(userId);
    
    console.log('\n' + '=' .repeat(50));
    
    // Test 2: Changements rapides
    await testRapidStatusChanges(userId);
    
    console.log('\n🎉 Tous les tests sont terminés!');
    console.log('   Vérifiez dans votre application que la synchronisation en temps réel fonctionne.');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  simulateKycStatusChange,
  testKycStatusSequence,
  testRapidStatusChanges
};
