const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

console.log('💳 Ajout du compte carte de crédit manquant...\n');

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

  // ID de l'utilisateur (à remplacer par le vôtre)
  const userId = 'HCFKNbUg45fEvt6mraXWb94UWG02';
  
  console.log(`\n🔍 Ajout du compte carte de crédit pour l'utilisateur: ${userId}`);

  // Données du compte carte de crédit
  const creditCardAccount = {
    currency: "EUR",
    id: `credit_${userId}`,
    accountNumber: `FR76 **** **** **** **** **** ${userId.slice(-4)}`,
    balance: 0,
    name: "credit",
    status: "active",
    accountType: "credit",
    createdAt: new Date(),
    bankName: "AmCbunq Bank",
    creditLimit: 5000,
    availableCredit: 5000,
    cardNumber: "**** **** **** 1234",
    expiryDate: "12/28",
    cvv: "***"
  };

  console.log('💳 Données du compte carte de crédit:', JSON.stringify(creditCardAccount, null, 2));

  // Mettre à jour le document utilisateur dans Firestore
  const userRef = db.collection('users').doc(userId);
  
  userRef.update({
    accounts: admin.firestore.FieldValue.arrayUnion(creditCardAccount)
  })
  .then(() => {
    console.log('✅ Compte carte de crédit ajouté avec succès !');
    console.log('💳 Détails du compte:');
    console.log(`   - ID: ${creditCardAccount.id}`);
    console.log(`   - Type: ${creditCardAccount.accountType}`);
    console.log(`   - Statut: ${creditCardAccount.status}`);
    console.log(`   - Limite de crédit: ${creditCardAccount.creditLimit}€`);
    console.log(`   - Crédit disponible: ${creditCardAccount.availableCredit}€`);
    console.log('\n🔄 Rafraîchissez votre application pour voir le nouveau compte !');
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'ajout du compte:', error);
  });

} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation:', error);
} 