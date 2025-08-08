import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  Upload, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText, 
  Eye, 
  Trash2, 
  AlertCircle,
  Loader2,
  Camera,
  FileImage
} from "lucide-react";
import { kycService, KYCStatus } from "../../services/kycService";
import { KYCSubmission } from "../../services/cloudinaryService";
import { cloudinaryService } from "../../services/cloudinaryService";
import { useNotifications } from "../../hooks/useNotifications";
import { FirebaseDataService } from "../../services/firebaseData";
import { logger } from "../../utils/logger";

const VerificationPage: React.FC = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("documents");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
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

  // Charger les données au montage
  useEffect(() => {
    if (userId) {
      loadKYCData();
    }
  }, [userId]);

  const loadKYCData = async () => {
    try {
      setLoading(true);
      if (!userId) return;

      // Charger en parallèle
      const [submissionsData, statusData, statsData] = await Promise.all([
        kycService.getUserSubmissions(userId),
        kycService.getUserKYCStatus(userId),
        kycService.getKYCStats(userId),
      ]);

      setSubmissions(submissionsData);
      setKycStatus(statusData);
      setKycStats(statsData);

    } catch (error) {
      logger.error('Erreur chargement données KYC:', error);
      showError('Erreur lors du chargement des données de vérification');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = cloudinaryService.validateFile(file);
      if (!validation.isValid) {
        showError(validation.error || 'Fichier invalide');
        return;
      }
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

      // Simuler le progrès d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Soumettre le document
      const submission = await kycService.submitDocument(userId, selectedFile, selectedDocumentType);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Recharger les données
      await loadKYCData();

      // Réinitialiser le formulaire
      setSelectedFile(null);
      setSelectedDocumentType(null);
      setShowUploadModal(false);
      setUploadProgress(0);

      // Rediriger vers la page de succès
      navigate('/dashboard/kyc-success');

    } catch (error) {
      logger.error('Erreur upload document:', error);
      showError(error instanceof Error ? error.message : 'Erreur lors de la soumission du document');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!userId) return;

    try {
      await kycService.deleteSubmission(submissionId, userId);
      await loadKYCData();
      showSuccess('Document supprimé avec succès');
    } catch (error) {
      logger.error('Erreur suppression soumission:', error);
      showError('Erreur lors de la suppression du document');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDocumentTypeLabel = (type: KYCSubmission['documentType']) => {
    switch (type) {
      case 'identity':
        return t("verification.identityDocument");
      case 'address':
        return t("verification.proofOfAddress");
      case 'income':
        return t("verification.proofOfIncome");
      case 'bankStatement':
        return t("verification.bankStatement");
      default:
        return type;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Chargement des données de vérification...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("verification.title")}
          </h1>
          <p className="text-gray-600">
            {t("verification.subtitle")}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">
            {t("verification.verificationLevel")}: {kycStats.completionPercentage}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("verification.progress")}
          </h2>
          <span className="text-sm text-gray-600">
            {kycStats.approvedSubmissions}/4 {t("verification.completed")}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${kycStats.completionPercentage}%` }}
          ></div>
        </div>
        
        {/* KYC Status */}
        {kycStatus && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Statut KYC</h3>
                <p className="text-sm text-gray-600">
                  {kycStatus.status === 'unverified' && 'Non vérifié'}
                  {kycStatus.status === 'pending' && 'En attente de vérification'}
                  {kycStatus.status === 'approved' && 'Vérifié et approuvé'}
                  {kycStatus.status === 'rejected' && 'Rejeté'}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(kycStatus.status)}`}>
                {getStatusIcon(kycStatus.status)}
                <span className="ml-1">
                  {kycStatus.status === 'unverified' && 'Non vérifié'}
                  {kycStatus.status === 'pending' && 'En attente'}
                  {kycStatus.status === 'approved' && 'Approuvé'}
                  {kycStatus.status === 'rejected' && 'Rejeté'}
                </span>
              </span>
            </div>
            {kycStatus.rejectionReason && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                <strong>Raison du rejet :</strong> {kycStatus.rejectionReason}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
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
              onClick={() => setSelectedTab("steps")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === "steps"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {t("verification.steps")}
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

              {/* Documents soumis */}
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun document soumis</p>
                    <p className="text-sm">Commencez par soumettre vos documents d'identité</p>
                  </div>
                ) : (
                  submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {getDocumentTypeLabel(submission.documentType)}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{submission.fileName}</span>
                              <span>•</span>
                              <span>{formatFileSize(submission.fileSize)}</span>
                              <span>•</span>
                              <span>{formatDate(submission.submittedAt)}</span>
                              <span>•</span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  submission.status
                                )}`}
                              >
                                {getStatusIcon(submission.status)}
                                <span className="ml-1">
                                  {submission.status === 'pending' && 'En attente'}
                                  {submission.status === 'approved' && 'Approuvé'}
                                  {submission.status === 'rejected' && 'Rejeté'}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => window.open(submission.cloudinaryUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>{t("verification.view")}</span>
                          </button>
                          {submission.status === 'rejected' && (
                            <button 
                              onClick={() => handleDeleteSubmission(submission.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>{t("verification.reupload")}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

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

          {selectedTab === "steps" && (
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
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          step.status
                        )}`}
                      >
                        {step.status === "completed" && "Terminé"}
                        {step.status === "in_progress" && "En cours"}
                        {step.status === "pending" && "En attente"}
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
              Soumettre un document
            </h3>

            {/* Type de document */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de document
              </label>
              <select
                value={selectedDocumentType || ''}
                onChange={(e) => handleDocumentTypeSelect(e.target.value as KYCSubmission['documentType'])}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un type</option>
                <option value="identity">Pièce d'identité</option>
                <option value="address">Justificatif de domicile</option>
                <option value="income">Justificatif de revenus</option>
                <option value="bankStatement">Relevé bancaire</option>
              </select>
            </div>

            {/* Sélection de fichier */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier
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
                        Cliquez pour sélectionner un fichier
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG, PDF (max 10MB)
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
                  Upload en cours... {uploadProgress}%
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
                Annuler
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedDocumentType || uploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Upload...</span>
                  </>
                ) : (
                  <span>Soumettre</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationPage; 