import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Lock, Unlock, Eye, EyeOff, Plus, Settings, Trash2 } from 'lucide-react';
import VerificationState from '../../components/VerificationState';
import { useKycSync } from '../../hooks/useNotifications';

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
        return 'Active';
      case 'blocked':
        return 'Bloquée';
      case 'expired':
        return 'Expirée';
      default:
        return 'Inconnu';
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
          <span>Vérification de votre statut...</span>
        </div>
      </div>
    );
  }

  if (isUnverified) {
    return (
      <VerificationState 
        userStatus={userStatus}
        title="Vérification d'identité requise"
        description="Pour demander et gérer vos cartes bancaires, vous devez d'abord valider votre identité."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes Cartes</h1>
        <p className="text-gray-600">Gérez vos cartes bancaires et cartes de crédit</p>
      </div>

      {/* Add New Card Button */}
      <div className="mb-6">
        <button 
          onClick={handleRequestCard}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Demander une nouvelle carte
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
              Aucune carte disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore de cartes bancaires. Demandez votre première carte pour commencer à l'utiliser.
            </p>
            <button 
              onClick={handleRequestCard}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Demander ma première carte
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
                      {card.type === 'credit' ? 'Carte de Crédit' : 'Carte de Débit'}
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
                    <p className="text-xs opacity-90">Expire</p>
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
                    <p className="text-sm text-gray-500">Solde actuel</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {card.balance.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </p>
                  </div>
                  {card.limit && (
                    <div>
                      <p className="text-sm text-gray-500">Limite de crédit</p>
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
                      Utiliser
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                      Détails
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
          Sécurité des cartes
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Protection des cartes</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Verrouillage/déverrouillage instantané</li>
              <li>• Notifications de transactions</li>
              <li>• Limites de paiement configurables</li>
              <li>• Protection contre la fraude</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Conseils de sécurité</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ne partagez jamais vos codes</li>
              <li>• Utilisez des sites sécurisés</li>
              <li>• Surveillez vos transactions</li>
              <li>• Signalez toute activité suspecte</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Demande de carte */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Demander une carte</h3>
              <button 
                onClick={() => setShowRequestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de carte</label>
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
                      <div className="font-medium text-gray-900">Carte physique</div>
                      <div className="text-sm text-gray-500">Livrée à votre adresse sous 5-7 jours ouvrés</div>
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
                      <div className="font-medium text-gray-900">Carte virtuelle</div>
                      <div className="text-sm text-gray-500">Disponible sous 24h pour les paiements en ligne</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Informations importantes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• La carte virtuelle sera disponible sous 24h</li>
                  <li>• La carte physique sera livrée à votre adresse</li>
                  <li>• Vous recevrez un code PIN par SMS séparé</li>
                  <li>• Les cartes sont sécurisées et assurées</li>
                </ul>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSubmitRequest}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Demander la carte
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