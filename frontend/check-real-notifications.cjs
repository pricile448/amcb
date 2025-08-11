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

async function checkRealNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🔍 VÉRIFICATION DES NOTIFICATIONS RÉELLES');
  console.log('=' .repeat(50));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. Récupérer toutes les notifications actuelles
    console.log('📋 1. Récupération des notifications actuelles...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    console.log(`📊 Notifications trouvées: ${notifications.length}`);
    
    // 2. Analyser les notifications
    if (notifications.length > 0) {
      console.log('\n📝 2. Analyse des notifications:');
      
      const testNotifications = [];
      const realNotifications = [];
      
      notifications.forEach((notif, index) => {
        const isTest = notif.title.includes('Test') || 
                      notif.title.includes('test') || 
                      notif.id.includes('test') || 
                      notif.id.includes('frontend_test') ||
                      notif.message.includes('test') ||
                      notif.message.includes('Test');
        
        if (isTest) {
          testNotifications.push(notif);
        } else {
          realNotifications.push(notif);
        }
        
        console.log(`   ${index + 1}. ${notif.title}`);
        console.log(`      ID: ${notif.id}`);
        console.log(`      Type: ${notif.type}`);
        console.log(`      Test: ${isTest ? 'OUI' : 'NON'}`);
        console.log('');
      });
      
      console.log(`\n📊 Résumé:`);
      console.log(`   🔴 Notifications de test: ${testNotifications.length}`);
      console.log(`   ✅ Notifications réelles: ${realNotifications.length}`);
      
      // 3. Proposer de nettoyer les tests
      if (testNotifications.length > 0) {
        console.log('\n🧹 3. Nettoyage des notifications de test...');
        
        const filteredNotifications = notifications.filter(notif => {
          const isTest = notif.title.includes('Test') || 
                        notif.title.includes('test') || 
                        notif.id.includes('test') || 
                        notif.id.includes('frontend_test') ||
                        notif.message.includes('test') ||
                        notif.message.includes('Test');
          return !isTest;
        });
        
        await userRef.update({
          notifications: filteredNotifications,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ ${testNotifications.length} notifications de test supprimées`);
        console.log(`📊 ${filteredNotifications.length} notifications réelles conservées`);
      } else {
        console.log('\n✅ Aucune notification de test trouvée');
      }
      
      // 4. Afficher les notifications réelles restantes
      if (realNotifications.length > 0) {
        console.log('\n📋 4. Notifications réelles conservées:');
        realNotifications.forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title}`);
          console.log(`      Message: ${notif.message}`);
          console.log(`      Type: ${notif.type}`);
          console.log(`      Date: ${notif.date.toDate ? notif.date.toDate().toLocaleString('fr-FR') : notif.date}`);
          console.log('');
        });
      }
    } else {
      console.log('📭 Aucune notification trouvée');
    }

    console.log('\n✅ Vérification terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter la vérification
checkRealNotifications().catch(console.error); 