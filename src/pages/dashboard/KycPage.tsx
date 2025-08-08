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
          setUserId(userId);
          
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
    if (!userId) {
      showError('Erreur', 'Utilisateur non identifié');
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
      // Préparer les données des documents
      // Soumettre chaque document individuellement via le service KYC
      for (const doc of documents) {
        if (doc.uploaded && doc.file) {
          try {
            // Déterminer le type de document pour le service KYC
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

            // Soumettre le document via le service KYC
            await kycService.submitDocument(userId, doc.file, documentType);
          } catch (error) {
            console.error(`Erreur lors de la soumission du document ${doc.name}:`, error);
            throw error;
          }
        }
      }

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </button>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Vérification en cours
                  </h1>
                  <p className="text-gray-600">
                    Votre dossier est en cours d'examen par nos équipes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">Vérification en cours</h2>
              <p className="text-yellow-700 mb-4">
                Vos documents ont été soumis et sont actuellement en cours d'examen par nos équipes.
              </p>
              <p className="text-sm text-yellow-600">
                Ce processus prend généralement 24 à 48 heures. Vous recevrez une notification dès que la vérification sera terminée.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <h3 className="font-medium text-gray-900 mb-2">Documents soumis</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <span>{doc.name}</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au tableau de bord
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('kyc.title')}
                </h1>
                <p className="text-gray-600">
                  {t('kyc.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {t('kyc.documentsRequired')}
          </h2>

          <div className="space-y-6">
            {documents.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {document.name}
                    </h3>
                                         <p className="text-sm text-gray-500">
                       {t('kyc.acceptedFormats')}
                     </p>
                   </div>
                   {document.required && (
                     <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                       {t('kyc.required')}
                     </span>
                   )}
                </div>

                {!document.uploaded ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
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
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                             <p className="text-gray-600">
                         {t('kyc.selectFile')}
                       </p>
                       <p className="text-sm text-gray-500">
                         {t('kyc.dragDrop')}
                       </p>
                    </label>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <p className="font-medium text-green-900">
                            {document.file?.name}
                          </p>
                          <p className="text-sm text-green-700">
                            {(document.file?.size || 0) / 1024 / 1024} MB
                          </p>
                        </div>
                      </div>
                                             <button
                         onClick={() => removeFile(document.id)}
                         className="text-red-600 hover:text-red-800 text-sm"
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
                             <h3 className="font-medium text-blue-900 mb-2">
                 {t('kyc.importantInfo')}
               </h3>
               <ul className="text-sm text-blue-800 space-y-1">
                 <li>{t('kyc.secureProcessing')}</li>
                 <li>{t('kyc.verificationTime')}</li>
                 <li>{t('kyc.emailNotification')}</li>
                 <li>{t('kyc.accountLimits')}</li>
               </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!allRequiredUploaded || submitting}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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