#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration Cloudinary fournie par l'utilisateur
const cloudinaryConfig = {
  CLOUD_NAME: 'dxvbuhadg',
  API_KEY: '221933451899525',
  API_SECRET: '_-G22OeY5A7QsLbKqr1ll93Cyso',
  UPLOAD_PRESET: 'amcb_kyc_documents'
};

// Contenu du fichier .env
const envContent = `# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=${cloudinaryConfig.CLOUD_NAME}
VITE_CLOUDINARY_API_KEY=${cloudinaryConfig.API_KEY}
VITE_CLOUDINARY_API_SECRET=${cloudinaryConfig.API_SECRET}
VITE_CLOUDINARY_UPLOAD_PRESET=${cloudinaryConfig.UPLOAD_PRESET}

# Firebase Configuration (à remplacer par vos vraies valeurs)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Application Configuration
VITE_APP_NAME=AmCbunq
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
`;

// Chemin du fichier .env
const envPath = path.join(__dirname, '.env');

try {
  // Vérifier si le fichier .env existe déjà
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Le fichier .env existe déjà.');
    console.log('📝 Voulez-vous le remplacer ? (y/N)');
    
    // Pour l'automatisation, on remplace directement
    console.log('🔄 Remplacement automatique du fichier .env...');
  }

  // Écrire le fichier .env
  fs.writeFileSync(envPath, envContent, 'utf8');
  
  console.log('✅ Fichier .env créé avec succès !');
  console.log('📁 Chemin:', envPath);
  console.log('');
  console.log('🔧 Configuration Cloudinary :');
  console.log(`   - Cloud Name: ${cloudinaryConfig.CLOUD_NAME}`);
  console.log(`   - API Key: ${cloudinaryConfig.API_KEY}`);
  console.log(`   - Upload Preset: ${cloudinaryConfig.UPLOAD_PRESET}`);
  console.log('');
  console.log('⚠️  N\'oubliez pas de :');
  console.log('   1. Créer l\'upload preset "amcb_kyc_documents" dans votre dashboard Cloudinary');
  console.log('   2. Configurer les variables Firebase si nécessaire');
  console.log('   3. Redémarrer votre serveur de développement');
  console.log('');
  console.log('🚀 Pour démarrer le serveur : npm run dev');

} catch (error) {
  console.error('❌ Erreur lors de la création du fichier .env:', error.message);
  process.exit(1);
}
