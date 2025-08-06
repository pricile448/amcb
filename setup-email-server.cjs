const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Configuration du serveur email AMCB');
console.log('=====================================\n');

// Function to read .env file
function readEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    return fs.readFileSync(envPath, 'utf8');
  }
  return '';
}

// Function to write .env file
function writeEnvFile(content) {
  const envPath = path.join(__dirname, '.env');
  fs.writeFileSync(envPath, content);
}

// Function to check if Resend API key is configured
function checkResendConfig() {
  const envContent = readEnvFile();
  const hasResendKey = envContent.includes('VITE_RESEND_API_KEY=');
  
  if (hasResendKey) {
    const match = envContent.match(/VITE_RESEND_API_KEY=([^\n]+)/);
    if (match && match[1] && match[1] !== 'your-resend-api-key-here') {
      console.log('✅ VITE_RESEND_API_KEY est déjà configuré');
      return true;
    }
  }
  
  console.log('❌ VITE_RESEND_API_KEY n\'est pas configuré');
  return false;
}

// Function to add Resend API key to .env
function addResendKey(apiKey) {
  let envContent = readEnvFile();
  
  // Remove existing VITE_RESEND_API_KEY line if it exists
  envContent = envContent.replace(/VITE_RESEND_API_KEY=.*\n?/g, '');
  
  // Add the new API key
  envContent += `\n# Configuration Resend pour l'envoi d'emails\nVITE_RESEND_API_KEY=${apiKey}\n`;
  
  writeEnvFile(envContent);
  console.log('✅ VITE_RESEND_API_KEY ajouté au fichier .env');
}

// Function to start email server
function startEmailServer() {
  console.log('\n🚀 Démarrage du serveur email...');
  
  // Load environment variables
  require('dotenv').config();
  
  // Check if Resend API key is available
  if (!process.env.VITE_RESEND_API_KEY) {
    console.error('❌ VITE_RESEND_API_KEY non trouvé dans les variables d\'environnement');
    console.log('   Veuillez redémarrer le serveur après avoir configuré la clé API');
    process.exit(1);
  }
  
  // Start the email server
  require('./email-server.cjs');
}

// Main setup process
async function setup() {
  console.log('1. Vérification de la configuration Resend...');
  
  if (checkResendConfig()) {
    console.log('\n2. Configuration OK, démarrage du serveur...');
    startEmailServer();
    return;
  }
  
  console.log('\n2. Configuration de Resend requise');
  console.log('\nPour obtenir votre clé API Resend :');
  console.log('1. Allez sur https://resend.com');
  console.log('2. Créez un compte ou connectez-vous');
  console.log('3. Allez dans Settings > API Keys');
  console.log('4. Créez une nouvelle clé API');
  console.log('5. Copiez la clé (elle commence par "re_")');
  
  rl.question('\nEntrez votre clé API Resend (ou appuyez sur Entrée pour ignorer): ', (apiKey) => {
    if (apiKey && apiKey.trim()) {
      if (apiKey.startsWith('re_')) {
        addResendKey(apiKey.trim());
        console.log('\n3. Démarrage du serveur...');
        startEmailServer();
      } else {
        console.log('❌ Clé API invalide. La clé Resend doit commencer par "re_"');
        rl.close();
      }
    } else {
      console.log('\n⚠️  Aucune clé API fournie. Le serveur ne pourra pas envoyer d\'emails.');
      console.log('   Vous pouvez configurer la clé plus tard en modifiant le fichier .env');
      console.log('\n3. Démarrage du serveur en mode test...');
      startEmailServer();
    }
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n👋 Arrêt du serveur email');
  rl.close();
  process.exit(0);
});

// Start setup
setup();
