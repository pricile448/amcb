const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function updateUserProfile() {
  try {
    console.log('🔄 Mise à jour du profil utilisateur...\n');
    
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
    console.log(`\n🔍 Profil actuel de l'utilisateur ${userData.email}:`);
    console.log(`- birthDate: ${userData.birthDate || 'NON DÉFINI'}`);
    console.log(`- birthPlace: ${userData.birthPlace || 'NON DÉFINI'}`);
    console.log(`- nationality: ${userData.nationality || 'NON DÉFINI'}`);
    console.log(`- residenceCountry: ${userData.residenceCountry || 'NON DÉFINI'}`);
    console.log(`- address: ${userData.address || 'NON DÉFINI'}`);
    console.log(`- city: ${userData.city || 'NON DÉFINI'}`);
    console.log(`- postalCode: ${userData.postalCode || 'NON DÉFINI'}`);
    console.log(`- profession: ${userData.profession || 'NON DÉFINI'}`);
    console.log(`- salary: ${userData.salary || 'NON DÉFINI'}`);
    
    // Demander les nouvelles données
    console.log('\n📝 Entrez les nouvelles données (laissez vide pour garder l\'existant):');
    
    const birthDate = await new Promise((resolve) => {
      rl.question('Date de naissance (YYYY-MM-DD): ', (answer) => {
        resolve(answer.trim() || userData.birthDate || '');
      });
    });
    
    const birthPlace = await new Promise((resolve) => {
      rl.question('Lieu de naissance: ', (answer) => {
        resolve(answer.trim() || userData.birthPlace || '');
      });
    });
    
    const nationality = await new Promise((resolve) => {
      rl.question('Nationalité: ', (answer) => {
        resolve(answer.trim() || userData.nationality || '');
      });
    });
    
    const residenceCountry = await new Promise((resolve) => {
      rl.question('Pays de résidence: ', (answer) => {
        resolve(answer.trim() || userData.residenceCountry || '');
      });
    });
    
    const address = await new Promise((resolve) => {
      rl.question('Adresse: ', (answer) => {
        resolve(answer.trim() || userData.address || '');
      });
    });
    
    const city = await new Promise((resolve) => {
      rl.question('Ville: ', (answer) => {
        resolve(answer.trim() || userData.city || '');
      });
    });
    
    const postalCode = await new Promise((resolve) => {
      rl.question('Code postal: ', (answer) => {
        resolve(answer.trim() || userData.postalCode || '');
      });
    });
    
    const profession = await new Promise((resolve) => {
      rl.question('Profession: ', (answer) => {
        resolve(answer.trim() || userData.profession || '');
      });
    });
    
    const salary = await new Promise((resolve) => {
      rl.question('Salaire (nombre): ', (answer) => {
        resolve(answer.trim() || userData.salary || 0);
      });
    });
    
    rl.close();
    
    // Préparer les données de mise à jour
    const updateData = {
      birthDate: birthDate || userData.birthDate || '',
      birthPlace: birthPlace || userData.birthPlace || '',
      nationality: nationality || userData.nationality || '',
      residenceCountry: residenceCountry || userData.residenceCountry || '',
      address: address || userData.address || '',
      city: city || userData.city || '',
      postalCode: postalCode || userData.postalCode || '',
      profession: profession || userData.profession || '',
      salary: salary ? parseInt(salary) : (userData.salary || 0),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Filtrer les champs vides
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => {
        if (key === 'updatedAt') return true;
        return value !== '' && value !== null && value !== undefined;
      })
    );
    
    console.log('\n🔄 Mise à jour du profil...');
    console.log('📋 Données à mettre à jour:', filteredUpdateData);
    
    // Mettre à jour le profil
    await db.collection('users').doc(userId).update(filteredUpdateData);
    
    console.log('✅ Profil mis à jour avec succès!');
    
    // Vérifier la mise à jour
    const updatedDoc = await db.collection('users').doc(userId).get();
    const updatedData = updatedDoc.data();
    
    console.log('\n🔍 Vérification de la mise à jour:');
    console.log(`- birthDate: ${updatedData.birthDate || 'NON DÉFINI'}`);
    console.log(`- birthPlace: ${updatedData.birthPlace || 'NON DÉFINI'}`);
    console.log(`- nationality: ${updatedData.nationality || 'NON DÉFINI'}`);
    console.log(`- residenceCountry: ${updatedData.residenceCountry || 'NON DÉFINI'}`);
    console.log(`- address: ${updatedData.address || 'NON DÉFINI'}`);
    console.log(`- city: ${updatedData.city || 'NON DÉFINI'}`);
    console.log(`- postalCode: ${updatedData.postalCode || 'NON DÉFINI'}`);
    console.log(`- profession: ${updatedData.profession || 'NON DÉFINI'}`);
    console.log(`- salary: ${updatedData.salary || 'NON DÉFINI'}`);
    
    console.log('\n🔄 Pour voir les changements, rechargez la page de profil dans l\'application');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
  } finally {
    process.exit(0);
  }
}

updateUserProfile(); 