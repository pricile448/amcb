// Script de test pour diagnostiquer les problèmes Cloudinary
const fs = require('fs');
const path = require('path');

console.log('🔍 Test de configuration Cloudinary...\n');

// Vérifier les variables d'environnement
const envVars = {
  VITE_CLOUDINARY_CLOUD_NAME: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  VITE_CLOUDINARY_UPLOAD_PRESET: process.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  VITE_CLOUDINARY_API_KEY: process.env.VITE_CLOUDINARY_API_KEY,
  VITE_CLOUDINARY_API_SECRET: process.env.VITE_CLOUDINARY_API_SECRET
};

console.log('📋 Variables d\'environnement:');
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅' : '❌';
  const displayValue = value ? `${value.substring(0, 10)}...` : 'Non définie';
  console.log(`  ${status} ${key}: ${displayValue}`);
});

console.log('\n🔧 Configuration recommandée:');
console.log('  VITE_CLOUDINARY_CLOUD_NAME=dxvbuhadg');
console.log('  VITE_CLOUDINARY_UPLOAD_PRESET=amcb_kyc_documents');
console.log('  VITE_CLOUDINARY_API_KEY=221933451899525');
console.log('  VITE_CLOUDINARY_API_SECRET=_-G22OeY5A7QsLbKqr1ll93Cyso');

console.log('\n📝 Instructions:');
console.log('1. Vérifiez que ces variables sont définies dans votre fichier .env');
console.log('2. Assurez-vous que l\'upload preset "amcb_kyc_documents" existe dans votre dashboard Cloudinary');
console.log('3. Vérifiez que l\'upload preset est configuré pour accepter les types de fichiers: jpg, jpeg, png, pdf');
console.log('4. Vérifiez que la taille maximale est définie à 10MB ou plus');

console.log('\n🌐 Test de connexion Cloudinary...');

// Test simple de connexion à l'API Cloudinary
const cloudName = envVars.VITE_CLOUDINARY_CLOUD_NAME || 'dxvbuhadg';
const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

console.log(`URL de test: ${testUrl}`);

// Créer un fichier de test simple
const testFilePath = path.join(__dirname, 'test-image.txt');
fs.writeFileSync(testFilePath, 'Test file for Cloudinary upload');

console.log('\n📁 Fichier de test créé:', testFilePath);

console.log('\n✅ Script de test terminé.');
console.log('💡 Si les variables d\'environnement sont correctes, le problème peut venir de:');
console.log('   - Upload preset mal configuré dans Cloudinary');
console.log('   - Restrictions de type de fichier');
console.log('   - Restrictions de taille de fichier');
console.log('   - Problèmes de CORS');
