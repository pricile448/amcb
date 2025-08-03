import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MessageCircle, Phone, Mail, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [faqItems] = useState<FAQItem[]>([
    {
      id: '1',
      question: 'Comment ouvrir un compte bancaire ?',
      answer: 'Pour ouvrir un compte, rendez-vous sur notre site web et cliquez sur "Ouvrir un compte". Vous devrez fournir vos informations personnelles, une pièce d\'identité et un justificatif de domicile. Le processus prend généralement 24-48h.',
      category: 'compte'
    },
    {
      id: '2',
      question: 'Comment effectuer un virement ?',
      answer: 'Connectez-vous à votre espace client, allez dans la section "Virements" et suivez les étapes. Vous aurez besoin du RIB du bénéficiaire. Les virements SEPA sont généralement traités sous 24h.',
      category: 'virements'
    },
    {
      id: '3',
      question: 'Ma carte a été bloquée, que faire ?',
      answer: 'Si votre carte est bloquée, contactez immédiatement notre service client au 01 23 45 67 89. Nous pourrons la débloquer ou vous en envoyer une nouvelle si nécessaire.',
      category: 'cartes'
    },
    {
      id: '4',
      question: 'Comment changer mon mot de passe ?',
      answer: 'Allez dans "Paramètres" > "Sécurité" > "Changer le mot de passe". Vous devrez saisir votre mot de passe actuel et le nouveau mot de passe deux fois.',
      category: 'securite'
    },
    {
      id: '5',
      question: 'Quels sont les frais bancaires ?',
      answer: 'Nos tarifs varient selon le type de compte. Consultez notre grille tarifaire dans la section "Tarifs" ou contactez notre service client pour plus de détails.',
      category: 'tarifs'
    },
    {
      id: '6',
      question: 'Comment activer l\'authentification à deux facteurs ?',
      answer: 'Dans "Paramètres" > "Sécurité", vous pouvez activer l\'authentification à deux facteurs. Vous recevrez un code par SMS à chaque connexion.',
      category: 'securite'
    },
    {
      id: '7',
      question: 'Mon IBAN a-t-il changé ?',
      answer: 'Non, votre IBAN reste le même sauf en cas de changement de compte. Vous pouvez le consulter dans la section "Mon IBAN" de votre espace client.',
      category: 'compte'
    },
    {
      id: '8',
      question: 'Comment télécharger mes relevés bancaires ?',
      answer: 'Allez dans "Historique" > sélectionnez la période > cliquez sur "Télécharger". Vous pouvez choisir le format PDF ou CSV.',
      category: 'documents'
    }
  ]);

  const categories = [
    { id: 'all', name: 'Toutes les questions', count: faqItems.length },
    { id: 'compte', name: 'Compte bancaire', count: faqItems.filter(item => item.category === 'compte').length },
    { id: 'virements', name: 'Virements', count: faqItems.filter(item => item.category === 'virements').length },
    { id: 'cartes', name: 'Cartes bancaires', count: faqItems.filter(item => item.category === 'cartes').length },
    { id: 'securite', name: 'Sécurité', count: faqItems.filter(item => item.category === 'securite').length },
    { id: 'tarifs', name: 'Tarifs', count: faqItems.filter(item => item.category === 'tarifs').length },
    { id: 'documents', name: 'Documents', count: faqItems.filter(item => item.category === 'documents').length }
  ];

  const filteredFAQ = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Fonctions pour rendre les boutons fonctionnels
  const handlePhoneCall = () => {
    window.open('tel:0123456789', '_self');
  };

  const handleChat = () => {
    // Redirection vers la page messages ou ouverture d'un chat
    window.location.href = '/dashboard/messages';
  };

  const handleEmail = () => {
    window.open('mailto:support@amcbunq.fr?subject=Demande d\'aide', '_self');
  };

  const handleContactSupport = () => {
    // Redirection vers la page messages
    window.location.href = '/dashboard/messages';
  };

  const handleAppointment = () => {
    // Ouverture d'un modal ou redirection vers une page de rendez-vous
    alert('Fonctionnalité de prise de rendez-vous à venir. Contactez-nous par téléphone au 01 23 45 67 89.');
  };

  const handleResourceClick = (resource: string) => {
    switch (resource) {
      case 'guide':
        alert('Guide d\'utilisation - Redirection vers le guide PDF');
        break;
      case 'conditions':
        window.location.href = '/dashboard/documents';
        break;
      case 'privacy':
        window.location.href = '/dashboard/documents';
        break;
      case 'tarifs':
        alert('Grille tarifaire - Redirection vers la page des tarifs');
        break;
      default:
        break;
    }
  };

  const contactMethods = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Téléphone',
      description: 'Service client 24h/7j',
      contact: '01 23 45 67 89',
      action: 'Appeler maintenant',
      onClick: handlePhoneCall
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'Chat en ligne',
      description: 'Réponse immédiate',
      contact: 'Disponible 24h/7j',
      action: 'Démarrer le chat',
      onClick: handleChat
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'Email',
      description: 'Réponse sous 24h',
      contact: 'support@amcbunq.fr',
      action: 'Envoyer un email',
      onClick: handleEmail
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Aide & Support</h1>
        <p className="text-gray-600">Trouvez rapidement les réponses à vos questions</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher dans l'aide..."
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions par catégorie</h2>
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
            Questions fréquemment posées
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredFAQ.length} question{filteredFAQ.length > 1 ? 's' : ''} trouvée{filteredFAQ.length > 1 ? 's' : ''}
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
                {expandedItems.includes(item.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {expandedItems.includes(item.id) && (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune question trouvée</h3>
            <p className="mt-1 text-sm text-gray-500">
              Essayez de modifier vos critères de recherche ou contactez notre support.
            </p>
          </div>
        )}
      </div>

      {/* Additional Resources */}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ressources utiles</h3>
          <div className="space-y-3">
            <button 
              onClick={() => handleResourceClick('guide')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Guide d'utilisation</span>
            </button>
            <button 
              onClick={() => handleResourceClick('conditions')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Conditions générales</span>
            </button>
            <button 
              onClick={() => handleResourceClick('privacy')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Politique de confidentialité</span>
            </button>
            <button 
              onClick={() => handleResourceClick('tarifs')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Grille tarifaire</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations importantes</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Horaires d'ouverture : 24h/7j</p>
            <p>• Temps de réponse email : 24h maximum</p>
            <p>• Temps de réponse chat : Immédiat</p>
            <p>• Numéro d'urgence : 01 23 45 67 89</p>
          </div>
        </div>
      </div>

      {/* Still Need Help */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Vous n'avez pas trouvé votre réponse ?
        </h3>
        <p className="text-gray-600 mb-4">
          Notre équipe support est là pour vous aider. Contactez-nous par téléphone, chat ou email.
        </p>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleContactSupport}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Contacter le support
          </button>
          <button 
            onClick={handleAppointment}
            className="bg-white text-blue-600 px-4 py-2 rounded-md border border-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            Prendre rendez-vous
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage; 