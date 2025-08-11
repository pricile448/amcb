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

async function quickCleanNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🧹 NETTOYAGE RAPIDE DES NOTIFICATIONS DE TEST');
  console.log('=' .repeat(50));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. Récupérer les notifications actuelles
    console.log('📋 Récupération des notifications...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    console.log(`📊 Notifications trouvées: ${notifications.length}`);
    
    // 2. Identifier et supprimer les notifications de test
    const testNotifications = [];
    const realNotifications = [];
    
    notifications.forEach(notif => {
      const isTest = notif.title.includes('Test') || 
                    notif.title.includes('test') || 
                    notif.id.includes('test') || 
                    notif.id.includes('frontend_test') ||
                    notif.message.includes('test') ||
                    notif.message.includes('Test') ||
                    notif.title.includes('simulé') ||
                    notif.message.includes('simulé') ||
                    notif.title.includes('Virement') && notif.message.includes('test');
      
      if (isTest) {
        testNotifications.push(notif);
      } else {
        realNotifications.push(notif);
      }
    });
    
    console.log(`🔴 Notifications de test identifiées: ${testNotifications.length}`);
    console.log(`✅ Notifications réelles conservées: ${realNotifications.length}`);
    
    // 3. Afficher les notifications de test trouvées
    if (testNotifications.length > 0) {
      console.log('\n📝 Notifications de test trouvées:');
      testNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title}`);
        console.log(`      Message: ${notif.message}`);
        console.log(`      ID: ${notif.id}`);
        console.log('');
      });
    }
    
    // 4. Mettre à jour Firestore
    if (testNotifications.length > 0) {
      console.log('💾 Suppression des notifications de test...');
      await userRef.update({
        notifications: realNotifications,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ ${testNotifications.length} notifications de test supprimées`);
    } else {
      console.log('✅ Aucune notification de test trouvée');
    }
    
    // 5. Afficher les notifications réelles restantes
    if (realNotifications.length > 0) {
      console.log('\n📋 Notifications réelles conservées:');
      realNotifications.forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title}`);
        console.log(`      Type: ${notif.type} | Priorité: ${notif.priority}`);
        console.log('');
      });
    }
    
    console.log('\n🎉 Nettoyage terminé !');
    console.log('💡 Rechargez la page pour voir les changements.');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le nettoyage
quickCleanNotifications().catch(console.error); 