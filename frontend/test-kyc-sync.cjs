const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Test de synchronisation KYC...\n');

// Vérifier que nous sommes dans le bon répertoire
if (!fs.existsSync('src/hooks/useNotifications.ts')) {
  console.error('❌ Veuillez exécuter ce script depuis le répertoire frontend');
  process.exit(1);
}

console.log('✅ Répertoire correct détecté');

// Instructions pour l'utilisateur
console.log('\n📋 INSTRUCTIONS POUR FORCER LA SYNCHRONISATION KYC :');
console.log('1. Ouvrez la console du navigateur (F12)');
console.log('2. Exécutez cette commande :');
console.log('   window.location.reload(true);');
console.log('3. Ou utilisez cette commande pour forcer la synchronisation :');
console.log('   localStorage.clear(); window.location.reload();');

console.log('\n🔧 ALTERNATIVE - Script de débogage :');
console.log('1. Ouvrez la console du navigateur');
console.log('2. Exécutez :');
console.log('   console.log("Statut KYC actuel:", JSON.parse(localStorage.getItem("user"))?.verificationStatus);');
console.log('3. Pour forcer la synchronisation :');
console.log('   FirebaseDataService.clearCache(); window.location.reload();');

console.log('\n🎯 SOLUTION RAPIDE :');
console.log('1. Videz le cache du navigateur (Ctrl+Shift+R)');
console.log('2. Ou utilisez le mode navigation privée');
console.log('3. Reconnectez-vous à l\'application');

console.log('\n✅ Le statut KYC devrait maintenant afficher "pending" !'); 