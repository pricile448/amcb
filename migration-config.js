/**
 * Configuration de Migration des Utilisateurs Existants
 * 
 * Modifiez ce fichier avec vos informations Firebase avant de lancer la migration
 */

module.exports = {
  // Configuration Firebase - REMPLACEZ par vos vraies valeurs
  firebase: {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  },

  // Configuration de la migration
  migration: {
    // Mode test sans modification (true = test, false = vraie migration)
    dryRun: true,
    
    // Nombre d'utilisateurs traités par lot
    batchSize: 50,
    
    // Créer une sauvegarde avant migration
    backupBeforeMigration: true,
    
    // Ne pas écraser les documents existants
    skipExistingDocuments: true,
    
    // Niveau de log ('debug', 'info', 'warn', 'error')
    logLevel: 'info',
    
    // Pause entre les lots (en millisecondes)
    pauseBetweenBatches: 1000,
    
    // Collections à migrer
    collections: {
      accounts: true,
      beneficiaries: true,
      budgets: true,
      billing: true,
      cardLimits: true,
      documents: true,
      notifications: true,
      transactions: true,
      transfers: true
    }
  },

  // Configuration des données par défaut
  defaultData: {
    // Préférences de notifications par défaut
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    
    // Limites de cartes par défaut
    cardLimits: {
      daily: 1000,
      monthly: 5000,
      yearly: 50000
    },
    
    // Types de comptes par défaut
    accountTypes: ['current', 'savings'],
    
    // Devises par défaut
    defaultCurrency: 'EUR'
  },

  // Configuration de sécurité
  security: {
    // Vérifier les permissions avant migration
    checkPermissions: true,
    
    // Limiter le nombre de documents créés par utilisateur
    maxDocumentsPerUser: 20,
    
    // Timeout pour les opérations (en millisecondes)
    operationTimeout: 30000
  }
};
