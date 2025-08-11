import React, { useState } from 'react';
import LogoImageSection from '../components/LogoImageSection';

const LogoPage: React.FC = () => {
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>('https://res.cloudinary.com/dxvbuhadg/image/upload/v1754875302/logo_xjrpnj.png');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            Identité Visuelle
          </h1>
          <p className="text-xl text-blue-700 max-w-2xl mx-auto">
            Découvrez et personnalisez l'identité visuelle d'AmCBunq
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">
              Configuration du Logo Cloudinary
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-2">
                  URL Cloudinary du Logo
                </label>
                <input
                  type="url"
                  value={cloudinaryUrl}
                  onChange={(e) => setCloudinaryUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/your-cloud-name/image/upload/v1/your-logo-path"
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-blue-600 mt-1">
                  Collez ici l'URL de votre logo hébergé sur Cloudinary
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <LogoImageSection 
            cloudinaryUrl={cloudinaryUrl || undefined}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default LogoPage;
