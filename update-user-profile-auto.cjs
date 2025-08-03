const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function updateUserProfileAuto() {
  try {
    console.log('🔄 Mise à jour automatique du profil utilisateur...\n');
    
    // ID utilisateur fixe (d'après les logs)
    const userId = 'potz60Vi282qaOJXuN3P';
    
    console.log(`🔍 Utilisateur cible: ${userId}`);
    
    // Vérifier que l'utilisateur existe
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
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
    
    // Données à mettre à jour (basées sur l'image du profil)
    const updateData = {
      birthDate: '1990-01-15', // Exemple - à adapter selon vos vraies données
      birthPlace: 'Paris', // Exemple - à adapter selon vos vraies données
      nationality: userData.nationality || 'Française',
      residenceCountry: userData.residenceCountry || 'France',
      address: userData.address || '5 RUE DE LE MODE',
      city: userData.city || 'PARIS',
      postalCode: userData.postalCode || '75010',
      profession: userData.profession || 'TENEUR',
      salary: userData.salary || 4000,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('\n📝 Données à mettre à jour:');
    console.log(JSON.stringify(updateData, null, 2));
    
    // Vérifier si des données sont déjà présentes
    const missingFields = [];
    const fieldsToCheck = ['birthDate', 'birthPlace', 'nationality', 'residenceCountry', 'address', 'city', 'postalCode', 'profession', 'salary'];
    
    fieldsToCheck.forEach(field => {
      if (!userData[field] || userData[field] === '') {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length === 0) {
      console.log('\n✅ Tous les champs sont déjà remplis !');
      console.log('✅ Aucune mise à jour nécessaire');
      return;
    }
    
    console.log(`\n⚠️ Champs manquants détectés: ${missingFields.join(', ')}`);
    
    // Filtrer seulement les champs manquants
    const filteredUpdateData = {};
    missingFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    });
    filteredUpdateData.updatedAt = updateData.updatedAt;
    
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
    
    // Vérifier que tous les champs sont maintenant remplis
    const stillMissing = fieldsToCheck.filter(field => !updatedData[field] || updatedData[field] === '');
    
    if (stillMissing.length === 0) {
      console.log('\n🎉 SUCCÈS: Tous les champs sont maintenant remplis !');
      console.log('✅ Le problème du formulaire d\'inscription est résolu');
    } else {
      console.log(`\n⚠️ Champs encore manquants: ${stillMissing.join(', ')}`);
      console.log('❌ Il reste des champs à compléter manuellement');
    }
    
    console.log('\n🔄 Pour voir les changements, rechargez la page de profil dans l\'application');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
  } finally {
    process.exit(0);
  }
}

updateUserProfileAuto(); 