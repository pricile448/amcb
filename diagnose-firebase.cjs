#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de la configuration Firebase...\n');

// Vérifier le fichier .env local
const envPath = path.join(__dirname, '.env');
console.log('📁 Vérification du fichier .env local...');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Fichier .env trouvé');
  
  // Vérifier les variables Firebase
  const firebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  console.log('\n🔧 Variables Firebase dans .env:');
  firebaseVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: Présente`);
    } else {
      console.log(`❌ ${varName}: Manquante`);
    }
  });
  
  // Vérifier les variables SMTP
  const smtpVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_SECURE',
    'SMTP_USER',
    'SMTP_PASS'
  ];
  
  console.log('\n📧 Variables SMTP dans .env:');
  smtpVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}: Présente`);
    } else {
      console.log(`❌ ${varName}: Manquante`);
    }
  });
  
} else {
  console.log('❌ Fichier .env non trouvé');
}

// Vérifier la configuration Firebase dans le code
const firebaseConfigPath = path.join(__dirname, 'src', 'config', 'firebase.ts');
console.log('\n📁 Vérification de la configuration Firebase dans le code...');

if (fs.existsSync(firebaseConfigPath)) {
  const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  console.log('✅ Fichier firebase.ts trouvé');
  
  // Vérifier les fallbacks
  if (firebaseContent.includes('|| "AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI"')) {
    console.log('✅ Fallbacks Firebase configurés');
  } else {
    console.log('❌ Fallbacks Firebase manquants');
  }
  
  // Vérifier les logs de debug
  if (firebaseContent.includes('console.log')) {
    console.log('✅ Logs de debug activés');
  } else {
    console.log('❌ Logs de debug manquants');
  }
  
} else {
  console.log('❌ Fichier firebase.ts non trouvé');
}

// Instructions pour résoudre les problèmes
console.log('\n🔧 Solutions pour les problèmes de connexion:');
console.log('\n1. **Variables d\'environnement manquantes sur Vercel:**');
console.log('   - Allez sur https://vercel.com/dashboard');
console.log('   - Sélectionnez votre projet "studio"');
console.log('   - Settings > Environment Variables');
console.log('   - Ajoutez toutes les variables Firebase et SMTP');

console.log('\n2. **Vérification des comptes Firebase:**');
console.log('   - Allez sur https://console.firebase.google.com');
console.log('   - Sélectionnez le projet "amcbunq"');
console.log('   - Authentication > Users');
console.log('   - Vérifiez que les comptes existent');

console.log('\n3. **Test de connexion:**');
console.log('   - Ouvrez la console du navigateur (F12)');
console.log('   - Essayez de vous connecter');
console.log('   - Vérifiez les erreurs dans la console');

console.log('\n4. **Redéploiement après configuration:**');
console.log('   - Après avoir ajouté les variables d\'environnement');
console.log('   - Redéployez: git push');

console.log('\n📋 Variables Firebase nécessaires:');
const requiredVars = {
  'VITE_FIREBASE_API_KEY': 'AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI',
  'VITE_FIREBASE_AUTH_DOMAIN': 'amcbunq.firebaseapp.com',
  'VITE_FIREBASE_PROJECT_ID': 'amcbunq',
  'VITE_FIREBASE_STORAGE_BUCKET': 'amcbunq.firebasestorage.app',
  'VITE_FIREBASE_MESSAGING_SENDER_ID': '466533825569',
  'VITE_FIREBASE_APP_ID': '1:466533825569:web:873294f84a51aee5f63760'
};

Object.entries(requiredVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n✅ Diagnostic terminé !'); 