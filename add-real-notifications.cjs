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

async function addRealNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  console.log('🏦 AJOUT DE NOTIFICATIONS RÉELLES');
  console.log('=' .repeat(40));
  console.log(`👤 Utilisateur: ${userId}\n`);

  try {
    // 1. Récupérer les notifications actuelles
    console.log('📋 1. Récupération des notifications actuelles...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }

    const userData = userDoc.data();
    const currentNotifications = userData.notifications || [];
    
    console.log(`📊 Notifications actuelles: ${currentNotifications.length}`);
    
    // 2. Filtrer pour garder seulement les vraies notifications
    const realNotifications = currentNotifications.filter(notif => {
      const isTest = notif.title.includes('Test') || 
                    notif.title.includes('test') || 
                    notif.id.includes('test') || 
                    notif.id.includes('frontend_test') ||
                    notif.message.includes('test') ||
                    notif.message.includes('Test');
      return !isTest;
    });
    
    console.log(`✅ Notifications réelles conservées: ${realNotifications.length}`);
    
    // 3. Ajouter des notifications réelles de banque
    console.log('\n📝 2. Ajout de notifications réelles...');
    
    const realBankingNotifications = [
      {
        id: `notif_${Date.now()}_1`,
        userId: userId,
        title: 'Transaction effectuée',
        message: 'Votre virement de 150€ vers Jean Dupont a été effectué avec succès.',
        type: 'success',
        date: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 30)), // 30 min ago
        read: false,
        priority: 'medium',
        category: 'transaction'
      },
      {
        id: `notif_${Date.now()}_2`,
        userId: userId,
        title: 'Maintenance prévue',
        message: 'Une maintenance est prévue ce soir de 23h à 2h du matin. Certains services pourront être temporairement indisponibles.',
        type: 'warning',
        date: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 2)), // 2h ago
        read: false,
        priority: 'high',
        category: 'maintenance'
      },
      {
        id: `notif_${Date.now()}_3`,
        userId: userId,
        title: 'Nouvelle fonctionnalité',
        message: 'Vous pouvez maintenant télécharger vos relevés bancaires en PDF directement depuis votre espace client.',
        type: 'feature',
        date: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24)), // 1 day ago
        read: true,
        priority: 'low',
        category: 'feature'
      },
      {
        id: `notif_${Date.now()}_4`,
        userId: userId,
        title: 'Sécurité renforcée',
        message: 'Votre compte est maintenant protégé par l\'authentification à deux facteurs. Merci de configurer votre application d\'authentification.',
        type: 'info',
        date: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)), // 2 days ago
        read: true,
        priority: 'high',
        category: 'security'
      },
      {
        id: `notif_${Date.now()}_5`,
        userId: userId,
        title: 'Carte débitée',
        message: 'Paiement de 45,80€ effectué chez Carrefour. Votre solde actuel est de 1.234,56€.',
        type: 'info',
        date: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1000 * 60 * 60 * 6)), // 6h ago
        read: false,
        priority: 'medium',
        category: 'transaction'
      }
    ];
    
    // 4. Combiner les notifications existantes avec les nouvelles
    const allNotifications = [...realNotifications, ...realBankingNotifications];
    
    // 5. Mettre à jour Firestore
    console.log('\n💾 3. Mise à jour de Firestore...');
    await userRef.update({
      notifications: allNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ ${realBankingNotifications.length} nouvelles notifications ajoutées`);
    console.log(`📊 Total: ${allNotifications.length} notifications`);
    
    // 6. Afficher le résumé
    console.log('\n📋 4. Résumé des notifications:');
    allNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title}`);
      console.log(`      Type: ${notif.type} | Priorité: ${notif.priority} | Lu: ${notif.read ? 'Oui' : 'Non'}`);
      console.log('');
    });
    
    console.log('\n🎉 Notifications réelles ajoutées avec succès !');
    console.log('💡 Les utilisateurs peuvent maintenant voir des notifications de banque réalistes.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Exécuter l'ajout
addRealNotifications().catch(console.error); 