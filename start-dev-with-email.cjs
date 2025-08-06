const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de l\'environnement de développement AMCB');
console.log('=====================================================\n');

// Démarrer le serveur email mock en arrière-plan
console.log('1. Démarrage du serveur email mock...');
const emailServer = spawn('node', ['mock-email-server.cjs'], {
  stdio: 'pipe',
  shell: true,
  detached: true
});

emailServer.stdout.on('data', (data) => {
  console.log('📧 Email Server:', data.toString().trim());
});

emailServer.stderr.on('data', (data) => {
  console.error('❌ Email Server Error:', data.toString().trim());
});

// Attendre un peu que le serveur email démarre
setTimeout(() => {
  console.log('\n2. Test du serveur email...');
  
  const testServer = spawn('node', ['test-email-server.cjs'], {
    stdio: 'inherit',
    shell: true
  });

  testServer.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Serveur email prêt !');
      console.log('\n3. Démarrage de l\'application de développement...');
      
      // Démarrer l'application de développement
      const devServer = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        shell: true
      });

      devServer.on('error', (error) => {
        console.error('❌ Erreur serveur de développement:', error);
      });

      devServer.on('close', (code) => {
        console.log(`\n👋 Serveur de développement arrêté avec le code: ${code}`);
        // Arrêter le serveur email
        emailServer.kill();
      });

      // Gérer l'arrêt propre
      process.on('SIGINT', () => {
        console.log('\n\n👋 Arrêt de tous les serveurs...');
        devServer.kill('SIGINT');
        emailServer.kill();
        process.exit(0);
      });

    } else {
      console.log('\n❌ Le serveur email n\'est pas prêt');
      emailServer.kill();
      process.exit(1);
    }
  });

}, 2000);

// Gérer les erreurs du serveur email
emailServer.on('error', (error) => {
  console.error('❌ Erreur serveur email:', error);
  process.exit(1);
});

emailServer.on('close', (code) => {
  console.log(`\n👋 Serveur email arrêté avec le code: ${code}`);
});
