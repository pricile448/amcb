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
      title: t('documents.list.accountContract.title'),
      type: 'contract',
      description: t('documents.list.accountContract.description'),
      detailedDescription: t('documents.list.accountContract.detailedDescription'),
      usage: t('documents.list.accountContract.usage'),
      importance: t('documents.list.accountContract.importance'),
      version: 'v2.1',
      lastUpdated: '15/01/2024',
      size: '245 KB',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
      available: true,
      validityPeriod: t('documents.list.accountContract.validityPeriod') || 'Valid until 31/12/2024'
    },
    {
      id: '2',
      title: t('documents.list.privacyPolicy.title'),
      type: 'policy',
      description: t('documents.list.privacyPolicy.description'),
      detailedDescription: t('documents.list.privacyPolicy.detailedDescription'),
      usage: t('documents.list.privacyPolicy.usage'),
      importance: t('documents.list.privacyPolicy.importance'),
      version: 'v1.8',
      lastUpdated: '10/01/2024',
      size: '180 KB',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-green-600',
      available: true,
      validityPeriod: t('documents.list.privacyPolicy.validityPeriod') || 'Quarterly updates'
    },
    {
      id: '3',
      title: t('documents.list.termsOfService.title'),
      type: 'terms',
      description: t('documents.list.termsOfService.description'),
      detailedDescription: t('documents.list.termsOfService.detailedDescription'),
      usage: t('documents.list.termsOfService.usage'),
      importance: t('documents.list.termsOfService.importance'),
      version: 'v2.0',
      lastUpdated: '05/01/2024',
      size: '320 KB',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'text-purple-600',
      available: true,
      validityPeriod: t('documents.list.termsOfService.validityPeriod') || 'Current version'
    },
    {
      id: '4',
      title: t('documents.list.legalNotice.title'),
      type: 'legal',
      description: t('documents.list.legalNotice.description'),
      detailedDescription: t('documents.list.legalNotice.detailedDescription'),
      usage: t('documents.list.legalNotice.usage'),
      importance: t('documents.list.legalNotice.importance'),
      version: 'v1.5',
      lastUpdated: '20/12/2023',
      size: '156 KB',
      icon: <Scale className="w-5 h-5" />,
      color: 'text-orange-600',
      available: true,
      validityPeriod: t('documents.list.legalNotice.validityPeriod') || 'Annual updates'
    },
    {
      id: '5',
      title: t('documents.list.cardContract.title'),
      type: 'contract',
      description: t('documents.list.cardContract.description'),
      detailedDescription: t('documents.list.cardContract.detailedDescription'),
      usage: t('documents.list.cardContract.usage'),
      importance: t('documents.list.cardContract.importance'),
      version: 'v1.9',
      lastUpdated: '12/12/2023',
      size: '198 KB',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
      available: true,
      validityPeriod: t('documents.list.cardContract.validityPeriod') || 'Valid for card duration'
    },
    {
      id: '6',
      title: t('documents.list.securityPolicy.title'),
      type: 'policy',
      description: t('documents.list.securityPolicy.description'),
      detailedDescription: t('documents.list.securityPolicy.detailedDescription'),
      usage: t('documents.list.securityPolicy.usage'),
      importance: t('documents.list.securityPolicy.importance'),
      version: 'v1.7',
      lastUpdated: '08/12/2023',
      size: '142 KB',
      icon: <Lock className="w-5 h-5" />,
      color: 'text-red-600',
      available: true,
      validityPeriod: t('documents.list.securityPolicy.validityPeriod') || 'Continuous updates'
    }
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contract':
        return t('documents.types.contract');
      case 'policy':
        return t('documents.types.policy');
      case 'terms':
        return t('documents.types.terms');
      case 'legal':
        return t('documents.types.legal');
      default:
        return t('documents.types.document');
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
        title: t('documents.alerts.unavailable.title'),
        message: t('documents.alerts.unavailable.message'),
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
        title: t('documents.alerts.downloadSuccess.title'),
        message: t('documents.alerts.downloadSuccess.message', { title: doc.title }),
        type: 'success'
      });
      setShowAlert(true);
    } catch (error) {
      setAlertConfig({
        title: t('documents.alerts.downloadError.title'),
        message: t('documents.alerts.downloadError.message'),
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
        title: t('documents.alerts.unavailable.title'),
        message: t('documents.alerts.unavailable.message'),
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
      
      Ceci est un aperçu simulé du document. Pour le télécharger en PDF, utilisez le bouton t("common.upload").
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
              
              <p><em>Ceci est un aperçu simulé du document. Pour le télécharger en PDF, utilisez le bouton t("common.upload") sur la page principale.</em></p>
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
            <h1 className="text-2xl font-bold text-gray-900">{t('documents.title')}</h1>
            <p className="text-gray-600">{t('documents.subtitle')}</p>
          </div>
          <button
            onClick={() => setShowDocumentation(!showDocumentation)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Info className="w-4 h-4 mr-2" />
            {showDocumentation ? t('documents.hideDocumentation') : t('documents.showDocumentation')}
          </button>
        </div>
      </div>

      {/* Documentation Section */}
      {showDocumentation && (
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 mr-2 text-blue-600" />
            {t('documents.documentation.title')}
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{t('documents.documentation.types.title')}</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">{t('documents.types.contract')}</span>
                  <span className="text-sm text-gray-600">{t('documents.documentation.types.contract.description')}</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">{t('documents.types.policy')}</span>
                  <span className="text-sm text-gray-600">{t('documents.documentation.types.policy.description')}</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-3">{t('documents.types.terms')}</span>
                  <span className="text-sm text-gray-600">{t('documents.documentation.types.terms.description')}</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mr-3">{t('documents.types.legal')}</span>
                  <span className="text-sm text-gray-600">{t('documents.documentation.types.legal.description')}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{t('documents.documentation.format.title')}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('documents.documentation.format.pdf')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('documents.documentation.format.compatible')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('documents.documentation.format.signature')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('documents.documentation.format.retention')}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {t('documents.documentation.importantInfo.title')}
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• {t('documents.documentation.importantInfo.keepCopy')}</li>
              <li>• {t('documents.documentation.importantInfo.regularUpdates')}</li>
              <li>• {t('documents.documentation.importantInfo.notifications')}</li>
              <li>• {t('documents.documentation.importantInfo.contactLegal')}</li>
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
                  <span>{t('documents.documentInfo.version')}:</span>
                  <span className="font-medium">{document.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('documents.documentInfo.lastUpdated')}:</span>
                  <span>{document.lastUpdated}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('documents.documentInfo.size')}:</span>
                  <span>{document.size}</span>
                </div>
                {document.validityPeriod && (
                  <div className="flex justify-between">
                    <span>{t('documents.documentInfo.validity')}:</span>
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
                {t('documents.actions.view')}
              </button>
              <button
                onClick={() => handleDownload(document)}
                disabled={!document.available || downloadingDoc === document.id}
                className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                title={downloadingDoc === document.id ? (t('documents.actions.downloading') || 'Downloading...') : (t('documents.actions.download') || 'Download')}
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
          {t('documents.info.title')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('documents.info.legal.title')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('documents.info.legal.upToDate')}</li>
              <li>• {t('documents.info.legal.secureDownload')}</li>
              <li>• {t('documents.info.legal.retention')}</li>
              <li>• {t('documents.info.legal.notifications')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('documents.info.security.title')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('documents.info.security.protected')}</li>
              <li>• {t('documents.info.security.access')}</li>
              <li>• {t('documents.info.security.history')}</li>
              <li>• {t('documents.info.security.signature')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('documents.contact.title')}
            </h3>
            <p className="text-gray-600">
              {t('documents.contact.description')}
            </p>
          </div>
          <button 
            onClick={handleContactSupport}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('documents.contact.button')}
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