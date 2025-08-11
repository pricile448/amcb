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

async function createRealNotifications() {
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2'; // Votre UID
  
  console.log('🔔 Création de notifications réelles dans Firestore...');
  
  const notifications = [
    {
      userId: userId,
      title: 'Transaction effectuée',
      message: 'Votre virement de 150€ vers Jean Dupont a été effectué avec succès.',
      type: 'success',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      read: false,
      priority: 'medium',
      category: 'transaction'
    },
    {
      userId: userId,
      title: 'Nouvelle carte débitée',
      message: 'Votre carte a été débitée de 25,50€ pour l\'achat en ligne.',
      type: 'info',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
      read: false,
      priority: 'low',
      category: 'transaction'
    },
    {
      userId: userId,
      title: 'Maintenance prévue',
      message: 'Une maintenance est prévue ce soir de 23h à 2h du matin. Certains services pourront être temporairement indisponibles.',
      type: 'warning',
      date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4h ago
      read: true,
      priority: 'medium',
      category: 'general'
    },
    {
      userId: userId,
      title: 'Sécurité renforcée',
      message: 'Nous avons détecté une connexion depuis un nouvel appareil. Veuillez vérifier que c\'est bien vous.',
      type: 'warning',
      date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6h ago
      read: false,
      priority: 'high',
      category: 'security'
    },
    {
      userId: userId,
      title: 'Offre spéciale',
      message: 'Profitez de notre offre spéciale : 0% de frais sur tous vos virements internationaux ce mois-ci.',
      type: 'feature',
      date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8h ago
      read: false,
      priority: 'low',
      category: 'feature'
    },
    {
      userId: userId,
      title: 'Document validé',
      message: 'Votre justificatif de domicile a été validé. Votre compte est maintenant entièrement fonctionnel.',
      type: 'success',
      date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12h ago
      read: false,
      priority: 'medium',
      category: 'general'
    },
    {
      userId: userId,
      title: 'Rappel de paiement',
      message: 'N\'oubliez pas que votre prélèvement automatique de 150€ sera effectué demain.',
      type: 'info',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 24h ago
      read: false,
      priority: 'medium',
      category: 'transaction'
    },
    {
      userId: userId,
      title: 'Nouvelle interface',
      message: 'Découvrez notre nouvelle interface utilisateur plus intuitive et moderne.',
      type: 'feature',
      date: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36h ago
      read: true,
      priority: 'low',
      category: 'feature'
    },
    {
      userId: userId,
      title: 'Support technique',
      message: 'Notre équipe technique a résolu le problème que vous avez signalé. Merci de votre patience.',
      type: 'success',
      date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 48h ago
      read: false,
      priority: 'medium',
      category: 'support'
    },
    {
      userId: userId,
      title: 'Limite de sécurité',
      message: 'Vous avez atteint 80% de votre limite de retrait quotidienne.',
      type: 'warning',
      date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 72h ago
      read: false,
      priority: 'high',
      category: 'security'
    }
  ];

  try {
    const batch = db.batch();
    
    for (const notification of notifications) {
      const docRef = db.collection('notifications').doc();
      batch.set(docRef, {
        ...notification,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    await batch.commit();
    
    console.log('✅ Notifications réelles créées avec succès !');
    console.log(`📝 ${notifications.length} notifications ajoutées dans Firestore`);
    console.log('🎯 Maintenant, ouvrez votre application pour voir les notifications réelles !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des notifications:', error);
  } finally {
    process.exit(0);
  }
}

createRealNotifications(); 