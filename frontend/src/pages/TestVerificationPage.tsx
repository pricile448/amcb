import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import VerificationState from '../components/VerificationState';
import ModernVerificationState from '../components/ModernVerificationState';

const TestVerificationPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [userStatus, setUserStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');

  const languages = [
    { code: 'fr', name: '🇫🇷 Français' },
    { code: 'en', name: '🇬🇧 English' },
    { code: 'es', name: '🇪🇸 Español' },
    { code: 'pt', name: '🇵🇹 Português' },
    { code: 'it', name: '🇮🇹 Italiano' },
    { code: 'nl', name: '🇳🇱 Nederlands' },
    { code: 'de', name: '🇩🇪 Deutsch' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test des composants de vérification
          </h1>
          
          {/* Sélecteur de langue */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Changer de langue:
            </label>
            <select 
              value={i18n.language} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="border border-gray-300 rounded-md px-4 py-2 text-lg"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sélecteur de statut */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut utilisateur:
            </label>
            <select 
              value={userStatus} 
              onChange={(e) => setUserStatus(e.target.value as any)}
              className="border border-gray-300 rounded-md px-4 py-2 text-lg"
            >
              <option value="unverified">Non vérifié</option>
              <option value="pending">En cours de vérification</option>
              <option value="verified">Vérifié</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Langue actuelle: <strong>{i18n.language}</strong> | 
            Statut: <strong>{userStatus}</strong>
          </div>
        </div>

        {/* Test des clés de traduction */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test des clés de traduction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500 mb-1">verificationState.titles.unverified</div>
              <div className="font-medium">{t('verificationState.titles.unverified')}</div>
            </div>
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500 mb-1">verificationState.titles.pending</div>
              <div className="font-medium">{t('verificationState.titles.pending')}</div>
            </div>
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500 mb-1">modernVerificationState.verificationInProgress</div>
              <div className="font-medium">{t('modernVerificationState.verificationInProgress')}</div>
            </div>
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500 mb-1">modernVerificationState.startVerification</div>
              <div className="font-medium">{t('modernVerificationState.startVerification')}</div>
            </div>
          </div>
        </div>

        {/* Composant VerificationState */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Composant VerificationState</h2>
          <VerificationState userStatus={userStatus} />
        </div>

        {/* Composant ModernVerificationState */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Composant ModernVerificationState</h2>
          <ModernVerificationState userStatus={userStatus} />
        </div>
      </div>
    </div>
  );
};

export default TestVerificationPage;
