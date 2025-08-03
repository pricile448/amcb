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

async function testDirectNotificationDeletion() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🧪 TEST DE SUPPRESSION DIRECTE DES NOTIFICATIONS');
  console.log('=' .repeat(60));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. Récupérer l'état actuel
    console.log('📋 1. État actuel des notifications...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const currentNotifications = userData.notifications || [];
    console.log(`📊 Notifications actuelles: ${currentNotifications.length}`);

    // 2. Ajouter des notifications de test
    console.log('\n📝 2. Ajout de notifications de test...');
    const testNotifications = [
      {
        id: `test_direct_1_${Date.now()}`,
        title: 'Test suppression directe 1',
        message: 'Cette notification sera supprimée directement',
        type: 'info',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'general',
        createdAt: new Date().toISOString()
      },
      {
        id: `test_direct_2_${Date.now()}`,
        title: 'Test suppression directe 2',
        message: 'Cette notification sera aussi supprimée',
        type: 'warning',
        date: new Date().toISOString(),
        read: false,
        priority: 'high',
        category: 'security',
        createdAt: new Date().toISOString()
      }
    ];

    const updatedNotifications = [...currentNotifications, ...testNotifications];
    
    await userRef.update({
      notifications: updatedNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ ${testNotifications.length} notifications de test ajoutées`);

    // 3. Vérifier l'ajout
    console.log('\n🔍 3. Vérification de l\'ajout...');
    const checkDoc = await userRef.get();
    const checkData = checkDoc.data();
    const checkNotifications = checkData.notifications || [];
    console.log(`📊 Notifications après ajout: ${checkNotifications.length}`);

    // 4. Supprimer une notification spécifique
    console.log('\n🗑️ 4. Suppression d\'une notification spécifique...');
    const notificationToDelete = testNotifications[0];
    console.log(`   Suppression de: ${notificationToDelete.title} (${notificationToDelete.id})`);
    
    const filteredNotifications = checkNotifications.filter(n => n.id !== notificationToDelete.id);
    
    await userRef.update({
      notifications: filteredNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('   ✅ Suppression effectuée');

    // 5. Vérifier la suppression
    console.log('\n🔍 5. Vérification de la suppression...');
    const finalDoc = await userRef.get();
    const finalData = finalDoc.data();
    const finalNotifications = finalData.notifications || [];
    console.log(`📊 Notifications après suppression: ${finalNotifications.length}`);
    
    const deletedNotification = finalNotifications.find(n => n.id === notificationToDelete.id);
    if (!deletedNotification) {
      console.log('   ✅ Notification correctement supprimée');
    } else {
      console.log('   ❌ Notification toujours présente');
    }

    // 6. Supprimer toutes les notifications de test
    console.log('\n🗑️ 6. Suppression de toutes les notifications de test...');
    const cleanNotifications = finalNotifications.filter(n => 
      !testNotifications.some(testNotif => testNotif.id === n.id)
    );
    
    await userRef.update({
      notifications: cleanNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('   ✅ Toutes les notifications de test supprimées');

    // 7. Vérification finale
    console.log('\n🔍 7. Vérification finale...');
    const finalCheckDoc = await userRef.get();
    const finalCheckData = finalCheckDoc.data();
    const finalCheckNotifications = finalCheckData.notifications || [];
    console.log(`📊 Notifications finales: ${finalCheckNotifications.length}`);
    
    const remainingTestNotifications = testNotifications.filter(testNotif => 
      finalCheckNotifications.find(n => n.id === testNotif.id)
    );
    
    if (remainingTestNotifications.length === 0) {
      console.log('   ✅ Toutes les notifications de test ont été supprimées');
    } else {
      console.log('   ❌ Certaines notifications de test sont encore présentes');
      remainingTestNotifications.forEach(notif => {
        console.log(`      - ${notif.title} (${notif.id})`);
      });
    }

    console.log('\n🎉 Test de suppression directe terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testDirectNotificationDeletion().catch(console.error); 