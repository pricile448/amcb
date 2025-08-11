// ✅ Script pour marquer TOUS les utilisateurs existants comme emailVerified
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function markAllUsersVerified() {
  console.log('✅ MARQUAGE DE TOUS LES UTILISATEURS COMME EMAIL VÉRIFIÉ');
  
  try {
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }
    
    console.log(`📧 Traitement de ${usersSnapshot.size} utilisateurs...`);
    
    const batch = db.batch();
    let count = 0;
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      const userId = doc.id;
      
      // Mettre à jour le statut email pour tous les utilisateurs existants
      const userRef = db.collection('users').doc(userId);
      batch.update(userRef, {
        emailVerified: true,
        emailVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`✅ ${userData.email || 'Email non défini'} (ID: ${userId}) - Marqué comme vérifié`);
      count++;
    });
    
    // Exécuter le batch
    await batch.commit();
    
    console.log(`\n🎉 SUCCÈS ! ${count} utilisateurs marqués comme emailVerified: true`);
    console.log('🔄 Tous les banners de vérification email devraient disparaître après rechargement.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

markAllUsersVerified(); 