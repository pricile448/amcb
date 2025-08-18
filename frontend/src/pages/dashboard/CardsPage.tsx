import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Plus, Shield } from 'lucide-react';
import { auth } from '../../config/firebase';
import { cardService, CardSubDocument } from '../../services/cardService';
import { useNotifications } from '../../hooks/useNotifications';
import { logger, debugLog } from '../../utils/logger';
import CardDisplay from '../../components/cards/CardDisplay';
import PhysicalCardMessage from '../../components/cards/PhysicalCardMessage';
import VirtualCardMessage from '../../components/cards/VirtualCardMessage';
import CardsSummary from '../../components/cards/CardsSummary';
import CardsSecurity from '../../components/cards/CardsSecurity';

interface CardData {
  physicalCardData: CardSubDocument | null;
  virtualCardData: CardSubDocument | null;
  physicalCardStatus: 'none' | 'not_requested' | 'pending' | 'processing' | 'completed' | 'rejected' | null;
  virtualCardStatus: 'none' | 'not_requested' | 'pending' | 'processing' | 'completed' | 'rejected' | null;
}

const CardsPage: React.FC = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const [cardData, setCardData] = useState<CardData>({
    physicalCardData: null,
    virtualCardData: null,
    physicalCardStatus: null,        // ✅ Changé de 'none' à null
    virtualCardStatus: null          // ✅ Changé de 'none' à null
  });
  const [requestingPhysical, setRequestingPhysical] = useState(false);
  const [requestingVirtual, setRequestingVirtual] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPhysicalCardDetails, setShowPhysicalCardDetails] = useState(false);
  const [showVirtualCardDetails, setShowVirtualCardDetails] = useState(false);

  // ✅ Réinitialisation forcée des cartes
  const forceResetCards = () => {
    debugLog('🔄 Réinitialisation forcée des cartes...');
    setCardData({
      physicalCardData: null,
      virtualCardData: null,
      physicalCardStatus: null,
      virtualCardStatus: null
    });
    debugLog('✅ État réinitialisé à null');
  };

  // ✅ Charger les données des cartes
  const loadCardData = async () => {
    if (!auth.currentUser) {
      debugLog('❌ Aucun utilisateur connecté');
      return;
    }

    try {
      debugLog('🔄 Début du chargement des données...');
      setLoading(true);
      const userId = auth.currentUser.uid;
              debugLog('👤 ID utilisateur:', userId);

      // ✅ Charger les données des cartes physiques et virtuelles
              debugLog('📥 Chargement des données de cartes...');
      const [physicalData, virtualData] = await Promise.all([
        cardService.getPhysicalCardData(userId),
        cardService.getVirtualCardData(userId)
      ]);

      // ✅ Charger les statuts
              debugLog('📊 Chargement des statuts...');
      const [physicalStatus, virtualStatus] = await Promise.all([
        cardService.getPhysicalCardStatus(userId),
        cardService.getVirtualCardStatus(userId)
      ]);

              debugLog('🔍 Données brutes reçues:', {
        physicalData,
        virtualData,
        physicalStatus,
        virtualStatus
      });

      const newCardData = {
        physicalCardData: physicalData,
        virtualCardData: virtualData,
        // ✅ Gérer les cas où les statuts sont null/undefined
        physicalCardStatus: physicalStatus?.status || null,
        virtualCardStatus: virtualStatus?.status || null
      };

              debugLog('🔄 Mise à jour de l\'état avec:', newCardData);
      setCardData(newCardData);
      
      // ✅ DEBUG: Afficher les données chargées
              debugLog('🔍 Données finales:', {
        physicalData,
        virtualData,
        physicalStatus: physicalStatus?.status,
        virtualStatus: virtualStatus?.status
      });
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données de cartes:', error);
      logger.error('Erreur lors du chargement des données de cartes:', error);
    } finally {
      setLoading(false);
              debugLog('✅ Chargement terminé');
    }
  };

  // ✅ Demander une carte physique
  const handleRequestPhysicalCard = async () => {
    if (!auth.currentUser) {
      showError(t('common.error'), t('cards.errors.noUser'));
      return;
    }

    // ✅ Empêcher les demandes multiples - un utilisateur n'a droit qu'à une seule carte physique
    if (requestingPhysical || cardData.physicalCardStatus === 'pending' || (cardData.physicalCardData && cardData.physicalCardData.cardNumber !== 'En attente')) {
      return;
    }

    setRequestingPhysical(true);
    try {
      // ✅ Mettre à jour l'état local IMMÉDIATEMENT pour éviter le flash
      setCardData(prev => ({
        ...prev,
        physicalCardStatus: 'pending',
        physicalCardData: {
          cardNumber: 'En attente',
          cardType: 'Carte physique',
          expiryDate: 'En attente',
          cvv: 'En attente',
          isActive: false,
          isDisplayed: false,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
          adminNotes: 'Carte physique en cours de génération - Délai 6-14 jours'
        }
      }));

      const success = await cardService.createPhysicalCardRequest(auth.currentUser.uid);

      if (success) {
        showSuccess(
          t('cards.requestPhysical.successTitle') || 'Demande enregistrée',
          t('cards.requestPhysical.successMessage') || 'Votre demande de carte physique a été enregistrée. Elle sera envoyée par voie postale dans 6-14 jours.'
        );

        // ✅ Recharger les vraies données depuis Firestore
        setTimeout(async () => {
          try {
            const realPhysicalData = await cardService.getPhysicalCardData(auth.currentUser!.uid);
            if (realPhysicalData) {
              setCardData(prev => ({
                ...prev,
                physicalCardData: realPhysicalData
              }));
            }
          } catch (error) {
            logger.error('Erreur lors du rechargement des données de carte physique:', error);
          }
        }, 1000);
      } else {
        // ✅ Restaurer l'état précédent en cas d'échec
        setCardData(prev => ({
          ...prev,
          physicalCardStatus: null,        // ✅ Changé de 'none' à null
          physicalCardData: null
        }));
        showError(t('common.error'), t('cards.requestPhysical.errorMessage'));
      }
    } catch (error) {
      console.error('Erreur lors de la demande de carte physique:', error);
      // ✅ Restaurer l'état précédent en cas d'erreur
      setCardData(prev => ({
        ...prev,
        physicalCardStatus: null,        // ✅ Changé de 'none' à null
        physicalCardData: null
      }));
      showError(t('common.error'), t('cards.requestPhysical.errorGeneric'));
    } finally {
      setRequestingPhysical(false);
    }
  };

  // ✅ Demander une carte virtuelle
  const handleRequestVirtualCard = async () => {
    if (!auth.currentUser) {
      showError(t('common.error'), t('cards.errors.noUser'));
      return;
    }

    if (requestingVirtual || cardData.virtualCardStatus === 'pending') {
      return;
    }

    setRequestingVirtual(true);
    try {
      // ✅ Mettre à jour l'état local IMMÉDIATEMENT pour éviter le flash
      setCardData(prev => ({
        ...prev,
        virtualCardStatus: 'pending',
        virtualCardData: {
          cardNumber: 'En attente',
          cardType: 'Carte virtuelle',
          expiryDate: 'En attente',
          cvv: 'En attente',
          isActive: false,
          isDisplayed: false,
          createdAt: new Date() as any,
          updatedAt: new Date() as any,
          adminNotes: 'Carte virtuelle en cours de génération - Délai 24h'
        }
      }));

      const success = await cardService.createVirtualCardRequest(auth.currentUser.uid);

      if (success) {
        showSuccess(
          t('cards.requestVirtual.successTitle') || 'Demande enregistrée',
          t('cards.requestVirtual.successMessage') || 'Votre demande de carte virtuelle a été enregistrée. Elle sera disponible dans 24h.'
        );

        // ✅ Recharger les vraies données depuis Firestore
        setTimeout(async () => {
          try {
            const realVirtualData = await cardService.getVirtualCardData(auth.currentUser!.uid);
            if (realVirtualData) {
              setCardData(prev => ({
                ...prev,
                virtualCardData: realVirtualData
              }));
            }
          } catch (error) {
            logger.error('Erreur lors du rechargement des données de carte virtuelle:', error);
          }
        }, 1000);
      } else {
        // ✅ Restaurer l'état précédent en cas d'échec
        setCardData(prev => ({
          ...prev,
          virtualCardStatus: null,        // ✅ Changé de 'none' à null
          virtualCardData: null
        }));
        showError(t('common.error'), t('cards.requestVirtual.errorMessage'));
      }
    } catch (error) {
      console.error('Erreur lors de la demande de carte virtuelle:', error);
      // ✅ Restaurer l'état précédent en cas d'erreur
      setCardData(prev => ({
        ...prev,
        virtualCardStatus: null,        // ✅ Changé de 'none' à null
        virtualCardData: null
      }));
      showError(t('common.error'), t('cards.requestVirtual.errorGeneric'));
    } finally {
      setRequestingVirtual(false);
    }
  };

  // ✅ Charger les données au montage et lors des changements d'authentification
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadCardData();
      } else {
        setCardData({
          physicalCardData: null,
          virtualCardData: null,
          physicalCardStatus: null,        // ✅ Changé de 'none' à null
          virtualCardStatus: null          // ✅ Changé de 'none' à null
        });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Écran de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>{t('cards.loading')}</span>
        </div>
      </div>
    );
  }

  // ✅ DEBUG: Afficher l'état actuel
  debugLog('🎯 État actuel du composant:', {
    cardData,
    loading,
    requestingPhysical,
    requestingVirtual
  });

  return (
    <div className="space-y-6">
      {/* ✅ En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('cards.title')}</h1>
          <p className="text-gray-600">{t('cards.subtitle')}</p>
        </div>
        

      </div>

      {/* ✅ Résumé des cartes */}
      <CardsSummary
        physicalCardData={cardData.physicalCardData}
        virtualCardData={cardData.virtualCardData}
        physicalCardStatus={cardData.physicalCardStatus}
        virtualCardStatus={cardData.virtualCardStatus}
      />

      {/* ✅ Section des cartes physiques */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('cards.physical.title')}</h2>
        
        {/* Message de la carte physique */}
        <PhysicalCardMessage 
          cardData={cardData.physicalCardData}
          cardStatus={cardData.physicalCardStatus}
        />
        
        {/* Affichage de la carte physique */}
        <CardDisplay
          cardData={cardData.physicalCardData}
          cardStatus={cardData.physicalCardStatus}
          cardType="physical"
          onRequestCard={handleRequestPhysicalCard}
          isRequesting={requestingPhysical}
          showCardDetails={showPhysicalCardDetails}
          onToggleCardDetails={() => setShowPhysicalCardDetails(!showPhysicalCardDetails)}
        />
      </div>

      {/* ✅ Section des cartes virtuelles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('cards.virtual.title')}</h2>
        
        {/* Message de la carte virtuelle */}
        <VirtualCardMessage 
          cardData={cardData.virtualCardData}
          cardStatus={cardData.virtualCardStatus}
        />
        
        {/* Affichage de la carte virtuelle */}
        <CardDisplay
          cardData={cardData.virtualCardData}
          cardStatus={cardData.virtualCardStatus}
          cardType="virtual"
          onRequestCard={handleRequestVirtualCard}
          isRequesting={requestingVirtual}
          showCardDetails={showVirtualCardDetails}
          onToggleCardDetails={() => setShowVirtualCardDetails(!showVirtualCardDetails)}
        />
      </div>

      {/* ✅ Section sécurité */}
      <CardsSecurity />
    </div>
  );
};

export default CardsPage; 