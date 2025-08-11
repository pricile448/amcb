const fs = require('fs');
const path = require('path');

console.log('🔍 Extraction des vraies données Firebase...\n');

// Lire la configuration admin existante
const adminConfigPath = path.join(__dirname, 'firebase-config.cjs');
const adminConfigContent = fs.readFileSync(adminConfigPath, 'utf8');

// Extraire les informations du projet
const projectIdMatch = adminConfigContent.match(/project_id:\s*"([^"]+)"/);
const clientIdMatch = adminConfigContent.match(/client_id:\s*"([^"]+)"/);

if (projectIdMatch && clientIdMatch) {
  const projectId = projectIdMatch[1];
  const clientId = clientIdMatch[1];
  
  console.log('📋 Informations extraites :');
  console.log('Project ID:', projectId);
  console.log('Client ID:', clientId);
  console.log('');
  
  // Générer l'App ID probable
  const appId = `1:${clientId}:web:${projectId}-web-app`;
  
  console.log('🔗 Liens pour récupérer les vraies clés :');
  console.log('1. Console Firebase:', `https://console.firebase.google.com/project/${projectId}/settings/general/`);
  console.log('2. Paramètres du projet > Général > Vos applications');
  console.log('');
  
  // Mettre à jour le fichier .env avec les vraies valeurs
  const envContent = `# Configuration Firebase
VITE_FIREBASE_API_KEY=AIzaSyC_placeholder_key_here
VITE_FIREBASE_AUTH_DOMAIN=${projectId}.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${projectId}.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=${clientId}
VITE_FIREBASE_APP_ID=${appId}

# Configuration email (pour les fonctions Firebase)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
`;

  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Fichier .env mis à jour avec les vraies valeurs !');
  console.log('');
  console.log('📝 Prochaines étapes :');
  console.log('1. Allez sur la console Firebase');
  console.log('2. Trouvez votre application web');
  console.log('3. Copiez la clé API et remplacez "AIzaSyC_placeholder_key_here"');
  console.log('4. Copiez l\'App ID et remplacez "' + appId + '"');
  console.log('');
  console.log('🔧 Pour tester : npm run dev');
  
} else {
  console.error('❌ Impossible de récupérer les informations du projet');
} 