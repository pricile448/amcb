const http = require('http');

function createRealNotifications() {
  console.log('🔔 Création de notifications réelles via l\'API...');

  const notifications = [
    {
      userId: 'YWu55QljgEM4J350kB7aKGf03TS2',
      title: 'Transaction effectuée',
      message: 'Votre virement de 150€ vers Jean Dupont a été effectué avec succès.',
      type: 'success',
      date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      priority: 'medium',
      category: 'transaction'
    },
    {
      userId: 'YWu55QljgEM4J350kB7aKGf03TS2',
      title: 'Nouvelle carte débitée',
      message: 'Votre carte a été débitée de 25,50€ pour l\'achat en ligne.',
      type: 'info',
      date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: false,
      priority: 'low',
      category: 'transaction'
    },
    {
      userId: 'YWu55QljgEM4J350kB7aKGf03TS2',
      title: 'Maintenance prévue',
      message: 'Une maintenance est prévue ce soir de 23h à 2h du matin.',
      type: 'warning',
      date: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      read: true,
      priority: 'medium',
      category: 'general'
    },
    {
      userId: 'YWu55QljgEM4J350kB7aKGf03TS2',
      title: 'Sécurité renforcée',
      message: 'Nous avons détecté une connexion depuis un nouvel appareil.',
      type: 'warning',
      date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      read: false,
      priority: 'high',
      category: 'security'
    },
    {
      userId: 'YWu55QljgEM4J350kB7aKGf03TS2',
      title: 'Offre spéciale',
      message: 'Profitez de notre offre : 0% de frais sur les virements internationaux.',
      type: 'feature',
      date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      read: false,
      priority: 'low',
      category: 'feature'
    }
  ];

  let createdCount = 0;

  notifications.forEach((notification, index) => {
    const postData = JSON.stringify(notification);

    const options = {
      hostname: 'localhost',
      port: 5173,
      path: '/api/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        createdCount++;
        console.log(`✅ Notification ${index + 1} créée: ${notification.title}`);
        
        if (createdCount === notifications.length) {
          console.log('\n🎉 Toutes les notifications ont été créées !');
          console.log('🎯 Maintenant, ouvrez les notifications dans votre application pour tester le scroll !');
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Erreur création notification ${index + 1}:`, error.message);
    });

    req.write(postData);
    req.end();
  });
}

createRealNotifications(); 