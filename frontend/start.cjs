const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Démarrage de l\'application AMCB...\n');

try {
  // 1. Construire l'application React
  console.log('📦 Construction de l\'application React...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application construite avec succès\n');

  // 2. Démarrer le serveur
  console.log('🌐 Démarrage du serveur...');
  console.log('📱 Application disponible sur: http://localhost:3000');
  console.log('🔌 API disponible sur: http://localhost:3000/api/notifications');
  console.log('\nAppuyez sur Ctrl+C pour arrêter le serveur\n');
  
  // Démarrer le serveur
  execSync('node server.cjs', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Erreur lors du démarrage:', error.message);
  process.exit(1);
} 