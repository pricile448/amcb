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

async function cleanNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🧹 Nettoyage et vérification des notifications...\n');
  
  try {
    // Récupérer toutes les notifications de l'utilisateur
    const notificationsRef = db.collection('notifications');
    const snapshot = await notificationsRef.where('userId', '==', userId).get();
    
    console.log(`📊 ${snapshot.size} notifications trouvées pour l'utilisateur ${userId}\n`);
    
    if (snapshot.empty) {
      console.log('📭 Aucune notification à nettoyer');
      return;
    }
    
    // Afficher les notifications existantes
    console.log('📋 Notifications existantes:');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}`);
      console.log(`  Titre: ${data.title}`);
      console.log(`  Type: ${data.type}`);
      console.log(`  Lu: ${data.read}`);
      console.log(`  Date: ${data.date}`);
      console.log('');
    });
    
    // Demander confirmation pour la suppression
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
      console.log('\n🗑️ Suppression des notifications...');
      
      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`✅ ${snapshot.size} notifications supprimées avec succès`);
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

async function listNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('📋 Liste des notifications dans Firestore...\n');
  
  try {
    const notificationsRef = db.collection('notifications');
    const snapshot = await notificationsRef.where('userId', '==', userId).get();
    
    console.log(`📊 ${snapshot.size} notifications trouvées pour l'utilisateur ${userId}\n`);
    
    if (snapshot.empty) {
      console.log('📭 Aucune notification trouvée');
      return;
    }
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Titre: ${data.title}`);
      console.log(`   Message: ${data.message?.substring(0, 50)}...`);
      console.log(`   Type: ${data.type} | Priorité: ${data.priority} | Lu: ${data.read}`);
      console.log(`   Date: ${data.date}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error);
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
  
  console.log('🔔 Gestionnaire de Notifications Firestore\n');
  console.log('1. Lister les notifications existantes');
  console.log('2. Nettoyer toutes les notifications');
  console.log('3. Quitter');
  
  const choice = await question('\nChoisissez une option (1-3): ');
  
  switch (choice) {
    case '1':
      rl.close();
      await listNotifications();
      break;
    case '2':
      rl.close();
      await cleanNotifications();
      break;
    case '3':
      console.log('👋 Au revoir !');
      rl.close();
      break;
    default:
      console.log('❌ Option invalide');
      rl.close();
  }
}

main(); 