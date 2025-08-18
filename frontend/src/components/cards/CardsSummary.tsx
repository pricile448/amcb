import React from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { CardSubDocument } from '../../services/cardService';

interface CardsSummaryProps {
  physicalCardData: CardSubDocument | null;
  virtualCardData: CardSubDocument | null;
  physicalCardStatus: 'none' | 'not_requested' | 'pending' | 'processing' | 'completed' | 'rejected' | null;
  virtualCardStatus: 'none' | 'not_requested' | 'pending' | 'processing' | 'completed' | 'rejected' | null;
}

const CardsSummary: React.FC<CardsSummaryProps> = ({
  physicalCardData,
  virtualCardData,
  physicalCardStatus,
  virtualCardStatus
}) => {
  const { t } = useTranslation();

  // Calculer le nombre de cartes actives
  const activeCards = [
    physicalCardStatus === 'completed' && physicalCardData?.isDisplayed,
    virtualCardStatus === 'completed' && virtualCardData?.isDisplayed
  ].filter(Boolean).length;

  // Calculer le nombre de cartes en cours
  const pendingCards = [
    physicalCardStatus === 'pending' || physicalCardStatus === 'processing',
    virtualCardStatus === 'pending' || virtualCardStatus === 'processing'
  ].filter(Boolean).length;

  // Calculer le nombre de cartes rejetées
  const rejectedCards = [
    physicalCardStatus === 'rejected',
    virtualCardStatus === 'rejected'
  ].filter(Boolean).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Cartes actives */}
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">{t('cards.summary.activeCards')}</p>
            <p className="text-2xl font-bold text-gray-900">{activeCards}</p>
          </div>
        </div>
      </div>

      {/* Cartes en cours */}
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">{t('cards.summary.pendingCards')}</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCards}</p>
          </div>
        </div>
      </div>

      {/* Cartes rejetées */}
      <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">{t('cards.summary.rejectedCards')}</p>
            <p className="text-2xl font-bold text-gray-900">{rejectedCards}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsSummary;
