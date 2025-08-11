const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

console.log('🔍 Test direct Firestore - Récupération des données utilisateur\n');

// Charger la configuration Firebase
const firebaseConfigPath = path.join(__dirname, 'firebase-config.cjs');
if (!fs.existsSync(firebaseConfigPath)) {
  console.error('❌ firebase-config.cjs non trouvé');
  process.exit(1);
}

try {
  const firebaseConfig = require(firebaseConfigPath);
  
  // Initialiser Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('✅ Firebase initialisé');
  console.log('📋 Configuration:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  });
  
  console.log('\n🔍 Pour tester la récupération des données :');
  console.log('1. Allez sur Firebase Console');
  console.log('2. Trouvez l\'ID de votre utilisateur dans la collection "users"');
  console.log('3. Exécutez cette commande avec l\'ID :');
  console.log('   node test-firestore-direct.cjs USER_ID_HERE');
  
  // Si un ID utilisateur est fourni en argument
  const userId = process.argv[2];
  if (userId) {
    console.log(`\n🔍 Test avec l'ID utilisateur: ${userId}`);
    
    getDoc(doc(db, 'users', userId))
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log('✅ Document utilisateur trouvé:');
          console.log('📋 Données complètes:', JSON.stringify(userData, null, 2));
          
          console.log('\n🎯 Statuts KYC:');
          console.log('- verificationStatus:', userData.verificationStatus || 'non défini');
          console.log('- kycStatus:', userData.kycStatus || 'non défini');
          console.log('- status:', userData.status || 'non défini');
          
        } else {
          console.log('❌ Document utilisateur non trouvé');
        }
      })
      .catch((error) => {
        console.error('❌ Erreur lors de la récupération:', error);
      });
  } else {
    console.log('\n💡 Exemple d\'utilisation:');
    console.log('   node test-firestore-direct.cjs abc123def456');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation:', error);
} 