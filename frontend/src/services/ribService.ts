import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logger } from '../utils/logger';

export interface RibRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Timestamp;
  completedAt?: Timestamp;
  adminNotes?: string;
  ribData?: {
    iban: string;
    bic: string;
    accountHolder: string;
    bankName: string;
    accountType: string;
    isDisplayed: boolean;
  };
}

export interface RibSubDocument {
  iban: string;
  bic: string;
  accountHolder: string;
  bankName: string;
  accountType: string;
  isDisplayed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminNotes?: string;
}

class RibService {
  private readonly USERS_COLLECTION = 'users';

  /**
   * Créer une nouvelle demande de RIB
   */
  async createRibRequest(userId: string): Promise<boolean> {
    try {
      // ✅ S'assurer que l'utilisateur existe d'abord
      const userExists = await this.ensureUserExists(userId);
      if (!userExists) {
        logger.error('Impossible de créer/assurer l\'existence de l\'utilisateur:', userId);
        return false;
      }

      // ✅ Mettre à jour uniquement le document utilisateur (pas de collection séparée)
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const ribSubDoc: RibSubDocument = {
        iban: 'En attente',
        bic: 'AMCBFRPPXXX',
        accountHolder: 'En attente',
        bankName: 'AmCbunq Bank',
        accountType: 'Compte principal',
        isDisplayed: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        adminNotes: 'RIB en cours de génération'
      };

      await updateDoc(userRef, {
        ribData: ribSubDoc,
        ribRequestStatus: 'pending',
        updatedAt: Timestamp.now()
      });
      
      logger.success('Demande RIB créée avec succès pour l\'utilisateur:', userId);
      return true;
    } catch (error) {
      logger.error('Erreur lors de la création de la demande RIB:', error);
      return false;
    }
  }

  /**
   * Récupérer le statut de la demande RIB d'un utilisateur
   */
  async getRibRequestStatus(userId: string): Promise<RibRequest | null> {
    try {
      // ✅ Vérifier uniquement dans le document utilisateur
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.ribRequestStatus) {
          // Retourner un objet compatible avec l'interface RibRequest
          return {
            id: `rib_${userId}`,
            userId,
            status: userData.ribRequestStatus,
            requestedAt: userData.ribData?.createdAt || Timestamp.now(),
            adminNotes: userData.ribData?.adminNotes
          };
        }
      }
      
      return null;
    } catch (error) {
      // En production, ne pas logger les erreurs de permissions pour éviter le spam
      if (import.meta.env.DEV) {
        logger.error('Erreur lors de la récupération du statut RIB:', error);
      }
      return null;
    }
  }

  /**
   * Récupérer le sous-document RIB d'un utilisateur depuis le document users
   */
  async getRibSubDocument(userId: string): Promise<RibSubDocument | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.ribData || null;
      }
      return null;
    } catch (error) {
      logger.error('Erreur lors de la récupération du sous-document RIB:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le statut d'une demande RIB (pour les admins)
   */
  async updateRibRequestStatus(
    userId: string, 
    status: RibRequest['status'], 
    adminId: string,
    adminNotes?: string
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const updateData: any = {
        ribRequestStatus: status,
        updatedAt: Timestamp.now()
      };

      // Si le statut est 'completed', activer l'affichage du RIB
      if (status === 'completed') {
        updateData['ribData.isDisplayed'] = true;
        updateData['ribData.updatedAt'] = Timestamp.now();
      }

      // Ajouter les notes admin si fournies
      if (adminNotes) {
        updateData['ribData.adminNotes'] = adminNotes;
      }

      await updateDoc(userRef, updateData);

      logger.success('Statut de la demande RIB mis à jour:', status);
      return true;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du statut RIB:', error);
      return false;
    }
  }

  /**
   * Mettre à jour le sous-document RIB dans le document utilisateur (pour les admins)
   */
  async updateRibSubDocument(
    userId: string, 
    ribData: Partial<RibSubDocument>
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const updateData = {
        ribData: {
          ...ribData,
          updatedAt: Timestamp.now()
        }
      };

      await updateDoc(userRef, updateData);
      logger.success('Sous-document RIB mis à jour dans users:', userId);
      return true;
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du sous-document RIB:', error);
      return false;
    }
  }

  /**
   * ✅ NOUVEAU: Réinitialiser le RIB à l'état initial (pour les admins)
   */
  async resetRibToInitialState(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // Supprimer complètement les données RIB
      await updateDoc(userRef, {
        ribData: null,
        ribRequestStatus: 'none'
      });
      
      logger.success('RIB réinitialisé à l\'état initial pour l\'utilisateur:', userId);
      return true;
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation du RIB:', error);
      return false;
    }
  }

  /**
   * Vérifier si un utilisateur a une demande RIB en cours
   */
  async hasPendingRibRequest(userId: string): Promise<boolean> {
    try {
      // ✅ Vérifier uniquement dans le document utilisateur
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.ribRequestStatus === 'pending' || userData.ribRequestStatus === 'processing') {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Erreur lors de la vérification des demandes RIB en cours:', error);
      return false;
    }
  }

  /**
   * Récupérer toutes les demandes RIB (pour les admins)
   */
  async getAllRibRequests(): Promise<RibRequest[]> {
    try {
      // ✅ Récupérer tous les utilisateurs qui ont une demande RIB en cours
      const q = query(
        collection(db, this.USERS_COLLECTION),
        where('ribRequestStatus', 'in', ['pending', 'processing'])
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: `rib_${doc.id}`,
          userId: doc.id,
          status: userData.ribRequestStatus,
          requestedAt: userData.ribData?.createdAt || Timestamp.now(),
          adminNotes: userData.ribData?.adminNotes
        } as RibRequest;
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de toutes les demandes RIB:', error);
      return [];
    }
  }

  /**
   * Créer ou mettre à jour l'utilisateur avec les données RIB
   */
  async ensureUserExists(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // ✅ Créer l'utilisateur s'il n'existe pas
        await setDoc(userRef, {
          uid: userId,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        logger.success('Utilisateur créé:', userId);
      }
      
      return true;
    } catch (error) {
      logger.error('Erreur lors de la création de l\'utilisateur:', error);
      return false;
    }
  }
}

export const ribService = new RibService();
