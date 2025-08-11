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

async function addUserNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🔔 Ajout de notifications dans le document utilisateur...\n');
  
  try {
    // Récupérer le document utilisateur
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    const userData = userDoc.data();
    const currentNotifications = userData.notifications || [];
    
    console.log(`📊 ${currentNotifications.length} notifications existantes trouvées`);
    
    // Créer de nouvelles notifications
    const newNotifications = [
      {
        id: `notif_${Date.now()}_1`,
        title: 'Bienvenue sur AmCbunq',
        message: 'Votre compte a été créé avec succès. Commencez par vérifier votre identité pour accéder à toutes les fonctionnalités.',
        type: 'info',
        date: new Date().toISOString(),
        read: false,
        priority: 'high',
        category: 'general',
        createdAt: new Date().toISOString()
      },
      {
        id: `notif_${Date.now()}_2`,
        title: 'Vérification d\'identité requise',
        message: 'Pour accéder à toutes les fonctionnalités, veuillez compléter votre vérification d\'identité.',
        type: 'warning',
        date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        read: false,
        priority: 'high',
        category: 'security',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: `notif_${Date.now()}_3`,
        title: 'Nouvelle fonctionnalité disponible',
        message: 'Découvrez notre nouveau système de notifications en temps réel !',
        type: 'feature',
        date: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1h ago
        read: false,
        priority: 'medium',
        category: 'feature',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      {
        id: `notif_${Date.now()}_4`,
        title: 'Transaction effectuée',
        message: 'Votre virement de 150€ vers Jean Dupont a été effectué avec succès.',
        type: 'success',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
        read: true,
        priority: 'medium',
        category: 'transaction',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: `notif_${Date.now()}_5`,
        title: 'Maintenance prévue',
        message: 'Une maintenance est prévue ce soir de 23h à 2h du matin. Certains services pourront être temporairement indisponibles.',
        type: 'warning',
        date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
        read: false,
        priority: 'medium',
        category: 'general',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      },
      {
        id: `notif_${Date.now()}_6`,
        title: 'Sécurité renforcée',
        message: 'Nous avons détecté une connexion depuis un nouvel appareil. Veuillez vérifier que c\'est bien vous.',
        type: 'warning',
        date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h ago
        read: false,
        priority: 'high',
        category: 'security',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
      },
      {
        id: `notif_${Date.now()}_7`,
        title: 'Offre spéciale',
        message: 'Profitez de notre offre spéciale : 0% de frais sur tous vos virements internationaux ce mois-ci.',
        type: 'feature',
        date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8h ago
        read: false,
        priority: 'low',
        category: 'feature',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
      },
      {
        id: `notif_${Date.now()}_8`,
        title: 'Document validé',
        message: 'Votre justificatif de domicile a été validé. Votre compte est maintenant entièrement fonctionnel.',
        type: 'success',
        date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12h ago
        read: true,
        priority: 'medium',
        category: 'general',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      }
    ];
    
    // Ajouter les nouvelles notifications
    const updatedNotifications = [...currentNotifications, ...newNotifications];
    
    // Mettre à jour le document utilisateur
    await userRef.update({
      notifications: updatedNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ ${newNotifications.length} notifications ajoutées au document utilisateur`);
    console.log(`📊 Total: ${updatedNotifications.length} notifications`);
    console.log('\n🎯 Maintenant, ouvrez votre application pour voir les notifications !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des notifications:', error);
  } finally {
    process.exit(0);
  }
}

async function listUserNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('📋 Liste des notifications dans le document utilisateur...\n');
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    console.log(`📊 ${notifications.length} notifications trouvées pour l'utilisateur ${userId}\n`);
    
    if (notifications.length === 0) {
      console.log('📭 Aucune notification trouvée');
      return;
    }
    
    notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ID: ${notif.id}`);
      console.log(`   Titre: ${notif.title}`);
      console.log(`   Message: ${notif.message?.substring(0, 50)}...`);
      console.log(`   Type: ${notif.type} | Priorité: ${notif.priority} | Lu: ${notif.read}`);
      console.log(`   Date: ${notif.date}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error);
  } finally {
    process.exit(0);
  }
}

async function clearUserNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🧹 Nettoyage des notifications du document utilisateur...\n');
  
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    console.log(`📊 ${notifications.length} notifications trouvées`);
    
    if (notifications.length === 0) {
      console.log('📭 Aucune notification à supprimer');
      return;
    }
    
    // Demander confirmation
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const question = (prompt) => {
      return new Promise((resolve) => {
        rl.question(prompt, resolve);
      });
    };
    
    const choice = await question('Voulez-vous supprimer toutes les notifications ? (o/n): ');
    
    if (choice.toLowerCase() === 'o') {
      // Supprimer toutes les notifications
      await userRef.update({
        notifications: [],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ ${notifications.length} notifications supprimées`);
    } else {
      console.log('❌ Suppression annulée');
    }
    
    rl.close();
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    process.exit(0);
  }
}

// Menu principal
async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };
  
  console.log('🔔 Gestionnaire de Notifications Utilisateur\n');
  console.log('1. Ajouter des notifications au document utilisateur');
  console.log('2. Lister les notifications du document utilisateur');
  console.log('3. Nettoyer toutes les notifications');
  console.log('4. Quitter');
  
  const choice = await question('\nChoisissez une option (1-4): ');
  
  switch (choice) {
    case '1':
      rl.close();
      await addUserNotifications();
      break;
    case '2':
      rl.close();
      await listUserNotifications();
      break;
    case '3':
      rl.close();
      await clearUserNotifications();
      break;
    case '4':
      console.log('👋 Au revoir !');
      rl.close();
      break;
    default:
      console.log('❌ Option invalide');
      rl.close();
  }
}

main(); 