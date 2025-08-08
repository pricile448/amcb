import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FirebaseDataService } from '../../services/firebaseData';
import { kycService } from '../../services/kycService';
import { useNotifications, useKycSync } from '../../hooks/useNotifications';

interface KycDocument {
  id: string;
  type: string;
  name: string;
  file: File | null;
  uploaded: boolean;
  required: boolean;
}

const KycPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const { userStatus, syncKycStatus } = useKycSync();
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
      required: true
    },
    {
      id: 'proof_of_address',
      type: 'proof_of_address',
      name: t('kyc.proofOfAddress'),
      file: null,
      uploaded: false,
      required: true
    },
    {
      id: 'proof_of_income',
      type: 'proof_of_income',
      name: t('kyc.proofOfIncome'),
      file: null,
      uploaded: false,
      required: true
    }
  ]);

  useEffect(() => {
    const loadUserStatus = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userId = user.id;
          const userEmail = user.email || '';
          const userName = user.displayName || user.firstName + ' ' + user.lastName || 'Utilisateur';
          
          setUserId(userId);
          setUserEmail(userEmail);
          setUserName(userName);
          
          // Synchroniser le statut KYC
          await syncKycStatus();
        } catch (error) {
          console.error('Erreur parsing user:', error);
        }
      }
    };

    loadUserStatus();
  }, [syncKycStatus]);

  const handleFileChange = (documentId: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file, uploaded: true }
        : doc
    ));
  };

  const removeFile = (documentId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file: null, uploaded: false }
        : doc
    ));
  };

  const handleSubmit = async () => {
    if (!userId || !userEmail || !userName) {
      showError('Erreur', 'Informations utilisateur manquantes');
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
          // Mapper le type de document pour le service KYC
          let documentType: 'identity' | 'address' | 'income' | 'bankStatement';
          switch (doc.type) {
            case 'identity':
              documentType = 'identity';
              break;
            case 'proof_of_address':
              documentType = 'address';
              break;
            case 'proof_of_income':
              documentType = 'income';
              break;
            default:
              documentType = 'identity';
          }
          
          const result = await kycService.submitDocument(userId, doc.file, documentType);
          uploadResults.push(result);
        }
      }

      // Mettre à jour le statut KYC après tous les uploads
      await kycService.updateKYCStatus(userId, 'pending');

      // Mettre à jour le statut KYC localement
      await syncKycStatus();

      showSuccess('Succès', 'Documents soumis avec succès ! Vous recevrez un email de confirmation.');
      
      // Rediriger vers la page de succès
      navigate('/dashboard/kyc-success');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError('Erreur', 'Une erreur est survenue lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const allRequiredUploaded = documents.filter(doc => doc.required).every(doc => doc.uploaded);

  // Si le statut est "pending", afficher un message de statut
  if (userStatus === 'pending') {
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
              <span className="hidden sm:inline">Retour au tableau de bord</span>
              <span className="sm:hidden">Retour</span>
            </button>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                <div className="bg-yellow-100 p-2 sm:p-3 rounded-full mr-0 sm:mr-4 mb-3 sm:mb-0 self-start">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Vérification en cours
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Votre dossier est en cours d'examen par nos équipes
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
              <h2 className="text-lg sm:text-xl font-semibold text-yellow-800 mb-2">Vérification en cours</h2>
              <p className="text-sm sm:text-base text-yellow-700 mb-3 sm:mb-4">
                Vos documents ont été soumis et sont actuellement en cours d'examen par nos équipes.
              </p>
              <p className="text-xs sm:text-sm text-yellow-600">
                Ce processus prend généralement 24 à 48 heures. Vous recevrez une notification dès que la vérification sera terminée.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-yellow-200">
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Documents soumis</h3>
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
            <span className="hidden sm:inline">Retour au tableau de bord</span>
            <span className="sm:hidden">Retour</span>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            {t('kyc.documentsRequired')}
          </h2>

          <div className="space-y-4 sm:space-y-6">
            {documents.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
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
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
                          handleFileChange(document.id, file);
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
                            {(document.file?.size || 0) / 1024 / 1024} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(document.id)}
                        className="text-red-600 hover:text-red-800 text-xs sm:text-sm self-start sm:self-center"
                      >
                        {t('kyc.removeFile')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-0 sm:mr-3 mt-0 sm:mt-0.5 mb-2 sm:mb-0 self-start" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                {t('kyc.importantInfo')}
              </h3>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                <li>{t('kyc.secureProcessing')}</li>
                <li>{t('kyc.verificationTime')}</li>
                <li>{t('kyc.emailNotification')}</li>
                <li>{t('kyc.accountLimits')}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={handleSubmit}
            disabled={!allRequiredUploaded || submitting}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('kyc.submitting')}
              </>
            ) : (
              t('kyc.submitDocuments')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KycPage; 