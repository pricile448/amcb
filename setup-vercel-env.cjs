#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration des variables d\'environnement Vercel:');
console.log('=====================================================');

// Lire le fichier .env local
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ Fichier .env non trouvé !');
  console.log('💡 Créez d\'abord le fichier .env avec vos variables Firebase');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parser le fichier .env
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim();
    if (value && !value.startsWith('#')) {
      envVars[key.trim()] = value.replace(/^["']|["']$/g, ''); // Enlever les guillemets
    }
  }
});

// Variables Firebase à configurer
const firebaseVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

// Variables SMTP à configurer
const smtpVars = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_SECURE',
  'SMTP_USER',
  'SMTP_PASS'
];

console.log('\n📋 Variables Firebase trouvées:');
console.log('--------------------------------');

firebaseVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`✅ ${varName}: ${envVars[varName].substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MANQUANTE`);
  }
});

console.log('\n📋 Variables SMTP trouvées:');
console.log('----------------------------');

smtpVars.forEach(varName => {
  if (envVars[varName]) {
    if (varName === 'SMTP_PASS') {
      console.log(`✅ ${varName}: ********`);
    } else {
      console.log(`✅ ${varName}: ${envVars[varName]}`);
    }
  } else {
    console.log(`❌ ${varName}: MANQUANTE`);
  }
});

console.log('\n🚀 Configuration sur Vercel...');
console.log('==============================');

// Configurer les variables Firebase
firebaseVars.forEach(varName => {
  if (envVars[varName]) {
    try {
      console.log(`🔧 Configuration de ${varName}...`);
      execSync(`vercel env add ${varName} production`, {
        input: envVars[varName],
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`✅ ${varName} configurée`);
    } catch (error) {
      console.log(`⚠️ ${varName} déjà configurée ou erreur`);
    }
  }
});

// Configurer les variables SMTP
smtpVars.forEach(varName => {
  if (envVars[varName]) {
    try {
      console.log(`🔧 Configuration de ${varName}...`);
      execSync(`vercel env add ${varName} production`, {
        input: envVars[varName],
        stdio: ['pipe', 'pipe', 'pipe']
      });
      console.log(`✅ ${varName} configurée`);
    } catch (error) {
      console.log(`⚠️ ${varName} déjà configurée ou erreur`);
    }
  }
});

console.log('\n✅ Configuration terminée !');
console.log('🔄 Redéployez votre application sur Vercel');
console.log('💡 Utilisez: vercel --prod'); 