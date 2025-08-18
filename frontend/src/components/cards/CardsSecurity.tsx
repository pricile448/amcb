import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertCircle, Lock, Eye, Smartphone } from 'lucide-react';

const CardsSecurity: React.FC = () => {
  const { t } = useTranslation();

  const securityFeatures = [
    {
      icon: <Shield className="w-5 h-5 text-blue-600" />,
      title: t('cards.security.features.0'),
      description: t('cards.security.features.0'),
      color: "text-blue-600"
    },
    {
      icon: <Lock className="w-5 h-5 text-green-600" />,
      title: t('cards.security.features.1'),
      description: t('cards.security.features.1'),
      color: "text-green-600"
    },
    {
      icon: <Eye className="w-5 h-5 text-purple-600" />,
      title: t('cards.security.features.2'),
      description: t('cards.security.features.2'),
      color: "text-purple-600"
    },
    {
      icon: <Smartphone className="w-5 h-5 text-orange-600" />,
      title: t('cards.security.features.3'),
      description: t('cards.security.features.3'),
      color: "text-orange-600"
    }
  ];

  const securityTips = [
    {
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      tip: t('cards.security.tips.pinCvv')
    },
    {
      icon: <AlertCircle className="w-4 h-4 text-orange-500" />,
      tip: t('cards.security.tips.secureSites')
    },
    {
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
      tip: t('cards.security.tips.monitorTransactions')
    },
    {
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      tip: t('cards.security.tips.reportSuspicious')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('cards.security.title')}</h2>
      
      {/* Fonctionnalités de sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conseils de sécurité */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-900 mb-3">{t('cards.security.tips.title')}</h3>
        <div className="space-y-2">
          {securityTips.map((tip, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
              {tip.icon}
              <span>{tip.tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Message d'information */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-blue-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              {t('cards.security.fraudProtection.guarantee')}
            </p>
            <p className="text-xs text-blue-700">
              {t('cards.security.fraudProtection.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsSecurity;
