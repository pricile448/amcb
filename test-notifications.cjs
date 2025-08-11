const http = require('http');

function createTestNotifications() {
  console.log('🧪 Création de notifications de test...');
  
  const postData = JSON.stringify({
    userId: 'YWu55QljgEM4J350kB7aKGf03TS2'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: '/api/test/create-notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`📡 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Réponse du serveur:');
        console.log('Success:', jsonData.success);
        console.log('Message:', jsonData.message);
        console.log('Nombre de notifications créées:', jsonData.notifications ? jsonData.notifications.length : 0);
        
        if (jsonData.notifications) {
          console.log('\n📝 Notifications créées:');
          jsonData.notifications.forEach((notif, index) => {
            console.log(`${index + 1}. ${notif.title} (${notif.type})`);
          });
        }
        
      } catch (error) {
        console.log('📄 Réponse brute:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Erreur:', error);
  });
  
  req.write(postData);
  req.end();
}

createTestNotifications(); 