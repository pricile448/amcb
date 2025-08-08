// Service KYC simple utilisant un formulaire PHP
import { logger } from '../utils/logger';

export interface SimpleKycSubmission {
  userEmail: string;
  userName: string;
  documentType: 'identity' | 'address' | 'income' | 'bankStatement';
  fileName: string;
  fileSize: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

class SimpleKycService {
  private uploadUrl: string;

  constructor() {
    // URL du formulaire PHP - utiliser un serveur PHP externe en production
    this.uploadUrl = import.meta.env.PROD 
      ? 'https://amcb-kyc-php.onrender.com/' 
      : '/kyc-upload.php';
    
    logger.debug('SimpleKycService - Configuration:', {
      uploadUrl: this.uploadUrl
    });
  }

  /**
   * Soumettre un document KYC via le formulaire PHP
   */
  async submitDocument(
    file: File, 
    documentType: 'identity' | 'address' | 'income' | 'bankStatement',
    userEmail: string,
    userName: string
  ): Promise<SimpleKycSubmission> {
    try {
      // Validation du fichier
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Fichier invalide');
      }

      logger.debug('SimpleKycService.submitDocument - Début soumission:', { 
        fileName: file.name, 
        size: file.size,
        type: file.type,
        documentType,
        userEmail
      });

      // Préparation des données
      const formData = new FormData();
      formData.append('document', file);
      formData.append('documentType', documentType);
      formData.append('userEmail', userEmail);
      formData.append('userName', userName);

      // Envoi au formulaire PHP
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      logger.debug('SimpleKycService.submitDocument - Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de la soumission');
      }

      logger.success('SimpleKycService.submitDocument - Soumission réussie:', {
        fileName: result.fileName,
        userEmail,
        documentType
      });

      // Retourner les données de soumission
      return {
        userEmail,
        userName,
        documentType,
        fileName: result.fileName,
        fileSize: file.size,
        status: 'pending',
        submittedAt: new Date()
      };

    } catch (error) {
      logger.error('SimpleKycService.submitDocument - Erreur soumission:', error);
      throw new Error(`Échec de la soumission KYC: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Soumettre tous les documents KYC
   */
  async submitAllDocuments(
    documents: {
      identity?: File;
      address?: File;
      income?: File;
      bankStatement?: File;
    },
    userEmail: string,
    userName: string
  ): Promise<SimpleKycSubmission[]> {
    const submissions: SimpleKycSubmission[] = [];
    const errors: string[] = [];

    logger.debug('SimpleKycService.submitAllDocuments - Début soumission multiple:', {
      userEmail,
      userName,
      documentTypes: Object.keys(documents)
    });

    // Soumettre chaque document
    for (const [documentType, file] of Object.entries(documents)) {
      if (file) {
        try {
          const submission = await this.submitDocument(
            file,
            documentType as any,
            userEmail,
            userName
          );
          submissions.push(submission);
        } catch (error) {
          const errorMessage = `Erreur lors de la soumission du document ${documentType}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
          errors.push(errorMessage);
          logger.error('SimpleKycService.submitAllDocuments - Erreur document:', errorMessage);
        }
      }
    }

    // Si des erreurs sont survenues, les signaler
    if (errors.length > 0) {
      throw new Error(`Erreurs lors de la soumission: ${errors.join('; ')}`);
    }

    logger.success('SimpleKycService.submitAllDocuments - Toutes les soumissions réussies:', {
      count: submissions.length,
      userEmail
    });

    return submissions;
  }

  /**
   * Valider le type de fichier
   */
  validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'image/heic',
      'image/heif'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: 'Le fichier est trop volumineux (max 10MB)' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Type de fichier non supporté. Utilisez JPG, PNG ou PDF' };
    }

    return { isValid: true };
  }

  /**
   * Obtenir le statut des soumissions
   */
  async getSubmissionStatus(userEmail: string): Promise<SimpleKycSubmission[]> {
    // Pour cette version simple, on retourne un statut par défaut
    // En production, vous pourriez interroger une base de données
    logger.debug('SimpleKycService.getSubmissionStatus - Statut demandé pour:', userEmail);
    
    return [];
  }

  /**
   * Rediriger vers le formulaire PHP
   */
  redirectToKycForm(): void {
    logger.debug('SimpleKycService.redirectToKycForm - Redirection vers le formulaire PHP');
    window.open(this.uploadUrl, '_blank');
  }
}

export const simpleKycService = new SimpleKycService();
export default simpleKycService;
