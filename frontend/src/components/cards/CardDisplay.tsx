import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Clock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { CardSubDocument } from '../../services/cardService';

interface CardDisplayProps {
  cardData: CardSubDocument | null;
  cardStatus: 'none' | 'not_requested' | 'pending' | 'processing' | 'completed' | 'rejected' | null;
  cardType: 'physical' | 'virtual';
  onRequestCard: () => void;
  isRequesting: boolean;
  showCardDetails?: boolean;
  onToggleCardDetails?: () => void;
}

const CardDisplay: React.FC<CardDisplayProps> = ({
  cardData,
  cardStatus,
  cardType,
  onRequestCard,
  isRequesting,
  showCardDetails = false,
  onToggleCardDetails
}) => {
  const { t } = useTranslation();
  const isPhysical = cardType === 'physical';
  const isVirtual = cardType === 'virtual';

  // Fonction pour masquer partiellement le numéro de carte
  const maskCardNumber = (cardNumber: string) => {
    if (cardNumber === 'En attente') return cardNumber;
    if (cardNumber.length < 8) return cardNumber;
    return `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}`;
  };

  // Fonction pour masquer le CVV
  const maskCVV = (cvv: string) => {
    if (cvv === 'En attente') return cvv;
    return '***';
  };

  // ✅ NOUVEAU: Rendu pour l'état initial (quand les champs n'existent pas)
  if (!cardStatus || cardStatus === undefined || cardStatus === null) {
    return (
      <div className="text-center py-8">
        <CreditCard className={`w-16 h-16 mx-auto mb-4 ${isPhysical ? 'text-blue-400' : 'text-green-400'}`} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t(`cards.${cardType}.noCard`)}
        </h3>
        <p className="text-gray-600 mb-4">
          {t(`cards.${cardType}.noCardDesc`)}
        </p>
        <button
          onClick={onRequestCard}
          disabled={isRequesting}
          className={`inline-flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 ${
            isPhysical ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isPhysical 
            ? t('cards.requestPhysical.firstCard')
            : t('cards.requestVirtual.button')
          }
        </button>
      </div>
    );
  }

  // ✅ NOUVEAU: Rendu pour l'état "none" (quand le statut est explicitement "none")
  if (cardStatus === 'none') {
    return (
      <div className="text-center py-8">
        <CreditCard className={`w-16 h-16 mx-auto mb-4 ${isPhysical ? 'text-blue-400' : 'text-green-400'}`} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t(`cards.${cardType}.noCard`)}
        </h3>
        <p className="text-gray-600 mb-4">
          {t(`cards.${cardType}.noCardDesc`)}
        </p>
        <button
          onClick={onRequestCard}
          disabled={isRequesting}
          className={`inline-flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 ${
            isPhysical ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isPhysical 
            ? t('cards.requestPhysical.firstCard')
            : t('cards.requestVirtual.button')
          }
        </button>
      </div>
    );
  }

  // ✅ NOUVEAU: Rendu pour l'état "not_requested" (équivalent à "none")
  if (cardStatus === 'not_requested') {
    return (
      <div className="text-center py-8">
        <CreditCard className={`w-16 h-16 mx-auto mb-4 ${isPhysical ? 'text-blue-400' : 'text-green-400'}`} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t(`cards.${cardType}.noCard`)}
        </h3>
        <p className="text-gray-600 mb-4">
          {t(`cards.${cardType}.noCardDesc`)}
        </p>
        <button
          onClick={onRequestCard}
          disabled={isRequesting}
          className={`inline-flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 ${
            isPhysical ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          {isPhysical 
            ? t('cards.requestPhysical.firstCard')
            : t('cards.requestVirtual.button')
          }
        </button>
      </div>
    );
  }

  // Rendu pour l'état "en cours de traitement"
  if (cardStatus === 'pending' || cardStatus === 'processing') {
    return (
      <div className="text-center py-8">
        <Clock className={`w-16 h-16 mx-auto mb-4 ${isPhysical ? 'text-blue-500' : 'text-green-500'}`} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t(`cards.${cardType}.processing.title`)}
        </h3>
        <p className="text-gray-600 mb-4">
          {t(`cards.${cardType}.processing.description`)}
        </p>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          isPhysical ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
        }`}>
          <Clock className="w-4 h-4 mr-2" />
          {t(`cards.${cardType}.processing.status`)}
        </div>
      </div>
    );
  }

  // Rendu pour l'état "carte disponible"
  if (cardData && cardData.isDisplayed && cardStatus === 'completed') {
    return (
      <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">
            {t(`cards.${cardType}.cardDetails`)}
          </h3>
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('cards.status.active')}
          </span>
        </div>
        
        {/* Message de disponibilité */}
        <div className={`mb-4 p-3 rounded-lg ${
          isPhysical ? 'bg-blue-50 border border-blue-200' : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center">
            <CheckCircle className={`w-5 h-5 mr-2 ${isPhysical ? 'text-blue-600' : 'text-green-600'}`} />
            <div>
              <p className="text-sm font-medium text-gray-800">
                {t(`cards.${cardType}.available.title`)}
              </p>
              <p className="text-xs text-gray-600">
                {t(`cards.${cardType}.available.message`)}
              </p>
            </div>
          </div>
        </div>

        {/* Détails de la carte */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">
              {t(`cards.${cardType}.cardNumber`)}:
            </span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm">
                {showCardDetails ? cardData.cardNumber : maskCardNumber(cardData.cardNumber)}
              </span>
              {onToggleCardDetails && (
                <button
                  onClick={onToggleCardDetails}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showCardDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">
              {t(`cards.${cardType}.expiryDate`)}:
            </span>
            <span className="text-sm font-medium">
              {cardData.expiryDate}
            </span>
          </div>

          {isVirtual && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">CVV:</span>
              <span className="font-mono text-sm">
                {showCardDetails ? cardData.cvv : maskCVV(cardData.cvv)}
              </span>
            </div>
          )}
        </div>

        {/* Notes d'administration si disponibles */}
        {cardData.adminNotes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> {cardData.adminNotes}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Rendu pour l'état "rejeté"
  if (cardStatus === 'rejected') {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Demande rejetée
        </h3>
        <p className="text-gray-600 mb-4">
          Votre demande de carte a été rejetée. Veuillez contacter le support pour plus d'informations.
        </p>
        <button
          onClick={onRequestCard}
          disabled={isRequesting}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Nouvelle demande
        </button>
      </div>
    );
  }

  // État par défaut - retourner l'état initial
  return (
    <div className="text-center py-8">
      <CreditCard className={`w-16 h-16 mx-auto mb-4 ${isPhysical ? 'text-blue-400' : 'text-green-400'}`} />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {t(`cards.${cardType}.noCard`)}
      </h3>
      <p className="text-gray-600 mb-4">
        {t(`cards.${cardType}.noCardDesc`)}
      </p>
      <button
        onClick={onRequestCard}
        disabled={isRequesting}
        className={`inline-flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 ${
          isPhysical ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {isPhysical 
          ? t('cards.requestPhysical.firstCard')
          : t('cards.requestVirtual.button')
        }
      </button>
    </div>
  );
};

export default CardDisplay;