// Service KYC pour la gestion des vérifications d'identité
import { db } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { cloudinaryService, KYCSubmission } from './cloudinaryService';
import { logger } from '../utils/logger';

export interface KYCStatus {
  status: 'unverified' | 'pending' | 'approved' | 'rejected';
  lastUpdated: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface KYCUserData {
  userId: string;
  kycStatus: KYCStatus;
  submissions: KYCSubmission[];
  requiredDocuments: string[];
  completedDocuments: string[];
}

class KYCService {
  /**
   * Soumettre un document KYC
   */
  async submitDocument(
    userId: string, 
    file: File, 
    documentType: KYCSubmission['documentType']
  ): Promise<KYCSubmission> {
    try {
      logger.debug('KYCService.submitDocument - Début soumission:', { 
        userId, 
        documentType, 
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // 1. Validation de base
      if (!userId) {
        throw new Error('ID utilisateur requis');
      }
      if (!file) {
        throw new Error('Fichier requis');
      }
      if (!documentType) {
        throw new Error('Type de document requis');
      }

      // 2. Valider le fichier avec Cloudinary
      const validation = cloudinaryService.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Fichier invalide');
      }

      logger.debug('KYCService.submitDocument - Fichier validé, début upload Cloudinary');

      // 3. Upload vers Cloudinary avec gestion d'erreur détaillée
      let cloudinaryResult;
      try {
        cloudinaryResult = await cloudinaryService.uploadFile(file, `kyc-documents/${userId}`);
        logger.debug('KYCService.submitDocument - Upload Cloudinary réussi:', {
          publicId: cloudinaryResult.public_id,
          url: cloudinaryResult.secure_url
        });
      } catch (cloudinaryError) {
        logger.error('KYCService.submitDocument - Erreur upload Cloudinary:', cloudinaryError);
        throw new Error(`Échec de l'upload vers Cloudinary: ${cloudinaryError instanceof Error ? cloudinaryError.message : 'Erreur inconnue'}`);
      }

      // 4. Créer l'objet de soumission
      const submission: KYCSubmission = {
        id: `${userId}_${documentType}_${Date.now()}`,
        userId,
        documentType,
        cloudinaryUrl: cloudinaryResult.secure_url,
        cloudinaryPublicId: cloudinaryResult.public_id,
        fileName: file.name,
        fileSize: cloudinaryResult.bytes,
        mimeType: file.type,
        status: 'pending',
        submittedAt: new Date(),
      };

      logger.debug('KYCService.submitDocument - Objet soumission créé:', submission.id);

      // 5. Sauvegarder dans Firestore
      try {
        await this.saveSubmission(submission);
        logger.debug('KYCService.submitDocument - Sauvegarde Firestore réussie');
      } catch (firestoreError) {
        logger.error('KYCService.submitDocument - Erreur sauvegarde Firestore:', firestoreError);
        // Si Firestore échoue, supprimer le fichier Cloudinary
        try {
          await cloudinaryService.deleteFile(cloudinaryResult.public_id);
          logger.debug('KYCService.submitDocument - Fichier Cloudinary supprimé après échec Firestore');
        } catch (deleteError) {
          logger.error('KYCService.submitDocument - Erreur suppression fichier Cloudinary:', deleteError);
        }
        throw new Error(`Échec de la sauvegarde: ${firestoreError instanceof Error ? firestoreError.message : 'Erreur inconnue'}`);
      }

      // 6. Mettre à jour le statut KYC de l'utilisateur
      try {
        await this.updateKYCStatus(userId, 'pending');
        logger.debug('KYCService.submitDocument - Statut KYC mis à jour');
      } catch (statusError) {
        logger.error('KYCService.submitDocument - Erreur mise à jour statut KYC:', statusError);
        // Ne pas faire échouer la soumission si la mise à jour du statut échoue
      }

      logger.success('KYCService.submitDocument - Soumission réussie:', submission.id);
      return submission;

    } catch (error) {
      logger.error('KYCService.submitDocument - Erreur soumission:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder une soumission dans Firestore
   */
  private async saveSubmission(submission: KYCSubmission): Promise<void> {
    try {
      const submissionRef = doc(db, 'kycSubmissions', submission.id);
      await setDoc(submissionRef, {
        ...submission,
        submittedAt: serverTimestamp(),
      });

      logger.debug('KYCService.saveSubmission - Sauvegarde réussie:', submission.id);
    } catch (error) {
      logger.error('KYCService.saveSubmission - Erreur sauvegarde:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le statut KYC de l'utilisateur
   */
  async updateKYCStatus(userId: string, status: KYCStatus['status'], rejectionReason?: string): Promise<void> {
    try {
      logger.debug('KYCService.updateKYCStatus - Mise à jour statut:', { userId, status });

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('Utilisateur non trouvé');
      }

      const currentData = userDoc.data();
      
      // Support pour les deux formats : string simple ou objet complexe
      let currentKYCStatus: any;
      if (typeof currentData.kycStatus === 'string') {
        // Format simple : kycStatus est juste une string
        currentKYCStatus = { status: currentData.kycStatus, lastUpdated: new Date() };
      } else {
        // Format complexe : kycStatus est un objet
        currentKYCStatus = currentData.kycStatus || { status: 'unverified', lastUpdated: new Date() };
      }

      const updatedKYCStatus: KYCStatus = {
        ...currentKYCStatus,
        status,
        lastUpdated: new Date(),
      };

      // Ajouter des timestamps spécifiques selon le statut
      switch (status) {
        case 'pending':
          updatedKYCStatus.submittedAt = new Date();
          break;
        case 'approved':
          updatedKYCStatus.approvedAt = new Date();
          break;
        case 'rejected':
          updatedKYCStatus.rejectedAt = new Date();
          updatedKYCStatus.rejectionReason = rejectionReason;
          break;
      }

      // Mettre à jour avec le nouveau format (string simple pour compatibilité)
      await updateDoc(userRef, {
        kycStatus: status,  // Format simple pour compatibilité avec l'UI
        kycStatusDetails: updatedKYCStatus,  // Détails complets si nécessaires
        updatedAt: serverTimestamp(),
      });

      logger.success('KYCService.updateKYCStatus - Statut mis à jour:', { userId, status });
    } catch (error) {
      logger.error('KYCService.updateKYCStatus - Erreur mise à jour:', error);
      throw error;
    }
  }

  /**
   * Récupérer les soumissions KYC d'un utilisateur
   */
  async getUserSubmissions(userId: string): Promise<KYCSubmission[]> {
    try {
      logger.debug('KYCService.getUserSubmissions - Récupération soumissions:', userId);

      const submissionsRef = collection(db, 'kycSubmissions');
      const q = query(
        submissionsRef,
        where('userId', '==', userId),
        orderBy('submittedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const submissions: KYCSubmission[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        submissions.push({
          ...data,
          id: doc.id,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate(),
        } as KYCSubmission);
      });

      logger.debug('KYCService.getUserSubmissions - Soumissions trouvées:', submissions.length);
      return submissions;
    } catch (error) {
      logger.error('KYCService.getUserSubmissions - Erreur récupération:', error);
      throw error;
    }
  }

  /**
   * Récupérer le statut KYC d'un utilisateur
   */
  async getUserKYCStatus(userId: string): Promise<KYCStatus | null> {
    try {
      logger.debug('KYCService.getUserKYCStatus - Récupération statut:', userId);

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        logger.warn('KYCService.getUserKYCStatus - Utilisateur non trouvé:', userId);
        return null;
      }

      const userData = userDoc.data();
      const kycStatus = userData.kycStatus;

      if (!kycStatus) {
        logger.debug('KYCService.getUserKYCStatus - Aucun statut KYC trouvé, retour statut par défaut');
        return {
          status: 'unverified',
          lastUpdated: new Date(),
        };
      }

      // Convertir les timestamps Firestore en Date
      const convertedStatus: KYCStatus = {
        ...kycStatus,
        lastUpdated: kycStatus.lastUpdated?.toDate() || new Date(),
        submittedAt: kycStatus.submittedAt?.toDate(),
        approvedAt: kycStatus.approvedAt?.toDate(),
        rejectedAt: kycStatus.rejectedAt?.toDate(),
      };

      logger.debug('KYCService.getUserKYCStatus - Statut récupéré:', convertedStatus);
      return convertedStatus;
    } catch (error) {
      logger.error('KYCService.getUserKYCStatus - Erreur récupération:', error);
      throw error;
    }
  }

  /**
   * Vérifier si tous les documents requis sont soumis
   */
  async checkRequiredDocuments(userId: string): Promise<{
    required: string[];
    submitted: string[];
    missing: string[];
    isComplete: boolean;
  }> {
    try {
      const requiredDocuments = ['identity', 'address', 'income', 'bankStatement'];
      const submissions = await this.getUserSubmissions(userId);
      
      const submittedTypes = submissions
        .filter(sub => sub.status !== 'rejected')
        .map(sub => sub.documentType);
      
      const missing = requiredDocuments.filter(docType => !submittedTypes.includes(docType as any));
      const isComplete = missing.length === 0;

      return {
        required: requiredDocuments,
        submitted: submittedTypes,
        missing,
        isComplete,
      };
    } catch (error) {
      logger.error('KYCService.checkRequiredDocuments - Erreur vérification:', error);
      throw error;
    }
  }

  /**
   * Supprimer une soumission (et le fichier Cloudinary)
   */
  async deleteSubmission(submissionId: string, userId: string): Promise<boolean> {
    try {
      logger.debug('KYCService.deleteSubmission - Suppression soumission:', submissionId);

      // Récupérer la soumission
      const submissionRef = doc(db, 'kycSubmissions', submissionId);
      const submissionDoc = await getDoc(submissionRef);

      if (!submissionDoc.exists()) {
        throw new Error('Soumission non trouvée');
      }

      const submission = submissionDoc.data() as KYCSubmission;

      // Vérifier que l'utilisateur est propriétaire
      if (submission.userId !== userId) {
        throw new Error('Accès non autorisé');
      }

      // Supprimer le fichier Cloudinary
      await cloudinaryService.deleteFile(submission.cloudinaryPublicId);

      // Supprimer de Firestore
      await setDoc(submissionRef, { deleted: true, deletedAt: serverTimestamp() });

      logger.success('KYCService.deleteSubmission - Suppression réussie:', submissionId);
      return true;
    } catch (error) {
      logger.error('KYCService.deleteSubmission - Erreur suppression:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques KYC
   */
  async getKYCStats(userId: string): Promise<{
    totalSubmissions: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    completionPercentage: number;
  }> {
    try {
      const submissions = await this.getUserSubmissions(userId);
      const total = submissions.length;
      const pending = submissions.filter(s => s.status === 'pending').length;
      const approved = submissions.filter(s => s.status === 'approved').length;
      const rejected = submissions.filter(s => s.status === 'rejected').length;
      
      const { isComplete } = await this.checkRequiredDocuments(userId);
      const completionPercentage = isComplete ? 100 : (approved / 4) * 100;

      return {
        totalSubmissions: total,
        pendingSubmissions: pending,
        approvedSubmissions: approved,
        rejectedSubmissions: rejected,
        completionPercentage: Math.round(completionPercentage),
      };
    } catch (error) {
      logger.error('KYCService.getKYCStats - Erreur statistiques:', error);
      throw error;
    }
  }
}

export const kycService = new KYCService();
export default kycService;
