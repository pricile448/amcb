import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logger } from '../utils/logger';

export interface CardRequest {
  id: string;
  userId: string;
  type: 'physical' | 'virtual';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: Timestamp;
  completedAt?: Timestamp;
  adminNotes?: string;
  cardData?: {
    cardNumber: string;
    cardType: string;
    expiryDate: string;
    cvv: string;
    isActive: boolean;
  };
}

export interface CardSubDocument {
  cardNumber: string;
  cardType: string;
  expiryDate: string;
  cvv: string;
  isActive: boolean;
  isDisplayed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminNotes?: string;
}

class CardService {
  private readonly USERS_COLLECTION = 'users';

  /**
   * Créer une nouvelle demande de carte physique
   */
  async createPhysicalCardRequest(userId: string): Promise<boolean> {
    try {
      // ✅ S'assurer que l'utilisateur existe d'abord
      const userExists = await this.ensureUserExists(userId);
      if (!userExists) {
        logger.error('Impossible de créer/assurer l\'existence de l\'utilisateur:', userId);
        return false;
      }

      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // ✅ Créer la demande de carte comme sous-document dans users/{userId}
      const cardRequest = {
        status: 'pending',
        requestedAt: Timestamp.now(),
        adminNotes: 'Demande de carte physique en attente de traitement'
      };

      // ✅ Mettre à jour le document utilisateur avec les données de carte ET la demande
      const cardSubDoc: CardSubDocument = {
        cardNumber: 'En attente',
        cardType: 'Carte physique',
        expiryDate: 'En attente',
        cvv: 'En attente',
        isActive: false,
        isDisplayed: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        adminNotes: 'Carte physique en cours de génération - Délai 6-14 jours'
      };

      await updateDoc(userRef, {
        physicalCardData: cardSubDoc,
        physicalCardStatus: 'pending',
        'cardRequests.physical': cardRequest,
        updatedAt: Timestamp.now()
      });
      
      logger.success('Demande de carte physique créée avec succès dans users:', userId);
      return true;
    } catch (error) {
      logger.error('Erreur lors de la création de la demande de carte physique:', error);
      return false;
    }
  }

  /**
   * Créer une nouvelle demande de carte virtuelle
   */
  async createVirtualCardRequest(userId: string): Promise<boolean> {
    try {
      // ✅ S'assurer que l'utilisateur existe d'abord
      const userExists = await this.ensureUserExists(userId);
      if (!userExists) {
        logger.error('Impossible de créer/assurer l\'existence de l\'utilisateur:', userId);
        return false;
      }

      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // ✅ Créer la demande de carte comme sous-document dans users/{userId}
      const cardRequest = {
        status: 'pending',
        requestedAt: Timestamp.now(),
        adminNotes: 'Demande de carte virtuelle en attente de traitement'
      };

      // ✅ Mettre à jour le document utilisateur avec les données de carte virtuelle ET la demande
      const cardSubDoc: CardSubDocument = {
        cardNumber: 'En attente',
        cardType: 'Carte virtuelle',
        expiryDate: 'En attente',
        cvv: 'En attente',
        isActive: false,
        isDisplayed: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        adminNotes: 'Carte virtuelle en cours de génération - Délai 24h'
      };

      await updateDoc(userRef, {
        virtualCardData: cardSubDoc,
        virtualCardStatus: 'pending',
        'cardRequests.virtual': cardRequest,
        updatedAt: Timestamp.now()
      });
      
      logger.success('Demande de carte virtuelle créée avec succès dans users:', userId);
      return true;
    } catch (error) {
      logger.error('Erreur lors de la création de la demande de carte virtuelle:', error);
      return false;
    }
  }

  /**
   * Récupérer le statut de la demande de carte physique d'un utilisateur
   */
  async getPhysicalCardStatus(userId: string): Promise<CardRequest | null> {
    try {
      // ✅ Vérifier dans le document utilisateur
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.physicalCardStatus) {
          return {
            id: `card_physical_${userId}`,
            userId,
            type: 'physical',
            status: userData.physicalCardStatus,
            requestedAt: userData.cardRequests?.physical?.requestedAt || userData.physicalCardData?.createdAt || Timestamp.now(),
            adminNotes: userData.cardRequests?.physical?.adminNotes || userData.physicalCardData?.adminNotes
          };
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Erreur lors de la récupération du statut de carte physique:', error);
      return null;
    }
  }

  /**
   * Récupérer le statut de la demande de carte virtuelle d'un utilisateur
   */
  async getVirtualCardStatus(userId: string): Promise<CardRequest | null> {
    try {
      // ✅ Vérifier dans le document utilisateur
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.virtualCardStatus) {
          return {
            id: `card_virtual_${userId}`,
            userId,
            type: 'virtual',
            status: userData.virtualCardStatus,
            requestedAt: userData.cardRequests?.virtual?.requestedAt || userData.virtualCardData?.createdAt || Timestamp.now(),
            adminNotes: userData.cardRequests?.virtual?.adminNotes || userData.virtualCardData?.adminNotes
          };
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Erreur lors de la récupération du statut de carte virtuelle:', error);
      return null;
    }
  }

  /**
   * Récupérer les données de carte physique depuis le document utilisateur
   */
  async getPhysicalCardData(userId: string): Promise<CardSubDocument | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.physicalCardData || null;
      }
      return null;
    } catch (error) {
      logger.error('Erreur lors de la récupération des données de carte physique:', error);
      return null;
    }
  }

  /**
   * Récupérer les données de carte virtuelle depuis le document utilisateur
   */
  async getVirtualCardData(userId: string): Promise<CardSubDocument | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.virtualCardData || null;
      }
      return null;
    } catch (error) {
      logger.error('Erreur lors de la récupération des données de carte virtuelle:', error);
      return null;
    }
  }

  /**
   * Mettre à jour le statut d'une demande de carte (pour les admins)
   */
  async updateCardRequestStatus(
    userId: string,
    cardType: 'physical' | 'virtual',
    status: 'pending' | 'processing' | 'completed' | 'rejected',
    adminId: string,
    adminNotes?: string
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // ✅ Mettre à jour le statut dans le document utilisateur
      const updateData: any = {
        [`${cardType}CardStatus`]: status,
        updatedAt: Timestamp.now()
      };

      // ✅ Mettre à jour la demande de carte dans cardRequests
      if (status === 'completed') {
        updateData[`cardRequests.${cardType}.completedAt`] = Timestamp.now();
      }
      
      if (adminNotes) {
        updateData[`cardRequests.${cardType}.adminNotes`] = adminNotes;
      }

      await updateDoc(userRef, updateData);
      logger.success(`Statut de la carte ${cardType} mis à jour:`, status);
      return true;
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour du statut de carte ${cardType}:`, error);
      return false;
    }
  }

  /**
   * Mettre à jour les données de carte dans le document utilisateur (pour les admins)
   */
  async updateCardData(
    userId: string, 
    cardType: 'physical' | 'virtual',
    cardData: Partial<CardSubDocument>
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const updateData = {
        [`${cardType}CardData`]: {
          ...cardData,
          updatedAt: Timestamp.now()
        }
      };

      await updateDoc(userRef, updateData);
      logger.success(`Données de carte ${cardType} mises à jour dans users:`, userId);
      return true;
    } catch (error) {
      logger.error(`Erreur lors de la mise à jour des données de carte ${cardType}:`, error);
      return false;
    }
  }

  /**
   * ✅ NOUVEAU: Activer une carte virtuelle (pour les admins)
   * Cette méthode met à jour le statut et affiche la carte à l'utilisateur
   */
  async activateVirtualCard(
    userId: string,
    cardDetails: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
      adminNotes?: string;
    }
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // ✅ Mettre à jour le sous-document avec les vraies données de la carte
      const updatedCardData: CardSubDocument = {
        cardNumber: cardDetails.cardNumber,
        cardType: 'Carte virtuelle',
        expiryDate: cardDetails.expiryDate,
        cvv: cardDetails.cvv,
        isActive: true,
        isDisplayed: true, // ✅ Afficher la carte à l'utilisateur
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        adminNotes: cardDetails.adminNotes || 'Carte virtuelle activée et disponible'
      };

      // ✅ Mettre à jour le statut et les données de la carte
      await updateDoc(userRef, {
        virtualCardData: updatedCardData,
        virtualCardStatus: 'completed',
        'cardRequests.virtual.status': 'completed',
        'cardRequests.virtual.completedAt': Timestamp.now(),
        'cardRequests.virtual.adminNotes': cardDetails.adminNotes || 'Carte virtuelle activée et disponible',
        updatedAt: Timestamp.now()
      });
      
      logger.success('Carte virtuelle activée pour l\'utilisateur:', userId);
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'activation de la carte virtuelle:', error);
      return false;
    }
  }

  /**
   * ✅ NOUVEAU: Activer une carte physique (pour les admins)
   * Cette méthode met à jour le statut et affiche la carte à l'utilisateur
   */
  async activatePhysicalCard(
    userId: string,
    cardDetails: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
      adminNotes?: string;
    }
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // ✅ Mettre à jour le sous-document avec les vraies données de la carte
      const updatedCardData: CardSubDocument = {
        cardNumber: cardDetails.cardNumber,
        cardType: 'Carte physique',
        expiryDate: cardDetails.expiryDate,
        cvv: cardDetails.cvv,
        isActive: true,
        isDisplayed: true, // ✅ Afficher la carte à l'utilisateur
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        adminNotes: cardDetails.adminNotes || 'Carte physique activée et disponible'
      };

      // ✅ Mettre à jour le statut et les données de la carte
      await updateDoc(userRef, {
        physicalCardData: updatedCardData,
        physicalCardStatus: 'completed',
        'cardRequests.physical.status': 'completed',
        'cardRequests.physical.completedAt': Timestamp.now(),
        'cardRequests.physical.adminNotes': cardDetails.adminNotes || 'Carte physique activée et disponible',
        updatedAt: Timestamp.now()
      });
      
      logger.success('Carte physique activée pour l\'utilisateur:', userId);
      return true;
    } catch (error) {
      logger.error('Erreur lors de l\'activation de la carte physique:', error);
      return false;
    }
  }

  /**
   * Réinitialiser les données de carte à l'état initial (pour les admins)
   */
  async resetCardToInitialState(
    userId: string, 
    cardType: 'physical' | 'virtual'
  ): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // Supprimer complètement les données de carte et la demande
      await updateDoc(userRef, {
        [`${cardType}CardData`]: null,
        [`${cardType}CardStatus`]: null,
        [`cardRequests.${cardType}`]: null,
        updatedAt: Timestamp.now()
      });
      
      logger.success(`Carte ${cardType} réinitialisée à l'état initial pour l'utilisateur:`, userId);
      return true;
    } catch (error) {
      logger.error(`Erreur lors de la réinitialisation de la carte ${cardType}:`, error);
      return false;
    }
  }

  /**
   * ✅ NOUVEAU: Réinitialiser TOUTES les cartes d'un utilisateur à l'état initial
   */
  async resetAllCardsToInitialState(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      // Supprimer complètement TOUS les champs de cartes
      await updateDoc(userRef, {
        physicalCardData: null,
        physicalCardStatus: null,
        virtualCardData: null,
        virtualCardStatus: null,
        cardRequests: null,
        updatedAt: Timestamp.now()
      });
      
      logger.success(`Toutes les cartes réinitialisées à l'état initial pour l'utilisateur:`, userId);
      return true;
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation de toutes les cartes:', error);
      return false;
    }
  }

  /**
   * ✅ NOUVEAU: Vérifier si un utilisateur a des données de cartes
   */
  async hasAnyCardData(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return false;
      }
      
      const userData = userSnap.data();
      
      // Vérifier s'il y a des données de cartes
      return !!(
        userData.physicalCardData ||
        userData.virtualCardData ||
        userData.physicalCardStatus ||
        userData.virtualCardStatus ||
        userData.cardRequests
      );
    } catch (error) {
      logger.error('Erreur lors de la vérification des données de cartes:', error);
      return false;
    }
  }

  /**
   * Vérifier si un utilisateur a une demande de carte en cours
   */
  async hasPendingCardRequest(userId: string, cardType: 'physical' | 'virtual'): Promise<boolean> {
    try {
      // ✅ Vérifier dans le document utilisateur
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const statusField = `${cardType}CardStatus`;
        if (userData[statusField] === 'pending' || userData[statusField] === 'processing') {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.error(`Erreur lors de la vérification des demandes de carte ${cardType} en cours:`, error);
      return false;
    }
  }

  /**
   * Récupérer toutes les demandes de cartes (pour les admins)
   */
  async getAllCardRequests(): Promise<CardRequest[]> {
    try {
      // ✅ Maintenant on récupère depuis la collection users
      const usersRef = collection(db, this.USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);
      
      const allRequests: CardRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const userId = doc.id;
        
        // Vérifier les cartes physiques
        if (userData.physicalCardStatus && userData.physicalCardStatus !== 'none') {
          allRequests.push({
            id: `card_physical_${userId}`,
            userId,
            type: 'physical',
            status: userData.physicalCardStatus,
            requestedAt: userData.cardRequests?.physical?.requestedAt || userData.physicalCardData?.createdAt || Timestamp.now(),
            completedAt: userData.cardRequests?.physical?.completedAt,
            adminNotes: userData.cardRequests?.physical?.adminNotes || userData.physicalCardData?.adminNotes
          });
        }
        
        // Vérifier les cartes virtuelles
        if (userData.virtualCardStatus && userData.virtualCardStatus !== 'none') {
          allRequests.push({
            id: `card_virtual_${userId}`,
            userId,
            type: 'virtual',
            status: userData.virtualCardStatus,
            requestedAt: userData.cardRequests?.virtual?.requestedAt || userData.virtualCardData?.createdAt || Timestamp.now(),
            completedAt: userData.cardRequests?.virtual?.completedAt,
            adminNotes: userData.cardRequests?.virtual?.adminNotes || userData.virtualCardData?.adminNotes
          });
        }
      });
      
      return allRequests;
    } catch (error) {
      logger.error('Erreur lors de la récupération de toutes les demandes de cartes:', error);
      return [];
    }
  }

  /**
   * Créer ou mettre à jour l'utilisateur avec les données de carte
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

export const cardService = new CardService();
