/**
 * Utilitaires pour la gestion des dates dans l'application
 */
import { logger } from './logger';

/**
 * Convertit une date Firestore en objet Date JavaScript
 * Gère tous les formats possibles de dates Firestore
 */
export function parseFirestoreDate(dateValue: any): Date {
  if (!dateValue) {
    return new Date();
  }

  try {
    // Si c'est un Timestamp Firestore avec toDate()
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    // Si c'est déjà un objet Date
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // Si c'est un objet avec seconds (Timestamp Firestore)
    if (dateValue.seconds && typeof dateValue.seconds === 'number') {
      return new Date(dateValue.seconds * 1000);
    }
    
    // Si c'est un objet avec _seconds (ancien format)
    if (dateValue._seconds && typeof dateValue._seconds === 'number') {
      return new Date(dateValue._seconds * 1000);
    }
    
    // Si c'est une chaîne de caractères
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    // Si c'est un timestamp numérique
    if (typeof dateValue === 'number') {
      // Si c'est en millisecondes
      if (dateValue > 1000000000000) {
        return new Date(dateValue);
      }
      // Si c'est en secondes
      else {
        return new Date(dateValue * 1000);
      }
    }
    
    // Fallback
    return new Date();
  } catch (error) {
    console.warn('Erreur lors de la conversion de date:', error, 'Valeur:', dateValue);
    return new Date();
  }
}

/**
 * Formate une date pour l'affichage dans l'interface
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'time' | 'datetime' = 'short'): string {
  if (!date || isNaN(date.getTime())) {
    return 'Date invalide';
  }

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

  switch (format) {
    case 'time':
      return date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    
    case 'datetime':
      if (isToday) {
        return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (isYesterday) {
        return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
      } else {
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    
    case 'long':
      return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    
    case 'short':
    default:
      if (isToday) {
        return `Aujourd'hui`;
      } else if (isYesterday) {
        return `Hier`;
      } else {
        return date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
      }
  }
}

/**
 * Formate un montant avec la devise
 */
export function formatAmount(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Formate un montant sans devise (juste le nombre)
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('fr-FR').format(number);
} 

/**
 * Tronque le nom complet de l'utilisateur pour l'affichage mobile
 * @param firstName - Prénom de l'utilisateur
 * @param lastName - Nom de famille de l'utilisateur
 * @param isMobile - Si on est sur mobile
 * @returns Nom tronqué pour l'affichage
 */
export const truncateUserName = (firstName: string, lastName: string, isMobile: boolean = false): string => {
  if (!firstName && !lastName) return 'Client AmCbunq';
  
  const first = firstName || 'Client';
  const last = lastName || 'AmCbunq';
  
  if (isMobile) {
    // Sur mobile : prénom complet + première lettre du nom
    return `${first} ${last.charAt(0)}.`;
  }
  
  // Sur desktop : nom complet, mais tronquer si trop long
  const fullName = `${first} ${last}`;
  if (fullName.length > 20) {
    // Si le nom complet est trop long, utiliser le format mobile même sur desktop
    return `${first} ${last.charAt(0)}.`;
  }
  
  return fullName;
};

/**
 * Tronque agressivement le nom de l'utilisateur pour les espaces très limités
 * @param firstName - Prénom de l'utilisateur
 * @param lastName - Nom de famille de l'utilisateur
 * @returns Nom très court pour l'affichage
 */
export const truncateUserNameAggressive = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) return 'Client A.';
  
  const first = firstName || 'Client';
  const last = lastName || 'AmCbunq';
  
  // Version courte : prénom complet + première lettre du nom (pas juste les initiales)
  return `${first} ${last.charAt(0)}.`;
};

/**
 * Tronque les libellés de transactions pour éviter qu'ils soient trop longs
 * @param description - Description de la transaction
 * @param maxLength - Longueur maximale (défaut: 30 caractères)
 * @returns Description tronquée
 */
export const truncateTransactionDescription = (description: string, maxLength: number = 30): string => {
  if (!description) return 'Transaction';
  
  if (description.length <= maxLength) {
    return description;
  }
  
  // Tronquer et ajouter "..."
  return description.substring(0, maxLength - 3) + '...';
};

/**
 * Détecte si l'écran est mobile
 * @returns true si l'écran est considéré comme mobile
 */
export const isMobileScreen = (): boolean => {
  // Vérifier si window est défini (pour éviter les erreurs SSR)
  if (typeof window === 'undefined') return false;
  
  // Utiliser plusieurs critères pour détecter mobile
  const isMobile = window.innerWidth < 768 || 
                   window.innerWidth < 1024 && window.innerHeight > window.innerWidth ||
                   /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Debug: afficher les informations de détection
  logger.debug('Mobile detection:', {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    userAgent: navigator.userAgent,
    isMobile: isMobile
  });
  
  return isMobile;
};

/**
 * Formate un nom d'utilisateur pour l'affichage avec détection automatique mobile
 * @param firstName - Prénom de l'utilisateur
 * @param lastName - Nom de famille de l'utilisateur
 * @returns Nom formaté selon la taille d'écran
 */
export const formatUserNameForDisplay = (firstName: string, lastName: string): string => {
  const isMobile = isMobileScreen();
  const fullName = `${firstName || 'Client'} ${lastName || 'AmCbunq'}`;
  
  let result: string;
  
  // Si le nom est très long (> 25 caractères), utiliser la troncature agressive
  if (fullName.length > 25) {
    result = truncateUserNameAggressive(firstName, lastName);
  } else {
    result = truncateUserName(firstName, lastName, isMobile);
  }
  
  // Debug: afficher les informations de troncature
  logger.debug('User name formatting:', {
    firstName,
    lastName,
    isMobile,
    fullNameLength: fullName.length,
    result
  });
  
  return result;
}; 