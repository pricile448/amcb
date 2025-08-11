const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function addBirthData() {
  try {
    console.log('🔄 Ajout des données de naissance...\n');
    
    // Demander l'ID utilisateur
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const userId = await new Promise((resolve) => {
      rl.question('Entrez l\'ID utilisateur (ou appuyez sur Entrée pour utiliser l\'ID par défaut): ', (answer) => {
        resolve(answer.trim() || 'potz60Vi282qaOJXuN3P');
      });
    });
    
    console.log(`🔍 Utilisateur cible: ${userId}`);
    
    // Vérifier que l'utilisateur existe
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      rl.close();
      return;
    }
    
    const userData = userDoc.data();
    console.log(`\n🔍 Profil actuel de l'utilisateur ${userData.email}:`);
    console.log(`- birthDate: ${userData.birthDate || 'NON DÉFINI'}`);
    console.log(`- birthPlace: ${userData.birthPlace || 'NON DÉFINI'}`);
    
    // Demander les données de naissance
    console.log('\n📝 Entrez les données de naissance:');
    
    const birthDate = await new Promise((resolve) => {
      rl.question('Date de naissance (YYYY-MM-DD, ex: 1990-01-15): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    const birthPlace = await new Promise((resolve) => {
      rl.question('Lieu de naissance (ex: Paris): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!birthDate || !birthPlace) {
      console.log('❌ Date et lieu de naissance requis');
      rl.close();
      return;
    }
    
    // Données à mettre à jour
    const updateData = {
      birthDate: birthDate,
      birthPlace: birthPlace,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('\n📝 Données à ajouter:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Mettre à jour le profil
    await db.collection('users').doc(userId).update(updateData);
    
    console.log('✅ Données de naissance ajoutées avec succès!');
    
    // Vérifier la mise à jour
    const updatedDoc = await db.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();
    
    console.log('\n🔍 Vérification de la mise à jour:');
    console.log(`- birthDate: ${updatedData.birthDate || 'NON DÉFINI'}`);
    console.log(`- birthPlace: ${updatedData.birthPlace || 'NON DÉFINI'}`);
    
    rl.close();
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des données de naissance:', error);
  }
}

// Exécuter le script
addBirthData(); 