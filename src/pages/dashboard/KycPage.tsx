import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FirebaseDataService } from '../../services/firebaseData';
import { kycService } from '../../services/kycService';
import { useNotifications } from '../../hooks/useNotifications';
import { useKycSync } from '../../hooks/useKycSync';

// Types
import { KYCDocumentType } from '../../types/kyc';

interface KycDocument {
  id: string;
  type: string;
  name: string;
  file: File | null;
  uploaded: boolean;
  required: boolean;
  translationKey: string;
}

const KycPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const { kycStatus, syncKycStatus } = useKycSync();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const [documents, setDocuments] = useState<KycDocument[]>([
    {
      id: 'identity',
      type: 'identity',
      name: t('kyc.identityDocument'),
      file: null,
      uploaded: false,
      required: true,
      translationKey: 'kyc.identityDocument'
    },
    {
      id: 'proof_of_address',
      type: 'proof_of_address',
      name: t('kyc.proofOfAddress'),
      file: null,
      uploaded: false,
      required: true,
      translationKey: 'kyc.proofOfAddress'
    },
    {
      id: 'proof_of_income',
      type: 'proof_of_income',
      name: t('kyc.proofOfIncome'),
      file: null,
      uploaded: false,
      required: true,
      translationKey: 'kyc.proofOfIncome'
    }
  ]);
  
  // Mettre à jour les noms des documents lorsque la langue change
  useEffect(() => {
    setDocuments(prev => prev.map(doc => ({
      ...doc,
      name: doc.translationKey ? t(doc.translationKey) : doc.name
    })));
  }, [t]);
  
  // Composant pour le document à uploader
  const DocumentUploadItem = ({ 
    document, 
    onFileChange, 
    onRemoveFile 
  }: { 
    document: KycDocument; 
    onFileChange: (documentId: string, file: File) => void; 
    onRemoveFile: (documentId: string) => void; 
  }) => {
    const { showError } = useNotifications();
    
    return (
      <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <div className="mb-2 sm:mb-0">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">
              {document.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('kyc.acceptedFormats')}
            </p>
          </div>
          {document.required && (
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full self-start">
              {t('kyc.required')}
            </span>
          )}
        </div>

        {!document.uploaded ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id={`file-${document.id}`}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.heif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
                  onFileChange(document.id, file);
                } else if (file) {
                  showError(t('kyc.fileTooLarge'), t('kyc.fileTooLargeMessage'));
                }
              }}
            />
            <label htmlFor={`file-${document.id}`} className="cursor-pointer">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm sm:text-base text-gray-600">
                {t('kyc.selectFile')}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {t('kyc.dragDrop')}
              </p>
            </label>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-green-900 text-sm sm:text-base truncate">
                    {document.file?.name}
                  </p>
                  <p className="text-xs sm:text-sm text-green-700">
                    {((document.file?.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemoveFile(document.id)}
                className="text-red-600 hover:text-red-800 text-xs sm:text-sm self-start sm:self-center"
              >
                {t('kyc.removeFile')}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Extraire les composants d'information KYC
  const KycInfoSection = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">
        {t('kyc.importantInfo')}
      </h3>
      <ul className="space-y-2 text-sm text-blue-700">
        <li className="flex items-start">
          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <span>{t('kyc.secureProcessing')}</span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <span>{t('kyc.verificationTime')}</span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <span>{t('kyc.emailNotification')}</span>
        </li>
        <li className="flex items-start">
          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <span>{t('kyc.accountLimits')}</span>
        </li>
      </ul>
    </div>
  );
  
  // Composant pour le bouton de soumission
  const SubmitButton = ({ 
    onClick, 
    disabled, 
    isSubmitting 
  }: { 
    onClick: () => void; 
    disabled: boolean; 
    isSubmitting: boolean; 
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || isSubmitting}
      className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
    >
      {isSubmitting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {t('kyc.submitting')}
        </>
      ) : (
        t('kyc.submitDocuments')
      )}
    </button>
  );
  
  // Composant pour la section des documents
  const DocumentsSection = ({
    documents,
    onFileChange,
    onRemoveFile
  }: {
    documents: KycDocument[];
    onFileChange: (documentId: string, file: File) => void;
    onRemoveFile: (documentId: string) => void;
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
      <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
        {t('kyc.documentsRequired')}
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {documents.map((document) => (
          <DocumentUploadItem 
            key={document.id} 
            document={document} 
            onFileChange={onFileChange}
            onRemoveFile={onRemoveFile}
          />
        ))}
      </div>
    </div>
  );

  // Charger les informations utilisateur et synchroniser le statut KYC
  const loadUserStatus = useCallback(async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    try {
      const user = JSON.parse(userStr);
      const userId = user.id;
      const userEmail = user.email || '';
      const userName = user.displayName || user.firstName + ' ' + user.lastName || t('common.defaultUser');
      
      setUserId(userId);
      setUserEmail(userEmail);
      setUserName(userName);
      
      // Synchroniser le statut KYC
      await syncKycStatus();
    } catch (error) {
      console.error(t('kyc.errors.parsingUser'), error);
    }
  }, [syncKycStatus, t]);

  useEffect(() => {
    loadUserStatus();
  }, [loadUserStatus]);

  // Gestionnaires de documents
  const handleFileChange = useCallback((documentId: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file, uploaded: true }
        : doc
    ));
  }, []);

  const removeFile = useCallback((documentId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file: null, uploaded: false }
        : doc
    ));
  }, []);

  // Mapper le type de document pour le service KYC
  const mapDocumentType = (docType: string): KYCDocumentType => {
    switch (docType) {
      case 'identity':
        return 'identity';
      case 'proof_of_address':
        return 'address';
      case 'proof_of_income':
        return 'income';
      default:
        return 'identity';
    }
  };

  // Soumettre les documents
  const handleSubmit = async () => {
    if (!userId || !userEmail || !userName) {
      showError(t('common.error'), t('kyc.errors.userMissing'));
      return;
    }

    // Vérifier que tous les documents requis sont uploadés
    const requiredDocuments = documents.filter(doc => doc.required);
    const missingDocuments = requiredDocuments.filter(doc => !doc.uploaded);

    if (missingDocuments.length > 0) {
      showError(t('kyc.missingDocuments'), t('kyc.missingDocumentsMessage'));
      return;
    }

    setSubmitting(true);
    try {
      // Uploader tous les documents requis
      const uploadResults = [];
      for (const doc of documents) {
        if (doc.uploaded && doc.file) {
          const documentType = mapDocumentType(doc.type);
          const result = await kycService.submitDocument(userId, doc.file, documentType);
          uploadResults.push(result);
        }
      }

      // Mettre à jour le statut KYC après tous les uploads
      await kycService.updateKYCStatus(userId, 'pending');

      // Mettre à jour le statut KYC localement
      await syncKycStatus();

      showSuccess(t('common.success'), t('kyc.success.message'));
      
      // Rediriger vers la page de succès
      navigate('/dashboard/kyc-success');
    } catch (error) {
      console.error(t('kyc.errors.submissionError'), error);
      showError(t('common.error'), t('kyc.errors.submissionFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const allRequiredUploaded = documents.filter(doc => doc.required).every(doc => doc.uploaded);

  // Composant pour afficher le statut en attente
  const PendingStatusView = () => (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t('kyc.navigation.backToDashboard')}</span>
            <span className="sm:hidden">{t('kyc.navigation.backToDashboard')}</span>
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center mb-4">
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-full mr-0 sm:mr-4 mb-3 sm:mb-0 self-start">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t('verification.title')}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {t('verification.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-8 text-center">
          <div className="mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-yellow-800 mb-2">{t('modernVerificationState.dossierEnExamen')}</h2>
            <p className="text-sm sm:text-base text-yellow-700 mb-3 sm:mb-4">
              {t('modernVerificationState.dossierEnExamenDescription')}
            </p>
            <p className="text-xs sm:text-sm text-yellow-600">
              {t('kycSuccess.waitMessage')}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-yellow-200">
            <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{t('kyc.pending.documentsSubmitted')}</h3>
            <div className="space-y-2 text-xs sm:text-sm text-gray-600">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between">
                  <span className="truncate flex-1 mr-2">{doc.name}</span>
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Si le statut est "pending", afficher le composant PendingStatusView
  if (kycStatus?.status === 'pending') {
    return <PendingStatusView />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{t('kyc.navigation.backToDashboard')}</span>
            <span className="sm:hidden">{t('kyc.navigation.backToDashboard')}</span>
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center mb-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-0 sm:mr-4 mb-3 sm:mb-0 self-start">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {t('kyc.title')}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {t('kyc.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <DocumentsSection 
          documents={documents} 
          onFileChange={handleFileChange} 
          onRemoveFile={removeFile} 
        />

        {/* Information Section */}
        <KycInfoSection />

        {/* Submit Button */}
        <div className="flex justify-center sm:justify-end">
          <SubmitButton 
            onClick={handleSubmit} 
            disabled={!allRequiredUploaded || submitting} 
            isSubmitting={submitting} 
          />
        </div>
      </div>
    </div>
  );
};

export default KycPage;