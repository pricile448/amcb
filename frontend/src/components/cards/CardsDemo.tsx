import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import CardDisplay from './CardDisplay';
import PhysicalCardMessage from './PhysicalCardMessage';
import VirtualCardMessage from './VirtualCardMessage';
import { CardSubDocument } from '../../services/cardService';

const CardsDemo: React.FC = () => {
  const { t } = useTranslation();
  const [demoMode, setDemoMode] = useState<'none' | 'pending' | 'completed' | 'rejected'>('none');

  // Données de démonstration
  const demoPhysicalCard: CardSubDocument = {
    cardNumber: '4532 **** **** 1234',
    cardType: 'Carte physique',
    expiryDate: '12/25',
    cvv: '123',
    isActive: true,
    isDisplayed: demoMode === 'completed',
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    adminNotes: demoMode === 'pending' 
      ? 'Carte physique en cours de génération - Délai 6-14 jours'
      : demoMode === 'completed'
      ? 'Carte physique activée et disponible'
      : demoMode === 'rejected'
      ? 'Demande rejetée - Veuillez contacter le support'
      : undefined
  };

  const demoVirtualCard: CardSubDocument = {
    cardNumber: '4111 **** **** 1111',
    cardType: 'Carte virtuelle',
    expiryDate: '10/26',
    cvv: '456',
    isActive: true,
    isDisplayed: demoMode === 'completed',
    createdAt: new Date() as any,
    updatedAt: new Date() as any,
    adminNotes: demoMode === 'pending'
      ? 'Carte virtuelle en cours de génération - Délai 24h'
      : demoMode === 'completed'
      ? 'Carte virtuelle activée et disponible'
      : demoMode === 'rejected'
      ? 'Demande rejetée - Veuillez contacter le support'
      : undefined
  };

  const handleDemoModeChange = (mode: typeof demoMode) => {
    setDemoMode(mode);
  };

  return (
    <div className="space-y-6">
      {/* Contrôles de démonstration */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Mode de démonstration</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={demoMode === 'none' ? 'primary' : 'secondary'}
            onClick={() => handleDemoModeChange('none')}
          >
            Aucune carte
          </Button>
          <Button
            variant={demoMode === 'pending' ? 'primary' : 'secondary'}
            onClick={() => handleDemoModeChange('pending')}
          >
            En cours
          </Button>
          <Button
            variant={demoMode === 'completed' ? 'primary' : 'secondary'}
            onClick={() => handleDemoModeChange('completed')}
          >
            Disponible
          </Button>
          <Button
            variant={demoMode === 'rejected' ? 'primary' : 'secondary'}
            onClick={() => handleDemoModeChange('rejected')}
          >
            Rejetée
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Utilisez ces boutons pour tester différents états des cartes
        </p>
      </div>

      {/* Test des cartes physiques */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Test - Carte Physique</h3>
        
        <PhysicalCardMessage 
          cardData={demoPhysicalCard}
          cardStatus={demoMode}
        />
        
        <CardDisplay
          cardData={demoPhysicalCard}
          cardStatus={demoMode}
          cardType="physical"
          onRequestCard={() => handleDemoModeChange('pending')}
          isRequesting={false}
          showCardDetails={false}
          onToggleCardDetails={() => {}}
        />
      </div>

      {/* Test des cartes virtuelles */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Test - Carte Virtuelle</h3>
        
        <VirtualCardMessage 
          cardData={demoVirtualCard}
          cardStatus={demoMode}
        />
        
        <CardDisplay
          cardData={demoVirtualCard}
          cardStatus={demoMode}
          cardType="virtual"
          onRequestCard={() => handleDemoModeChange('pending')}
          isRequesting={false}
          showCardDetails={false}
          onToggleCardDetails={() => {}}
        />
      </div>
    </div>
  );
};

export default CardsDemo;
