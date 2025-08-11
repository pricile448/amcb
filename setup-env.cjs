const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration des variables d\'environnement...\n');

// Lire la configuration admin existante
const adminConfigPath = path.join(__dirname, 'firebase-config.cjs');
const adminConfigContent = fs.readFileSync(adminConfigPath, 'utf8');

// Extraire les informations du projet
const projectIdMatch = adminConfigContent.match(/project_id:\s*"([^"]+)"/);
const clientIdMatch = adminConfigContent.match(/client_id:\s*"([^"]+)"/);

if (projectIdMatch && clientIdMatch) {
  const projectId = projectIdMatch[1];
  const clientId = clientIdMatch[1];
  
  // Contenu du fichier .env
  const envContent = `# Configuration Firebase
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=${projectId}.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${projectId}.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=${clientId}
VITE_FIREBASE_APP_ID=1:${clientId}:web:your-app-id-here

# Configuration email (pour les fonctions Firebase)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
`;

  // Écrire le fichier .env
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Fichier .env créé !');
  console.log('');
  console.log('📋 Prochaines étapes :');
  console.log('1. Allez sur https://console.firebase.google.com/');
  console.log(`2. Sélectionnez votre projet: ${projectId}`);
  console.log('3. Cliquez sur ⚙️ (Paramètres) > Paramètres du projet');
  console.log('4. Dans l\'onglet "Général", trouvez "Vos applications"');
  console.log('5. Si vous n\'avez pas d\'app web, cliquez sur "Ajouter une application" > Web');
  console.log('6. Copiez la clé API et l\'App ID');
  console.log('7. Modifiez le fichier .env avec vos vraies valeurs :');
  console.log('');
  console.log('   VITE_FIREBASE_API_KEY=AIzaSyC... (votre vraie clé)');
  console.log('   VITE_FIREBASE_APP_ID=1:117639555901342878348:web:abc123def456 (votre vraie app ID)');
  console.log('');
  console.log('🔗 Lien direct: https://console.firebase.google.com/project/' + projectId + '/settings/general/');
  
} else {
  console.error('❌ Impossible de récupérer les informations du projet');
} 