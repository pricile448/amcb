const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');
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
const db = getFirestore(app);

async function forceEmailVerification(email, password) {
  try {
    console.log('🔍 Début de la vérification forcée pour:', email);
    
    // 1. Se connecter
    console.log('\n1️⃣ Connexion...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Connexion réussie!');
    console.log('   - UID:', user.uid);
    console.log('   - Email:', user.email);
    console.log('   - Email vérifié (Auth):', user.emailVerified);
    
    // 2. Vérifier les données Firestore
    console.log('\n2️⃣ Vérification des données Firestore...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('Document Firestore non trouvé');
    }
    
    const userData = userDoc.data();
    console.log('✅ Document Firestore trouvé:');
    console.log('   - Prénom:', userData.firstName);
    console.log('   - Nom:', userData.lastName);
    console.log('   - Email vérifié (Firestore):', userData.emailVerified);
    console.log('   - isEmailVerified:', userData.isEmailVerified);
    
    // 3. Forcer la vérification
    console.log('\n3️⃣ Forçage de la vérification...');
    
    // Mettre à jour Firestore
    const updates = {
      emailVerified: true,
      isEmailVerified: true,
      status: 'active'
    };
    
    await updateDoc(doc(db, 'users', user.uid), updates);
    console.log('✅ Firestore mis à jour avec emailVerified = true');
    
    // 4. Vérifier la synchronisation
    console.log('\n4️⃣ Vérification de la synchronisation...');
    const updatedDoc = await getDoc(doc(db, 'users', user.uid));
    const updatedData = updatedDoc.data();
    
    console.log('   - emailVerified (Firestore):', updatedData.emailVerified);
    console.log('   - isEmailVerified (Firestore):', updatedData.isEmailVerified);
    console.log('   - Status (Firestore):', updatedData.status);
    
    // 5. Déconnexion
    console.log('\n5️⃣ Déconnexion...');
    await signOut(auth);
    console.log('✅ Déconnexion réussie');
    
    console.log('\n🎉 Vérification forcée terminée avec succès!');
    console.log('   L\'utilisateur peut maintenant se connecter normalement.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification forcée:', error);
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n🔍 Erreur invalid-credential:');
      console.log('   - Vérifiez que l\'email et le mot de passe sont corrects');
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n🔍 Erreur user-not-found:');
      console.log('   - L\'utilisateur n\'existe pas dans Firebase Auth');
    }
  }
}

// Fonction principale
async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.log('❌ Usage: node force-email-verification.cjs <email> <password>');
    console.log('   Exemple: node force-email-verification.cjs test@example.com motdepasse123');
    process.exit(1);
  }
  
  console.log('🚀 Démarrage de la vérification forcée...\n');
  await forceEmailVerification(email, password);
  console.log('\n🏁 Opération terminée');
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { forceEmailVerification };
