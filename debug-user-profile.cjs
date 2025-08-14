// 🔍 Script de diagnostic pour les données utilisateur
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

async function debugUserProfile(email, password) {
  try {
    console.log('🔍 Début du diagnostic pour:', email);
    
    // 1. Essayer de se connecter
    console.log('\n1️⃣ Tentative de connexion...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Connexion réussie!');
    console.log('   - UID:', user.uid);
    console.log('   - Email:', user.email);
    console.log('   - Email vérifié (Auth):', user.emailVerified);
    console.log('   - Date de création:', user.metadata.creationTime);
    
    // 2. Vérifier les données Firestore
    console.log('\n2️⃣ Vérification des données Firestore...');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('✅ Document Firestore trouvé:');
      console.log('   - Prénom:', userData.firstName);
      console.log('   - Nom:', userData.lastName);
      console.log('   - Email vérifié (Firestore):', userData.emailVerified);
      console.log('   - isEmailVerified:', userData.isEmailVerified);
      console.log('   - Statut KYC:', userData.kycStatus);
      console.log('   - Statut général:', userData.status);
      console.log('   - Date de création:', userData.createdAt);
      
      // 3. Vérifier la synchronisation
      console.log('\n3️⃣ Vérification de la synchronisation...');
      const authVerified = user.emailVerified;
      const firestoreVerified = userData.emailVerified || false;
      const firestoreIsVerified = userData.isEmailVerified || false;
      
      console.log('   - Auth emailVerified:', authVerified);
      console.log('   - Firestore emailVerified:', firestoreVerified);
      console.log('   - Firestore isEmailVerified:', firestoreIsVerified);
      
      if (authVerified !== firestoreVerified || authVerified !== firestoreIsVerified) {
        console.log('⚠️  Synchronisation nécessaire!');
        
        // Synchroniser les statuts
        console.log('🔄 Synchronisation des statuts...');
        const updates = {};
        if (authVerified !== firestoreVerified) {
          updates.emailVerified = authVerified;
          console.log('   - Mise à jour emailVerified:', authVerified);
        }
        if (authVerified !== firestoreIsVerified) {
          updates.isEmailVerified = authVerified;
          console.log('   - Mise à jour isEmailVerified:', authVerified);
        }
        
        await updateDoc(doc(db, 'users', user.uid), updates);
        console.log('✅ Statuts synchronisés!');
      } else {
        console.log('✅ Statuts déjà synchronisés');
      }
      
    } else {
      console.log('❌ Document Firestore non trouvé!');
    }
    
    // 4. Déconnexion
    console.log('\n4️⃣ Déconnexion...');
    await signOut(auth);
    console.log('✅ Déconnexion réussie');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    
    if (error.code === 'auth/invalid-credential') {
      console.log('\n🔍 Analyse de l\'erreur invalid-credential:');
      console.log('   - Cette erreur indique que l\'email ou le mot de passe est incorrect');
      console.log('   - Vérifiez que l\'email et le mot de passe correspondent exactement');
      console.log('   - Assurez-vous qu\'il n\'y a pas d\'espaces supplémentaires');
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n🔍 Analyse de l\'erreur user-not-found:');
      console.log('   - L\'utilisateur n\'existe pas dans Firebase Auth');
      console.log('   - Vérifiez que l\'inscription s\'est bien déroulée');
    } else if (error.code === 'auth/wrong-password') {
      console.log('\n🔍 Analyse de l\'erreur wrong-password:');
      console.log('   - Le mot de passe est incorrect');
      console.log('   - Vérifiez le mot de passe utilisé lors de l\'inscription');
    }
  }
}

// Fonction principale
async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  
  if (!email || !password) {
    console.log('❌ Usage: node debug-user-profile.cjs <email> <password>');
    console.log('   Exemple: node debug-user-profile.cjs test@example.com motdepasse123');
    process.exit(1);
  }
  
  console.log('🚀 Démarrage du diagnostic utilisateur...\n');
  await debugUserProfile(email, password);
  console.log('\n🏁 Diagnostic terminé');
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { debugUserProfile }; 