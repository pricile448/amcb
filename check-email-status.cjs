// 🔍 Script pour vérifier le statut emailVerified
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function checkEmailStatus() {
  console.log('🔍 VÉRIFICATION DU STATUT EMAIL');
  
  try {
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      console.log(`\n👤 Utilisateur: ${userData.email || 'Email non défini'}`);
      console.log(`   - ID: ${doc.id}`);
      console.log(`   - emailVerified: ${userData.emailVerified || false}`);
      console.log(`   - emailVerifiedAt: ${userData.emailVerifiedAt || 'Non défini'}`);
      console.log(`   - kycStatus: ${userData.kycStatus || 'Non défini'}`);
      console.log(`   - Tous les champs:`, Object.keys(userData));
    });
    
    // Vérifier aussi la collection emailVerificationCodes
    console.log('\n📧 VÉRIFICATION DES CODES DE VÉRIFICATION');
    const codesSnapshot = await db.collection('emailVerificationCodes').get();
    
    if (codesSnapshot.empty) {
      console.log('❌ Aucun code de vérification trouvé');
    } else {
      codesSnapshot.forEach(doc => {
        const codeData = doc.data();
        console.log(`\n🔑 Code pour utilisateur: ${doc.id}`);
        console.log(`   - Email: ${codeData.email}`);
        console.log(`   - Expire: ${codeData.expires?.toDate() || 'Non défini'}`);
        console.log(`   - Tentatives: ${codeData.attempts || 0}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkEmailStatus(); 