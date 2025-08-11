import React, { useEffect, useState } from 'react';
import { MigrationTestPanel } from '../../components/MigrationTestPanel';
import { useNotifications } from '../../hooks/useNotifications';

export const MigrationTestPage: React.FC = () => {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    // Récupérer l'userId depuis localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id || '');
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    }
  }, []);

  const handleMigrationComplete = async () => {
    // Recharger les notifications après migration
    try {
      showSuccess('Migration réussie', 'Les notifications ont été migrées avec succès');
      console.log('✅ Migration terminée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      showError('Erreur de migration', 'Une erreur est survenue lors de la migration');
    }
  };

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🔒 Accès Requis
          </h2>
          <p className="text-gray-600">
            Vous devez être connecté pour accéder à cette page de test.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🧪 Page de Test - Migration Firestore
          </h1>
          <p className="text-gray-600">
            Testez la migration des notifications localStorage vers Firestore
          </p>
          <div className="mt-2 text-sm text-gray-500">
            User ID: <code className="bg-gray-100 px-2 py-1 rounded">{currentUserId}</code>
          </div>
        </div>

        <MigrationTestPanel 
          userId={currentUserId}
          onMigrationComplete={handleMigrationComplete}
        />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            📋 Instructions d'utilisation
          </h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>1. Vérification des endpoints :</strong>
              <p>Vérifiez que les endpoints backend `/api/notifications` sont disponibles et fonctionnels.</p>
            </div>
            
            <div>
              <strong>2. Migration des données :</strong>
              <p>Migrez les notifications localStorage vers Firestore. Cette opération copie les données sans les supprimer du localStorage.</p>
            </div>
            
            <div>
              <strong>3. Comparaison :</strong>
              <p>Comparez le nombre de notifications entre localStorage et Firestore pour vérifier l'intégrité de la migration.</p>
            </div>
            
            <div>
              <strong>4. Nettoyage (optionnel) :</strong>
              <p>Une fois la migration validée, vous pouvez nettoyer les données localStorage pour éviter les doublons.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Attention</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Cette page est destinée aux tests et au développement</li>
            <li>• Sauvegardez vos données avant toute opération de migration</li>
            <li>• Le nettoyage localStorage est irréversible</li>
            <li>• Testez d'abord sur un environnement de développement</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 