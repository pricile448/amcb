import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Shield, ArrowRight, Clock } from 'lucide-react';

const KycSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  const getDashboardLink = (path: string) => {
    const currentLang = lang || 'fr';
    return `/${currentLang}/dashboard/${path}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Icône de succès */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            
            {/* Titre principal */}
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {t('kycSuccess.title')}
            </h2>
            
            {/* Message de vérification en cours */}
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-2 text-yellow-600">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">{t('kycSuccess.verificationInProgress')}</span>
              </div>
              
              <p className="mt-4 text-sm text-gray-600">
                {t('kycSuccess.description')}
              </p>
              
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm font-medium text-yellow-800">
                  {t('kycSuccess.waitMessage')}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {t('kycSuccess.waitDescription')}
                </p>
              </div>
            </div>
            
            {/* Informations supplémentaires */}
            <div className="mt-6 text-left">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {t('kycSuccess.nextSteps')}
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {t('kycSuccess.steps.received')}
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">⏳</span>
                  {t('kycSuccess.steps.verification')}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">📧</span>
                  {t('kycSuccess.steps.notification')}
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  {t('kycSuccess.steps.access')}
                </li>
              </ul>
            </div>
            
            {/* Bouton retour au tableau de bord */}
            <div className="mt-8">
              <Link
                to={getDashboardLink('')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('kyc.navigation.backToDashboard')}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KycSuccessPage;
