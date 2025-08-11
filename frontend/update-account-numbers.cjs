const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('🏦 Mise à jour des numéros de compte manuels...\n');

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
  
  console.log(`\n🔍 Mise à jour des numéros de compte pour l'utilisateur: ${userId}`);

  // Numéros de compte manuels (vrais IBAN)
  const accountNumbers = {
    checking: "FR7630001007941234567890185", // Compte courant
    savings: "FR7630001007941234567890186",  // Compte épargne  
    credit: "FR7630001007941234567890187"    // Carte de crédit
  };

  console.log('🏦 Numéros de compte définis:');
  console.log(`   - Compte courant: ${accountNumbers.checking}`);
  console.log(`   - Compte épargne: ${accountNumbers.savings}`);
  console.log(`   - Carte de crédit: ${accountNumbers.credit}`);

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

    // Mettre à jour les numéros de compte
    const updatedAccounts = accounts.map(account => {
      const accountName = account.name || account.accountType;
      let newAccountNumber = account.accountNumber;

      if (accountName === 'checking' || accountName === 'courant') {
        newAccountNumber = accountNumbers.checking;
        console.log(`   ✅ Compte courant mis à jour: ${newAccountNumber}`);
      } else if (accountName === 'savings' || accountName === 'epargne') {
        newAccountNumber = accountNumbers.savings;
        console.log(`   ✅ Compte épargne mis à jour: ${newAccountNumber}`);
      } else if (accountName === 'credit') {
        newAccountNumber = accountNumbers.credit;
        console.log(`   ✅ Carte de crédit mise à jour: ${newAccountNumber}`);
      }

      return {
        ...account,
        accountNumber: newAccountNumber
      };
    });

    // Mettre à jour le document utilisateur
    return userRef.update({
      accounts: updatedAccounts
    });
  })
  .then(() => {
    console.log('\n✅ Numéros de compte mis à jour avec succès !');
    console.log('🔄 Rafraîchissez votre application pour voir les nouveaux numéros !');
  })
  .catch((error) => {
    console.error('❌ Erreur lors de la mise à jour:', error);
  });

} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation:', error);
} 