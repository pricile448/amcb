// 🔍 Script de diagnostic pour les données utilisateur
const admin = require('firebase-admin');

// Configuration Firebase Admin
const serviceAccount = require('./firebase-config.cjs');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function debugUserProfile() {
  try {
    console.log('🔍 DIAGNOSTIC DES DONNÉES UTILISATEUR');
    console.log('=====================================');
    
    // Récupérer tous les utilisateurs
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Aucun utilisateur trouvé dans Firestore');
      return;
    }
    
    console.log(`✅ ${usersSnapshot.size} utilisateur(s) trouvé(s)`);
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      console.log('\n👤 UTILISATEUR:', doc.id);
      console.log('📋 DONNÉES COMPLÈTES:', JSON.stringify(userData, null, 2));
      
      // Vérifier les champs de date de naissance
      const dateFields = ['birthDate', 'dob', 'dateOfBirth', 'birthdate', 'date_de_naissance'];
      console.log('\n📅 CHAMPS DE DATE DE NAISSANCE:');
      dateFields.forEach(field => {
        if (userData[field]) {
          console.log(`✅ ${field}:`, userData[field]);
        } else {
          console.log(`❌ ${field}: Non trouvé`);
        }
      });
      
      // Vérifier les champs de lieu de naissance
      const placeFields = ['birthPlace', 'pob', 'placeOfBirth', 'birthplace', 'lieu_de_naissance'];
      console.log('\n🏠 CHAMPS DE LIEU DE NAISSANCE:');
      placeFields.forEach(field => {
        if (userData[field]) {
          console.log(`✅ ${field}:`, userData[field]);
        } else {
          console.log(`❌ ${field}: Non trouvé`);
        }
      });
      
      console.log('\n' + '='.repeat(50));
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    process.exit(0);
  }
}

debugUserProfile(); 