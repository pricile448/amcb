// Script pour vérifier les upload presets Cloudinary existants
const https = require('https');

const cloudName = 'dxvbuhadg';
const apiKey = '221933451899525';
const apiSecret = '_-G22OeY5A7QsLbKqr1ll93Cyso';

console.log('🔍 Vérification des upload presets Cloudinary...\n');

// Créer l'authentification Basic
const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

const options = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: `/v1_1/${cloudName}/upload_presets`,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
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
        console.log('✅ Upload presets trouvés :');
        if (response.presets && response.presets.length > 0) {
          response.presets.forEach(preset => {
            console.log(`  📌 ${preset.name} (${preset.unsigned ? 'Unsigned' : 'Signed'})`);
          });
          
          // Vérifier si notre preset existe
          const ourPreset = response.presets.find(p => p.name === 'amcb_kyc_documents');
          if (ourPreset) {
            console.log('\n✅ Le preset "amcb_kyc_documents" existe !');
          } else {
            console.log('\n❌ Le preset "amcb_kyc_documents" n\'existe PAS');
            console.log('📝 Vous devez le créer dans le dashboard Cloudinary');
          }
        } else {
          console.log('  Aucun preset trouvé');
        }
      } else {
        console.log('❌ Erreur API:', res.statusCode, data);
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

req.end();

console.log('\n📋 Instructions pour créer le preset :');
console.log('1. Allez sur https://cloudinary.com/console');
console.log('2. Settings → Upload → Add upload preset');
console.log('3. Preset name: amcb_kyc_documents');
console.log('4. Mode: Unsigned');
console.log('5. Allowed formats: jpg,jpeg,png,pdf');
console.log('6. Max file size: 10MB');
