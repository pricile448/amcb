import React, { useState } from 'react';
import { 
  migrateNotificationsToFirestore, 
  checkFirestoreEndpoints, 
  compareLocalStorageWithFirestore,
  cleanupLocalStorageAfterMigration,
  restoreFromFirestore,
  MigrationResult 
} from '../utils/migrationUtils';

interface MigrationTestPanelProps {
  userId: string;
  onMigrationComplete?: () => void;
}

export const MigrationTestPanel: React.FC<MigrationTestPanelProps> = ({ 
  userId, 
  onMigrationComplete 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    endpointsCheck?: boolean;
    migration?: MigrationResult;
    comparison?: {
      localStorageCount: number;
      firestoreCount: number;
      differences: string[];
    };
  }>({});

  const handleCheckEndpoints = async () => {
    setIsLoading(true);
    try {
      const isAvailable = await checkFirestoreEndpoints();
      setResults(prev => ({ ...prev, endpointsCheck: isAvailable }));
    } catch (error) {
      console.error('Erreur lors de la vérification des endpoints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      const migrationResult = await migrateNotificationsToFirestore(userId);
      setResults(prev => ({ ...prev, migration: migrationResult }));
      
      if (migrationResult.success && onMigrationComplete) {
        onMigrationComplete();
      }
    } catch (error) {
      console.error('Erreur lors de la migration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComparison = async () => {
    setIsLoading(true);
    try {
      const comparison = await compareLocalStorageWithFirestore(userId);
      setResults(prev => ({ ...prev, comparison }));
    } catch (error) {
      console.error('Erreur lors de la comparaison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = () => {
    const success = cleanupLocalStorageAfterMigration(userId);
    if (success) {
      alert('🧹 Données localStorage nettoyées avec succès !');
    } else {
      alert('❌ Erreur lors du nettoyage');
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const success = await restoreFromFirestore(userId);
      if (success) {
        alert('✅ Données restaurées depuis Firestore !');
      } else {
        alert('❌ Erreur lors de la restauration');
      }
    } catch (error) {
      console.error('Erreur lors de la restauration:', error);
      alert('❌ Erreur lors de la restauration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        🧪 Panneau de Test - Migration Firestore
      </h3>
      
      <div className="space-y-4">
        {/* Vérification des endpoints */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">1. Vérification des Endpoints</h4>
          <button
            onClick={handleCheckEndpoints}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Vérification...' : '🔍 Vérifier les endpoints'}
          </button>
          {results.endpointsCheck !== undefined && (
            <div className={`mt-2 p-2 rounded ${results.endpointsCheck ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {results.endpointsCheck ? '✅ Endpoints disponibles' : '❌ Endpoints non disponibles'}
            </div>
          )}
        </div>

        {/* Migration */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">2. Migration vers Firestore</h4>
          <button
            onClick={handleMigration}
            disabled={isLoading || results.endpointsCheck === false}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 mr-2"
          >
            {isLoading ? 'Migration...' : '🔄 Migrer les données'}
          </button>
          {results.migration && (
            <div className={`mt-2 p-2 rounded ${results.migration.success ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              <div>Migration: {results.migration.success ? '✅ Succès' : '⚠️ Partielle'}</div>
              <div>Migrées: {results.migration.migratedCount}</div>
              {results.migration.errors.length > 0 && (
                <div className="text-sm">
                  Erreurs: {results.migration.errors.length}
                  <details className="mt-1">
                    <summary className="cursor-pointer">Voir les erreurs</summary>
                    <ul className="list-disc list-inside text-xs">
                      {results.migration.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparaison */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">3. Comparaison des Données</h4>
          <button
            onClick={handleComparison}
            disabled={isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Comparaison...' : '📊 Comparer localStorage vs Firestore'}
          </button>
          {results.comparison && (
            <div className="mt-2 p-2 rounded bg-blue-100 text-blue-800">
              <div>localStorage: {results.comparison.localStorageCount} notifications</div>
              <div>Firestore: {results.comparison.firestoreCount} notifications</div>
              {results.comparison.differences.length > 0 && (
                <div className="text-sm mt-1">
                  Différences détectées:
                  <ul className="list-disc list-inside">
                    {results.comparison.differences.map((diff, index) => (
                      <li key={index}>{diff}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions de nettoyage */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-2">4. Actions de Nettoyage</h4>
          <div className="space-x-2">
            <button
              onClick={handleCleanup}
              className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 text-sm"
            >
              🧹 Nettoyer localStorage
            </button>
            <button
              onClick={handleRestore}
              disabled={isLoading}
              className="bg-indigo-500 text-white px-3 py-2 rounded hover:bg-indigo-600 disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Restauration...' : '📥 Restaurer depuis Firestore'}
            </button>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">ℹ️ Informations</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Vérifiez d'abord que les endpoints sont disponibles</li>
            <li>• La migration copie les données localStorage vers Firestore</li>
            <li>• Le localStorage reste comme fallback en cas d'erreur</li>
            <li>• Utilisez la comparaison pour vérifier l'intégrité</li>
            <li>• Le nettoyage supprime définitivement les données localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 