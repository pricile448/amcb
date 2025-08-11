const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');
const http = require('http');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.serviceAccount),
    databaseURL: "https://amcbunq-default-rtdb.europe-west1.firebasedatabase.app"
  });
}

const db = admin.firestore();

// Fonction pour faire une requête HTTP
function makeHttpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testNotificationDeletion() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🧪 TEST DE SUPPRESSION DES NOTIFICATIONS');
  console.log('=' .repeat(50));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. Ajouter des notifications de test via Firestore direct
    console.log('📝 1. Ajout de notifications de test via Firestore...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const currentNotifications = userData.notifications || [];
    
    const testNotifications = [
      {
        id: `test_delete_1_${Date.now()}`,
        title: 'Notification à supprimer 1',
        message: 'Cette notification sera supprimée',
        type: 'info',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'general',
        createdAt: new Date().toISOString()
      },
      {
        id: `test_delete_2_${Date.now()}`,
        title: 'Notification à supprimer 2',
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

    // 2. Vérifier que les notifications sont bien présentes
    console.log('\n🔍 2. Vérification de la présence des notifications...');
    const checkDoc = await userRef.get();
    const checkData = checkDoc.data();
    const checkNotifications = checkData.notifications || [];
    
    const foundNotifications = testNotifications.filter(testNotif => 
      checkNotifications.find(n => n.id === testNotif.id)
    );
    
    console.log(`📊 Notifications trouvées: ${foundNotifications.length}/${testNotifications.length}`);

    // 3. Tester la suppression via l'API
    console.log('\n🗑️ 3. Test de suppression via l\'API...');
    
    for (const notification of testNotifications) {
      console.log(`   Suppression de: ${notification.title}`);
      
      const deleteOptions = {
        hostname: 'localhost',
        port: 5173,
        path: `/api/notifications/${notification.id}?userId=${userId}`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      };

             try {
         const response = await makeHttpRequest(deleteOptions);
         console.log(`   Status: ${response.status}`);
         
         if (response.status === 204) {
           console.log(`   ✅ Suppression réussie`);
         } else {
           console.log(`   ❌ Échec de suppression: ${response.status}`);
           console.log(`   Réponse:`, response.data);
         }
       } catch (error) {
         console.log(`   ❌ Erreur lors de la suppression: ${error.message}`);
         console.log(`   Détails de l'erreur:`, error);
       }
    }

    // 4. Vérifier que les notifications ont été supprimées
    console.log('\n🔍 4. Vérification de la suppression...');
    const finalDoc = await userRef.get();
    const finalData = finalDoc.data();
    const finalNotifications = finalData.notifications || [];
    
    const remainingNotifications = testNotifications.filter(testNotif => 
      finalNotifications.find(n => n.id === testNotif.id)
    );
    
    console.log(`📊 Notifications restantes: ${remainingNotifications.length}`);
    
    if (remainingNotifications.length === 0) {
      console.log('✅ Toutes les notifications de test ont été supprimées');
    } else {
      console.log('❌ Certaines notifications sont encore présentes:');
      remainingNotifications.forEach(notif => {
        console.log(`   - ${notif.title} (${notif.id})`);
      });
    }

    // 5. Test de suppression directe via Firestore
    console.log('\n🗑️ 5. Test de suppression directe via Firestore...');
    
    // Ajouter une notification pour le test direct
    const directTestNotification = {
      id: `test_direct_${Date.now()}`,
      title: 'Test suppression directe',
      message: 'Cette notification sera supprimée directement',
      type: 'info',
      date: new Date().toISOString(),
      read: false,
      priority: 'medium',
      category: 'general',
      createdAt: new Date().toISOString()
    };

    const withDirectTest = [...finalNotifications, directTestNotification];
    await userRef.update({
      notifications: withDirectTest,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('   Notification ajoutée pour test direct');

    // Supprimer directement
    const withoutDirectTest = withDirectTest.filter(n => n.id !== directTestNotification.id);
    await userRef.update({
      notifications: withoutDirectTest,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('   Suppression directe effectuée');

    // Vérifier
    const finalCheckDoc = await userRef.get();
    const finalCheckData = finalCheckDoc.data();
    const finalCheckNotifications = finalCheckData.notifications || [];
    
    const directTestRemaining = finalCheckNotifications.find(n => n.id === directTestNotification.id);
    
    if (!directTestRemaining) {
      console.log('   ✅ Suppression directe réussie');
    } else {
      console.log('   ❌ Suppression directe échouée');
    }

    console.log('\n🎉 Test de suppression terminé !');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testNotificationDeletion().catch(console.error); 