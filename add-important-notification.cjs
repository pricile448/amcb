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

// Interface pour lire les entrées utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function addImportantNotification() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🔔 AJOUT DE NOTIFICATION IMPORTANTE');
  console.log('=' .repeat(40));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. Demander les détails de la notification
    console.log('📝 Saisie des détails de la notification:\n');
    
    const title = await question('Titre de la notification: ');
    const message = await question('Message de la notification: ');
    
    console.log('\nTypes disponibles: success, info, warning, error, feature');
    const type = await question('Type (success/info/warning/error/feature): ');
    
    console.log('\nPriorités disponibles: low, medium, high');
    const priority = await question('Priorité (low/medium/high): ');
    
    console.log('\nCatégories disponibles: general, security, transaction, chat, feature, maintenance');
    const category = await question('Catégorie: ');
    
    const readStatus = await question('Marquer comme lue ? (oui/non): ');
    const read = readStatus.toLowerCase() === 'oui';
    
    // 2. Créer la notification
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: userId,
      title: title,
      message: message,
      type: type,
      date: admin.firestore.Timestamp.fromDate(new Date()),
      read: read,
      priority: priority,
      category: category
    };
    
    // 3. Récupérer les notifications existantes
    console.log('\n📋 Récupération des notifications existantes...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      rl.close();
      return;
    }

    const userData = userDoc.data();
    const currentNotifications = userData.notifications || [];
    
    // 4. Ajouter la nouvelle notification
    const updatedNotifications = [notification, ...currentNotifications];
    
    // 5. Mettre à jour Firestore
    console.log('\n💾 Mise à jour de Firestore...');
    await userRef.update({
      notifications: updatedNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // 6. Afficher le résumé
    console.log('\n✅ Notification ajoutée avec succès !');
    console.log('\n📋 Détails de la notification:');
    console.log(`   Titre: ${notification.title}`);
    console.log(`   Message: ${notification.message}`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Priorité: ${notification.priority}`);
    console.log(`   Catégorie: ${notification.category}`);
    console.log(`   Lu: ${notification.read ? 'Oui' : 'Non'}`);
    console.log(`   ID: ${notification.id}`);
    console.log(`   Date: ${notification.date.toDate().toLocaleString('fr-FR')}`);
    
    console.log(`\n📊 Total notifications: ${updatedNotifications.length}`);
    console.log('\n💡 La notification apparaîtra dans l\'interface lors du prochain rechargement de page.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    rl.close();
  }
}

// Exécuter l'ajout
addImportantNotification().catch(console.error); 