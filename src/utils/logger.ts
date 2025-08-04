// Logger utilitaire pour gérer les logs selon l'environnement
const isDevelopment = import.meta.env.DEV;

export const logger = {
  // Logs de débogage - seulement en développement
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('🔍', ...args);
    }
  },

  // Logs d'information - toujours affichés
  info: (...args: any[]) => {
    console.log('ℹ️', ...args);
  },

  // Logs de succès - toujours affichés
  success: (...args: any[]) => {
    console.log('✅', ...args);
  },

  // Logs d'avertissement - toujours affichés
  warn: (...args: any[]) => {
    console.warn('⚠️', ...args);
  },

  // Logs d'erreur - toujours affichés
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