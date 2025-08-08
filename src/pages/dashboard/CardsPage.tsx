import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Lock, Unlock, Eye, EyeOff, Plus, Settings, Trash2 } from 'lucide-react';
import VerificationState from '../../components/VerificationState';
import { useKycSync } from '../../hooks/useNotifications';
import { logger } from '../../utils/logger';

interface Card {
  id: string;
  type: 'credit' | 'debit';
  name: string;
  number: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  limit?: number;
  status: 'active' | 'blocked' | 'expired';
  isVisible: boolean;
  color: string;
}

const CardsPage: React.FC = () => {
  const { t } = useTranslation();
  const { userStatus, isUnverified, isLoading: kycLoading } = useKycSync();
  const [cards, setCards] = useState<Card[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestType, setRequestType] = useState<'physical' | 'virtual'>('physical');

  const toggleCardVisibility = (id: string) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, isVisible: !card.isVisible } : card
    ));
  };

  const toggleCardStatus = (id: string) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { 
        ...card, 
        status: card.status === 'active' ? 'blocked' : 'active' 
      } : card
    ));
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'blocked':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('cards.status.active');
      case 'blocked':
        return t('cards.status.blocked');
      case 'expired':
        return t('cards.status.expired');
      default:
        return t('cards.status.unknown');
    }
  };

  const handleRequestCard = () => {
    setShowRequestForm(true);
  };

  const handleSubmitRequest = () => {
    // Logique pour soumettre la demande de carte
            logger.debug('Demande de carte soumise:', requestType);
    setShowRequestForm(false);
  };

  // Si l'utilisateur n'est pas vérifié, afficher l'état de vérification
  if (kycLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>{t('cards.loading.status')}</span>
        </div>
      </div>
    );
  }

  if (isUnverified) {
    return (
      <VerificationState 
        userStatus={userStatus}
        title={t('cards.verification.title') || 'Verification Required'}
                  description={t('cards.verification.description') || 'Please verify your identity to access cards'}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('cards.title')}</h1>
        <p className="text-gray-600">{t('cards.subtitle')}</p>
      </div>

      {/* Add New Card Button */}
      <div className="mb-6">
        <button 
          onClick={handleRequestCard}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('cards.addCard')}
        </button>
      </div>

      {/* Cards Grid */}
      {cards.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {t('cards.noCards')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('cards.noCardsDescription')}
            </p>
            <button 
              onClick={handleRequestCard}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('cards.requestFirstCard')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Card Visual */}
              <div className={`${card.color} p-6 text-white relative`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-semibold">
                      {card.type === 'credit' ? t('cards.cardTypes.credit') : t('cards.cardTypes.debit')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCardVisibility(card.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    >
                      {card.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => toggleCardStatus(card.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                    >
                      {card.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm opacity-90 mb-1">{card.name}</p>
                  <p className="font-mono text-lg tracking-wider">
                    {card.isVisible ? formatCardNumber(card.number) : '•••• •••• •••• ••••'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-90">{t('cards.cardDetails.expires')}</p>
                    <p className="font-mono">{card.isVisible ? card.expiryDate : '••/••'}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-90">CVV</p>
                    <p className="font-mono">{card.isVisible ? card.cvv : '•••'}</p>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-6">
                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                    {getStatusText(card.status)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteCard(card.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Balance/Limit */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">{t('cards.cardDetails.currentBalance')}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {card.balance.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </p>
                  </div>
                  {card.limit && (
                    <div>
                      <p className="text-sm text-gray-500">{t('cards.cardDetails.creditLimit')}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {card.limit.toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t">
                                  <div className="grid grid-cols-2 gap-2">
                  <button className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    {t('cards.actions.use')}
                  </button>
                  <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                    {t('cards.actions.details')}
                  </button>
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('cards.security.title')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('cards.security.protection.title')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('cards.security.protection.feature1')}</li>
              <li>• {t('cards.security.protection.feature2')}</li>
              <li>• {t('cards.security.protection.feature3')}</li>
              <li>• {t('cards.security.protection.feature4')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('cards.security.tips.title')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('cards.security.tips.tip1')}</li>
              <li>• {t('cards.security.tips.tip2')}</li>
              <li>• {t('cards.security.tips.tip3')}</li>
              <li>• {t('cards.security.tips.tip4')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Demande de carte */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">{t('cards.requestModal.title')}</h3>
              <button 
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('cards.requestModal.cardType')}</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="cardType" 
                      value="physical"
                      checked={requestType === 'physical'}
                      onChange={(e) => setRequestType(e.target.value as 'physical' | 'virtual')}
                      className="text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{t('cards.requestTypes.physical.title')}</div>
                      <div className="text-sm text-gray-500">{t('cards.requestTypes.physical.description')}</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="cardType" 
                      value="virtual"
                      checked={requestType === 'virtual'}
                      onChange={(e) => setRequestType(e.target.value as 'physical' | 'virtual')}
                      className="text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{t('cards.requestTypes.virtual.title')}</div>
                      <div className="text-sm text-gray-500">{t('cards.requestTypes.virtual.description')}</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">{t('cards.requestModal.importantInfo.title')}</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {t('cards.requestModal.importantInfo.info1')}</li>
                  <li>• {t('cards.requestModal.importantInfo.info2')}</li>
                  <li>• {t('cards.requestModal.importantInfo.info3')}</li>
                  <li>• {t('cards.requestModal.importantInfo.info4')}</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('cards.requestModal.cancel')}
                </button>
                <button 
                  onClick={handleSubmitRequest}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('cards.requestModal.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsPage; 