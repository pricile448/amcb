#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, Timestamp } = require('firebase/firestore');

// Configuration Firebase - REMPLACEZ par vos vraies valeurs
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetCardsToInitialState(userId) {
  try {
    console.log(`🔄 Réinitialisation des cartes pour l'utilisateur: ${userId}`);
    
    const userRef = doc(db, 'users', userId);
    
    // Supprimer tous les champs liés aux cartes
    await updateDoc(userRef, {
      cardLimits: null,
      cardRequestedAt: null,
      cardStatus: null,
      cardType: null,
      monthly: null,
      withdrawal: null,
      updatedAt: Timestamp.now()
    });
    
    console.log('✅ Cartes réinitialisées avec succès !');
    console.log('📱 L\'interface devrait maintenant afficher les boutons de demande');
    
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  }
}

// ID de l'utilisateur à réinitialiser
const USER_ID = '7fTWiF9ucmP5Dnwc919xd8vPPFy2';

// Exécuter la réinitialisation
resetCardsToInitialState(USER_ID)
  .then(() => {
    console.log('\n🎯 Réinitialisation terminée !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });
