const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration de l\'API PHP pour AMCB');
console.log('==========================================\n');

// Vérifier si PHP est installé
try {
  const phpVersion = execSync('php --version', { encoding: 'utf8' });
  console.log('✅ PHP détecté:');
  console.log(phpVersion.split('\n')[0]);
} catch (error) {
  console.error('❌ PHP n\'est pas installé ou n\'est pas dans le PATH');
  console.log('📥 Veuillez installer PHP depuis: https://www.php.net/downloads');
  process.exit(1);
}

// Vérifier si Composer est installé
try {
  const composerVersion = execSync('composer --version', { encoding: 'utf8' });
  console.log('\n✅ Composer détecté:');
  console.log(composerVersion.split('\n')[0]);
} catch (error) {
  console.error('❌ Composer n\'est pas installé');
  console.log('📥 Veuillez installer Composer depuis: https://getcomposer.org/download/');
  process.exit(1);
}

// Aller dans le dossier api
const apiDir = path.join(__dirname, 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

process.chdir(apiDir);
console.log(`\n📁 Dossier de travail: ${apiDir}`);

// Installer les dépendances PHP
console.log('\n📦 Installation des dépendances PHP...');
try {
  execSync('composer install --no-dev --optimize-autoloader', { stdio: 'inherit' });
  console.log('✅ Dépendances PHP installées avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'installation des dépendances PHP');
  process.exit(1);
}

// Créer le fichier .env pour les variables SMTP
const envPath = path.join(__dirname, '.env');
const envContent = `# Configuration SMTP pour l'envoi d'emails
# Remplacez ces valeurs par vos propres paramètres SMTP

# Serveur SMTP (ex: mail.votre-domaine.com, smtp.gmail.com)
SMTP_HOST=mail.votre-domaine.com

# Port SMTP (587 pour TLS, 465 pour SSL)
SMTP_PORT=587

# Sécurité (true pour SSL, false pour TLS)
SMTP_SECURE=false

# Email d'envoi
SMTP_USER=noreply@votre-domaine.com

# Mot de passe de l'email
SMTP_PASS=votre-mot-de-passe-email

# Configuration Firebase (pour la production)
FIREBASE_PROJECT_ID=amcbunq
FIREBASE_PRIVATE_KEY_ID=votre-private-key-id
FIREBASE_PRIVATE_KEY=votre-private-key
FIREBASE_CLIENT_EMAIL=votre-client-email
FIREBASE_CLIENT_ID=votre-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=votre-cert-url
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Fichier .env créé dans le dossier api/');
  console.log('📝 Veuillez configurer vos paramètres SMTP dans api/.env');
} else {
  console.log('\nℹ️  Le fichier .env existe déjà dans le dossier api/');
}

// Créer un script de test
const testScript = `#!/bin/bash
echo "🧪 Test de l'API PHP AMCB"
echo "=========================="

# Aller dans le dossier api
cd "$(dirname "$0")/api"

# Tester la configuration
echo "\\n📋 Test de configuration..."
php test-email.php

echo "\\n🏁 Test terminé"
`;

const testScriptPath = path.join(__dirname, 'test-php-api.sh');
fs.writeFileSync(testScriptPath, testScript);
fs.chmodSync(testScriptPath, '755');

console.log('\n✅ Script de test créé: test-php-api.sh');

// Instructions
console.log('\n📋 Instructions de configuration:');
console.log('==================================');
console.log('1. Configurez vos paramètres SMTP dans api/.env');
console.log('2. Testez la configuration: npm run test:php-api');
console.log('3. Pour le développement local, utilisez: npm run dev:php');
console.log('4. Pour déployer sur Vercel: vercel --prod');

// Ajouter les scripts dans package.json
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts['test:php-api'] = 'cd api && php test-email.php';
  packageJson.scripts['dev:php'] = 'php -S localhost:8000 -t api api/index.php';
  packageJson.scripts['install:php'] = 'cd api && composer install';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('\n✅ Scripts ajoutés dans package.json');
}

console.log('\n🎉 Configuration terminée avec succès!');
console.log('\n📚 Prochaines étapes:');
console.log('1. Configurez vos paramètres SMTP dans api/.env');
console.log('2. Testez l\'envoi d\'email: npm run test:php-api');
console.log('3. Démarrez le serveur de développement: npm run dev:php'); 