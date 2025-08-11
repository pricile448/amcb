import React from 'react';
import Logo from './Logo';

const LogoCardDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Logos avec Cartes Adaptatives
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Découvrez nos logos dans des cartes élégantes qui s'adaptent automatiquement aux couleurs de fond
          </p>
        </div>

        {/* Section Fond Clair */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Fond Clair
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo Simple avec Carte */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Logo Simple</h3>
                <div className="flex justify-center">
                  <Logo variant="simple" size="lg" cardStyle={true} />
                </div>
              </div>

              {/* Logo Icon avec Carte */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Logo Icon</h3>
                <div className="flex justify-center">
                  <Logo variant="icon" size="lg" cardStyle={true} />
                </div>
              </div>

              {/* Logo Full avec Carte */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">Logo Complet</h3>
                <div className="flex justify-center">
                  <Logo variant="full" size="lg" cardStyle={true} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Fond Sombre */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-gray-900 dark:bg-black rounded-3xl shadow-2xl p-12 border border-gray-700 dark:border-gray-600">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Fond Sombre
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo Simple avec Carte */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Logo Simple</h3>
                <div className="flex justify-center">
                  <Logo variant="simple" size="lg" cardStyle={true} />
                </div>
              </div>

              {/* Logo Icon avec Carte */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Logo Icon</h3>
                <div className="flex justify-center">
                  <Logo variant="icon" size="lg" cardStyle={true} />
                </div>
              </div>

              {/* Logo Full avec Carte */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Logo Complet</h3>
                <div className="flex justify-center">
                  <Logo variant="full" size="lg" cardStyle={true} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Comparaison */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Comparaison des Styles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Sans Carte */}
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-6">Sans Carte</h3>
                <div className="flex justify-center mb-4">
                  <Logo variant="simple" size="lg" />
                </div>
                <p className="text-blue-100 text-sm">
                  Logo direct sur le fond coloré
                </p>
              </div>

              {/* Avec Carte */}
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-6">Avec Carte</h3>
                <div className="flex justify-center mb-4">
                  <Logo variant="simple" size="lg" cardStyle={true} />
                </div>
                <p className="text-blue-100 text-sm">
                  Logo dans une carte adaptative
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations Techniques */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Caractéristiques des Cartes
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Bordures arrondies (rounded-xl)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Ombres portées (shadow-lg)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Bordures adaptatives</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Fond blanc sur fond sombre</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Fond sombre sur fond clair</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Padding adaptatif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoCardDemo;
