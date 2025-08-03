const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Build Vercel optimisé...\n');

// Vérifier les variables d'environnement
console.log('🔍 Vérification des variables d'environnement...');
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Variables manquantes:', missingVars.join(', '));
  console.log('💡 Assurez-vous que les variables sont configurées sur Vercel');
  process.exit(1);
}

console.log('✅ Toutes les variables d\'environnement sont présentes');

// Build de l'application
console.log('\n📦 Build de l\'application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build terminé avec succès');
} catch (error) {
  console.error('❌ Erreur lors du build:', error.message);
  process.exit(1);
}

// Vérifier que le dossier dist existe
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ Dossier dist non trouvé après le build');
  process.exit(1);
}

console.log('\n🎉 Build Vercel terminé avec succès !');
console.log('📁 Dossier dist créé:', distPath); 