import React, { useState } from 'react';
import { FirebaseDataService } from '../services/firebaseData';

const KycStatusDebug: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const checkCurrentStatus = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentStatus(user.verificationStatus || 'non défini');
        setMessage(`Statut actuel: ${user.verificationStatus || 'non défini'}`);
      } else {
        setCurrentStatus('aucun utilisateur');
        setMessage('Aucun utilisateur trouvé dans localStorage');
      }
    } catch (error) {
      setMessage(`Erreur: ${error}`);
    }
  };

  const forceSync = async () => {
    setLoading(true);
    setMessage('Synchronisation en cours...');
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userId = user.id;
        
        if (userId) {
          // Vider le cache
          FirebaseDataService.clearCache();
          
          // Forcer la synchronisation
          const newStatus = await FirebaseDataService.syncKycStatus(userId);
          
          setCurrentStatus(newStatus);
          setMessage(`Synchronisation terminée. Nouveau statut: ${newStatus}`);
          
          // Recharger la page après 2 secondes
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setMessage('ID utilisateur non trouvé');
        }
      } else {
        setMessage('Utilisateur non connecté');
      }
    } catch (error) {
      setMessage(`Erreur lors de la synchronisation: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      FirebaseDataService.clearCache();
      setMessage('Cache vidé avec succès. Rechargez la page.');
    } catch (error) {
      setMessage(`Erreur lors du vidage du cache: ${error}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-lg mb-3">🔧 Debug KYC Status</h3>
      
      <div className="space-y-2 mb-3">
        <div className="text-sm">
          <strong>Statut actuel:</strong> {currentStatus || 'Non vérifié'}
        </div>
        <div className="text-xs text-gray-600">
          {message}
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={checkCurrentStatus}
          className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
        >
          Vérifier le statut
        </button>
        
        <button
          onClick={forceSync}
          disabled={loading}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Synchronisation...' : 'Forcer synchronisation'}
        </button>
        
        <button
          onClick={clearCache}
          className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Vider le cache
        </button>
      </div>
    </div>
  );
};

export default KycStatusDebug; 