const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Script de déploiement Vercel\n');

// Fonction pour exécuter une commande
function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} terminé`);
    return result;
  } catch (error) {
    console.error(`❌ Erreur lors de ${description}:`, error.message);
    return null;
  }
}

// Fonction pour vérifier si Vercel CLI est installé
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Fonction pour vérifier les variables d'environnement
function checkEnvVariables() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env non trouvé');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredVars.filter(varName => {
    return !envContent.includes(varName) || envContent.includes(`${varName}=your-`) || envContent.includes(`${varName}=placeholder`);
  });

  if (missingVars.length > 0) {
    console.log('⚠️  Variables d\'environnement manquantes ou avec des valeurs par défaut:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n💡 Utilisez le script update-firebase-keys.cjs pour configurer les vraies clés');
    return false;
  }

  console.log('✅ Variables d\'environnement vérifiées');
  return true;
}

// Fonction principale de déploiement
async function deployToVercel() {
  console.log('🔍 Vérifications pré-déploiement...\n');

  // 1. Vérifier Vercel CLI
  if (!checkVercelCLI()) {
    console.log('❌ Vercel CLI non installé');
    console.log('💡 Installez-le avec: npm install -g vercel');
    return;
  }

  // 2. Vérifier les variables d'environnement
  if (!checkEnvVariables()) {
    console.log('\n⚠️  Continuez-vous malgré les variables manquantes ? (y/N)');
    // En mode automatique, on continue mais on avertit
  }

  console.log('\n🚀 Démarrage du déploiement...\n');

  // 3. Build de l'application
  const buildResult = runCommand('npm run build', 'Build de l\'application');
  if (!buildResult) {
    console.log('❌ Échec du build, arrêt du déploiement');
    return;
  }

  // 4. Vérifier que le build a créé le dossier dist
  const distPath = path.join(__dirname, 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('❌ Dossier dist non trouvé après le build');
    return;
  }

  // 5. Déploiement sur Vercel
  console.log('\n🌐 Déploiement sur Vercel...');
  console.log('💡 Si c\'est la première fois, suivez les instructions de configuration');
  
  const deployResult = runCommand('vercel --prod --yes', 'Déploiement Vercel');
  
  if (deployResult) {
    console.log('\n✅ Déploiement terminé avec succès !');
    console.log('\n🔗 Prochaines étapes :');
    console.log('1. Vérifiez votre application sur l\'URL fournie');
    console.log('2. Testez les fonctionnalités Firebase');
    console.log('3. Vérifiez les logs si nécessaire : vercel logs');
  } else {
    console.log('\n❌ Échec du déploiement');
    console.log('💡 Vérifiez les logs avec : vercel logs');
  }
}

// Fonction pour afficher l'aide
function showHelp() {
  console.log(`
🚀 Script de déploiement Vercel

Usage:
  node deploy-vercel.cjs

Options:
  --help     Afficher cette aide
  --check    Vérifier seulement la configuration

Exemples:
  node deploy-vercel.cjs          # Déployer
  node deploy-vercel.cjs --check  # Vérifier seulement

Prérequis:
  - Vercel CLI installé (npm install -g vercel)
  - Variables d'environnement configurées
  - Projet connecté à Vercel
`);
}

// Gestion des arguments
const args = process.argv.slice(2);
if (args.includes('--help')) {
  showHelp();
} else if (args.includes('--check')) {
  console.log('🔍 Vérification de la configuration...\n');
  checkVercelCLI();
  checkEnvVariables();
} else {
  deployToVercel();
} 