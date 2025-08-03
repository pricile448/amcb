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

async function checkPolling() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🔍 VÉRIFICATION DU POLLING');
  console.log('=' .repeat(40));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. Vérifier les logs de Firestore
    console.log('📋 1. Vérification des accès Firestore...');
    
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    console.log('✅ Données utilisateur récupérées');
    console.log(`📊 Dernière mise à jour: ${userData.updatedAt ? userData.updatedAt.toDate().toLocaleString('fr-FR') : 'Non disponible'}`);
    
    // 2. Vérifier les notifications
    const notifications = userData.notifications || [];
    console.log(`🔔 Notifications: ${notifications.length}`);
    
    // 3. Vérifier s'il y a des notifications récentes (moins de 5 minutes)
    const now = new Date();
    const recentNotifications = notifications.filter(notif => {
      const notifDate = notif.date.toDate ? notif.date.toDate() : new Date(notif.date);
      const diffMinutes = (now.getTime() - notifDate.getTime()) / (1000 * 60);
      return diffMinutes < 5;
    });
    
    console.log(`🕐 Notifications récentes (< 5 min): ${recentNotifications.length}`);
    
    if (recentNotifications.length > 0) {
      console.log('\n📝 Notifications récentes:');
      recentNotifications.forEach((notif, index) => {
        const notifDate = notif.date.toDate ? notif.date.toDate() : new Date(notif.date);
        const diffMinutes = (now.getTime() - notifDate.getTime()) / (1000 * 60);
        console.log(`   ${index + 1}. ${notif.title} (il y a ${diffMinutes.toFixed(1)} min)`);
      });
    }
    
    // 4. Recommandations
    console.log('\n💡 Recommandations:');
    console.log('   1. Vérifiez que le serveur de développement n\'a pas de polling');
    console.log('   2. Vérifiez que useNotifications n\'est pas appelé plusieurs fois');
    console.log('   3. Vérifiez qu\'il n\'y a pas de setInterval dans le code');
    console.log('   4. Rechargez la page pour voir si le polling s\'arrête');
    
    console.log('\n✅ Vérification terminée !');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter la vérification
checkPolling().catch(console.error); 