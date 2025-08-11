// Script pour tester la mise à jour du statut KYC
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, getDoc } = require('firebase/firestore');

// Configuration Firebase (remplacez par votre config)
const firebaseConfig = {
  // Vos clés Firebase ici
  apiKey: "your-api-key",
  authDomain: "amcbunq.firebaseapp.com", 
  projectId: "amcbunq",
  storageBucket: "amcbunq.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testKycStatusUpdate() {
  const userId = "chapelleolivier00@gmail.com"; // Remplacez par l'ID utilisateur réel
  
  try {
    console.log('🔍 Test mise à jour statut KYC...');
    
    // 1. Lire le statut actuel
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    const currentData = userDoc.data();
    console.log('📋 Statut actuel:', currentData.kycStatus);
    
    // 2. Mettre à jour vers 'pending'
    await updateDoc(userRef, {
      kycStatus: 'pending',
      kycStatusDetails: {
        status: 'pending',
        lastUpdated: new Date(),
        submittedAt: new Date()
      },
      updatedAt: new Date()
    });
    
    console.log('✅ Statut mis à jour vers "pending"');
    
    // 3. Vérifier la mise à jour
    const updatedDoc = await getDoc(userRef);
    const updatedData = updatedDoc.data();
    console.log('📋 Nouveau statut:', updatedData.kycStatus);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécuter le test
testKycStatusUpdate();

console.log('📝 Instructions :');
console.log('1. Modifiez userId avec l\'ID réel de l\'utilisateur');
console.log('2. Ajoutez votre configuration Firebase');
console.log('3. Exécutez: node test-kyc-status-update.js');

