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

async function getUserNotifications(userId) {
  console.log(`🔍 Récupération des notifications pour l'utilisateur: ${userId}\n`);

  try {
    // Récupérer le document utilisateur
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];

    console.log(`📊 Données utilisateur récupérées:`, Object.keys(userData));
    console.log(`📋 ${notifications.length} notifications trouvées\n`);

    if (notifications.length === 0) {
      console.log('📭 Aucune notification trouvée pour cet utilisateur');
      return;
    }

    // Trier par date décroissante
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Afficher les notifications
    console.log('📋 NOTIFICATIONS RÉCUPÉRÉES:');
    console.log('=' .repeat(80));

    notifications.forEach((notif, index) => {
      const date = new Date(notif.date).toLocaleString('fr-FR');
      const readStatus = notif.read ? '✅' : '❌';
      const priorityIcon = {
        'low': '🟢',
        'medium': '🟡', 
        'high': '🔴'
      }[notif.priority] || '⚪';

      console.log(`${index + 1}. ${priorityIcon} ${notif.title}`);
      console.log(`   📅 ${date} | ${readStatus} Lu | ${notif.type.toUpperCase()} | ${notif.category}`);
      console.log(`   📝 ${notif.message}`);
      console.log(`   🆔 ID: ${notif.id}`);
      console.log('');
    });

    // Statistiques
    const unreadCount = notifications.filter(n => !n.read).length;
    const readCount = notifications.filter(n => n.read).length;
    
    console.log('📊 STATISTIQUES:');
    console.log(`   • Total: ${notifications.length}`);
    console.log(`   • Non lues: ${unreadCount}`);
    console.log(`   • Lues: ${readCount}`);
    console.log(`   • Priorité haute: ${notifications.filter(n => n.priority === 'high').length}`);
    console.log(`   • Priorité moyenne: ${notifications.filter(n => n.priority === 'medium').length}`);
    console.log(`   • Priorité basse: ${notifications.filter(n => n.priority === 'low').length}`);

    return notifications;

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des notifications:', error);
    throw error;
  }
}

async function listAllUsersWithNotifications() {
  console.log('🔍 Recherche de tous les utilisateurs avec des notifications...\n');

  try {
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    console.log(`📊 ${usersSnapshot.size} utilisateurs trouvés\n`);

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const notifications = userData.notifications || [];
      
      if (notifications.length > 0) {
        console.log(`👤 ${userId}: ${notifications.length} notifications`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors de la recherche des utilisateurs:', error);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🔔 Script de récupération des notifications utilisateur\n');
    console.log('Usage:');
    console.log('  node get-user-notifications.cjs <userId>     - Récupérer les notifications d\'un utilisateur');
    console.log('  node get-user-notifications.cjs --list       - Lister tous les utilisateurs avec des notifications');
    console.log('');
    console.log('Exemple:');
    console.log('  node get-user-notifications.cjs YWu55QljgEM4J350kB7aKGf03TS2');
    console.log('');
    return;
  }

  if (args[0] === '--list') {
    await listAllUsersWithNotifications();
  } else {
    const userId = args[0];
    await getUserNotifications(userId);
  }
}

// Exécuter le script
main().catch(console.error); 