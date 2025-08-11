const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🏦 Configuration du RIB commun...\n');

// Charger la configuration Firebase Admin
const firebaseConfigPath = path.join(__dirname, 'firebase-config.cjs');
if (!fs.existsSync(firebaseConfigPath)) {
  console.error('❌ firebase-config.cjs non trouvé');
  process.exit(1);
}

try {
  const { db } = require(firebaseConfigPath);

  console.log('✅ Firebase Admin initialisé');
  console.log('📋 Base de données Firestore connectée');

  // ID de l'utilisateur
  const userId = 'HCFKNbUg45fEvt6mraXWb94UWG02';
  
  console.log(`\n🔍 Configuration du RIB pour l'utilisateur: ${userId}`);

  // RIB commun pour tous les comptes
  const commonRib = {
    iban: "FR7630001007941234567890185",
    bic: "BNPAFRPPXXX",
    bankName: "AmCbunq Bank",
    accountHolder: "Laetitia Rondy",
    status: "unavailable", // unavailable, requested, available
    requestDate: null,
    availableDate: null
  };

  console.log('🏦 RIB commun défini:');
  console.log(`   - IBAN: ${commonRib.iban}`);
  console.log(`   - BIC: ${commonRib.bic}`);
  console.log(`   - Statut: ${commonRib.status}`);

  // Récupérer le document utilisateur
  const userRef = db.collection('users').doc(userId);
  
  userRef.get()
  .then((doc) => {
    if (!doc.exists) {
      console.error('❌ Utilisateur non trouvé');
      return;
    }

    const userData = doc.data();
    const accounts = userData.accounts || [];
    
    console.log(`\n📊 ${accounts.length} comptes trouvés dans Firestore`);

    // Mettre à jour les comptes avec le RIB commun
    const updatedAccounts = accounts.map(account => {
      const accountName = account.name || account.accountType;
      
      // Déterminer le statut du RIB selon le statut KYC
      let ribStatus = "unavailable";
      let ribDisplay = "RIB non disponible";
      
      if (userData.kycStatus === 'unverified') {
        ribStatus = "unavailable";
        ribDisplay = "RIB non disponible";
      } else if (userData.kycStatus === 'pending') {
        ribStatus = "unavailable";
        ribDisplay = "RIB non disponible";
      } else if (userData.kycStatus === 'verified') {
        // Pour les utilisateurs vérifiés, le RIB est disponible
        ribStatus = "available";
        ribDisplay = commonRib.iban;
      }

      console.log(`   ✅ Compte ${accountName}: RIB ${ribStatus} - ${ribDisplay}`);

      return {
        ...account,
        rib: {
          ...commonRib,
          status: ribStatus,
          displayValue: ribDisplay
        }
      };
    });

    // Mettre à jour le document utilisateur
    return userRef.update({
      accounts: updatedAccounts,
      commonRib: commonRib
    });
  })
  .then(() => {
    console.log('\n✅ RIB commun configuré avec succès !');
    console.log('🔄 Rafraîchissez votre application pour voir les changements !');
  })
  .catch((error) => {
    console.error('❌ Erreur lors de la configuration:', error);
  });

} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation:', error);
} 