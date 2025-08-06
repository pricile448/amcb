const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Configuration Resend pour AMCB');
console.log('==================================\n');

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

// Function to add Resend API key
function addResendKey(apiKey) {
  let envContent = readEnvFile();
  
  // Remove existing VITE_RESEND_API_KEY line if it exists
  envContent = envContent.replace(/VITE_RESEND_API_KEY=.*\n?/g, '');
  
  // Add the new API key
  envContent += `\n# Configuration Resend pour l'envoi d'emails\nVITE_RESEND_API_KEY=${apiKey}\n`;
  
  writeEnvFile(envContent);
  console.log('✅ VITE_RESEND_API_KEY ajouté au fichier .env');
}

console.log('Pour configurer Resend :');
console.log('1. Allez sur https://resend.com');
console.log('2. Créez un compte ou connectez-vous');
console.log('3. Allez dans Settings > API Keys');
console.log('4. Créez une nouvelle clé API');
console.log('5. Copiez la clé (elle commence par "re_")\n');

rl.question('Entrez votre clé API Resend (ou appuyez sur Entrée pour ignorer): ', (apiKey) => {
  if (apiKey && apiKey.trim()) {
    if (apiKey.startsWith('re_')) {
      addResendKey(apiKey.trim());
      console.log('\n✅ Configuration terminée !');
      console.log('🔄 Redémarrez le serveur email pour appliquer les changements :');
      console.log('   node email-server.cjs');
    } else {
      console.log('❌ Clé API invalide. La clé Resend doit commencer par "re_"');
    }
  } else {
    console.log('\n⚠️  Aucune clé API fournie.');
    console.log('   Le serveur email fonctionnera mais ne pourra pas envoyer d\'emails.');
    console.log('   Vous pouvez configurer la clé plus tard en modifiant le fichier .env');
  }
  
  rl.close();
});
