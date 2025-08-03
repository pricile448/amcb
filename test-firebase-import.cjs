console.log('🔍 Test d\'import Firebase...');

try {
  const { admin, db } = require('./firebase-config.cjs');
  console.log('✅ Import Firebase réussi !');
  console.log('Admin:', admin ? 'OK' : 'ERREUR');
  console.log('DB:', db ? 'OK' : 'ERREUR');
} catch (error) {
  console.error('❌ Erreur import Firebase:', error.message);
} 