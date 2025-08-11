// Configuration Firestore pour migration future
// Ce fichier permet de basculer facilement entre mode simulé et Firestore réel

const FIRESTORE_CONFIG = {
  // Mode actuel : 'simulated' ou 'firestore'
  mode: 'simulated',
  
  // Configuration Firestore (à remplir plus tard)
  firestore: {
    projectId: 'your-project-id',
    apiKey: 'your-api-key',
    authDomain: 'your-project.firebaseapp.com',
    storageBucket: 'your-project.appspot.com',
    messagingSenderId: '123456789',
    appId: 'your-app-id'
  },
  
  // Collections Firestore
  collections: {
    users: 'users',
    notifications: 'notifications',
    accounts: 'accounts',
    transactions: 'transactions'
  }
};

// Fonction pour basculer entre modes
function switchMode(newMode) {
  if (newMode === 'simulated' || newMode === 'firestore') {
    FIRESTORE_CONFIG.mode = newMode;
    console.log(`🔄 Mode basculé vers: ${newMode}`);
    return true;
  }
  console.error('❌ Mode invalide. Utilisez "simulated" ou "firestore"');
  return false;
}

// Fonction pour vérifier le mode actuel
function getCurrentMode() {
  return FIRESTORE_CONFIG.mode;
}

// Fonction pour obtenir la configuration
function getConfig() {
  return FIRESTORE_CONFIG;
}

module.exports = {
  FIRESTORE_CONFIG,
  switchMode,
  getCurrentMode,
  getConfig
}; 