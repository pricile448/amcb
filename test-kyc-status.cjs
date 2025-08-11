const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testKycStatus() {
  try {
    console.log('🔍 Test du statut KYC...\n');
    
    // Demander l'ID utilisateur
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const userId = await new Promise((resolve) => {
      rl.question('Entrez l\'ID utilisateur à tester: ', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
    
    if (!userId) {
      console.log('❌ ID utilisateur requis');
      return;
    }
    
    console.log(`\n🔍 Vérification du statut KYC pour l'utilisateur: ${userId}\n`);
    
    // Récupérer les données utilisateur depuis Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé dans Firestore');
      return;
    }
    
    const userData = userDoc.data();
    console.log('📊 Données utilisateur complètes:');
    console.log(JSON.stringify(userData, null, 2));
    
    // Vérifier les champs de statut
    console.log('\n🔍 Analyse des champs de statut:');
    console.log(`- kycStatus: ${userData.kycStatus || 'NON DÉFINI'}`);
    console.log(`- verificationStatus: ${userData.verificationStatus || 'NON DÉFINI'}`);
    console.log(`- role: ${userData.role || 'NON DÉFINI'}`);
    
    // Déterminer le statut effectif
    const effectiveStatus = userData.kycStatus || userData.verificationStatus || 'unverified';
    console.log(`\n✅ Statut effectif: ${effectiveStatus}`);
    
    // Vérifier si l'utilisateur devrait voir la vérification
    const shouldShowVerification = effectiveStatus === 'unverified' || effectiveStatus === 'pending';
    console.log(`\n🔒 Doit afficher la vérification: ${shouldShowVerification ? 'OUI' : 'NON'}`);
    
    if (shouldShowVerification) {
      console.log('⚠️  L\'utilisateur devrait voir "Vérification d\'identité requise" sur les pages Cartes, Facturation, Historique');
    } else {
      console.log('✅ L\'utilisateur peut accéder à toutes les pages');
    }
    
    // Vérifier le localStorage simulé
    console.log('\n🔍 Simulation du localStorage:');
    const simulatedUser = {
      id: userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      verificationStatus: effectiveStatus,
      role: userData.role || 'user'
    };
    
    console.log('localStorage.getItem("user"):', JSON.stringify(simulatedUser, null, 2));
    
    // Test de la logique du hook useKycSync
    console.log('\n🔍 Test de la logique useKycSync:');
    const isUnverified = effectiveStatus !== 'verified';
    console.log(`- userStatus: ${effectiveStatus}`);
    console.log(`- isUnverified: ${isUnverified}`);
    console.log(`- isLoading: false (après synchronisation)`);
    
    if (isUnverified) {
      console.log('✅ Le hook devrait retourner isUnverified: true');
      console.log('✅ Les pages devraient afficher VerificationState');
    } else {
      console.log('✅ Le hook devrait retourner isUnverified: false');
      console.log('✅ Les pages devraient afficher le contenu normal');
    }
    
    // Recommandations
    console.log('\n💡 Recommandations:');
    if (effectiveStatus === 'unverified' || effectiveStatus === 'pending') {
      console.log('1. ✅ Le statut est correct pour afficher la vérification');
      console.log('2. 🔍 Vérifiez que le hook useKycSync est bien appelé dans les pages');
      console.log('3. 🔍 Vérifiez que le composant VerificationState s\'affiche correctement');
    } else {
      console.log('1. ⚠️  Le statut est "verified", l\'utilisateur ne devrait pas voir la vérification');
      console.log('2. 🔍 Si vous voulez tester la vérification, changez le statut vers "unverified" ou "pending"');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    process.exit(0);
  }
}

testKycStatus(); 