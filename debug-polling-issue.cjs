const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function debugPollingIssue() {
  console.log('🔍 DIAGNOSTIC DU PROBLÈME DE POLLING');
  console.log('=====================================\n');

  try {
    // 1. Vérifier les logs d'accès récents
    console.log('1️⃣ Vérification des accès récents à Firestore...');
    
    // Simuler un accès pour voir les logs
    const testUserId = 'test-user-id';
    const userRef = db.collection('users').doc(testUserId);
    
    try {
      await userRef.get();
      console.log('   ✅ Accès Firestore fonctionnel');
    } catch (error) {
      console.log('   ❌ Erreur d\'accès Firestore:', error.message);
    }

    // 2. Vérifier les notifications récentes
    console.log('\n2️⃣ Vérification des notifications récentes...');
    
    // Essayer de récupérer les notifications d'un utilisateur réel
    const usersSnapshot = await db.collection('users').limit(1).get();
    
    if (!usersSnapshot.empty) {
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      console.log(`   📋 Utilisateur trouvé: ${userId}`);
      
      if (userData.notifications && Array.isArray(userData.notifications)) {
        console.log(`   📬 Nombre de notifications: ${userData.notifications.length}`);
        
        // Vérifier les notifications récentes (dernières 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentNotifications = userData.notifications.filter(notif => {
          const notifDate = notif.date.toDate ? notif.date.toDate() : new Date(notif.date);
          return notifDate > oneDayAgo;
        });
        
        console.log(`   🕐 Notifications récentes (24h): ${recentNotifications.length}`);
        
        if (recentNotifications.length > 0) {
          console.log('   📝 Dernières notifications:');
          recentNotifications.slice(0, 3).forEach((notif, index) => {
            const date = notif.date.toDate ? notif.date.toDate() : new Date(notif.date);
            console.log(`      ${index + 1}. ${notif.title} (${date.toLocaleString()})`);
          });
        }
      } else {
        console.log('   ❌ Aucune notification trouvée');
      }
    } else {
      console.log('   ❌ Aucun utilisateur trouvé');
    }

    // 3. Vérifier les processus en cours
    console.log('\n3️⃣ Recommandations pour résoudre le polling:');
    console.log('   🔧 Actions à effectuer:');
    console.log('      1. Vérifiez que le serveur de développement est arrêté');
    console.log('      2. Videz le cache du navigateur (Ctrl+Shift+R)');
    console.log('      3. Redémarrez le serveur avec: npm run dev');
    console.log('      4. Vérifiez la console du navigateur pour les erreurs');
    console.log('      5. Vérifiez que useNotifications.ts n\'a pas de setInterval');
    console.log('      6. Vérifiez que DashboardLayout.tsx n\'appelle pas loadNotifications en boucle');
    
    console.log('\n   🐛 Points à vérifier dans le code:');
    console.log('      - useNotifications.ts: useEffect avec loadNotifications');
    console.log('      - DashboardLayout.tsx: appels à useNotifications');
    console.log('      - NotificationDropdown.tsx: useEffect ou setInterval');
    console.log('      - vite-dev-server.cjs: endpoints avec polling');
    
    console.log('\n   📊 Si le problème persiste:');
    console.log('      - Ouvrez les outils de développement (F12)');
    console.log('      - Allez dans l\'onglet Network');
    console.log('      - Rechargez la page et observez les requêtes répétées');
    console.log('      - Vérifiez les requêtes vers /api/notifications');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

debugPollingIssue().catch(console.error); 