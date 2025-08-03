const http = require('http');

async function testServerConnection() {
  console.log('🔍 TEST DE CONNEXION AU SERVEUR');
  console.log('=' .repeat(40));

  // Test 1: Status endpoint
  console.log('\n📡 Test 1: Endpoint /api/status');
  try {
    const statusOptions = {
      hostname: 'localhost',
      port: 5173,
      path: '/api/status',
      method: 'GET'
    };

    const statusResponse = await makeHttpRequest(statusOptions);
    console.log(`   Status: ${statusResponse.status}`);
    console.log(`   Réponse:`, statusResponse.data);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  // Test 2: Test endpoint
  console.log('\n📡 Test 2: Endpoint /api/test');
  try {
    const testOptions = {
      hostname: 'localhost',
      port: 5173,
      path: '/api/test',
      method: 'GET'
    };

    const testResponse = await makeHttpRequest(testOptions);
    console.log(`   Status: ${testResponse.status}`);
    console.log(`   Réponse:`, testResponse.data);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  // Test 3: Notifications endpoint (GET)
  console.log('\n📡 Test 3: Endpoint /api/notifications/:userId');
  try {
    const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
    const notificationsOptions = {
      hostname: 'localhost',
      port: 5173,
      path: `/api/notifications/${userId}`,
      method: 'GET'
    };

    const notificationsResponse = await makeHttpRequest(notificationsOptions);
    console.log(`   Status: ${notificationsResponse.status}`);
    console.log(`   Réponse:`, notificationsResponse.data);
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }
}

function makeHttpRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

testServerConnection().catch(console.error); 