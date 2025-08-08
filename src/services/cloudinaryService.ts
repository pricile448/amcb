// Service Cloudinary pour l'upload des documents KYC
import { logger } from '../utils/logger';

export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

export interface KYCSubmission {
  id: string;
  userId: string;
  documentType: 'identity' | 'address' | 'income' | 'bankStatement';
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerNotes?: string;
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    // Configuration Cloudinary - à remplacer par vos vraies clés
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'kyc-documents';
  }

  /**
   * Upload un fichier vers Cloudinary
   */
  async uploadFile(file: File, folder: string = 'kyc-documents'): Promise<CloudinaryUploadResponse> {
    try {
      logger.debug('CloudinaryService.uploadFile - Début upload:', { fileName: file.name, size: file.size });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', folder);
      formData.append('resource_type', 'auto');

      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur Cloudinary: ${response.status} ${response.statusText}`);
      }

      const result: CloudinaryUploadResponse = await response.json();
      
      logger.success('CloudinaryService.uploadFile - Upload réussi:', {
        publicId: result.public_id,
        url: result.secure_url,
        size: result.bytes
      });

      return result;
    } catch (error) {
      logger.error('CloudinaryService.uploadFile - Erreur upload:', error);
      throw new Error(`Échec de l'upload vers Cloudinary: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Supprimer un fichier de Cloudinary
   */
  async deleteFile(publicId: string): Promise<boolean> {
    try {
      logger.debug('CloudinaryService.deleteFile - Suppression:', publicId);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/delete_by_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: publicId, // Note: En production, vous devriez utiliser un token de suppression sécurisé
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur suppression Cloudinary: ${response.status}`);
      }

      logger.success('CloudinaryService.deleteFile - Suppression réussie:', publicId);
      return true;
    } catch (error) {
      logger.error('CloudinaryService.deleteFile - Erreur suppression:', error);
      return false;
    }
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
   * Obtenir l'URL optimisée pour l'affichage
   */
  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg';
  } = {}): string {
    const { width, height, quality = 80, format = 'auto' } = options;
    
    let url = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    
    // Ajouter les transformations
    const transformations = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    
    if (transformations.length > 0) {
      url += `/${transformations.join(',')}`;
    }
    
    url += `/${publicId}`;
    return url;
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
