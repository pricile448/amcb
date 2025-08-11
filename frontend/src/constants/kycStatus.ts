/**
 * Constantes pour les statuts KYC
 * Harmonise les statuts entre le backend (Firestore) et l'interface utilisateur
 */

export const KYC_STATUS = {
  // Statuts backend (Firestore)
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const KYC_STATUS_LABELS = {
  // Labels d'interface (français)
  [KYC_STATUS.UNVERIFIED]: 'Non vérifié',
  [KYC_STATUS.PENDING]: 'En attente',
  [KYC_STATUS.APPROVED]: 'Vérifié',
  [KYC_STATUS.REJECTED]: 'Rejeté',
} as const;

export const KYC_STATUS_COLORS = {
  // Couleurs d'interface
  [KYC_STATUS.UNVERIFIED]: 'blue',
  [KYC_STATUS.PENDING]: 'yellow',
  [KYC_STATUS.APPROVED]: 'green',
  [KYC_STATUS.REJECTED]: 'red',
} as const;

export const KYC_STATUS_ICONS = {
  // Icônes d'interface
  [KYC_STATUS.UNVERIFIED]: 'AlertCircle',
  [KYC_STATUS.PENDING]: 'Clock',
  [KYC_STATUS.APPROVED]: 'CheckCircle',
  [KYC_STATUS.REJECTED]: 'XCircle',
} as const;

// Type pour TypeScript
export type KYCStatusType = typeof KYC_STATUS[keyof typeof KYC_STATUS];

// Fonction utilitaire pour vérifier si un statut est "vérifié"
export const isStatusVerified = (status: KYCStatusType | undefined): boolean => {
  return status === KYC_STATUS.APPROVED;
};

// Fonction utilitaire pour obtenir le label d'un statut
export const getStatusLabel = (status: KYCStatusType): string => {
  return KYC_STATUS_LABELS[status] || 'Statut inconnu';
};

// Fonction utilitaire pour obtenir la couleur d'un statut
export const getStatusColor = (status: KYCStatusType): string => {
  return KYC_STATUS_COLORS[status] || 'gray';
};
