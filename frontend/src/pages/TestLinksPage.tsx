import React from 'react';
import { useTranslation } from 'react-i18next';
import LocalizedLink from '../components/LocalizedLink';
import LinkDebugger from '../components/LinkDebugger';

const TestLinksPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Test des Liens Localisés
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Vérification des boutons et liens
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Page d'accueil</h3>
              <div className="flex flex-wrap gap-3">
                <LocalizedLink
                  to="/"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Accueil
                </LocalizedLink>
                <LocalizedLink
                  to="/ouvrir-compte"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ouvrir un compte
                </LocalizedLink>
                <LocalizedLink
                  to="/fonctionnalites"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Fonctionnalités
                </LocalizedLink>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Autres pages</h3>
              <div className="flex flex-wrap gap-3">
                <LocalizedLink
                  to="/tarifs"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Tarifs
                </LocalizedLink>
                <LocalizedLink
                  to="/aide"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Aide
                </LocalizedLink>
                <LocalizedLink
                  to="/connexion"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Connexion
                </LocalizedLink>
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Dashboard</h3>
              <div className="flex flex-wrap gap-3">
                <LocalizedLink
                  to="/dashboard"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Dashboard
                </LocalizedLink>
                <LocalizedLink
                  to="/dashboard/comptes"
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Comptes
                </LocalizedLink>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Instructions de test :</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Cliquez sur chaque bouton pour vérifier qu'il redirige vers la bonne page</li>
              <li>• Vérifiez que l'URL contient le préfixe de langue (ex: /fr/, /en/)</li>
              <li>• Testez avec différentes langues via le sélecteur de langue</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Debug Panel */}
      <LinkDebugger />
    </div>
  );
};

export default TestLinksPage;
