import React from 'react';
import { Lock, Shield, CheckCircle, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface ModernVerificationStateProps {
  userStatus: string;
  title?: string;
  description?: string;
  showFeatures?: boolean;
}

const ModernVerificationState: React.FC<ModernVerificationStateProps> = ({
  userStatus,
  title,
  description,
  showFeatures = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Si l'utilisateur est vérifié, ne rien afficher
  if (userStatus === 'verified') {
    return null;
  }

  // Si l'utilisateur est en cours de vérification, afficher un message spécial
  if (userStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-8 bg-white/80 backdrop-blur-sm border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-yellow-800">
                    Vérification en cours
                  </h1>
                  <p className="text-sm text-yellow-800 opacity-80">
                    Votre dossier est en cours d'examen
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span className="text-xs text-gray-500 font-medium">AmCbunq</span>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-lg leading-relaxed text-yellow-800 mb-6">
                Votre dossier de vérification d'identité est actuellement en cours d'examen par nos équipes. 
                Ce processus prend généralement 24 à 48 heures.
              </p>
              
              {/* Bouton pour voir le statut */}
              <button 
                onClick={() => {
                  console.log('Bouton cliqué, navigation vers /dashboard/kyc');
                  navigate('/dashboard/kyc');
                }}
                className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <CheckCircle className="w-5 h-5 mr-3" />
                Voir le statut
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Informations sur le processus */}
            <div className="mt-8 p-4 bg-yellow-50/60 rounded-xl border border-yellow-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Processus en cours</h4>
                  <p className="text-sm text-yellow-700">
                    Nos équipes vérifient actuellement vos documents. Vous recevrez une notification dès que la vérification sera terminée.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Besoin d'aide ? Contactez notre support au 01 23 45 67 89
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (userStatus) {
      case 'pending':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
          color: 'yellow',
          bgGradient: 'from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          statusText: 'Vérification en cours',
          description: 'Votre dossier est en cours d\'examen par nos équipes.'
        };
      case 'rejected':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          color: 'red',
          bgGradient: 'from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          statusText: 'Vérification rejetée',
          description: 'Votre dossier a été rejeté. Veuillez corriger les informations.'
        };
      default:
        return {
          icon: <Lock className="w-8 h-8 text-blue-500" />,
          color: 'blue',
          bgGradient: 'from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          statusText: 'Vérification requise',
          description: 'Pour accéder à toutes les fonctionnalités, vous devez valider votre identité.'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl ${statusInfo.bgGradient} ${statusInfo.borderColor} border rounded-2xl shadow-2xl overflow-hidden`}>
        {/* Header avec effet de verre */}
        <div className="relative p-8 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                {statusInfo.icon}
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${statusInfo.textColor}`}>
                  {title || 'Vérification d\'identité'}
                </h1>
                <p className={`text-sm ${statusInfo.textColor} opacity-80`}>
                  {statusInfo.statusText}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              <span className="text-xs text-gray-500 font-medium">AmCbunq</span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-8">
          <div className="text-center mb-8">
            <p className={`text-lg leading-relaxed ${statusInfo.textColor} mb-6`}>
              {description || statusInfo.description}
            </p>
            
            {/* Bouton d'action principal */}
            <button 
              onClick={() => {
                console.log('Bouton cliqué, navigation vers /dashboard/kyc');
                navigate('/dashboard/kyc');
              }}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Shield className="w-5 h-5 mr-3" />
              Commencer la vérification
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Fonctionnalités disponibles après vérification */}
          {showFeatures && (
            <div className="mt-8">
              <h3 className={`text-lg font-semibold ${statusInfo.textColor} mb-4 text-center`}>
                Fonctionnalités disponibles après vérification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '💳', title: 'Cartes bancaires', desc: 'Demande de cartes physiques et virtuelles' },
                  { icon: '💸', title: 'Virements', desc: 'Transferts d\'argent entre comptes' },
                  { icon: '📊', title: 'Données complètes', desc: 'Accès à tous vos comptes et transactions' },
                  { icon: '💬', title: 'Support chat', desc: 'Assistance client en temps réel' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center p-4 bg-white/60 rounded-xl border border-gray-200 hover:bg-white/80 transition-colors">
                    <span className="text-2xl mr-3">{feature.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informations de sécurité */}
          <div className="mt-8 p-4 bg-white/40 rounded-xl border border-gray-200">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Sécurité garantie</h4>
                <p className="text-sm text-gray-600">
                  Vos données sont protégées par un chiffrement de niveau bancaire. 
                  La vérification d'identité est obligatoire pour votre sécurité et celle de vos fonds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Besoin d'aide ? Contactez notre support au 01 23 45 67 89
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernVerificationState; 