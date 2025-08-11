const fs = require('fs');
const path = require('path');

console.log('🧪 Test de la configuration Firebase...\n');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ Fichier .env non trouvé !');
  console.log('📋 Exécutez : node setup-env.cjs');
  process.exit(1);
}

// Lire le fichier .env
const envContent = fs.readFileSync(envPath, 'utf8');



// Vérifier les éléments critiques
const checks = [
  {
    name: 'API Key',
    pattern: /VITE_FIREBASE_API_KEY=([^\n]+)/,
    placeholder: 'your-api-key-here',
    critical: true
  },
  {
    name: 'App ID',
    pattern: /VITE_FIREBASE_APP_ID=([^\n]+)/,
    placeholder: '1:117639555901342878348:web:your-app-id-here',
    critical: true
  },
  {
    name: 'Project ID',
    pattern: /VITE_FIREBASE_PROJECT_ID=([^\n]+)/,
    placeholder: null,
    critical: false
  },
  {
    name: 'Auth Domain',
    pattern: /VITE_FIREBASE_AUTH_DOMAIN=([^\n]+)/,
    placeholder: null,
    critical: false
  }
];

let allGood = true;

checks.forEach(check => {
  const match = envContent.match(check.pattern);
  
  if (match) {
    const value = match[1];
    
    if (check.placeholder && value === check.placeholder) {
      console.log(`❌ ${check.name}: Non configuré (${check.placeholder})`);
      allGood = false;
    } else if (value && value.length > 5) {
      console.log(`✅ ${check.name}: Configuré`);
    } else {
      console.log(`⚠️  ${check.name}: Valeur suspecte (${value})`);
      if (check.critical) allGood = false;
    }
  } else {
    console.log(`❌ ${check.name}: Non trouvé`);
    if (check.critical) allGood = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 Configuration Firebase OK !');
  console.log('✅ Vous pouvez tester l\'inscription maintenant');
} else {
  console.log('🚨 Configuration Firebase incomplète !');
  console.log('📖 Suivez le guide : FIREBASE_SETUP_GUIDE.md');
  console.log('🔗 Ou allez directement sur : https://console.firebase.google.com/project/amcbunq/settings/general/');
}

console.log('\n📋 Prochaines étapes :');
console.log('1. Configurez Firebase (si nécessaire)');
console.log('2. Redémarrez le serveur : npm run dev');
console.log('3. Testez l\'inscription d\'un compte'); 