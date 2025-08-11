// Script pour mettre à jour l'upload preset Cloudinary en mode Unsigned
const https = require('https');

const cloudName = 'dxvbuhadg';
const apiKey = '221933451899525';
const apiSecret = '_-G22OeY5A7QsLbKqr1ll93Cyso';
const presetName = 'amcb_kyc_documents';

console.log('🔧 Mise à jour de l\'upload preset Cloudinary...\n');

// Configuration du preset mise à jour
const presetConfig = {
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
  path: `/v1_1/${cloudName}/upload_presets/${presetName}`,
  method: 'PUT',
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
      
      if (res.statusCode === 200) {
        console.log('✅ Upload preset mis à jour avec succès !');
        console.log(`📌 Nom: ${response.name}`);
        console.log(`🔧 Mode: ${response.unsigned ? 'Unsigned ✅' : 'Signed ❌'}`);
        console.log(`📁 Dossier: ${response.folder || 'root'}`);
        console.log(`📄 Formats autorisés: ${response.allowed_formats ? response.allowed_formats.join(', ') : 'tous'}`);
        console.log(`📏 Taille max: ${response.max_file_size ? (response.max_file_size / 1024 / 1024).toFixed(1) + 'MB' : 'non définie'}`);
        
        if (response.unsigned) {
          console.log('\n🚀 Configuration parfaite ! Vous pouvez maintenant tester les uploads KYC !');
        } else {
          console.log('\n⚠️ Le preset est encore en mode Signed. Vous devez le configurer manuellement dans le dashboard.');
        }
      } else {
        console.log('❌ Erreur mise à jour preset:', res.statusCode);
        console.log('Détails:', data);
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
