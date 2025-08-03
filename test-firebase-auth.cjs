#!/usr/bin/env node

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

console.log('🧪 Test de la configuration Firebase...\n');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI",
  authDomain: "amcbunq.firebaseapp.com",
  projectId: "amcbunq",
  storageBucket: "amcbunq.firebasestorage.app",
  messagingSenderId: "466533825569",
  appId: "1:466533825569:web:873294f84a51aee5f63760"
};

console.log('📋 Configuration Firebase:');
console.log('API Key:', firebaseConfig.apiKey);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);
console.log('App ID:', firebaseConfig.appId);

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

console.log('\n✅ Firebase initialisé avec succès');

// Test de connexion (si des credentials sont fournis)
if (process.argv.length >= 4) {
  const email = process.argv[2];
  const password = process.argv[3];
  
  console.log(`\n🔐 Test de connexion pour: ${email}`);
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('✅ Connexion réussie!');
      console.log('User ID:', user.uid);
      console.log('Email:', user.email);
      console.log('Email Verified:', user.emailVerified);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur de connexion:');
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      process.exit(1);
    });
} else {
  console.log('\n💡 Pour tester une connexion:');
  console.log('node test-firebase-auth.cjs email@example.com password');
  console.log('\n✅ Configuration Firebase valide');
} 