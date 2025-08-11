import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const TestAuthRoutesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Test des Routes d'Authentification Firebase
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Routes Firebase (sans préfixe de langue)
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Routes de vérification d'email</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/verification-pending"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  /verification-pending
                </Link>
                <Link
                  to="/auth/action"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  /auth/action
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Ces routes sont gérées par Firebase et ne doivent PAS avoir de préfixe de langue
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Routes avec préfixe de langue</h3>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/fr/connexion"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  /fr/connexion
                </Link>
                <Link
                  to="/en/login"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  /en/login
                </Link>
                <Link
                  to="/fr/ouvrir-compte"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  /fr/ouvrir-compte
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Ces routes utilisent le système de préfixe de langue normal
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Instructions de test :</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Cliquez sur les routes Firebase pour vérifier qu'elles fonctionnent sans préfixe</li>
              <li>• Cliquez sur les routes avec préfixe pour vérifier qu'elles fonctionnent avec la langue</li>
              <li>• Vérifiez que les liens dans les pages Firebase fonctionnent correctement</li>
            </ul>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">⚠️ Important :</h3>
            <p className="text-yellow-700 text-sm">
              Les routes Firebase (/verification-pending, /auth/action) sont maintenant en dehors du wrapper de langue 
              et fonctionnent directement. Les liens internes dans ces pages utilisent le composant AuthLink qui 
              gère automatiquement la redirection vers les bonnes pages avec ou sans préfixe de langue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuthRoutesPage;
