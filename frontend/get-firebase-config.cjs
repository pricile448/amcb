const fs = require('fs');
const path = require('path');

console.log('🔍 Récupération de la configuration Firebase...');

// Lire la configuration admin existante
const adminConfigPath = path.join(__dirname, 'firebase-config.cjs');
const adminConfigContent = fs.readFileSync(adminConfigPath, 'utf8');

// Extraire les informations du projet
const projectIdMatch = adminConfigContent.match(/project_id:\s*"([^"]+)"/);
const clientIdMatch = adminConfigContent.match(/client_id:\s*"([^"]+)"/);

if (projectIdMatch && clientIdMatch) {
  const projectId = projectIdMatch[1];
  const clientId = clientIdMatch[1];
  
  console.log(`✅ Projet trouvé: ${projectId}`);
  console.log(`✅ Client ID: ${clientId}`);
  
  // Configuration Firebase pour le frontend
  const frontendConfig = `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY_ICI", // Remplacez par votre vraie clé API depuis Firebase Console
  authDomain: "${projectId}.firebaseapp.com",
  projectId: "${projectId}",
  storageBucket: "${projectId}.appspot.com",
  messagingSenderId: "${clientId}",
  appId: "1:${clientId}:web:VOTRE_APP_ID_ICI" // Remplacez par votre vraie app ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
`;

  // Écrire la nouvelle configuration
  const frontendConfigPath = path.join(__dirname, 'src', 'config', 'firebase.ts');
  fs.writeFileSync(frontendConfigPath, frontendConfig);
  
  console.log('✅ Configuration Firebase mise à jour !');
  console.log('');
  console.log('📋 Prochaines étapes :');
  console.log('1. Allez sur https://console.firebase.google.com/');
  console.log(`2. Sélectionnez votre projet: ${projectId}`);
  console.log('3. Cliquez sur ⚙️ (Paramètres) > Paramètres du projet');
  console.log('4. Dans l\'onglet "Général", trouvez "Vos applications"');
  console.log('5. Si vous n\'avez pas d\'app web, cliquez sur "Ajouter une application" > Web');
  console.log('6. Copiez la clé API et l\'App ID');
  console.log('7. Remplacez "VOTRE_API_KEY_ICI" et "VOTRE_APP_ID_ICI" dans le fichier config');
  console.log('');
  console.log('🔗 Lien direct: https://console.firebase.google.com/project/' + projectId + '/settings/general/');
  
} else {
  console.error('❌ Impossible de récupérer les informations du projet');
} 