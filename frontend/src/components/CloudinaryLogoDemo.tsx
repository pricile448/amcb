import React from 'react';

const CloudinaryLogoDemo: React.FC = () => {
  const cloudinaryUrl = "https://res.cloudinary.com/dxvbuhadg/image/upload/v1754875302/logo_xjrpnj.png";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-900 dark:text-white mb-4">
            Logo AmCBunq - Cloudinary
          </h1>
          <p className="text-xl text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
            Votre logo hébergé sur Cloudinary avec une interface moderne
          </p>
        </div>

        {/* Section principale du logo */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 border border-blue-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-3">
                Notre Identité Visuelle
              </h2>
              <p className="text-blue-700 dark:text-blue-300 text-lg">
                Logo moderne et professionnel d'AmCBunq
              </p>
            </div>

            {/* Logo principal avec carte */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl p-6 shadow-lg">
                  <img 
                    src={cloudinaryUrl}
                    alt="AmCBunq Logo - Cloudinary"
                    className="w-80 h-auto transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl rounded-xl"
                    onError={(e) => {
                      console.error('Erreur de chargement du logo Cloudinary:', e);
                      // Pas de fallback local - on garde l'image cassée pour débugger
                    }}
                  />
                </div>
                
                {/* Overlay avec effet hover */}
                <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-500 rounded-2xl flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="bg-white bg-opacity-95 dark:bg-gray-800 dark:bg-opacity-95 px-6 py-3 rounded-xl shadow-xl">
                      <span className="text-blue-900 dark:text-blue-100 font-bold text-lg">AmCBunq</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations du logo */}
            <div className="text-center mb-8">
              <p className="text-blue-800 dark:text-blue-200 font-semibold text-xl mb-3">
                The bank of the future, today
              </p>
              <div className="flex items-center justify-center space-x-6 text-blue-600 dark:text-blue-400">
                <span className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm font-medium">Moderne</span>
                </span>
                <span className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm font-medium">Professionnel</span>
                </span>
                <span className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-sm font-medium">Innovant</span>
                </span>
              </div>
            </div>

            {/* Détails techniques */}
            <div className="bg-blue-50 dark:bg-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-white mb-4 text-center">
                Détails Techniques
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Source:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">Cloudinary</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Format:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">PNG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Optimisation:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">Automatique</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">CDN:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">Global</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Responsive:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">Oui</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Fallback:</span>
                    <span className="text-blue-900 dark:text-blue-100 font-medium">Logo local</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section d'utilisation */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Comment Utiliser Ce Logo
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">1</span>
                </div>
                <h4 className="font-semibold mb-2">Configuration</h4>
                <p className="text-blue-100 text-sm">
                  L'URL est déjà configurée dans le composant
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">2</span>
                </div>
                <h4 className="font-semibold mb-2">Intégration</h4>
                <p className="text-blue-100 text-sm">
                  Importez et utilisez dans vos composants
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">3</span>
                </div>
                <h4 className="font-semibold mb-2">Personnalisation</h4>
                <p className="text-blue-100 text-sm">
                  Modifiez les couleurs et animations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryLogoDemo;
