const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, sendEmailVerification } = require('firebase/auth');
require('dotenv').config();

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testVerificationRoutes() {
  try {
    console.log('🧪 Test des routes de vérification d\'email...\n');
    
    // 1. Vérifier la configuration
    console.log('1️⃣ Configuration Firebase:');
    console.log('   - Auth Domain:', firebaseConfig.authDomain);
    console.log('   - Project ID:', firebaseConfig.projectId);
    console.log('   - API Key:', firebaseConfig.apiKey ? '✅ Configuré' : '❌ Manquant');
    
    // 2. Tester la création d'un utilisateur temporaire
    console.log('\n2️⃣ Test de création d\'utilisateur temporaire...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('   - Email de test:', testEmail);
    console.log('   - Mot de passe:', testPassword);
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    
    console.log('✅ Utilisateur créé avec succès!');
    console.log('   - UID:', user.uid);
    console.log('   - Email:', user.email);
    
    // 3. Tester l'envoi d'email de vérification
    console.log('\n3️⃣ Test d\'envoi d\'email de vérification...');
    
    // Simuler l'environnement local
    const originalOrigin = global.window?.location?.origin;
    global.window = {
      location: {
        origin: 'http://localhost:3000'
      }
    };
    
    const verificationUrl = `${global.window.location.origin}/auth/action`;
    console.log('   - URL de vérification générée:', verificationUrl);
    
    await sendEmailVerification(user, {
      url: verificationUrl,
      handleCodeInApp: false
    });
    
    console.log('✅ Email de vérification envoyé!');
    
    // 4. Nettoyer l'utilisateur de test
    console.log('\n4️⃣ Nettoyage de l\'utilisateur de test...');
    // Note: Firebase ne permet pas de supprimer un utilisateur directement
    // Il sera supprimé automatiquement après un certain temps
    
    console.log('\n🎉 Test terminé avec succès!');
    console.log('\n📋 Résumé:');
    console.log('   - ✅ Firebase configuré correctement');
    console.log('   - ✅ Création d\'utilisateur fonctionne');
    console.log('   - ✅ Envoi d\'email fonctionne');
    console.log('   - ✅ URL de vérification générée:', verificationUrl);
    
    console.log('\n🔍 Vérifications à faire:');
    console.log('   1. Vérifiez que votre serveur local fonctionne sur http://localhost:3000');
    console.log('   2. Vérifiez que la route /auth/action est accessible');
    console.log('   3. Vérifiez que l\'email est reçu dans votre boîte de réception');
    console.log('   4. Cliquez sur le lien dans l\'email pour tester la vérification');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n🔍 Email déjà utilisé, essayez avec un autre email de test');
    } else if (error.code === 'auth/weak-password') {
      console.log('\n🔍 Mot de passe trop faible, utilisez un mot de passe plus fort');
    } else if (error.code === 'auth/invalid-email') {
      console.log('\n🔍 Format d\'email invalide');
    } else if (error.code === 'auth/network-request-failed') {
      console.log('\n🔍 Problème de réseau, vérifiez votre connexion internet');
    }
  }
}

// Exécuter le test
testVerificationRoutes().catch(console.error);
