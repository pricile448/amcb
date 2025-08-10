import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseDataService } from '../services/firebaseData';
import { kycService, KYCStatus } from '../services/kycService';
import { logger } from '../utils/logger';
import { KYC_STATUS, isStatusVerified } from '../constants/kycStatus';

export const useKycSync = () => {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // ✅ OPTIMISÉ: Synchronisation KYC avec gestion d'erreur améliorée
  const syncKycStatus = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) {
        logger.warn('useKycSync: Aucun utilisateur connecté');
        return;
      }

      logger.debug('useKycSync: Synchronisation KYC en cours...');
      
      // ✅ NOUVEAU: Utiliser les constantes KYC
      const status = await kycService.getUserKYCStatus(userId);
      if (status) {
        setKycStatus(status);
        setLastSync(new Date());
        
        // Mettre à jour le localStorage
        localStorage.setItem('kycStatus', JSON.stringify(status));
      }

      logger.debug('useKycSync: Statut KYC synchronisé:', status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de synchronisation KYC';
      setError(errorMessage);
      logger.error('useKycSync: Erreur synchronisation:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NOUVEAU: Mise à jour immédiate après soumission (sans rechargement complet)
  const updateKycStatusImmediately = useCallback((newStatus: KYCStatus) => {
    logger.debug('🔄 useKycSync: Mise à jour immédiate du statut:', newStatus);
    setKycStatus(newStatus);
    setLastSync(new Date()); // Update lastSync
    
    // Mettre à jour le localStorage
    localStorage.setItem('kycStatus', JSON.stringify(newStatus));
  }, []);
  
  // ✅ OPTIMISÉ: Forcer la synchronisation (ignore tous les caches)
  const forceSyncKycStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) {
        logger.warn('useKycSync: Aucun utilisateur connecté');
        return;
      }

      logger.debug('🔄 useKycSync: Force sync en cours...');
      
      // Vider le cache localStorage
      localStorage.removeItem('kycStatus');
      
      // Forcer la synchronisation via FirebaseDataService (ignore cache)
      await FirebaseDataService.forceSyncKycStatus(userId);
      
      // Récupérer le nouveau statut
      const status = await kycService.getUserKYCStatus(userId);
      setKycStatus(status);
      setLastSync(new Date()); // Update lastSync

      // Mettre à jour le localStorage avec le nouveau statut
      if (status) {
        localStorage.setItem('kycStatus', JSON.stringify(status));
      }

      logger.success('🔄 useKycSync: Force sync réussi:', status);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur force sync KYC';
      setError(errorMessage);
      logger.error('🔄 useKycSync: Erreur force sync:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ OPTIMISÉ: Listener Firestore en temps réel avec gestion d'erreur améliorée
  useEffect(() => {
    const userId = FirebaseDataService.getCurrentUserId();
    if (!userId) {
      logger.warn('useKycSync: Aucun utilisateur connecté pour le listener');
      return;
    }

    logger.debug('🔴 useKycSync: Démarrage listener Firestore pour userId:', userId);

    // Créer le listener Firestore pour écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          const kycStatus = userData.kycStatus;
          const kycStatusDetails = userData.kycStatusDetails;

          if (kycStatus) {
            // ✅ Gérer format chaîne simple OU objet complet
            let convertedStatus: KYCStatus;
            
            if (typeof kycStatus === 'string') {
              // Format chaîne simple → utiliser kycStatusDetails si disponible
              if (kycStatusDetails) {
                convertedStatus = {
                  ...kycStatusDetails,
                  status: kycStatus, // S'assurer que le statut principal est correct
                  lastUpdated: kycStatusDetails.lastUpdated?.toDate() || new Date(),
                  submittedAt: kycStatusDetails.submittedAt?.toDate(),
                  approvedAt: kycStatusDetails.approvedAt?.toDate(),
                  rejectedAt: kycStatusDetails.rejectedAt?.toDate(),
                };
              } else {
                // Pas de détails → créer objet simple
                convertedStatus = {
                  status: kycStatus as KYCStatus['status'],
                  lastUpdated: new Date(),
                };
              }
            } else {
              // Format objet complet (ancien format)
              convertedStatus = {
                ...kycStatus,
                lastUpdated: kycStatus.lastUpdated?.toDate() || new Date(),
                submittedAt: kycStatus.submittedAt?.toDate(),
                approvedAt: kycStatus.approvedAt?.toDate(),
                rejectedAt: kycStatus.rejectedAt?.toDate(),
              };
            }

            logger.debug('🔴 useKycSync: Statut KYC mis à jour en temps réel:', convertedStatus);
            
            // ✅ OPTIMISÉ: Mise à jour immédiate sans rechargement
            setKycStatus(convertedStatus);
            setLastSync(new Date()); // Update lastSync
            
            // Mettre à jour le localStorage
            localStorage.setItem('kycStatus', JSON.stringify(convertedStatus));
          } else {
            // Pas de statut KYC → statut par défaut
            const defaultStatus: KYCStatus = {
              status: KYC_STATUS.UNVERIFIED, // ✅ NOUVEAU: Utiliser la constante
              lastUpdated: new Date(),
            };
            setKycStatus(defaultStatus);
            setLastSync(new Date()); // Update lastSync
            localStorage.setItem('kycStatus', JSON.stringify(defaultStatus));
          }
        } else {
          logger.warn('useKycSync: Document utilisateur non trouvé pour le listener');
        }
      },
      (error) => {
        logger.error('useKycSync: Erreur listener Firestore:', error);
        setError('Erreur de connexion en temps réel');
      }
    );

    // ✅ Nettoyer le listener lors du démontage du composant
    return () => {
      logger.debug('🔴 useKycSync: Arrêt listener Firestore pour userId:', userId);
      unsubscribe();
    };
  }, []); // Dépendance vide = s'exécute une seule fois au montage

  // Charger le statut depuis le localStorage au montage (fallback)
  useEffect(() => {
    const savedStatus = localStorage.getItem('kycStatus');
    if (savedStatus) {
      try {
        const parsedStatus = JSON.parse(savedStatus);
        setKycStatus(parsedStatus);
        setLastSync(new Date()); // Update lastSync
      } catch (err) {
        logger.error('useKycSync: Erreur parsing localStorage:', err);
      }
    }
  }, []);

  return {
    kycStatus,
    loading,
    error,
    lastSync, // Export lastSync
    syncKycStatus,
    forceSyncKycStatus,
    updateKycStatusImmediately, // Export updateKycStatusImmediately
    // ✅ NOUVEAU: Utiliser les constantes et fonctions utilitaires
    isVerified: isStatusVerified(kycStatus?.status),
    isPending: kycStatus?.status === KYC_STATUS.PENDING,
    isUnverified: kycStatus?.status === KYC_STATUS.UNVERIFIED || !kycStatus,
    isRejected: kycStatus?.status === KYC_STATUS.REJECTED,
  };
};
