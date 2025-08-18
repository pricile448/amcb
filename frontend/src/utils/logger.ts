// Logger utilitaire pour gérer les logs selon l'environnement
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  // Logs de débogage - seulement en développement
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('🔍', ...args);
    }
  },

  // Logs d'information - seulement en développement
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.log('ℹ️', ...args);
    }
  },

  // Logs de succès - seulement en développement
  success: (...args: any[]) => {
    if (isDevelopment) {
      console.log('✅', ...args);
    }
  },

  // Logs d'avertissement - seulement en développement
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('⚠️', ...args);
    }
  },

  // Logs d'erreur - toujours affichés (même en production)
  error: (...args: any[]) => {
    console.error('❌', ...args);
  },

  // Logs de groupe - seulement en développement
  group: (label: string, fn: () => void) => {
    if (isDevelopment) {
      console.group('🔍 ' + label);
      fn();
      console.groupEnd();
    }
  }
};

export default logger;

// Fonction pour les logs de debug (uniquement en développement)
export const debugLog = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    console.log(message, ...args);
  }
};

// Fonction pour les logs de debug avec logger (uniquement en développement)
export const debugLogger = (message: string, ...args: any[]) => {
  if (import.meta.env.DEV) {
    logger.debug(message, ...args);
  }
}; 