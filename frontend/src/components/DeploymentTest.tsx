import React from 'react';

const DeploymentTest: React.FC = () => {
  const currentTime = new Date().toLocaleString('fr-FR');
  const commitHash = 'c17c63b'; // Hash du dernier commit
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 text-center shadow-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">🚀 DÉPLOIEMENT TEST - {currentTime}</h1>
        <p className="text-lg">
          <strong>Commit:</strong> {commitHash} | 
          <strong>Status:</strong> ✅ DÉPLOYÉ | 
          <strong>Logos:</strong> Cloudinary | 
          <strong>Responsive:</strong> Activé
        </p>
        <div className="mt-2 text-sm">
          Si vous voyez ce message, le déploiement fonctionne ! 
          Vos changements sont maintenant en production.
        </div>
      </div>
    </div>
  );
};

export default DeploymentTest;
