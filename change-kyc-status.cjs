const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function changeKycStatus() {
  try {
    console.log('🔄 Changement du statut KYC...\n');
    
    // Demander l'ID utilisateur
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const userId = await new Promise((resolve) => {
      rl.question('Entrez l\'ID utilisateur: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!userId) {
      console.log('❌ ID utilisateur requis');
      rl.close();
      return;
    }
    
    // Vérifier que l'utilisateur existe
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      rl.close();
      return;
    }
    
    const userData = userDoc.data();
    console.log(`\n🔍 Statut actuel de l'utilisateur ${userData.email}:`);
    console.log(`- kycStatus: ${userData.kycStatus || 'NON DÉFINI'}`);
    console.log(`- verificationStatus: ${userData.verificationStatus || 'NON DÉFINI'}`);
    
    // Demander le nouveau statut
    const newStatus = await new Promise((resolve) => {
      rl.question('\nChoisissez le nouveau statut (unverified/pending/verified): ', (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase());
      });
    });
    
    if (!['unverified', 'pending', 'verified'].includes(newStatus)) {
      console.log('❌ Statut invalide. Utilisez: unverified, pending, ou verified');
      return;
    }
    
    // Mettre à jour le statut
    console.log(`\n🔄 Mise à jour du statut vers: ${newStatus}`);
    
    await db.collection('users').doc(userId).update({
      kycStatus: newStatus,
      verificationStatus: newStatus, // Synchroniser les deux champs
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Statut KYC mis à jour avec succès!');
    
    // Vérifier la mise à jour
    const updatedDoc = await db.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();
    
    console.log('\n🔍 Vérification de la mise à jour:');
    console.log(`- kycStatus: ${updatedData.kycStatus}`);
    console.log(`- verificationStatus: ${updatedData.verificationStatus}`);
    
    // Prévisions pour l'interface
    console.log('\n💡 Impact sur l\'interface:');
    if (newStatus === 'unverified' || newStatus === 'pending') {
      console.log('✅ Les pages Cartes, Facturation, Historique afficheront "Vérification d\'identité requise"');
      console.log('✅ Les pages IBAN et Virements afficheront "Vérification d\'identité requise"');
    } else {
      console.log('✅ L\'utilisateur aura accès à toutes les pages');
    }
    
    console.log('\n🔄 Pour tester, rechargez l\'application dans le navigateur');
    
  } catch (error) {
    console.error('❌ Erreur lors du changement de statut:', error);
  } finally {
    process.exit(0);
  }
}

changeKycStatus(); 