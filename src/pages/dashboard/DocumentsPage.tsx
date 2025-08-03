import React, { useState } from 'react';
import { Download, Eye, FileText, Shield, BookOpen, Scale, Lock, ExternalLink, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ModernAlert from '../../components/ModernAlert';

interface Document {
  id: string;
  title: string;
  type: 'contract' | 'policy' | 'terms' | 'legal';
  description: string;
  version: string;
  lastUpdated: string;
  size: string;
  icon: React.ReactNode;
  color: string;
  available: boolean;
  detailedDescription: string;
  usage: string;
  importance: string;
  validityPeriod?: string;
}

const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [downloadingDoc, setDownloadingDoc] = useState<string | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const documents: Document[] = [
    {
      id: '1',
      title: 'Contrat de compte bancaire',
      type: 'contract',
      description: 'Conditions générales de votre compte AmCbunq',
      detailedDescription: 'Ce contrat définit les conditions générales d\'ouverture et d\'utilisation de votre compte bancaire AmCbunq. Il inclut les droits et obligations de chaque partie, les conditions de fonctionnement du compte, les frais applicables, et les modalités de résiliation.',
      usage: 'Consultez ce document pour comprendre vos droits et obligations en tant que titulaire de compte. Il est important de le conserver car il peut être demandé pour des démarches administratives ou en cas de litige.',
      importance: 'Document légal obligatoire',
      version: 'v2.1',
      lastUpdated: '15/01/2024',
      size: '245 KB',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
      available: true,
      validityPeriod: 'Valide jusqu\'au 31/12/2024'
    },
    {
      id: '2',
      title: 'Politique de confidentialité',
      type: 'policy',
      description: 'Comment nous protégeons vos données personnelles',
      detailedDescription: 'Cette politique détaille comment AmCbunq collecte, utilise, stocke et protège vos données personnelles conformément au RGPD. Elle explique vos droits en matière de protection des données et comment les exercer.',
      usage: 'Lisez attentivement cette politique pour comprendre comment vos données sont traitées. Vous pouvez exercer vos droits (accès, rectification, suppression) en contactant notre délégué à la protection des données.',
      importance: 'Conformité RGPD',
      version: 'v1.8',
      lastUpdated: '10/01/2024',
      size: '180 KB',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-green-600',
      available: true,
      validityPeriod: 'Mise à jour trimestrielle'
    },
    {
      id: '3',
      title: 'Conditions d\'utilisation',
      type: 'terms',
      description: 'Règles d\'utilisation de nos services bancaires',
      detailedDescription: 'Ces conditions régissent l\'utilisation de tous nos services bancaires en ligne, mobiles et physiques. Elles couvrent les règles de sécurité, les limites d\'utilisation, les responsabilités et les sanctions en cas de non-respect.',
      usage: 'Acceptez ces conditions pour utiliser nos services. Elles peuvent être modifiées avec un préavis de 30 jours. En cas de modification, vous serez notifié par email et dans votre espace client.',
      importance: 'Conditions d\'accès aux services',
      version: 'v2.0',
      lastUpdated: '05/01/2024',
      size: '320 KB',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'text-purple-600',
      available: true,
      validityPeriod: 'Version en vigueur'
    },
    {
      id: '4',
      title: 'Avis légal',
      type: 'legal',
      description: 'Informations légales et réglementaires',
      detailedDescription: 'Cet avis contient les informations légales obligatoires sur AmCbunq : identité de l\'établissement, autorisations bancaires, supervision, garanties des dépôts, et coordonnées des autorités de contrôle.',
      usage: 'Consultez cet avis pour vérifier la légalité de nos activités et connaître vos garanties. Ces informations sont importantes pour votre sécurité et la conformité de nos services.',
      importance: 'Obligation légale',
      version: 'v1.5',
      lastUpdated: '20/12/2023',
      size: '156 KB',
      icon: <Scale className="w-5 h-5" />,
      color: 'text-orange-600',
      available: true,
      validityPeriod: 'Mise à jour annuelle'
    },
    {
      id: '5',
      title: 'Contrat de carte bancaire',
      type: 'contract',
      description: 'Conditions spécifiques à votre carte bancaire',
      detailedDescription: 'Ce contrat détaille les conditions d\'émission et d\'utilisation de votre carte bancaire : plafonds, frais, assurances, responsabilités en cas de perte ou vol, et procédures de contestation.',
      usage: 'Conservez ce document avec votre carte. Il contient les informations essentielles sur vos droits et obligations, notamment en cas de fraude ou de contestation de transaction.',
      importance: 'Protection juridique',
      version: 'v1.9',
      lastUpdated: '12/12/2023',
      size: '198 KB',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
      available: true,
      validityPeriod: 'Valide pendant la durée de validité de la carte'
    },
    {
      id: '6',
      title: 'Politique de sécurité',
      type: 'policy',
      description: 'Mesures de sécurité pour protéger votre compte',
      detailedDescription: 'Cette politique détaille les mesures de sécurité mises en place par AmCbunq pour protéger votre compte et vos données : authentification multi-facteurs, surveillance des transactions, cryptage des données, et procédures en cas d\'incident.',
      usage: 'Suivez ces recommandations pour sécuriser votre compte. En cas de suspicion de compromission, contactez immédiatement notre service sécurité.',
      importance: 'Sécurité du compte',
      version: 'v1.7',
      lastUpdated: '08/12/2023',
      size: '142 KB',
      icon: <Lock className="w-5 h-5" />,
      color: 'text-red-600',
      available: true,
      validityPeriod: 'Mise à jour continue'
    }
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contract':
        return 'Contrat';
      case 'policy':
        return 'Politique';
      case 'terms':
        return 'Conditions';
      case 'legal':
        return 'Légal';
      default:
        return 'Document';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract':
        return 'bg-blue-100 text-blue-800';
      case 'policy':
        return 'bg-green-100 text-green-800';
      case 'terms':
        return 'bg-purple-100 text-purple-800';
      case 'legal':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour générer un PDF simulé
  const generatePDFContent = (document: Document): string => {
    const pdfContent = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 500
>>
stream
BT
/F1 12 Tf
72 720 Td
(${document.title}) Tj
0 -20 Td
(Version: ${document.version}) Tj
0 -20 Td
(Dernière mise à jour: ${document.lastUpdated}) Tj
0 -20 Td
(Taille: ${document.size}) Tj
0 -30 Td
(${document.detailedDescription}) Tj
0 -20 Td
(Usage: ${document.usage}) Tj
0 -20 Td
(Importance: ${document.importance}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
625
%%EOF
    `;
    return pdfContent;
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.available) {
      setAlertConfig({
        title: 'Document indisponible',
        message: 'Ce document n\'est pas disponible pour le moment.',
        type: 'warning'
      });
      setShowAlert(true);
      return;
    }

    setDownloadingDoc(doc.id);
    
    try {
      // Simulation d'un téléchargement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Générer le contenu PDF
      const pdfContent = generatePDFContent(doc);
      
      // Créer un blob PDF
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.title.replace(/\s+/g, '_')}_${doc.version}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      URL.revokeObjectURL(url);
      
      setAlertConfig({
        title: 'Téléchargement réussi',
        message: `Le document "${doc.title}" a été téléchargé en PDF avec succès !`,
        type: 'success'
      });
      setShowAlert(true);
    } catch (error) {
      setAlertConfig({
        title: 'Erreur de téléchargement',
        message: 'Une erreur est survenue lors du téléchargement. Veuillez réessayer.',
        type: 'error'
      });
      setShowAlert(true);
    } finally {
      setDownloadingDoc(null);
    }
  };

  const handleView = (doc: Document) => {
    if (!doc.available) {
      setAlertConfig({
        title: 'Document indisponible',
        message: 'Ce document n\'est pas disponible pour le moment.',
        type: 'warning'
      });
      setShowAlert(true);
      return;
    }

    // Simulation d'ouverture en ligne
    const content = `
      ${doc.title}
      Version: ${doc.version}
      Dernière mise à jour: ${doc.lastUpdated}
      Taille: ${doc.size}
      
      ${doc.description}
      
      Ceci est un aperçu simulé du document. Pour le télécharger en PDF, utilisez le bouton "Télécharger".
    `;
    
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>${doc.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
              .meta { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
              .content { margin-top: 20px; }
              .importance { background: #fef3c7; padding: 10px; border-radius: 6px; margin: 10px 0; }
              .usage { background: #dbeafe; padding: 10px; border-radius: 6px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <h1>${doc.title}</h1>
            <div class="meta">
              <strong>Version:</strong> ${doc.version}<br>
              <strong>Dernière mise à jour:</strong> ${doc.lastUpdated}<br>
              <strong>Taille:</strong> ${doc.size}<br>
              ${doc.validityPeriod ? `<strong>Validité:</strong> ${doc.validityPeriod}` : ''}
            </div>
            <div class="content">
              <h3>Description détaillée</h3>
              <p>${doc.detailedDescription}</p>
              
              <div class="importance">
                <strong>Importance:</strong> ${doc.importance}
              </div>
              
              <div class="usage">
                <strong>Usage:</strong> ${doc.usage}
              </div>
              
              <p><em>Ceci est un aperçu simulé du document. Pour le télécharger en PDF, utilisez le bouton "Télécharger" sur la page principale.</em></p>
            </div>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleContactSupport = () => {
    // Redirection vers la page messages ou ouverture d'un chat
    window.location.href = '/dashboard/messages';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Documents</h1>
            <p className="text-gray-600">Contrats, politiques et conditions d'utilisation</p>
          </div>
          <button
            onClick={() => setShowDocumentation(!showDocumentation)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Info className="w-4 h-4 mr-2" />
            {showDocumentation ? 'Masquer la documentation' : 'Voir la documentation'}
          </button>
        </div>
      </div>

      {/* Documentation Section */}
      {showDocumentation && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            Documentation des Documents
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Types de Documents</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">Contrat</span>
                  <span className="text-sm text-gray-600">Documents légaux définissant les conditions d'utilisation</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">Politique</span>
                  <span className="text-sm text-gray-600">Règles et procédures internes de l'établissement</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-3">Conditions</span>
                  <span className="text-sm text-gray-600">Conditions générales d'utilisation des services</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mr-3">Légal</span>
                  <span className="text-sm text-gray-600">Informations légales et réglementaires obligatoires</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Format de Téléchargement</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Tous les documents sont téléchargés au format PDF
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Compatible avec tous les lecteurs PDF
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Signature électronique acceptée
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Conservation recommandée pour 5 ans
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Informations importantes
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Conservez une copie de tous vos documents contractuels</li>
              <li>• Les documents sont mis à jour régulièrement - vérifiez les versions</li>
              <li>• En cas de modification, vous recevrez une notification</li>
              <li>• Contactez notre service juridique pour toute question</li>
            </ul>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <div key={document.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            {/* Document Header */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center ${document.color}`}>
                {document.icon}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(document.type)}`}>
                {getTypeLabel(document.type)}
              </span>
            </div>

            {/* Document Info */}
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">{document.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{document.description}</p>
              
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-medium">{document.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mis à jour:</span>
                  <span>{document.lastUpdated}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taille:</span>
                  <span>{document.size}</span>
                </div>
                {document.validityPeriod && (
                  <div className="flex justify-between">
                    <span>Validité:</span>
                    <span className="text-xs">{document.validityPeriod}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => handleView(document)}
                disabled={!document.available}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4 mr-2" />
                Consulter
              </button>
              <button
                onClick={() => handleDownload(document)}
                disabled={!document.available || downloadingDoc === document.id}
                className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                title={downloadingDoc === document.id ? 'Téléchargement PDF en cours...' : 'Télécharger en PDF'}
              >
                {downloadingDoc === document.id ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Information Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informations importantes
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Documents légaux</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tous les documents sont à jour et conformes</li>
              <li>• Téléchargement au format PDF sécurisé</li>
              <li>• Conservation recommandée pendant 5 ans</li>
              <li>• Notification automatique des modifications</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sécurité et Conformité</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Documents protégés et authentifiés</li>
              <li>• Accès 24h/24 à vos contrats</li>
              <li>• Historique des versions disponible</li>
              <li>• Signature électronique acceptée</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Besoin d'aide ?
            </h3>
            <p className="text-gray-600">
              Questions sur vos documents ou contrats ? Notre équipe juridique est là pour vous aider.
            </p>
          </div>
          <button 
            onClick={handleContactSupport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Contacter le support
          </button>
        </div>
      </div>

      {/* Modern Alert */}
      <ModernAlert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
};

export default DocumentsPage; 