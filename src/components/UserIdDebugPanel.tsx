import React from 'react';
import { diagnoseUserIds, fixUserIds, clearUserData } from '../utils/userIdDiagnostic';

const UserIdDebugPanel: React.FC = () => {
  const handleDiagnose = async () => {
    console.log('🔍 Démarrage du diagnostic...');
    await diagnoseUserIds();
  };

  const handleFix = async () => {
    console.log('🔧 Démarrage de la correction...');
    await fixUserIds();
  };

  const handleClear = () => {
    clearUserData();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Debug UserId</h3>
      <div className="space-y-2">
        <button
          onClick={handleDiagnose}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          🔍 Diagnostiquer
        </button>
        <button
          onClick={handleFix}
          className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          🔧 Corriger
        </button>
        <button
          onClick={handleClear}
          className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          🧹 Nettoyer
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Ouvrez la console pour voir les résultats
      </p>
    </div>
  );
};

export default UserIdDebugPanel; 