const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function testRegisterComplete() {
  try {
    console.log('🧪 Test d\'inscription complète...\n');
    
    // Données de test complètes
    const testUserData = {
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33123456789',
      birthDate: '1990-01-15',
      birthPlace: 'Paris',
      nationality: 'Française',
      residenceCountry: 'France',
      address: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      profession: 'Ingénieur',
      salary: '50000'
    };
    
    console.log('📋 Données de test:');
    console.log(JSON.stringify(testUserData, null, 2));
    
    // Créer l'utilisateur directement dans Firestore
    const newUser = {
      // Informations de base
      email: testUserData.email,
      password: testUserData.password,
      firstName: testUserData.firstName,
      lastName: testUserData.lastName,
      
      // Informations de contact
      phone: testUserData.phone,
      
      // Informations personnelles
      birthDate: testUserData.birthDate,
      birthPlace: testUserData.birthPlace,
      nationality: testUserData.nationality,
      residenceCountry: testUserData.residenceCountry,
      
      // Adresse
      address: testUserData.address,
      city: testUserData.city,
      postalCode: testUserData.postalCode,
      
      // Informations professionnelles
      profession: testUserData.profession,
      salary: parseInt(testUserData.salary),
      
      // Statuts et rôles
      verificationStatus: 'unverified',
      kycStatus: 'unverified',
      role: 'user',
      isEmailVerified: false,
      isPhoneVerified: false,
      
      // Données bancaires (initialisées vides)
      accounts: [],
      transactions: [],
      beneficiaries: [],
      iban: null,
      budgets: [],
      notifications: [],
      
      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('\n🔄 Création de l\'utilisateur de test...');
    
    const userRef = await db.collection('users').add(newUser);
    
    console.log(`✅ Utilisateur de test créé avec l'ID: ${userRef.id}`);
    console.log('📊 Champs sauvegardés:', Object.keys(newUser));
    
    // Vérifier que l'utilisateur a été créé correctement
    const createdDoc = await db.collection('users').doc(userRef.id).get();
    const createdData = createdDoc.data();
    
    console.log('\n🔍 Vérification des données sauvegardées:');
    console.log(`- birthDate: ${createdData.birthDate}`);
    console.log(`- birthPlace: ${createdData.birthPlace}`);
    console.log(`- nationality: ${createdData.nationality}`);
    console.log(`- residenceCountry: ${createdData.residenceCountry}`);
    console.log(`- address: ${createdData.address}`);
    console.log(`- city: ${createdData.city}`);
    console.log(`- postalCode: ${createdData.postalCode}`);
    console.log(`- profession: ${createdData.profession}`);
    console.log(`- salary: ${createdData.salary}`);
    
    // Vérifier que tous les champs sont présents
    const requiredFields = ['birthDate', 'birthPlace', 'nationality', 'residenceCountry', 'address', 'city', 'postalCode', 'profession', 'salary'];
    const missingFields = requiredFields.filter(field => !createdData[field] || createdData[field] === '');
    
    if (missingFields.length === 0) {
      console.log('\n✅ Tous les champs ont été sauvegardés correctement!');
      console.log('✅ Le formulaire d\'inscription fonctionne parfaitement');
    } else {
      console.log('\n❌ Champs manquants:', missingFields);
      console.log('❌ Il y a un problème avec le formulaire d\'inscription');
    }
    
    // Nettoyer l'utilisateur de test
    console.log('\n🧹 Nettoyage de l\'utilisateur de test...');
    await db.collection('users').doc(userRef.id).delete();
    console.log('✅ Utilisateur de test supprimé');
    
    console.log('\n💡 Conclusion:');
    if (missingFields.length === 0) {
      console.log('✅ Le problème vient probablement du fait que l\'utilisateur existant a été créé avant l\'ajout de ces champs');
      console.log('✅ Utilisez le script update-user-profile.cjs pour mettre à jour le profil existant');
    } else {
      console.log('❌ Il y a un problème avec le formulaire d\'inscription');
      console.log('❌ Vérifiez le code du formulaire et du backend');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    process.exit(0);
  }
}

testRegisterComplete(); 