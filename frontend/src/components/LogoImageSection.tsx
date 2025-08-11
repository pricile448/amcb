import React from 'react';

interface LogoImageSectionProps {
  cloudinaryUrl?: string;
  alt?: string;
  className?: string;
}

const LogoImageSection: React.FC<LogoImageSectionProps> = ({ 
  cloudinaryUrl = "https://res.cloudinary.com/dxvbuhadg/image/upload/v1754875302/logo_xjrpnj.png",
  alt = "AmCBunq Logo",
  className = ""
}) => {
  return (
    <div className={`logo-image-section ${className}`}>
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-blue-900 dark:text-white mb-2 text-center">
            Notre Logo
          </h2>
          <p className="text-blue-700 dark:text-blue-300 text-center max-w-md">
            Découvrez notre identité visuelle moderne et professionnelle
          </p>
        </div>
        
        <div className="relative group">
          {cloudinaryUrl ? (
            <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-4 shadow-lg">
              <img 
                src={cloudinaryUrl}
                alt={alt}
                className="w-64 h-auto transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl rounded-lg"
                onError={(e) => {
                  console.error('Erreur de chargement du logo Cloudinary:', e);
                  // Pas de fallback local - on garde l'image cassée pour débugger
                }}
              />
            </div>
          ) : (
            <div className="w-64 h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center border-2 border-dashed border-blue-300 dark:border-gray-500">
              <div className="text-center">
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">Logo non configuré</p>
                <p className="text-blue-500 dark:text-blue-300 text-sm">Ajoutez une URL Cloudinary</p>
              </div>
            </div>
          )}
          
          {/* Overlay avec effet hover */}
          <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 px-4 py-2 rounded-lg shadow-lg">
                <span className="text-blue-900 dark:text-blue-100 font-semibold text-sm">AmCBunq</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
            The bank of the future, today
          </p>
          <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
            <span className="text-sm">✓ Moderne</span>
            <span className="text-sm">✓ Professionnel</span>
            <span className="text-sm">✓ Innovant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoImageSection;
