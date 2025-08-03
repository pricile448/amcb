import React, { useState } from 'react';
import { FirebaseDataService } from '../services/firebaseData';
import { auth } from '../config/firebase';

const KycStatusDebug: React.FC = () => {
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>({});

  const checkCurrentStatus = () => {
    try {
      const userStr = localStorage.getItem('user');
      const authUser = auth.currentUser;
      
      const debugData = {
        localStorageUser: userStr ? JSON.parse(userStr) : null,
        authCurrentUser: authUser ? {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName
        } : null,
        hasUserInStorage: !!userStr,
        hasAuthUser: !!authUser
      };
      
      setDebugInfo(debugData);
      
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
      const authUser = auth.currentUser;
      const userStr = localStorage.getItem('user');
      
      if (!authUser) {
        setMessage('❌ Aucun utilisateur authentifié avec Firebase');
        setLoading(false);
        return;
      }
      
      if (!userStr) {
        setMessage('❌ Aucun utilisateur dans localStorage');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      const userId = user.id || authUser.uid;
      
      console.log('🔍 Debug syncKycStatus:', {
        authUser: authUser.uid,
        localStorageUser: user,
        userId: userId
      });
      
      // Vider le cache
      FirebaseDataService.clearCache();
      
      // Forcer la synchronisation
      const newStatus = await FirebaseDataService.syncKycStatus(userId);
      
      setCurrentStatus(newStatus);
      setMessage(`✅ Synchronisation terminée. Nouveau statut: ${newStatus}`);
      
      // Recharger la page après 2 secondes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erreur syncKycStatus:', error);
      setMessage(`❌ Erreur lors de la synchronisation: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      FirebaseDataService.clearCache();
      setMessage('✅ Cache vidé avec succès. Rechargez la page.');
    } catch (error) {
      setMessage(`❌ Erreur lors du vidage du cache: ${error}`);
    }
  };

  const testFirestoreConnection = async () => {
    setLoading(true);
    setMessage('Test de connexion Firestore...');
    
    try {
      const authUser = auth.currentUser;
      if (!authUser) {
        setMessage('❌ Aucun utilisateur authentifié');
        setLoading(false);
        return;
      }
      
      // Test direct de récupération des données utilisateur
      const userData = await FirebaseDataService.getUserData(authUser.uid);
      console.log('🔍 Données utilisateur récupérées:', userData);
      
      setMessage(`✅ Connexion Firestore OK. Statut: ${userData?.verificationStatus || 'non défini'}`);
      setCurrentStatus(userData?.verificationStatus || 'non défini');
      
    } catch (error) {
      console.error('❌ Erreur test Firestore:', error);
      setMessage(`❌ Erreur connexion Firestore: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const syncUserDataToLocalStorage = async () => {
    setLoading(true);
    setMessage('Synchronisation des données utilisateur...');
    
    try {
      const authUser = auth.currentUser;
      if (!authUser) {
        setMessage('❌ Aucun utilisateur authentifié');
        setLoading(false);
        return;
      }
      
      // Récupérer les données utilisateur depuis Firestore
      const userData = await FirebaseDataService.getUserData(authUser.uid);
      console.log('🔍 Données utilisateur récupérées:', userData);
      
      if (userData) {
        // Créer l'objet utilisateur pour localStorage
        const userForStorage = {
          id: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          verificationStatus: userData.verificationStatus || 'unverified',
          kycStatus: userData.kycStatus || 'unverified',
          ...userData
        };
        
        // Sauvegarder dans localStorage
        localStorage.setItem('user', JSON.stringify(userForStorage));
        
        setCurrentStatus(userForStorage.verificationStatus);
        setMessage(`✅ Données synchronisées! Statut: ${userForStorage.verificationStatus}`);
        
        // Recharger les infos de debug
        setTimeout(() => {
          checkCurrentStatus();
        }, 1000);
        
      } else {
        setMessage('❌ Aucune donnée utilisateur trouvée dans Firestore');
      }
      
    } catch (error) {
      console.error('❌ Erreur syncUserData:', error);
      setMessage(`❌ Erreur lors de la synchronisation: ${error}`);
    } finally {
      setLoading(false);
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
          onClick={testFirestoreConnection}
          disabled={loading}
          className="w-full bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 disabled:opacity-50"
        >
          Test Firestore
        </button>
        
        <button
          onClick={syncUserDataToLocalStorage}
          disabled={loading}
          className="w-full bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Synchronisation...' : 'Sync → localStorage'}
        </button>
        
        <button
          onClick={forceSync}
          disabled={loading}
          className="w-full bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          Forcer synchronisation
        </button>
        
        <button
          onClick={clearCache}
          className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Vider le cache
        </button>
      </div>
      
      {Object.keys(debugInfo).length > 0 && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug Info:</strong>
          <pre className="mt-1 text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default KycStatusDebug; 