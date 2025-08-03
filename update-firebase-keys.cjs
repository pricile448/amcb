const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔑 Mise à jour des clés Firebase\n');

// Fonction pour poser une question
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function updateFirebaseKeys() {
  try {
    console.log('📋 Veuillez fournir vos vraies clés Firebase :\n');
    
    // Demander la clé API
    const apiKey = await askQuestion('🔑 Clé API Firebase (commence par AIzaSyC...): ');
    
    if (!apiKey.startsWith('AIzaSyC')) {
      console.log('❌ Erreur : La clé API doit commencer par "AIzaSyC"');
      rl.close();
      return;
    }
    
    // Demander l'App ID
    const appId = await askQuestion('🆔 App ID Firebase (format: 1:117639555901342878348:web:...): ');
    
    if (!appId.includes(':web:')) {
      console.log('❌ Erreur : L\'App ID doit contenir ":web:"');
      rl.close();
      return;
    }
    
    // Lire le fichier .env actuel
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Remplacer les clés
    envContent = envContent.replace(
      /VITE_FIREBASE_API_KEY=.*/,
      `VITE_FIREBASE_API_KEY=${apiKey}`
    );
    
    envContent = envContent.replace(
      /VITE_FIREBASE_APP_ID=.*/,
      `VITE_FIREBASE_APP_ID=${appId}`
    );
    
    // Écrire le fichier mis à jour
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Clés Firebase mises à jour avec succès !');
    console.log('\n🧪 Pour tester, lancez : npm run dev');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour :', error.message);
  } finally {
    rl.close();
  }
}

updateFirebaseKeys(); 