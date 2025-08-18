import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Phone, Mail, MessageCircle, BookOpen } from 'lucide-react';

const CardsSupport: React.FC = () => {
  const { t } = useTranslation();

  const supportOptions = [
    {
      icon: <Phone className="w-5 h-5 text-blue-600" />,
      title: t('cards.support.options.phone.title'),
      description: t('cards.support.options.phone.description'),
      action: t('cards.support.options.phone.action'),
      href: "tel:+33123456789"
    },
    {
      icon: <Mail className="w-5 h-5 text-green-600" />,
      title: t('cards.support.options.email.title'),
      description: t('cards.support.options.email.description'),
      action: t('cards.support.options.email.action'),
      href: "mailto:support@amcbunq.com"
    },
    {
      icon: <MessageCircle className="w-5 h-5 text-purple-600" />,
      title: t('cards.support.options.chat.title'),
      description: t('cards.support.options.chat.description'),
      action: t('cards.support.options.chat.action'),
      href: "#"
    },
    {
      icon: <BookOpen className="w-5 h-5 text-orange-600" />,
      title: t('cards.support.options.help.title'),
      description: t('cards.support.options.help.description'),
      action: t('cards.support.options.help.action'),
      href: "#"
    }
  ];

  const commonQuestions = [
    {
      question: t('cards.support.faq.questions.activation.question'),
      answer: t('cards.support.faq.questions.activation.answer')
    },
    {
      question: t('cards.support.faq.questions.lost.question'),
      answer: t('cards.support.faq.questions.lost.answer')
    },
    {
      question: t('cards.support.faq.questions.pin.question'),
      answer: t('cards.support.faq.questions.pin.answer')
    },
    {
      question: t('cards.support.faq.questions.acceptance.question'),
      answer: t('cards.support.faq.questions.acceptance.answer')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('cards.support.title')}</h2>
      
      {/* Options de support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {supportOptions.map((option, index) => (
          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">{option.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                <a
                  href={option.href}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  {option.action}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Questions fréquentes */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-900 mb-3">{t('cards.support.faq.title')}</h3>
        <div className="space-y-3">
          {commonQuestions.map((item, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">{item.question}</h4>
              <p className="text-sm text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Message d'urgence */}
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <HelpCircle className="w-5 h-5 text-red-600 mr-2" />
          <div>
            <p className="text-sm font-medium text-red-800">
              Urgence - Carte perdue ou volée ?
            </p>
            <p className="text-xs text-red-700">
              Appelez immédiatement le <strong>0800 123 456</strong> (gratuit et disponible 24/7)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardsSupport;
