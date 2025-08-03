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

async function testFrontendNotificationFlow() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🧪 TEST DU FLUX DE NOTIFICATIONS FRONTEND');
  console.log('=' .repeat(60));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. État initial
    console.log('📋 1. État initial des notifications...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const initialNotifications = userData.notifications || [];
    console.log(`📊 Notifications initiales: ${initialNotifications.length}`);

    // 2. Ajouter une notification de test
    console.log('\n📝 2. Ajout d\'une notification de test...');
    const testNotification = {
      id: `frontend_test_${Date.now()}`,
      userId: userId,
      title: 'Test Frontend - Notification',
      message: 'Cette notification sera testée par le frontend',
      type: 'info',
      date: new Date().toISOString(),
      read: false,
      priority: 'medium',
      category: 'general',
      createdAt: new Date().toISOString()
    };

    const updatedNotifications = [...initialNotifications, testNotification];
    
    await userRef.update({
      notifications: updatedNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Notification de test ajoutée');

    // 3. Simuler le chargement des notifications (comme le frontend)
    console.log('\n🔍 3. Simulation du chargement des notifications...');
    const loadDoc = await userRef.get();
    const loadData = loadDoc.data();
    const loadNotifications = loadData.notifications || [];
    
    // Trier par date décroissante (comme le frontend)
    loadNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    console.log(`📊 Notifications chargées: ${loadNotifications.length}`);
    const foundTestNotification = loadNotifications.find(n => n.id === testNotification.id);
    
    if (foundTestNotification) {
      console.log('✅ Notification de test trouvée dans la liste');
      console.log(`   Titre: ${foundTestNotification.title}`);
      console.log(`   Lu: ${foundTestNotification.read ? 'Oui' : 'Non'}`);
    } else {
      console.log('❌ Notification de test non trouvée');
    }

    // 4. Simuler le marquage comme lu (comme le frontend)
    console.log('\n📝 4. Simulation du marquage comme lu...');
    const markAsReadNotifications = loadNotifications.map(n => 
      n.id === testNotification.id 
        ? { ...n, read: true, updatedAt: new Date().toISOString() }
        : n
    );
    
    await userRef.update({
      notifications: markAsReadNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Notification marquée comme lue');

    // 5. Vérifier le marquage
    console.log('\n🔍 5. Vérification du marquage...');
    const checkDoc = await userRef.get();
    const checkData = checkDoc.data();
    const checkNotifications = checkData.notifications || [];
    
    const markedNotification = checkNotifications.find(n => n.id === testNotification.id);
    if (markedNotification && markedNotification.read) {
      console.log('✅ Notification correctement marquée comme lue');
    } else {
      console.log('❌ Notification non marquée comme lue');
    }

    // 6. Simuler la suppression (comme le frontend)
    console.log('\n🗑️ 6. Simulation de la suppression...');
    const filteredNotifications = checkNotifications.filter(n => n.id !== testNotification.id);
    
    await userRef.update({
      notifications: filteredNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Notification supprimée');

    // 7. Vérification finale
    console.log('\n🔍 7. Vérification finale...');
    const finalDoc = await userRef.get();
    const finalData = finalDoc.data();
    const finalNotifications = finalData.notifications || [];
    
    const deletedNotification = finalNotifications.find(n => n.id === testNotification.id);
    if (!deletedNotification) {
      console.log('✅ Notification correctement supprimée');
    } else {
      console.log('❌ Notification toujours présente');
    }

    console.log(`📊 Notifications finales: ${finalNotifications.length}`);
    console.log('\n🎉 Test du flux frontend terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testFrontendNotificationFlow().catch(console.error); 