const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');
const readline = require('readline');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.serviceAccount),
    databaseURL: "https://amcbunq-default-rtdb.europe-west1.firebasedatabase.app"
  });
}

const db = admin.firestore();

// Interface readline pour l'interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Fonction pour afficher un menu
function displayMenu() {
  console.log('\n🔔 MENU DES NOTIFICATIONS');
  console.log('=' .repeat(40));
  console.log('1. Ajouter une notification personnalisée');
  console.log('2. Ajouter des notifications de test rapides');
  console.log('3. Voir mes notifications actuelles');
  console.log('4. Supprimer toutes mes notifications');
  console.log('5. Quitter');
  console.log('=' .repeat(40));
}

// Fonction pour ajouter une notification personnalisée
async function addCustomNotification(userId) {
  console.log('\n📝 AJOUT D\'UNE NOTIFICATION PERSONNALISÉE');
  console.log('=' .repeat(50));

  try {
    const title = await askQuestion('📋 Titre de la notification: ');
    const message = await askQuestion('📝 Message de la notification: ');
    
    console.log('\n🎯 Type de notification:');
    console.log('1. info (bleu)');
    console.log('2. success (vert)');
    console.log('3. warning (orange)');
    console.log('4. error (rouge)');
    console.log('5. feature (violet)');
    const typeChoice = await askQuestion('Choisissez le type (1-5): ');
    
    const types = ['info', 'success', 'warning', 'error', 'feature'];
    const type = types[parseInt(typeChoice) - 1] || 'info';

    console.log('\n📊 Priorité:');
    console.log('1. Basse (🟢)');
    console.log('2. Moyenne (🟡)');
    console.log('3. Haute (🔴)');
    const priorityChoice = await askQuestion('Choisissez la priorité (1-3): ');
    
    const priorities = ['low', 'medium', 'high'];
    const priority = priorities[parseInt(priorityChoice) - 1] || 'medium';

    console.log('\n📂 Catégorie:');
    console.log('1. Général');
    console.log('2. Sécurité');
    console.log('3. Transaction');
    console.log('4. Chat');
    console.log('5. Fonctionnalité');
    const categoryChoice = await askQuestion('Choisissez la catégorie (1-5): ');
    
    const categories = ['general', 'security', 'transaction', 'chat', 'feature'];
    const category = categories[parseInt(categoryChoice) - 1] || 'general';

    const readChoice = await askQuestion('Marquer comme lue ? (o/n): ');
    const read = readChoice.toLowerCase() === 'o';

    // Créer la notification
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      title: title,
      message: message,
      type: type,
      date: new Date().toISOString(),
      read: read,
      priority: priority,
      category: category,
      createdAt: new Date().toISOString()
    };

    // Ajouter à Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const currentNotifications = userData.notifications || [];
    const updatedNotifications = [...currentNotifications, notification];

    await userRef.update({
      notifications: updatedNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('\n✅ Notification ajoutée avec succès !');
    console.log(`📋 Titre: ${notification.title}`);
    console.log(`🎯 Type: ${notification.type}`);
    console.log(`📊 Priorité: ${notification.priority}`);
    console.log(`📂 Catégorie: ${notification.category}`);

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout de la notification:', error);
  }
}

// Fonction pour ajouter des notifications de test rapides
async function addQuickTestNotifications(userId) {
  console.log('\n🚀 AJOUT DE NOTIFICATIONS DE TEST RAPIDES');
  console.log('=' .repeat(50));

  try {
    const testNotifications = [
      {
        title: 'Bienvenue sur AmCbunq',
        message: 'Votre compte a été créé avec succès. Commencez par vérifier votre identité pour accéder à toutes les fonctionnalités.',
        type: 'info',
        priority: 'high',
        category: 'general',
        read: false
      },
      {
        title: 'Vérification d\'identité requise',
        message: 'Pour accéder à toutes les fonctionnalités, veuillez compléter votre vérification d\'identité.',
        type: 'warning',
        priority: 'high',
        category: 'security',
        read: false
      },
      {
        title: 'Nouvelle fonctionnalité disponible',
        message: 'Découvrez notre nouveau système de notifications en temps réel !',
        type: 'feature',
        priority: 'medium',
        category: 'feature',
        read: false
      },
      {
        title: 'Transaction effectuée',
        message: 'Votre virement de 150€ vers Jean Dupont a été effectué avec succès.',
        type: 'success',
        priority: 'medium',
        category: 'transaction',
        read: true
      },
      {
        title: 'Maintenance prévue',
        message: 'Une maintenance est prévue ce soir de 23h à 2h du matin. Certains services pourront être temporairement indisponibles.',
        type: 'warning',
        priority: 'medium',
        category: 'general',
        read: false
      }
    ];

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const currentNotifications = userData.notifications || [];
    
    // Ajouter les notifications de test avec des IDs uniques
    const newNotifications = testNotifications.map((notif, index) => ({
      ...notif,
      id: `notif_${Date.now()}_${index}_${Math.random().toString(36).substring(2)}`,
      date: new Date(Date.now() - index * 1000 * 60 * 30).toISOString(), // Espacer de 30 min
      createdAt: new Date(Date.now() - index * 1000 * 60 * 30).toISOString()
    }));

    const updatedNotifications = [...currentNotifications, ...newNotifications];

    await userRef.update({
      notifications: updatedNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ ${newNotifications.length} notifications de test ajoutées avec succès !`);
    newNotifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title} (${notif.type})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des notifications de test:', error);
  }
}

// Fonction pour voir les notifications actuelles
async function viewCurrentNotifications(userId) {
  console.log('\n📋 MES NOTIFICATIONS ACTUELLES');
  console.log('=' .repeat(50));

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];

    if (notifications.length === 0) {
      console.log('📭 Aucune notification trouvée');
      return;
    }

    // Trier par date décroissante
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

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
      console.log('');
    });

    // Statistiques
    const unreadCount = notifications.filter(n => !n.read).length;
    console.log(`📊 Total: ${notifications.length} | Non lues: ${unreadCount}`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des notifications:', error);
  }
}

// Fonction pour supprimer toutes les notifications
async function clearAllNotifications(userId) {
  console.log('\n🗑️ SUPPRESSION DE TOUTES LES NOTIFICATIONS');
  console.log('=' .repeat(50));

  const confirm = await askQuestion('⚠️ Êtes-vous sûr de vouloir supprimer TOUTES vos notifications ? (oui/non): ');
  
  if (confirm.toLowerCase() !== 'oui') {
    console.log('❌ Suppression annulée');
    return;
  }

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    await userRef.update({
      notifications: [],
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Toutes les notifications ont été supprimées');

  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  }
}

// Fonction principale
async function main() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2'; // Votre ID utilisateur
  
  console.log('🔔 SCRIPT INTERACTIF DE GESTION DES NOTIFICATIONS');
  console.log('=' .repeat(60));
  console.log(`👤 Utilisateur: ${userId}`);

  while (true) {
    displayMenu();
    const choice = await askQuestion('\nChoisissez une option (1-5): ');

    switch (choice) {
      case '1':
        await addCustomNotification(userId);
        break;
      case '2':
        await addQuickTestNotifications(userId);
        break;
      case '3':
        await viewCurrentNotifications(userId);
        break;
      case '4':
        await clearAllNotifications(userId);
        break;
      case '5':
        console.log('\n👋 Au revoir !');
        rl.close();
        return;
      default:
        console.log('❌ Option invalide, veuillez choisir 1-5');
    }

    if (choice !== '5') {
      await askQuestion('\nAppuyez sur Entrée pour continuer...');
    }
  }
}

// Exécuter le script
main().catch(console.error); 