// ✅ Script pour marquer l'email comme vérifié
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function markEmailVerified() {
  console.log('✅ MARQUAGE EMAIL COMME VÉRIFIÉ');
  
  try {
    // Chercher l'utilisateur par email
    const email = 'leatitiarondey@gmail.com'; // Email de l'utilisateur connecté
    const usersSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    
    console.log(`👤 Utilisateur trouvé: ${email} (ID: ${userId})`);
    
    // Mettre à jour le statut email
    await db.collection('users').doc(userId).update({
      emailVerified: true,
      emailVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Email marqué comme vérifié avec succès !');
    console.log('🔄 Le banner devrait disparaître après rechargement de la page.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

markEmailVerified(); 