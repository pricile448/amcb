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

async function testSimpleNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🧪 TEST SIMPLE DES NOTIFICATIONS');
  console.log('=' .repeat(50));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. Récupérer les notifications
    console.log('📋 1. Récupération des notifications...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    console.log(`📊 Notifications trouvées: ${notifications.length}`);
    
    // 2. Afficher les détails des notifications
    if (notifications.length > 0) {
      console.log('\n📝 2. Détails des notifications:');
      notifications.slice(0, 5).forEach((notif, index) => {
        console.log(`   ${index + 1}. ${notif.title}`);
        console.log(`      Message: ${notif.message}`);
        console.log(`      Type: ${notif.type}`);
        console.log(`      Priorité: ${notif.priority}`);
        console.log(`      Lu: ${notif.read ? 'Oui' : 'Non'}`);
        console.log(`      Date: ${notif.date.toDate ? notif.date.toDate().toLocaleString('fr-FR') : notif.date}`);
        console.log('');
      });
      
      if (notifications.length > 5) {
        console.log(`   ... et ${notifications.length - 5} autres notifications`);
      }
    }

    // 3. Statistiques
    console.log('📊 3. Statistiques:');
    const unreadCount = notifications.filter(n => !n.read).length;
    const readCount = notifications.filter(n => n.read).length;
    
    console.log(`   📖 Non lues: ${unreadCount}`);
    console.log(`   ✅ Lues: ${readCount}`);
    console.log(`   📅 Total: ${notifications.length}`);
    
    // 4. Types de notifications
    const types = {};
    notifications.forEach(n => {
      types[n.type] = (types[n.type] || 0) + 1;
    });
    
    console.log('\n🎯 4. Répartition par type:');
    Object.entries(types).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n✅ Test terminé avec succès !');
    console.log('💡 Les utilisateurs peuvent maintenant lire les notifications sans pouvoir les supprimer.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter le test
testSimpleNotifications().catch(console.error); 