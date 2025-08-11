// Script pour créer automatiquement l'upload preset Cloudinary
const https = require('https');

const cloudName = 'dxvbuhadg';
const apiKey = '221933451899525';
const apiSecret = '_-G22OeY5A7QsLbKqr1ll93Cyso';

console.log('🔧 Création de l\'upload preset Cloudinary...\n');

// Configuration du preset
const presetConfig = {
  name: 'amcb_kyc_documents',
  unsigned: true,
  folder: 'kyc-documents',
  allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  max_file_size: 10485760, // 10MB
  resource_type: 'auto',
  access_mode: 'public'
};

// Créer l'authentification Basic
const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
const postData = JSON.stringify(presetConfig);

const options = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: `/v1_1/${cloudName}/upload_presets`,
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Upload preset créé avec succès !');
        console.log(`📌 Nom: ${response.name}`);
        console.log(`🔧 Mode: ${response.unsigned ? 'Unsigned' : 'Signed'}`);
        console.log(`📁 Dossier: ${response.folder || 'root'}`);
        console.log(`📄 Formats autorisés: ${response.allowed_formats ? response.allowed_formats.join(', ') : 'tous'}`);
        console.log(`📏 Taille max: ${response.max_file_size ? (response.max_file_size / 1024 / 1024).toFixed(1) + 'MB' : 'non définie'}`);
        console.log('\n🚀 Vous pouvez maintenant tester les uploads KYC !');
      } else {
        console.log('❌ Erreur création preset:', res.statusCode);
        console.log('Détails:', data);
        
        if (res.statusCode === 400 && data.includes('already exists')) {
          console.log('\n💡 Le preset existe peut-être déjà. Essayons de le mettre à jour...');
        }
      }
    } catch (error) {
      console.log('❌ Erreur parsing JSON:', error.message);
      console.log('Response brute:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erreur requête:', error.message);
});

req.write(postData);
req.end();
