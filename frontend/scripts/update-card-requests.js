#!/usr/bin/env node

/**
 * Script pour mettre à jour les cardRequests dans les documents users/{userId}
 * 
 * Ce script permet de :
 * 1. Créer des demandes de cartes pour des utilisateurs existants
 * 2. Mettre à jour le statut des cartes
 * 3. Activer des cartes virtuelles ou physiques
 * 4. Migrer des données existantes
 * 
 * Usage:
 * node scripts/update-card-requests.js [command] [options]
 * 
 * Commandes disponibles:
 * - create-request: Créer une nouvelle demande de carte
 * - update-status: Mettre à jour le statut d'une carte
 * - activate-card: Activer une carte (la rendre visible)
 * - migrate-data: Migrer des données existantes
 * - list-users: Lister tous les utilisateurs avec leurs cartes
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  collection, 
  getDocs,
  Timestamp 
} = require('firebase/firestore');

// Configuration Firebase (à adapter selon votre projet)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Créer une demande de carte pour un utilisateur
 */
async function createCardRequest(userId, cardType, status = 'pending', adminNotes = '') {
  try {
    console.log(`🔄 Création d'une demande de carte ${cardType} pour l'utilisateur ${userId}...`);
    
    const userRef = doc(db, 'users', userId);
    
    // Vérifier si l'utilisateur existe
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.error(`❌ L'utilisateur ${userId} n'existe pas`);
      return false;
    }
    
    // Données de la demande de carte
    const cardRequest = {
      status: status,
      requestedAt: Timestamp.now(),
      adminNotes: adminNotes || `Demande de carte ${cardType} en attente de traitement`
    };
    
    // Données de la carte (état initial)
    const cardSubDoc = {
      cardNumber: 'En attente',
      cardType: `Carte ${cardType}`,
      expiryDate: 'En attente',
      cvv: 'En attente',
      isActive: false,
      isDisplayed: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      adminNotes: adminNotes || `Carte ${cardType} en cours de génération`
    };
    
    // Mettre à jour le document utilisateur
    await updateDoc(userRef, {
      [`${cardType}CardData`]: cardSubDoc,
      [`${cardType}CardStatus`]: status,
      [`cardRequests.${cardType}`]: cardRequest,
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ Demande de carte ${cardType} créée avec succès pour l'utilisateur ${userId}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erreur lors de la création de la demande de carte ${cardType}:`, error);
    return false;
  }
}

/**
 * Mettre à jour le statut d'une carte
 */
async function updateCardStatus(userId, cardType, newStatus, adminNotes = '') {
  try {
    console.log(`🔄 Mise à jour du statut de la carte ${cardType} pour l'utilisateur ${userId} vers ${newStatus}...`);
    
    const userRef = doc(db, 'users', userId);
    
    // Vérifier si l'utilisateur existe
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.error(`❌ L'utilisateur ${userId} n'existe pas`);
      return false;
    }
    
    const updateData = {
      [`${cardType}CardStatus`]: newStatus,
      updatedAt: Timestamp.now()
    };
    
    // Mettre à jour la demande de carte
    if (newStatus === 'completed') {
      updateData[`cardRequests.${cardType}.completedAt`] = Timestamp.now();
    }
    
    if (adminNotes) {
      updateData[`cardRequests.${cardType}.adminNotes`] = adminNotes;
    }
    
    await updateDoc(userRef, updateData);
    
    console.log(`✅ Statut de la carte ${cardType} mis à jour vers ${newStatus} pour l'utilisateur ${userId}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour du statut de la carte ${cardType}:`, error);
    return false;
  }
}

/**
 * Activer une carte (la rendre visible et active)
 */
async function activateCard(userId, cardType, cardDetails) {
  try {
    console.log(`🔄 Activation de la carte ${cardType} pour l'utilisateur ${userId}...`);
    
    const userRef = doc(db, 'users', userId);
    
    // Vérifier si l'utilisateur existe
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.error(`❌ L'utilisateur ${userId} n'existe pas`);
      return false;
    }
    
    // Données de la carte activée
    const updatedCardData = {
      cardNumber: cardDetails.cardNumber,
      cardType: `Carte ${cardType}`,
      expiryDate: cardDetails.expiryDate,
      cvv: cardDetails.cvv,
      isActive: true,
      isDisplayed: true, // ✅ Rendre la carte visible
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      adminNotes: cardDetails.adminNotes || `Carte ${cardType} activée et disponible`
    };
    
    // Mettre à jour le statut et les données de la carte
    await updateDoc(userRef, {
      [`${cardType}CardData`]: updatedCardData,
      [`${cardType}CardStatus`]: 'completed',
      [`cardRequests.${cardType}.status`]: 'completed',
      [`cardRequests.${cardType}.completedAt`]: Timestamp.now(),
      [`cardRequests.${cardType}.adminNotes`]: cardDetails.adminNotes || `Carte ${cardType} activée et disponible`,
      updatedAt: Timestamp.now()
    });
    
    console.log(`✅ Carte ${cardType} activée avec succès pour l'utilisateur ${userId}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'activation de la carte ${cardType}:`, error);
    return false;
  }
}

/**
 * Lister tous les utilisateurs avec leurs cartes
 */
async function listUsersWithCards() {
  try {
    console.log('🔄 Récupération de tous les utilisateurs avec leurs cartes...');
    
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    if (querySnapshot.empty) {
      console.log('📝 Aucun utilisateur trouvé');
      return;
    }
    
    console.log(`\n📊 ${querySnapshot.size} utilisateur(s) trouvé(s):\n`);
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;
      
      console.log(`👤 Utilisateur: ${userId}`);
      console.log(`   📅 Créé le: ${userData.createdAt?.toDate?.() || 'N/A'}`);
      
      // Cartes physiques
      if (userData.physicalCardStatus && userData.physicalCardStatus !== 'none') {
        console.log(`   💳 Carte physique: ${userData.physicalCardStatus}`);
        if (userData.physicalCardData) {
          console.log(`      Numéro: ${userData.physicalCardData.cardNumber}`);
          console.log(`      Expire: ${userData.physicalCardData.expiryDate}`);
          console.log(`      Active: ${userData.physicalCardData.isActive ? 'Oui' : 'Non'}`);
          console.log(`      Visible: ${userData.physicalCardData.isDisplayed ? 'Oui' : 'Non'}`);
        }
      }
      
      // Cartes virtuelles
      if (userData.virtualCardStatus && userData.virtualCardStatus !== 'none') {
        console.log(`   📱 Carte virtuelle: ${userData.virtualCardStatus}`);
        if (userData.virtualCardData) {
          console.log(`      Numéro: ${userData.virtualCardData.cardNumber}`);
          console.log(`      Expire: ${userData.virtualCardData.expiryDate}`);
          console.log(`      Active: ${userData.virtualCardData.isActive ? 'Oui' : 'Non'}`);
          console.log(`      Visible: ${userData.virtualCardData.isDisplayed ? 'Oui' : 'Non'}`);
        }
      }
      
      // Demandes de cartes
      if (userData.cardRequests) {
        console.log(`   📋 Demandes de cartes:`);
        if (userData.cardRequests.physical) {
          console.log(`      Physique: ${userData.cardRequests.physical.status} (${userData.cardRequests.physical.requestedAt?.toDate?.() || 'N/A'})`);
        }
        if (userData.cardRequests.virtual) {
          console.log(`      Virtuelle: ${userData.cardRequests.virtual.status} (${userData.cardRequests.virtual.requestedAt?.toDate?.() || 'N/A'})`);
        }
      }
      
      console.log(''); // Ligne vide pour séparer
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
  }
}

/**
 * Migrer des données existantes
 */
async function migrateData() {
  try {
    console.log('🔄 Migration des données existantes...');
    
    // Exemple de migration : créer des demandes de cartes pour tous les utilisateurs
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    let migratedCount = 0;
    
    for (const doc of querySnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      // Créer une demande de carte virtuelle si elle n'existe pas
      if (!userData.virtualCardStatus || userData.virtualCardStatus === 'none') {
        const success = await createCardRequest(userId, 'virtual', 'pending', 'Migration automatique');
        if (success) migratedCount++;
      }
      
      // Créer une demande de carte physique si elle n'existe pas
      if (!userData.physicalCardStatus || userData.physicalCardStatus === 'none') {
        const success = await createCardRequest(userId, 'physical', 'pending', 'Migration automatique');
        if (success) migratedCount++;
      }
    }
    
    console.log(`✅ Migration terminée. ${migratedCount} demande(s) de carte(s) créée(s)`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

/**
 * Afficher l'aide
 */
function showHelp() {
  console.log(`
📋 Script de gestion des cardRequests dans Firestore

Usage: node scripts/update-card-requests.js [command] [options]

Commandes disponibles:

1. create-request <userId> <cardType> [status] [adminNotes]
   Créer une nouvelle demande de carte
   Exemple: node scripts/update-card-requests.js create-request user123 virtual pending "Demande en attente"

2. update-status <userId> <cardType> <newStatus> [adminNotes]
   Mettre à jour le statut d'une carte
   Exemple: node scripts/update-card-requests.js update-status user123 virtual completed "Carte activée"

3. activate-card <userId> <cardType> <cardNumber> <expiryDate> <cvv> [adminNotes]
   Activer une carte (la rendre visible)
   Exemple: node scripts/update-card-requests.js activate-card user123 virtual "4111 1234 5678 9012" "12/25" "123" "Carte activée"

4. list-users
   Lister tous les utilisateurs avec leurs cartes
   Exemple: node scripts/update-card-requests.js list-users

5. migrate-data
   Migrer des données existantes
   Exemple: node scripts/update-card-requests.js migrate-data

6. help
   Afficher cette aide

Types de cartes: physical, virtual
Statuts: none, pending, processing, completed, rejected

⚠️  IMPORTANT: Configurez d'abord vos identifiants Firebase dans le script !
`);
}

/**
 * Fonction principale
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  try {
    switch (command) {
      case 'create-request':
        if (args.length < 3) {
          console.error('❌ Usage: create-request <userId> <cardType> [status] [adminNotes]');
          return;
        }
        const [_, userId, cardType, status = 'pending', adminNotes = ''] = args;
        await createCardRequest(userId, cardType, status, adminNotes);
        break;
        
      case 'update-status':
        if (args.length < 4) {
          console.error('❌ Usage: update-status <userId> <cardType> <newStatus> [adminNotes]');
          return;
        }
        const [__, userId2, cardType2, newStatus, adminNotes2 = ''] = args;
        await updateCardStatus(userId2, cardType2, newStatus, adminNotes2);
        break;
        
      case 'activate-card':
        if (args.length < 6) {
          console.error('❌ Usage: activate-card <userId> <cardType> <cardNumber> <expiryDate> <cvv> [adminNotes]');
          return;
        }
        const [___, userId3, cardType3, cardNumber, expiryDate, cvv, adminNotes3 = ''] = args;
        await activateCard(userId3, cardType3, {
          cardNumber,
          expiryDate,
          cvv,
          adminNotes: adminNotes3
        });
        break;
        
      case 'list-users':
        await listUsersWithCards();
        break;
        
      case 'migrate-data':
        await migrateData();
        break;
        
      default:
        console.error(`❌ Commande inconnue: ${command}`);
        showHelp();
        break;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution:', error);
  }
}

// Exécuter le script
if (require.main === module) {
  main().then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  }).catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = {
  createCardRequest,
  updateCardStatus,
  activateCard,
  listUsersWithCards,
  migrateData
};
