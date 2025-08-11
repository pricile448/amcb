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

async function viewNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('📋 AFFICHAGE DES NOTIFICATIONS');
  console.log('=' .repeat(40));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // Récupérer les notifications
    console.log('📋 Récupération des notifications...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    console.log(`📊 Total notifications: ${notifications.length}\n`);
    
    if (notifications.length === 0) {
      console.log('📭 Aucune notification trouvée');
      return;
    }
    
    // Afficher les notifications
    console.log('📝 Liste des notifications:\n');
    
    const unreadCount = notifications.filter(n => !n.read).length;
    console.log(`🔴 Non lues: ${unreadCount} | ✅ Lues: ${notifications.length - unreadCount}\n`);
    
    notifications.forEach((notif, index) => {
      const date = notif.date.toDate ? notif.date.toDate().toLocaleString('fr-FR') : notif.date;
      const status = notif.read ? '✅' : '🔴';
      
      console.log(`${index + 1}. ${status} ${notif.title}`);
      console.log(`   📝 ${notif.message}`);
      console.log(`   🏷️  Type: ${notif.type} | Priorité: ${notif.priority} | Catégorie: ${notif.category}`);
      console.log(`   📅 ${date}`);
      console.log(`   🆔 ID: ${notif.id}`);
      console.log('');
    });
    
    // Statistiques
    console.log('📊 Statistiques:');
    const typeStats = {};
    const priorityStats = {};
    const categoryStats = {};
    
    notifications.forEach(notif => {
      typeStats[notif.type] = (typeStats[notif.type] || 0) + 1;
      priorityStats[notif.priority] = (priorityStats[notif.priority] || 0) + 1;
      categoryStats[notif.category] = (categoryStats[notif.category] || 0) + 1;
    });
    
    console.log('   Types:', typeStats);
    console.log('   Priorités:', priorityStats);
    console.log('   Catégories:', categoryStats);
    
    console.log('\n✅ Affichage terminé !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'affichage:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter l'affichage
viewNotifications().catch(console.error); 