// Types pour les fonctionnalités KYC

/**
 * Types de documents KYC supportés par l'application
 */
export type KYCDocumentType = 'identity' | 'address' | 'income' | 'bankStatement';

/**
 * Statuts possibles pour une vérification KYC
 */
export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

/**
 * Interface pour une soumission de document KYC
 */
export interface KYCSubmission {
  id: string;
  userId: string;
  documentType: KYCDocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  submittedAt: Date;
  status?: KYCStatus;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

/**
 * Interface pour les détails du statut KYC d'un utilisateur
 */
export interface KYCStatusDetails {
  status: KYCStatus;
  lastUpdated: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  documents?: KYCDocumentType[];
}