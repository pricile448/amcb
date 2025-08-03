import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock, Shield, Target } from 'lucide-react';

interface VerificationStateProps {
  userStatus: string;
  title?: string;
  description?: string;
  showFeatures?: boolean;
}

const VerificationState: React.FC<VerificationStateProps> = ({ 
  userStatus, 
  title,
  description,
  showFeatures = true
}) => {
  const { t } = useTranslation();

  // Si l'utilisateur est vérifié, ne rien afficher
  if (userStatus === 'verified') {
    return null;
  }

  const getTitle = () => {
    if (title) return title;
    return userStatus === 'unverified' 
      ? 'Vérification d\'identité requise' 
      : 'Vérification en cours';
  };

  const getDescription = () => {
    if (description) return description;
    return userStatus === 'unverified'
      ? 'Pour accéder à cette fonctionnalité, vous devez d\'abord valider votre identité.'
      : 'Votre compte est en cours de vérification. Vous pourrez accéder à cette fonctionnalité une fois validé.';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {getTitle().split(' ').slice(0, -2).join(' ')}
        </h1>
        <p className="text-gray-600">
          {getTitle().split(' ').slice(-2).join(' ')}
        </p>
      </div>

      {/* État vierge pour utilisateurs non vérifiés */}
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {getTitle()}
          </h3>
          <p className="text-gray-600 mb-6">
            {getDescription()}
          </p>
          {showFeatures && (
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Compte sécurisé</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Target className="w-4 h-4" />
                <span>Fonctionnalités personnalisées</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationState; 