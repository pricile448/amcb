const http = require('http');

const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';

console.log('🔍 Test de diagnostic des notifications...\n');

// Test 1: Vérifier si le serveur répond
function testServerConnection() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5173,
      path: '/api/notifications/' + userId,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📡 Statut de la réponse: ${res.statusCode}`);
        console.log(`📋 Headers:`, res.headers);
        
        if (res.statusCode === 200) {
          try {
            const notifications = JSON.parse(data);
            console.log(`✅ ${notifications.length} notifications récupérées`);
            if (notifications.length > 0) {
              console.log('📝 Première notification:', notifications[0]);
            }
          } catch (error) {
            console.log('❌ Erreur parsing JSON:', error.message);
            console.log('📄 Données brutes:', data);
          }
        } else {
          console.log('❌ Erreur serveur:', res.statusCode);
          console.log('📄 Réponse:', data);
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Erreur de connexion:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout de la requête');
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

// Test 2: Vérifier les données Firestore directement
async function testFirestoreData() {
  try {
    console.log('\n🔥 Test direct Firestore...');
    
    const admin = require('firebase-admin');
    const serviceAccount = require('./firebase-config.cjs');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount.serviceAccount),
        databaseURL: "https://amcbunq-default-rtdb.europe-west1.firebasedatabase.app"
      });
    }
    
    const db = admin.firestore();
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé dans Firestore');
      return;
    }
    
    const userData = userDoc.data();
    console.log('✅ Utilisateur trouvé dans Firestore');
    console.log('📊 Champs disponibles:', Object.keys(userData));
    
    const notifications = userData.notifications || [];
    console.log(`📋 Notifications dans Firestore: ${notifications.length}`);
    
    if (notifications.length > 0) {
      console.log('📝 Première notification Firestore:', notifications[0]);
    }
    
  } catch (error) {
    console.error('❌ Erreur Firestore:', error.message);
  }
}

// Exécuter les tests
async function runTests() {
  try {
    await testServerConnection();
    await testFirestoreData();
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  } finally {
    process.exit(0);
  }
}

runTests(); 