import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Upload, 
  FileImage, 
  Loader2, 
  Trash2, 
  Eye, 
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Shield,
  FileText,
  UserCheck,
  CreditCard,
  Home,
  DollarSign,
  Building2,
  ArrowLeft
} from 'lucide-react';
import { useKycSync } from '../../hooks/useKycSync';
import { kycService, KYCStatus } from '../../services/kycService';
import { cloudinaryService, KYCSubmission } from '../../services/cloudinaryService';
import { useNotifications } from "../../hooks/useNotifications";
import { FirebaseDataService } from "../../services/firebaseData";
import { logger } from '../../utils/logger';
import KycSubmissionsList from "../../components/KycSubmissionsList";

const VerificationPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  
  // Force re-render when language changes
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
  
  // ✅ NOUVEAU: Utiliser le hook useKycSync pour la synchronisation en temps réel
  const { 
    kycStatus, 
    loading: kycLoading, 
    error: kycError,
    updateKycStatusImmediately,
    forceSyncKycStatus // ✅ NOUVEAU: Ajouter la fonction de force de synchronisation
  } = useKycSync();
  
  const [selectedTab, setSelectedTab] = useState("documents");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [kycStats, setKycStats] = useState({
    totalSubmissions: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    completionPercentage: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<KYCSubmission['documentType'] | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const userId = FirebaseDataService.getCurrentUserId();

  const getDashboardLink = (path: string) => {
    const currentLang = lang || 'fr';
    return `/${currentLang}/dashboard/${path}`;
  };

  // ✅ OPTIMISÉ: Charger seulement les soumissions et stats (le statut KYC vient du hook)
  useEffect(() => {
    if (userId) {
      loadSubmissionsAndStats();
    }
  }, [userId]);

  const loadSubmissionsAndStats = async () => {
    try {
      setLoading(true);
      if (!userId) return;

      // ✅ OPTIMISÉ: Ne plus charger le statut KYC (géré par le hook)
      const [submissionsData, statsData] = await Promise.all([
        kycService.getUserSubmissions(userId),
        kycService.getKYCStats(userId),
      ]);

      setSubmissions(submissionsData);
      setKycStats(statsData);

    } catch (error) {
      logger.error('Erreur chargement données KYC:', error);
      showError('Erreur lors du chargement des données de vérification');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOUVEAU: Fonction pour mettre à jour le statut KYC immédiatement après soumission
  const updateKycStatusAfterSubmission = (newStatus: 'pending' | 'approved' | 'rejected') => {
    if (!kycStatus) return;
    
    // ✅ OPTIMISÉ: Créer un objet KYCStatus valide avec le nouveau statut
    const updatedStatus: KYCStatus = {
      status: newStatus,
      lastUpdated: new Date(),
      submittedAt: kycStatus.submittedAt,
      approvedAt: kycStatus.approvedAt,
      rejectedAt: kycStatus.rejectedAt,
      rejectionReason: kycStatus.rejectionReason,
    };

    // Ajouter des timestamps spécifiques selon le statut
    switch (newStatus) {
      case 'pending':
        updatedStatus.submittedAt = new Date();
        break;
      case 'approved':
        updatedStatus.approvedAt = new Date();
        break;
      case 'rejected':
        updatedStatus.rejectedAt = new Date();
        break;
    }

    // ✅ Mise à jour immédiate via le hook (sans rechargement)
    updateKycStatusImmediately(updatedStatus);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDocumentTypeSelect = (type: KYCSubmission['documentType']) => {
    setSelectedDocumentType(type);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedDocumentType || !userId) {
      showError('Veuillez sélectionner un fichier et un type de document');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simuler une progression d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Utiliser la méthode publique submitDocument qui gère tout le processus
      const submission = await kycService.submitDocument(userId, selectedFile, selectedDocumentType);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Mettre à jour le statut KYC
      updateKycStatusAfterSubmission('pending');

      // Réinitialiser le formulaire
      setSelectedFile(null);
      setSelectedDocumentType(null);
      setShowUploadModal(false);
      setUploadProgress(0);

      // Recharger les données
      await loadSubmissionsAndStats();

      showSuccess('Document soumis avec succès');
    } catch (error) {
      logger.error('Erreur lors de l\'upload:', error);
      showError('Erreur lors de la soumission du document');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!userId) return;

    try {
      await kycService.deleteSubmission(submissionId, userId);
      
      // ✅ OPTIMISÉ: Mise à jour locale sans rechargement complet
      setSubmissions(prev => prev.filter(sub => sub.id !== submissionId));
      
      // ✅ OPTIMISÉ: Recharger seulement les stats
      const statsData = await kycService.getKYCStats(userId);
      setKycStats(statsData);
      
      showSuccess('Document supprimé avec succès');
    } catch (error) {
      logger.error('Erreur suppression soumission:', error);
      showError('Erreur lors de la suppression du document');
    }
  };

  // ✅ GARDÉ: Cette fonction est encore utilisée dans la modal d'upload
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ✅ NOUVEAU: Déterminer les états pour l'affichage du statut KYC
  const isPending = kycStatus?.status === 'pending';
  const isVerified = kycStatus?.status === 'approved';
  const isRejected = kycStatus?.status === 'rejected';
  const isUnverified = kycStatus?.status === 'unverified';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">{t('verification.loading')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" key={currentLanguage}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* ✅ REFACTORISÉ: En-tête avec navigation et titre */}
        <div className="mb-6">
          {/* Navigation retour */}
          <button
            onClick={() => navigate(getDashboardLink(''))}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('kyc.navigation.backToDashboard')}
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {t('kyc.title')}
          </h1>
        </div>

        {/* ✅ REFACTORISÉ: Affichage du statut KYC en temps réel */}
        {kycStatus && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  isPending ? 'bg-yellow-500' : 
                  isVerified ? 'bg-green-500' : 
                  isRejected ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {t('verification.status.current')}: {t(`verification.status.${kycStatus.status}`)}
                </span>
                {kycStatus.lastUpdated && (
                  <span className="text-xs text-gray-500">
                    ({t('verification.status.lastUpdated')}: {kycStatus.lastUpdated.toLocaleString('fr-FR')})
                  </span>
                )}
              </div>
            </div>
            
            {/* ✅ NOUVEAU: Indicateur de synchronisation en temps réel */}
            <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
              {kycLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  <span>{t('verification.status.synchronizing')}</span>
                </>
              ) : kycError ? (
                <>
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-red-500">{t('verification.status.syncError')}: {kycError}</span>
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">{t('verification.status.realTimeActive')}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* ✅ REFACTORISÉ: Bannière de statut KYC unifiée */}
        {kycStatus && !isVerified && (
          <div className="mb-6">
            {isPending ? (
              <PendingStatusSection 
                submissions={submissions}
                currentLanguage={currentLanguage}
              />
            ) : isRejected ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      {t('verification.banner.rejected.title')}
                    </h3>
                    <p className="text-red-700 mb-3">
                      {kycStatus.rejectionReason || t('verification.banner.rejected.message')}
                    </p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {t('verification.banner.rejected.button')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      {t('verification.banner.unverified.title')}
                    </h3>
                    <p className="text-blue-700 mb-3">
                      {t('verification.banner.unverified.message')}
                    </p>
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t('verification.banner.unverified.button')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ✅ REFACTORISÉ: Onglets simplifiés */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab("documents")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "documents"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("verification.documents")}
              </button>
              <button
                onClick={() => setSelectedTab("status")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === "status"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {t("verification.status")}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === "documents" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t("verification.uploadedDocuments")}
                  </h3>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{t("verification.uploadDocument")}</span>
                  </button>
                </div>

                {/* ✅ NOUVEAU: Utiliser le composant KycSubmissionsList pour un affichage moderne */}
                <KycSubmissionsList 
                  className="mt-4"
                  showActions={true}
                  maxHeight="max-h-96"
                />

                {/* Documents requis */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    {t("verification.requiredDocuments")}
                  </h3>
                  <ul className="text-blue-800 space-y-2">
                    <li>• {t("verification.identityDocument")} (Carte d'identité, Passeport)</li>
                    <li>• {t("verification.proofOfAddress")} (Facture récente, Quittance de loyer)</li>
                    <li>• {t("verification.proofOfIncome")} (Bulletin de salaire, Avis d'imposition)</li>
                    <li>• {t("verification.bankStatement")} (Relevé bancaire des 3 derniers mois)</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedTab === "status" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("verification.verificationSteps")}
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: t("verification.step1.title"),
                      description: t("verification.step1.description"),
                      status: kycStats.approvedSubmissions >= 1 ? "completed" : "pending",
                    },
                    {
                      step: 2,
                      title: t("verification.step2.title"),
                      description: t("verification.step2.description"),
                      status: kycStats.approvedSubmissions >= 2 ? "completed" : "pending",
                    },
                    {
                      step: 3,
                      title: t("verification.step3.title"),
                      description: t("verification.step3.description"),
                      status: kycStats.approvedSubmissions >= 3 ? "completed" : "pending",
                    },
                    {
                      step: 4,
                      title: t("verification.step4.title"),
                      description: t("verification.step4.description"),
                      status: kycStats.approvedSubmissions >= 4 ? "completed" : "pending",
                    },
                  ].map((step) => (
                    <div
                      key={step.step}
                      className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : step.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          step.step
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            step.status === "completed" 
                              ? "bg-green-100 text-green-800" 
                              : step.status === "in_progress" 
                              ? "bg-blue-100 text-blue-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {step.status === "completed" && t("verification.stepStatus.completed")}
                          {step.status === "in_progress" && t("verification.stepStatus.inProgress")}
                          {step.status === "pending" && t("verification.stepStatus.pending")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal d'upload */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('kyc.submitDocuments')}
              </h3>

              {/* Type de document */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('kyc.documentsRequired')}
                </label>
                <select
                  value={selectedDocumentType || ''}
                  onChange={(e) => handleDocumentTypeSelect(e.target.value as KYCSubmission['documentType'])}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('kyc.selectFile')}</option>
                  <option value="identity">{t('kyc.identityDocument')}</option>
                  <option value="address">{t('kyc.proofOfAddress')}</option>
                  <option value="income">{t('kyc.proofOfIncome')}</option>
                  <option value="bankStatement">{t('kyc.bankStatement')}</option>
                </select>
              </div>

              {/* Sélection de fichier */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('kyc.file')}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".jpg,.jpeg,.png,.pdf,.heic,.heif"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileImage className="w-8 h-8 mx-auto text-blue-600" />
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {t('kyc.selectFile')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t('kyc.acceptedFormats')}
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Barre de progression */}
              {uploading && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('kyc.submitting')} {uploadProgress}%
                  </p>
                </div>
              )}

              {/* Boutons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedDocumentType || uploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('kyc.submitting')}</span>
                    </>
                  ) : (
                    <span>{t('kyc.submitDocuments')}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant séparé pour la section pending status
const PendingStatusSection: React.FC<{ 
  submissions: KYCSubmission[]; 
  currentLanguage: string; 
}> = ({ submissions, currentLanguage }) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6" key={currentLanguage}>
      <div className="flex items-start space-x-3">
        <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            {t('kyc.pending.title')}
          </h3>
          <p className="text-yellow-700 mb-3">
            {t('kyc.pending.message')}
          </p>
          <p className="text-sm text-yellow-600">
            {t('kyc.pending.timeframe')}
          </p>
          
          {/* Section documents soumis */}
          {submissions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-3">
                {t('kyc.pending.documentsSubmitted')}
              </h4>
              <div className="space-y-2">
                {submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-yellow-700">
                      {t(`kyc.${submission.documentType}`)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPage; 