import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, AlertCircle, Upload, CheckCircle, Camera, CreditCard, Home, User } from 'lucide-react';
import { useKycState } from '../../hooks/useKycState';
import { useKycSync } from '../../hooks/useKycSync';
import { useNotifications } from '../../hooks/useNotifications';
import { kycService } from '../../services/kycService';
import { FirebaseDataService } from '../../services/firebaseData';
import { auth } from '../../config/firebase';

// Fonction utilitaire pour générer les liens du dashboard
const getDashboardLink = (path: string) => {
  const currentLang = window.location.pathname.split('/')[1] || 'fr';
  return `/${currentLang}/dashboard${path}`;
};

interface KycDocument {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  file: File | null;
  uploaded: boolean;
  required: boolean;
}

const KycPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { kycStatus, loading, clearStableStatus } = useKycState();
  const { syncKycStatus } = useKycSync(); // Garder pour la soumission
  const { showSuccess, showError } = useNotifications();
  const [submitting, setSubmitting] = useState(false);
  
  // État pour forcer le re-render lors du changement de langue
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Initialisation des documents avec traduction et icônes
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  
  useEffect(() => {
    setDocuments([
      { 
        id: 'identity_recto', 
        type: 'identity', 
        name: t('kyc.identityRecto'), 
        description: t('kyc.identityRectoDesc'),
        icon: <CreditCard className="w-6 h-6" />,
        file: null, 
        uploaded: false, 
        required: true 
      },
      { 
        id: 'identity_verso', 
        type: 'identity', 
        name: t('kyc.identityVerso'), 
        description: t('kyc.identityVersoDesc'),
        icon: <CreditCard className="w-6 h-6" />,
        file: null, 
        uploaded: false, 
        required: true 
      },
      { 
        id: 'passport', 
        type: 'passport', 
        name: t('kyc.passport'), 
        description: t('kyc.passportDesc'),
        icon: <FileText className="w-6 h-6" />,
        file: null, 
        uploaded: false, 
        required: true 
      },
      { 
        id: 'proof_of_address', 
        type: 'proof_of_address', 
        name: t('kyc.proofOfAddress'), 
        description: t('kyc.proofOfAddressDesc'),
        icon: <Home className="w-6 h-6" />,
        file: null, 
        uploaded: false, 
        required: true 
      },
      { 
        id: 'selfie_with_id', 
        type: 'selfie_with_id', 
        name: t('kyc.selfieWithId'), 
        description: t('kyc.selfieWithIdDesc'),
        icon: <Camera className="w-6 h-6" />,
        file: null, 
        uploaded: false, 
        required: true 
      }
    ]);
  }, [t, currentLanguage]);

  const handleFileChange = (documentId: string, file: File | null) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, file, uploaded: !!file }
        : doc
    ));
  };

  const handleSubmit = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      showError('Erreur', 'Vous devez être connecté pour soumettre des documents');
      return;
    }
    
    setSubmitting(true);
    try {
      const uploadResults = [];
      
      // ✅ NOUVEAU: Upload séquentiel avec gestion d'erreur individuelle
      for (const doc of documents) {
        if (doc.file && doc.uploaded) {
          try {
            let documentType: 'identity' | 'address' | 'income' | 'bankStatement' = 'identity';
            switch (doc.type) {
              case 'proof_of_address':
                documentType = 'address';
                break;
              case 'passport':
              case 'selfie_with_id':
                documentType = 'identity';
                break;
              default:
                documentType = 'identity';
            }
            
            console.log(`📤 Upload document: ${doc.name} (${doc.type})`);
            const result = await kycService.submitDocument(userId, doc.file, documentType);
            uploadResults.push(result);
            console.log(`✅ Upload réussi: ${doc.name}`);
          } catch (uploadError) {
            console.error(`❌ Erreur upload ${doc.name}:`, uploadError);
            showError('Erreur Upload', `Échec de l'upload de ${doc.name}: ${uploadError instanceof Error ? uploadError.message : 'Erreur inconnue'}`);
            throw uploadError; // Arrêter le processus
          }
        }
      }

      console.log('🔄 Mise à jour statut KYC vers pending...');
      await kycService.updateKYCStatus(userId, 'pending');
      console.log('✅ Statut KYC mis à jour vers pending');
      
      // Attendre un peu que Firestore se mette à jour
      console.log('⏳ Attente synchronisation Firestore...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔄 Synchronisation statut KYC...');
      await syncKycStatus();
      console.log('✅ Synchronisation KYC terminée');
      
      showSuccess('Succès', 'Documents soumis avec succès ! Vous recevrez un email de confirmation.');
      clearStableStatus(); // Nettoyer l'état stable
      navigate(getDashboardLink(''));
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError('Erreur', 'Une erreur est survenue lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const allRequiredUploaded = documents.filter(doc => doc.required).every(doc => doc.uploaded);

  // Debug: Afficher le statut actuel
  console.log('🔍 KYC Status Debug:', {
    kycStatus,
    status: kycStatus?.status,
    documents: documents.map(doc => ({
      id: doc.id,
      name: doc.name,
      uploaded: doc.uploaded,
      required: doc.required,
      hasFile: !!doc.file
    })),
    allRequiredUploaded,
    requiredDocs: documents.filter(doc => doc.required),
    uploadedDocs: documents.filter(doc => doc.uploaded),
    missingDocs: documents.filter(doc => doc.required && !doc.uploaded)
  });

  // ÉTAT DE CHARGEMENT - Éviter le flash
  if (loading || !kycStatus) {
    return (
      <div className="bg-gray-50 py-4 sm:py-8" key={currentLanguage}>
        <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Bouton retour */}
          <button
            onClick={() => navigate(getDashboardLink(''))}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('kyc.navigation.backToDashboard')}
          </button>
          
          {/* Loading Spinner */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-8">
              <div className="w-full h-full border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <h1 className="text-xl font-medium text-gray-600">
              {t('kyc.loadingStatus')}
            </h1>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAT PENDING - Documents en cours de vérification
  if (kycStatus?.status === 'pending') {
    return (
      <div className="bg-gray-50 py-4 sm:py-8" key={currentLanguage}>
        <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Bouton retour */}
          <button
            onClick={() => navigate(getDashboardLink(''))}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('kyc.navigation.backToDashboard')}
          </button>
          
          {/* Statut PENDING - Spinner animé + Traduction hybride */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            {/* Spinner principal */}
            <div className="w-24 h-24 mx-auto mb-8">
              <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            
            {/* Titre avec traduction */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ⏳ {t('kyc.pending.title')}
            </h1>
            
            {/* Message avec traduction */}
            <p className="text-lg text-gray-600 mb-8">
              {t('kyc.pending.message')}
            </p>
            
            {/* Documents soumis avec traduction */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4 text-lg">
                📋 {t('kyc.pending.documentsSubmitted')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-center text-sm text-gray-600 bg-white p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ÉTAT UNVERIFIED - Formulaire d'upload des documents
  return (
    <div className="bg-gray-50 py-4 sm:py-8" key={currentLanguage}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Bouton retour */}
        <button
          onClick={() => navigate(getDashboardLink(''))}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('kyc.navigation.backToDashboard')}
        </button>
        
        {/* Titre principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            {t('kyc.title')}
          </h1>
          
          <p className="text-gray-600 mb-3">
            {t('kyc.subtitle')}
          </p>
          
          {/* État actuel */}
          <div className="bg-red-50 rounded-lg p-3 mt-4">
            <p className="text-sm text-red-700">
              <strong>{t('kyc.currentStatus')}:</strong> {kycStatus?.status === 'unverified' ? t('kyc.unverified') : kycStatus?.status || t('kyc.undefined')}
            </p>
            {!kycStatus && (
              <p className="text-xs text-red-600 mt-1">
                {t('kyc.loadingStatus')}
              </p>
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            {t('kyc.documentsRequiredForVerification')}
          </h2>

          {/* Barre de progression */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                {t('kyc.progress')}: {documents.filter(doc => doc.uploaded).length} / {documents.filter(doc => doc.required).length} {t('kyc.documents')}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round((documents.filter(doc => doc.uploaded).length / documents.filter(doc => doc.required).length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(documents.filter(doc => doc.uploaded).length / documents.filter(doc => doc.required).length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                {/* En-tête du document */}
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    {document.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {document.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {document.description}
                    </p>
                  </div>
                  {document.required && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      {t('kyc.required')}
                    </span>
                  )}
                </div>

                {/* Zone d'upload */}
                {!document.uploaded ? (
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor={`file-${document.id}`} className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">{t('kyc.clickToUpload')}</span>
                        </p>
                        <p className="text-xs text-gray-500">{t('kyc.acceptedFormats')}</p>
                      </div>
                      <input
                        id={`file-${document.id}`}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(document.id, e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">{t('kyc.documentUploaded')}</span>
                    </div>
                    <button
                      onClick={() => handleFileChange(document.id, null)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      {t('kyc.removeFile')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button - Afficher seulement si tous les documents requis sont uploadés */}
        {allRequiredUploaded ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                             <p className="text-green-700 font-medium">✅ {t('kyc.allDocumentsUploaded')}</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
                             {submitting ? t('kyc.submitting') : t('kyc.submitDocumentsForVerification')}
            </button>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="mb-4">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                             <p className="text-yellow-700 font-medium text-lg">
                 {t('kyc.actionRequired')}
               </p>
            </div>
                         <p className="text-yellow-700 mb-3">
               {t('kyc.uploadAllRequired')}
             </p>
            <div className="bg-white rounded-lg p-4 mb-4">
                             <p className="text-sm text-yellow-600 mb-2">
                 <strong>{t('kyc.missingDocuments')} ({documents.filter(doc => doc.required && !doc.uploaded).length}) :</strong>
               </p>
              <div className="space-y-1">
                {documents.filter(doc => doc.required && !doc.uploaded).map(doc => (
                  <p key={doc.id} className="text-xs text-yellow-600">
                    • {doc.name}
                  </p>
                ))}
              </div>
            </div>
                         <p className="text-xs text-yellow-600">
               {t('kyc.currentProgress')}: {documents.filter(doc => doc.uploaded).length} / {documents.filter(doc => doc.required).length} {t('kyc.documents')}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycPage;
