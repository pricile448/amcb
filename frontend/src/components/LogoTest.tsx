import React, { useState, useEffect } from 'react';
import logoService from '../services/logoService';
import { LOGO_CONFIG, CLOUDINARY_CONFIG } from '../config/logos';

const LogoTest: React.FC = () => {
  const [logoStatus, setLogoStatus] = useState<Record<string, { loading: boolean; valid: boolean; error?: string }>>({});
  const [cloudinaryStatus, setCloudinaryStatus] = useState<{ cloudName: string; version: string; folder: string }>({
    cloudName: '',
    version: '',
    folder: ''
  });

  useEffect(() => {
    // Initialiser le statut des logos
    const initialStatus = Object.keys(LOGO_CONFIG).reduce((acc, key) => {
      acc[key] = { loading: true, valid: false };
      return acc;
    }, {} as Record<string, { loading: boolean; valid: boolean; error?: string }>);

    setLogoStatus(initialStatus);
    setCloudinaryStatus(CLOUDINARY_CONFIG);

    // Tester chaque logo
    Object.entries(LOGO_CONFIG).forEach(([key, config]) => {
      testLogoUrl(key, config.url);
    });
  }, []);

  const testLogoUrl = async (logoKey: string, url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const isValid = response.ok;
      
      setLogoStatus(prev => ({
        ...prev,
        [logoKey]: {
          loading: false,
          valid: isValid,
          error: isValid ? undefined : `HTTP ${response.status}`
        }
      }));
    } catch (error) {
      setLogoStatus(prev => ({
        ...prev,
        [logoKey]: {
          loading: false,
          valid: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      }));
    }
  };

  const getStatusIcon = (status: { loading: boolean; valid: boolean; error?: string }) => {
    if (status.loading) return '⏳';
    if (status.valid) return '✅';
    return '❌';
  };

  const getStatusColor = (status: { loading: boolean; valid: boolean; error?: string }) => {
    if (status.loading) return 'text-yellow-600';
    if (status.valid) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Test des Logos AmCbunq - Cloudinary Only</h2>
      
      {/* Configuration Cloudinary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">Configuration Cloudinary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium text-blue-700">Cloud Name:</span>
            <span className="ml-2 text-blue-600">{cloudinaryStatus.cloudName}</span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Version:</span>
            <span className="ml-2 text-blue-600">{cloudinaryStatus.version}</span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Folder:</span>
            <span className="ml-2 text-blue-600">{cloudinaryStatus.folder}</span>
          </div>
        </div>
      </div>

      {/* Statut des logos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Statut des Logos Cloudinary</h3>
        <div className="space-y-3">
          {Object.entries(logoStatus).map(([key, status]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`text-xl ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </span>
                <div>
                  <span className="font-medium text-gray-700 capitalize">{key}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {LOGO_CONFIG[key as keyof typeof LOGO_CONFIG]?.url}
                  </span>
                </div>
              </div>
              <div className="text-right">
                {status.loading && <span className="text-yellow-600 text-sm">Test en cours...</span>}
                {status.valid && <span className="text-green-600 text-sm">Valide</span>}
                {!status.loading && !status.valid && (
                  <span className="text-red-600 text-sm">{status.error}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aperçu des logos */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Aperçu des Logos Cloudinary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(LOGO_CONFIG).map(([key, config]) => (
            <div key={key} className="p-4 bg-gray-50 rounded-lg text-center">
              <h4 className="font-medium text-gray-700 mb-2 capitalize">{key}</h4>
              <div className="flex justify-center mb-2">
                <img
                  src={config.url}
                  alt={config.alt}
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    console.error(`Erreur logo ${key}:`, e);
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 truncate">{config.url}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            Object.entries(LOGO_CONFIG).forEach(([key, config]) => {
              testLogoUrl(key, config.url);
            });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retester tous les logos
        </button>
        <button
          onClick={() => {
            console.log('Configuration des logos:', LOGO_CONFIG);
            console.log('Service logoService:', logoService);
            console.log('Configuration Cloudinary:', CLOUDINARY_CONFIG);
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Afficher la config dans la console
        </button>
      </div>

      {/* Information importante */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important</h4>
        <p className="text-yellow-700 text-sm">
          Cette application utilise maintenant UNIQUEMENT Cloudinary pour les logos. 
          Assurez-vous que tous les logos sont correctement uploadés sur votre compte Cloudinary 
          avec les bonnes URLs et versions.
        </p>
      </div>
    </div>
  );
};

export default LogoTest;
