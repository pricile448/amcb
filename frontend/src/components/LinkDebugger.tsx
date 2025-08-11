import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

const LinkDebugger: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-sm font-mono max-w-md z-50">
      <div className="mb-2 font-bold">🔗 Debug des Liens</div>
      <div className="space-y-1 text-xs">
        <div>Langue actuelle: <span className="text-yellow-300">{lang || 'undefined'}</span></div>
        <div>URL actuelle: <span className="text-green-300">{location.pathname}</span></div>
        <div>Hash: <span className="text-blue-300">{location.hash || 'none'}</span></div>
        <div>Search: <span className="text-purple-300">{location.search || 'none'}</span></div>
      </div>
      <div className="mt-2 text-xs text-gray-300">
        Exemples de liens:
        <div className="mt-1">
          <div>• / → /{lang}/</div>
          <div>• /ouvrir-compte → /{lang}/ouvrir-compte</div>
          <div>• /fonctionnalites → /{lang}/fonctionnalites</div>
        </div>
      </div>
    </div>
  );
};

export default LinkDebugger;
