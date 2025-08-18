import React from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, Clock, CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import { CardSubDocument } from '../../services/cardService';

interface VirtualCardMessageProps {
  cardData: CardSubDocument | null;
  cardStatus: 'none' | 'not_requested' | 'pending' | 'processing' | 'completed' | 'rejected' | null;
}

const VirtualCardMessage: React.FC<VirtualCardMessageProps> = ({
  cardData,
  cardStatus
}) => {
  const { t } = useTranslation();

  // Si pas de carte ou statut "none", pas de message
  if (!cardData || cardStatus === 'none' || cardStatus === 'not_requested' || !cardStatus) {
    return null;
  }

  // Message pour carte en cours de traitement
  if (cardStatus === 'pending' || cardStatus === 'processing') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-green-900 mb-1">
              {t('cards.security.cardGeneration.virtual.title')}
            </h4>
            <p className="text-sm text-green-700 mb-2">
              {cardData.adminNotes || t('cards.security.cardGeneration.virtual.description')}
            </p>
            <div className="flex items-center space-x-4 text-xs text-green-600">
              <div className="flex items-center">
                <Smartphone className="w-4 h-4 mr-1" />
                <span>{t('cards.security.cardGeneration.virtual.mobileAvailable')}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{t('cards.security.cardGeneration.virtual.delay')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Message pour carte rejetée
  if (cardStatus === 'rejected') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-red-900 mb-1">
              Demande de carte virtuelle rejetée
            </h4>
            <p className="text-sm text-red-700 mb-2">
              {cardData.adminNotes || 'Votre demande de carte virtuelle a été rejetée. Veuillez contacter le support pour plus d\'informations.'}
            </p>
            <button className="text-xs text-red-600 hover:text-red-800 underline">
              Contacter le support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Message pour carte disponible
  if (cardStatus === 'completed' && cardData.isDisplayed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-green-900 mb-1">
              {t('cards.virtual.available.title')}
            </h4>
            <p className="text-sm text-green-700 mb-2">
              {cardData.adminNotes || t('cards.virtual.available.message')}
            </p>
            <div className="flex items-center space-x-4 text-xs text-green-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>{t('cards.virtual.status.active')}</span>
              </div>
              <div className="flex items-center">
                <Wifi className="w-4 h-4 mr-1" />
                <span>{t('cards.virtual.status.onlinePayments')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VirtualCardMessage;
