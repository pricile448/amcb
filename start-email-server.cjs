const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Démarrage du serveur email AMCB');
console.log('==================================\n');

console.log('Choisissez le mode de serveur email :');
console.log('1. Serveur email réel (avec Resend)');
console.log('2. Serveur email mock (pour tests)');
console.log('3. Configurer Resend API key');
console.log('4. Quitter\n');

rl.question('Votre choix (1-4): ', (choice) => {
  switch (choice.trim()) {
    case '1':
      console.log('\n🚀 Démarrage du serveur email réel...');
      console.log('⚠️  Assurez-vous que VITE_RESEND_API_KEY est configuré dans .env');
      rl.close();
      startServer('email-server.cjs');
      break;
      
    case '2':
      console.log('\n🧪 Démarrage du serveur email mock...');
      console.log('💡 Ce serveur simule l\'envoi d\'emails pour les tests');
      rl.close();
      startServer('mock-email-server.cjs');
      break;
      
    case '3':
      console.log('\n🔧 Configuration de Resend...');
      rl.close();
      startServer('setup-resend.cjs');
      break;
      
    case '4':
      console.log('\n👋 Au revoir !');
      rl.close();
      break;
      
    default:
      console.log('\n❌ Choix invalide. Veuillez choisir 1, 2, 3 ou 4.');
      rl.close();
  }
});

function startServer(scriptName) {
  const server = spawn('node', [scriptName], {
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
  });

  server.on('close', (code) => {
    console.log(`\n👋 Serveur arrêté avec le code: ${code}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n\n👋 Arrêt du serveur...');
    server.kill('SIGINT');
    process.exit(0);
  });
}
