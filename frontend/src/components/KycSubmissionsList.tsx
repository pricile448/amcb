import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Eye, Trash2 } from 'lucide-react';
import { kycService } from '../services/kycService';
import { KYCSubmission } from '../services/cloudinaryService';
import { FirebaseDataService } from '../services/firebaseData';
import { logger } from '../utils/logger';
// ✅ NOUVEAU: Plus besoin des constantes de statut KYC

interface KycSubmissionsListProps {
  className?: string;
  showActions?: boolean;
  maxHeight?: string;
}

const KycSubmissionsList: React.FC<KycSubmissionsListProps> = ({ 
  className = '', 
  showActions = true,
  maxHeight = 'max-h-96'
}) => {
  const { t } = useTranslation();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = FirebaseDataService.getCurrentUserId();

  // Charger les soumissions
  const loadSubmissions = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userSubmissions = await kycService.getUserSubmissions(userId);
      setSubmissions(userSubmissions);
      logger.debug('KycSubmissionsList: Soumissions chargées:', userSubmissions.length);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(errorMessage);
      logger.error('KycSubmissionsList: Erreur chargement soumissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    if (userId) {
      loadSubmissions();
    }
  }, [userId]);

  // Supprimer une soumission
  const handleDeleteSubmission = async (submissionId: string) => {
    if (!userId || !confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      const success = await kycService.deleteSubmission(submissionId, userId);
      if (success) {
        // Recharger la liste
        await loadSubmissions();
        logger.success('KycSubmissionsList: Soumission supprimée:', submissionId);
      }
    } catch (error) {
      logger.error('KycSubmissionsList: Erreur suppression:', error);
    }
  };

  // ✅ NOUVEAU: Plus de statut dans les soumissions, on affiche juste les documents

  // Formater la taille du fichier
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Formater le type de document
  const formatDocumentType = (type: KYCSubmission['documentType']): string => {
    const typeLabels = {
      identity: 'Pièce d\'identité',
      address: 'Justificatif de domicile',
      income: 'Justificatif de revenus',
      bankStatement: 'Relevé bancaire'
    };
    return typeLabels[type] || type;
  };

  if (!userId) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        {t('kycSubmissions.userNotConnected') || 'Utilisateur non connecté'}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* En-tête */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t('kycSubmissions.title') || 'Documents soumis'}
          </h3>
          <button
            onClick={loadSubmissions}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Actualiser</span>
              </>
            )}
          </button>
        </div>
        
        {submissions.length > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            {submissions.length} document(s) soumis
          </p>
        )}
      </div>

      {/* Contenu */}
      <div className={`${maxHeight} overflow-y-auto`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des documents...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <div className="text-red-500 mb-2">❌ Erreur de chargement</div>
            <p className="text-sm text-gray-600 mb-3">{error}</p>
            <button
              onClick={loadSubmissions}
              className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
            >
              Réessayer
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Aucun document soumis</p>
            <p className="text-sm text-gray-400">
              Commencez par soumettre vos documents d'identité
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  {/* Informations du document */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {formatDocumentType(submission.documentType)}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {submission.fileName}
                        </p>
                      </div>
                    </div>
                    
                    {/* Métadonnées */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Taille:</span> {formatFileSize(submission.fileSize)}
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {submission.mimeType}
                      </div>
                      <div>
                        <span className="font-medium">Soumis:</span> {submission.submittedAt.toLocaleString('fr-FR')}
                      </div>
                      <div>
                        <span className="font-medium">Document:</span> {submission.documentType}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => window.open(submission.cloudinaryUrl, '_blank')}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Voir le document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <a
                        href={submission.cloudinaryUrl}
                        download={submission.fileName}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      
                      <button
                        onClick={() => handleDeleteSubmission(submission.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KycSubmissionsList;
