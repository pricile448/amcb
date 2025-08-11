import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Phone, MessageCircle, Mail, Calendar, FileText, Shield, CreditCard, TrendingUp, HelpCircle, BookOpen, File, DollarSign, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useParams } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getDashboardLink = (path: string) => {
    const currentLang = lang || 'fr';
    return `/${currentLang}/dashboard/${path}`;
  };

  const [faqItems] = useState<FAQItem[]>([
    {
      id: '1',
      question: t('help.faq.accountOpening.question'),
      answer: t('help.faq.accountOpening.answer'),
      category: 'account'
    },
    {
      id: '2',
      question: t('help.faq.transfer.question'),
      answer: t('help.faq.transfer.answer'),
      category: 'transfers'
    },
    {
      id: '3',
      question: t('help.faq.cardBlocked.question'),
      answer: t('help.faq.cardBlocked.answer'),
      category: 'cards'
    },
    {
      id: '4',
      question: t('help.faq.passwordChange.question'),
      answer: t('help.faq.passwordChange.answer'),
      category: 'security'
    },
    {
      id: '5',
      question: t('help.faq.bankingFees.question'),
      answer: t('help.faq.bankingFees.answer'),
      category: 'fees'
    },
    {
      id: '6',
      question: t('help.faq.twoFactor.question'),
      answer: t('help.faq.twoFactor.answer'),
      category: 'security'
    },
    {
      id: '7',
      question: t('help.faq.ibanChange.question'),
      answer: t('help.faq.ibanChange.answer'),
      category: 'account'
    },
    {
      id: '8',
      question: t('help.faq.downloadStatements.question'),
      answer: t('help.faq.downloadStatements.answer'),
      category: 'documents'
    }
  ]);

  const categories = [
    { id: 'all', name: t('help.categories.all'), count: faqItems.length },
    { id: 'account', name: t('help.categories.account'), count: faqItems.filter(item => item.category === 'account').length },
    { id: 'transfers', name: t('help.categories.transfers'), count: faqItems.filter(item => item.category === 'transfers').length },
    { id: 'cards', name: t('help.categories.cards'), count: faqItems.filter(item => item.category === 'cards').length },
    { id: 'security', name: t('help.categories.security'), count: faqItems.filter(item => item.category === 'security').length },
    { id: 'fees', name: t('help.categories.fees'), count: faqItems.filter(item => item.category === 'fees').length },
    { id: 'documents', name: t('help.categories.documents'), count: faqItems.filter(item => item.category === 'documents').length }
  ];

  const filteredFAQ = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Fonctions pour rendre les boutons fonctionnels
  const handlePhoneCall = () => {
    window.open('tel:0123456789', '_self');
  };

  const handleChat = () => {
    // Redirection vers la page messages ou ouverture d'un chat
    window.location.href = getDashboardLink('messages');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(t('help.contact.email.subject') || 'Demande d\'aide');
    window.open(`mailto:support@amcbunq.fr?subject=${subject}`, '_self');
  };

  const handleContactSupport = () => {
    // Redirection vers la page messages
    window.location.href = getDashboardLink('messages');
  };

  const handleAppointment = () => {
    // Ouverture d'un modal ou redirection vers une page de rendez-vous
    alert(t('help.appointment.alert') || 'Fonctionnalité de rendez-vous à venir');
  };

  const handleResourceClick = (resource: string) => {
    switch (resource) {
      case 'guide':
        alert(t('help.resources.guide.alert') || 'Guide utilisateur - Redirection vers PDF');
        break;
      case 'conditions':
        window.location.href = getDashboardLink('documents');
        break;
      case 'privacy':
        window.location.href = getDashboardLink('documents');
        break;
      case 'tarifs':
        alert(t('help.resources.fees.alert') || 'Tarifs - Redirection vers la page des prix');
        break;
      default:
        break;
    }
  };

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: t('help.contact.phone.title') || 'Téléphone',
      description: t('help.contact.phone.description') || 'Service client 24/7',
      contact: t('help.contact.phone.number') || '01 23 45 67 89',
      action: t('help.contact.phone.action') || 'Appeler maintenant',
      onClick: handlePhoneCall
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: t('help.contact.chat.title') || 'Chat en ligne',
      description: t('help.contact.chat.description') || 'Réponse immédiate',
      contact: t('help.contact.chat.availability') || 'Disponible 24/7',
      action: t('help.contact.chat.action') || 'Démarrer le chat',
      onClick: handleChat
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t('help.contact.email.title') || 'E-mail',
      description: t('help.contact.email.description') || 'Réponse sous 24h',
      contact: t('help.contact.email.address') || 'support@amcbunq.fr',
      action: t('help.contact.email.action') || 'Envoyer un email',
      onClick: handleEmail
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('help.title') || 'Aide & Support'}</h1>
        <p className="text-gray-600">{t('help.subtitle') || 'Trouvez rapidement l\'aide dont vous avez besoin'}</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('help.search.placeholder') || 'Search help...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contact Methods */}
      <div className="grid gap-6 mb-8 md:grid-cols-3">
        {contactMethods.map((method, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                {method.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{method.title}</h3>
                <p className="text-sm text-gray-500">{method.description}</p>
              </div>
            </div>
            <p className="text-lg font-medium text-gray-900 mb-4">{method.contact}</p>
            <button 
              onClick={method.onClick}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {method.action}
            </button>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('help.categories.title')}</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {t('help.faq.title')}
          </h2>
          <p className="text-gray-600 mt-1">
            {t('help.faq.results', { count: filteredFAQ.length })}
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredFAQ.map((item) => (
            <div key={item.id} className="p-6">
              <button
                onClick={() => toggleExpanded(item.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <h3 className="text-lg font-medium text-gray-900 pr-4">
                  {item.question}
                </h3>
                {expandedItems.has(item.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {expandedItems.has(item.id) && (
                <div className="mt-4 text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQ.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('help.faq.noResults.title')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('help.faq.noResults.description')}
            </p>
          </div>
        )}
      </div>

      {/* Additional Resources */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
                 <div className="bg-white rounded-lg shadow-sm border p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('help.resources.title')}</h3>
           <div className="space-y-3">
             <button 
               onClick={() => handleResourceClick('guide')}
               className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
             >
               <ExternalLink className="w-4 h-4" />
               <span>{t('help.resources.guide.title')}</span>
             </button>
             <button 
               onClick={() => handleResourceClick('conditions')}
               className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
             >
               <ExternalLink className="w-4 h-4" />
               <span>{t('help.resources.conditions.title')}</span>
             </button>
             <button 
               onClick={() => handleResourceClick('privacy')}
               className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
             >
               <ExternalLink className="w-4 h-4" />
               <span>{t('help.resources.privacy.title')}</span>
             </button>
             <button 
               onClick={() => handleResourceClick('tarifs')}
               className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
             >
               <ExternalLink className="w-4 h-4" />
               <span>{t('help.resources.fees.title')}</span>
             </button>
           </div>
         </div>

                 <div className="bg-white rounded-lg shadow-sm border p-6">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('help.importantInfo.title')}</h3>
           <div className="space-y-3 text-sm text-gray-600">
             <p>• {t('help.importantInfo.openingHours')}</p>
             <p>• {t('help.importantInfo.emailResponse')}</p>
             <p>• {t('help.importantInfo.chatResponse')}</p>
             <p>• {t('help.importantInfo.emergencyNumber')}</p>
           </div>
         </div>
      </div>

             {/* Still Need Help */}
       <div className="mt-8 bg-blue-50 rounded-lg p-6">
         <h3 className="text-lg font-semibold text-gray-900 mb-2">
           {t('help.stillNeedHelp.title')}
         </h3>
         <p className="text-gray-600 mb-4">
           {t('help.stillNeedHelp.description')}
         </p>
         <div className="flex flex-wrap gap-3">
           <button 
             onClick={handleContactSupport}
             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
           >
             {t('help.stillNeedHelp.contactButton')}
           </button>
           <button 
             onClick={handleAppointment}
             className="bg-white text-blue-600 px-4 py-2 rounded-md border border-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
           >
             {t('help.stillNeedHelp.appointmentButton')}
           </button>
         </div>
       </div>
    </div>
  );
};

export default HelpPage; 