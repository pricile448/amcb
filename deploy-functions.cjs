const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Déploiement des fonctions Firebase...');

try {
  // Aller dans le dossier functions
  process.chdir(path.join(__dirname, 'functions'));
  
  // Installer les dépendances
  console.log('📦 Installation des dépendances...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Déployer les fonctions
  console.log('🌐 Déploiement des fonctions...');
  execSync('firebase deploy --only functions', { stdio: 'inherit' });
  
  console.log('✅ Fonctions déployées avec succès !');
  
} catch (error) {
  console.error('❌ Erreur lors du déploiement:', error.message);
  process.exit(1);
} 