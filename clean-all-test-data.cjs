const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.serviceAccount),
    databaseURL: "https://amcbunq-default-rtdb.europe-west1.firebasedatabase.app"
  });
}

const db = admin.firestore();

async function cleanAllTestData() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🧹 NETTOYAGE COMPLET DES DONNÉES DE TEST');
  console.log('=' .repeat(50));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. Récupérer toutes les données utilisateur
    console.log('📋 1. Récupération des données utilisateur...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    console.log('📊 Données trouvées:', Object.keys(userData));
    
    // 2. Nettoyer les notifications de test
    console.log('\n🔔 2. Nettoyage des notifications de test...');
    const notifications = userData.notifications || [];
    const realNotifications = notifications.filter(notif => {
      const isTest = notif.title.includes('Test') || 
                    notif.title.includes('test') || 
                    notif.id.includes('test') || 
                    notif.id.includes('frontend_test') ||
                    notif.message.includes('test') ||
                    notif.message.includes('Test') ||
                    notif.title.includes('simulé') ||
                    notif.message.includes('simulé');
      return !isTest;
    });
    
    console.log(`   🔴 Notifications de test supprimées: ${notifications.length - realNotifications.length}`);
    console.log(`   ✅ Notifications réelles conservées: ${realNotifications.length}`);
    
    // 3. Nettoyer les transactions de test
    console.log('\n💰 3. Nettoyage des transactions de test...');
    const transactions = userData.transactions || [];
    const realTransactions = transactions.filter(trans => {
      const isTest = trans.description.includes('Test') || 
                    trans.description.includes('test') ||
                    trans.description.includes('simulé') ||
                    trans.amount === 0 ||
                    trans.id.includes('test');
      return !isTest;
    });
    
    console.log(`   🔴 Transactions de test supprimées: ${transactions.length - realTransactions.length}`);
    console.log(`   ✅ Transactions réelles conservées: ${realTransactions.length}`);
    
    // 4. Nettoyer les comptes de test
    console.log('\n🏦 4. Nettoyage des comptes de test...');
    const accounts = userData.accounts || [];
    const realAccounts = accounts.filter(account => {
      const isTest = account.name.includes('Test') || 
                    account.name.includes('test') ||
                    account.balance === 0 ||
                    account.id.includes('test');
      return !isTest;
    });
    
    console.log(`   🔴 Comptes de test supprimés: ${accounts.length - realAccounts.length}`);
    console.log(`   ✅ Comptes réels conservés: ${realAccounts.length}`);
    
    // 5. Nettoyer les bénéficiaires de test
    console.log('\n👥 5. Nettoyage des bénéficiaires de test...');
    const beneficiaries = userData.beneficiaries || [];
    const realBeneficiaries = beneficiaries.filter(benef => {
      const isTest = benef.name.includes('Test') || 
                    benef.name.includes('test') ||
                    benef.iban.includes('TEST') ||
                    benef.id.includes('test');
      return !isTest;
    });
    
    console.log(`   🔴 Bénéficiaires de test supprimés: ${beneficiaries.length - realBeneficiaries.length}`);
    console.log(`   ✅ Bénéficiaires réels conservés: ${realBeneficiaries.length}`);
    
    // 6. Mettre à jour Firestore avec les données nettoyées
    console.log('\n💾 6. Mise à jour de Firestore...');
    const updatedData = {
      ...userData,
      notifications: realNotifications,
      transactions: realTransactions,
      accounts: realAccounts,
      beneficiaries: realBeneficiaries,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await userRef.update(updatedData);
    
    // 7. Résumé final
    console.log('\n✅ NETTOYAGE TERMINÉ !');
    console.log('\n📊 Résumé final:');
    console.log(`   🔔 Notifications: ${realNotifications.length}`);
    console.log(`   💰 Transactions: ${realTransactions.length}`);
    console.log(`   🏦 Comptes: ${realAccounts.length}`);
    console.log(`   👥 Bénéficiaires: ${realBeneficiaries.length}`);
    
    console.log('\n🎉 Toutes les données de test ont été supprimées !');
    console.log('💡 L\'application ne contient plus que des données réelles.');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le nettoyage
cleanAllTestData().catch(console.error); 