import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Truck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { CardSubDocument } from '../../services/cardService';

interface PhysicalCardMessageProps {
  cardData: CardSubDocument | null;
  cardStatus: 'none' | 'not_requested' | 'pending' | 'processing' | 'completed' | 'rejected' | null;
}

const PhysicalCardMessage: React.FC<PhysicalCardMessageProps> = ({
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              {t('cards.security.cardGeneration.physical.title')}
            </h4>
            <p className="text-sm text-blue-700 mb-2">
              {cardData.adminNotes || t('cards.security.cardGeneration.physical.description')}
            </p>
            <div className="flex items-center space-x-4 text-xs text-blue-600">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                <span>{t('cards.security.cardGeneration.physical.postalDelivery')}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{t('cards.security.cardGeneration.physical.delay')}</span>
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
              Demande de carte rejetée
            </h4>
            <p className="text-sm text-red-700 mb-2">
              {cardData.adminNotes || 'Votre demande de carte physique a été rejetée. Veuillez contacter le support pour plus d\'informations.'}
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
              {t('cards.physical.available.title')}
            </h4>
            <p className="text-sm text-green-700 mb-2">
              {cardData.adminNotes || t('cards.physical.available.message')}
            </p>
            <div className="flex items-center space-x-4 text-xs text-green-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>{t('cards.physical.status.active')}</span>
              </div>
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-1" />
                <span>{t('cards.physical.status.delivered')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PhysicalCardMessage;
