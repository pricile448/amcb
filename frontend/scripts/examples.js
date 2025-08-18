/**
 * Exemples d'utilisation du script de gestion des cardRequests
 * 
 * Ce fichier montre comment utiliser les différentes fonctions du script
 */

const {
  createCardRequest,
  updateCardStatus,
  activateCard,
  listUsersWithCards,
  migrateData
} = require('./update-card-requests');

/**
 * Exemple 1: Créer une demande de carte virtuelle
 */
async function exampleCreateVirtualCardRequest() {
  console.log('📱 Exemple: Création d\'une demande de carte virtuelle');
  
  const userId = 'user123';
  const cardType = 'virtual';
  const status = 'pending';
  const adminNotes = 'Demande de carte virtuelle pour paiements en ligne';
  
  try {
    const success = await createCardRequest(userId, cardType, status, adminNotes);
    if (success) {
      console.log('✅ Demande de carte virtuelle créée avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

/**
 * Exemple 2: Mettre à jour le statut d'une carte
 */
async function exampleUpdateCardStatus() {
  console.log('🔄 Exemple: Mise à jour du statut d\'une carte');
  
  const userId = 'user123';
  const cardType = 'virtual';
  const newStatus = 'processing';
  const adminNotes = 'Carte en cours de génération';
  
  try {
    const success = await updateCardStatus(userId, cardType, newStatus, adminNotes);
    if (success) {
      console.log('✅ Statut de la carte mis à jour avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

/**
 * Exemple 3: Activer une carte virtuelle
 */
async function exampleActivateVirtualCard() {
  console.log('🚀 Exemple: Activation d\'une carte virtuelle');
  
  const userId = 'user123';
  const cardType = 'virtual';
  const cardDetails = {
    cardNumber: '4111 1234 5678 9012',
    expiryDate: '12/25',
    cvv: '123',
    adminNotes: 'Carte virtuelle activée et disponible pour les paiements en ligne'
  };
  
  try {
    const success = await activateCard(userId, cardType, cardDetails);
    if (success) {
      console.log('✅ Carte virtuelle activée avec succès');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

/**
 * Exemple 4: Créer et activer une carte physique
 */
async function exampleCreateAndActivatePhysicalCard() {
  console.log('💳 Exemple: Création et activation d\'une carte physique');
  
  const userId = 'user123';
  const cardType = 'physical';
  
  try {
    // Étape 1: Créer la demande
    console.log('📋 Étape 1: Création de la demande de carte physique');
    const requestCreated = await createCardRequest(userId, cardType, 'pending', 'Demande de carte physique');
    
    if (requestCreated) {
      // Étape 2: Mettre à jour le statut vers "processing"
      console.log('⚙️ Étape 2: Mise à jour du statut vers "processing"');
      await updateCardStatus(userId, cardType, 'processing', 'Carte physique en cours de génération');
      
      // Étape 3: Activer la carte
      console.log('✅ Étape 3: Activation de la carte physique');
      const cardDetails = {
        cardNumber: '4532 1234 5678 9012',
        expiryDate: '12/25',
        cvv: '123',
        adminNotes: 'Carte physique activée et disponible pour les paiements en magasin'
      };
      
      const success = await activateCard(userId, cardType, cardDetails);
      if (success) {
        console.log('🎉 Carte physique complètement configurée et activée !');
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

/**
 * Exemple 5: Workflow complet pour un nouvel utilisateur
 */
async function exampleCompleteWorkflow() {
  console.log('🔄 Exemple: Workflow complet pour un nouvel utilisateur');
  
  const userId = 'newuser456';
  const adminNotes = 'Nouvel utilisateur - Configuration complète des cartes';
  
  try {
    // 1. Créer une demande de carte virtuelle
    console.log('📱 1. Création de la demande de carte virtuelle');
    await createCardRequest(userId, 'virtual', 'pending', adminNotes);
    
    // 2. Créer une demande de carte physique
    console.log('💳 2. Création de la demande de carte physique');
    await createCardRequest(userId, 'physical', 'pending', adminNotes);
    
    // 3. Simuler le traitement de la carte virtuelle
    console.log('⚙️ 3. Traitement de la carte virtuelle');
    await updateCardStatus(userId, 'virtual', 'processing', 'Carte virtuelle en cours de génération');
    
    // 4. Activer la carte virtuelle
    console.log('🚀 4. Activation de la carte virtuelle');
    await activateCard(userId, 'virtual', {
      cardNumber: '4111 9876 5432 1098',
      expiryDate: '10/26',
      cvv: '456',
      adminNotes: 'Carte virtuelle activée pour le nouvel utilisateur'
    });
    
    // 5. Simuler le traitement de la carte physique
    console.log('📮 5. Traitement de la carte physique');
    await updateCardStatus(userId, 'physical', 'processing', 'Carte physique en cours de génération et livraison');
    
    console.log('🎉 Workflow complet terminé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du workflow:', error);
  }
}

/**
 * Exemple 6: Migration de données existantes
 */
async function exampleMigration() {
  console.log('🔄 Exemple: Migration de données existantes');
  
  try {
    await migrateData();
    console.log('✅ Migration terminée');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
}

/**
 * Exemple 7: Lister tous les utilisateurs
 */
async function exampleListUsers() {
  console.log('📊 Exemple: Liste de tous les utilisateurs avec leurs cartes');
  
  try {
    await listUsersWithCards();
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
  }
}

/**
 * Fonction principale pour exécuter tous les exemples
 */
async function runAllExamples() {
  console.log('🚀 Démarrage de tous les exemples...\n');
  
  try {
    // Exemple 1: Création de demande
    await exampleCreateVirtualCardRequest();
    console.log('');
    
    // Exemple 2: Mise à jour de statut
    await exampleUpdateCardStatus();
    console.log('');
    
    // Exemple 3: Activation de carte
    await exampleActivateVirtualCard();
    console.log('');
    
    // Exemple 4: Carte physique complète
    await exampleCreateAndActivatePhysicalCard();
    console.log('');
    
    // Exemple 5: Workflow complet
    await exampleCompleteWorkflow();
    console.log('');
    
    // Exemple 6: Migration
    await exampleMigration();
    console.log('');
    
    // Exemple 7: Liste des utilisateurs
    await exampleListUsers();
    console.log('');
    
    console.log('🎉 Tous les exemples ont été exécutés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution des exemples:', error);
  }
}

// Exporter les fonctions pour utilisation externe
module.exports = {
  exampleCreateVirtualCardRequest,
  exampleUpdateCardStatus,
  exampleActivateVirtualCard,
  exampleCreateAndActivatePhysicalCard,
  exampleCompleteWorkflow,
  exampleMigration,
  exampleListUsers,
  runAllExamples
};

// Si le fichier est exécuté directement
if (require.main === module) {
  console.log('📚 Exemples d\'utilisation du script de gestion des cartes\n');
  
  const args = process.argv.slice(2);
  const example = args[0];
  
  if (!example) {
    console.log('Usage: node scripts/examples.js [example-name]');
    console.log('Exemples disponibles:');
    console.log('  - create-request');
    console.log('  - update-status');
    console.log('  - activate-card');
    console.log('  - physical-card');
    console.log('  - complete-workflow');
    console.log('  - migration');
    console.log('  - list-users');
    console.log('  - all');
    return;
  }
  
  switch (example) {
    case 'create-request':
      exampleCreateVirtualCardRequest();
      break;
    case 'update-status':
      exampleUpdateCardStatus();
      break;
    case 'activate-card':
      exampleActivateVirtualCard();
      break;
    case 'physical-card':
      exampleCreateAndActivatePhysicalCard();
      break;
    case 'complete-workflow':
      exampleCompleteWorkflow();
      break;
    case 'migration':
      exampleMigration();
      break;
    case 'list-users':
      exampleListUsers();
      break;
    case 'all':
      runAllExamples();
      break;
    default:
      console.error(`❌ Exemple inconnu: ${example}`);
      break;
  }
}
