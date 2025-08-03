import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, Share2, FileText, Building, AlertCircle, CheckCircle, Loader2, MessageSquare } from 'lucide-react';
import { FirebaseDataService } from '../../services/firebaseData';
import VerificationState from '../../components/VerificationState';
import { useKycSync } from '../../hooks/useNotifications';

interface BillingData {
  billingIban: string;
  billingBic: string;
  billingHolder: string;
  billingText: string;
  firstName: string;
  lastName: string;
}

const BillingPage: React.FC = () => {
  const { t } = useTranslation();
  const { userStatus, isUnverified, isLoading: kycLoading } = useKycSync();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<BillingData | null>(null);

  // Charger les données de facturation depuis Firestore
  useEffect(() => {
    const loadBillingData = async () => {
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        if (!userId) {
          console.error('❌ Aucun utilisateur connecté');
          setLoading(false);
          return;
        }

        console.log('🏦 Chargement des données de facturation pour userId:', userId);
        
        // Récupérer les données utilisateur complètes depuis l'API
        const userData = await FirebaseDataService.getUserData(userId);
        console.log('🔍 Données utilisateur reçues:', userData);
        
        if (userData && userData.billingIban) {
          const billingInfo: BillingData = {
            billingIban: userData.billingIban,
            billingBic: userData.billingBic || 'SMOEFRP1',
            billingHolder: userData.billingHolder || `${userData.firstName} ${userData.lastName}`,
            billingText: userData.billingText || '',
            firstName: userData.firstName || 'Client',
            lastName: userData.lastName || 'AmCbunq'
          };
          
          setBillingData(billingInfo);
          console.log('✅ Données de facturation chargées avec succès:', billingInfo);
        } else {
          console.log('⚠️ Aucune donnée de facturation trouvée');
          setBillingData(null);
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des données de facturation:', error);
        setBillingData(null);
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, []);

  const handleCopyIban = async () => {
    if (!billingData) return;
    try {
      await navigator.clipboard.writeText(billingData.billingIban.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleDownloadRib = () => {
    if (!billingData) return;
    // Créer un fichier RIB de facturation à télécharger
    const ribContent = `
RIB de Facturation AmCbunq
Titulaire: ${billingData.billingHolder}
IBAN: ${billingData.billingIban}
BIC: ${billingData.billingBic}
Banque: AmCbunq Bank
Date: ${new Date().toLocaleDateString('fr-FR')}

Note: Ce RIB est destiné aux opérations de facturation et validation de compte.
    `;
    
    const blob = new Blob([ribContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIB_Facturation_${billingData.billingHolder.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleShare = () => {
    // Logique pour partager
    console.log('Partage du RIB de facturation...');
  };

  // Si l'utilisateur n'est pas vérifié, afficher l'état de vérification
  if (kycLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Vérification de votre statut...</span>
        </div>
      </div>
    );
  }

  if (isUnverified) {
    return (
      <VerificationState 
        userStatus={userStatus}
        title="Vérification d'identité requise"
        description="Pour accéder aux informations de facturation et aux messages de la banque, vous devez d'abord valider votre identité."
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement des données de facturation...</span>
        </div>
      </div>
    );
  }

  if (!billingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="p-4 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée de facturation</h3>
          <p className="text-gray-500 mb-4">
            Les informations de facturation ne sont pas encore disponibles.
          </p>
          <p className="text-sm text-gray-400">
            Contactez votre conseiller pour obtenir vos coordonnées de facturation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Facturation</h1>
            <p className="text-green-100 text-sm md:text-base">RIB et messages de la banque</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 px-2 md:px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-xs md:text-sm font-medium">Facturation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-green-100 text-xs md:text-sm">Type</p>
            <p className="text-lg md:text-2xl font-bold">RIB Facturation</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-green-100 text-xs md:text-sm">Statut</p>
            <p className="text-lg md:text-2xl font-bold">Actif</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-green-100 text-xs md:text-sm">Usage</p>
            <p className="text-lg md:text-2xl font-bold">Validation</p>
          </div>
        </div>
      </div>

      {/* RIB de Facturation */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">RIB de Facturation</h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-2 md:px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showDetails ? <FileText className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            <span className="text-xs md:text-sm">{showDetails ? 'Masquer' : 'Afficher'} les détails</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 md:p-3 bg-green-100 rounded-xl">
                <Building className="w-5 md:w-6 h-5 md:h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">RIB de Facturation</h3>
                <p className="text-xs md:text-sm text-gray-500">Pour la validation de compte et les opérations bancaires</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-3 md:p-4 border border-green-200">
              <p className="text-xs md:text-sm text-gray-500 mb-2">Numéro IBAN de Facturation</p>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <p className="text-lg md:text-xl font-mono font-bold text-gray-900 break-all">
                  {showDetails ? billingData.billingIban : 'FR76 **** **** **** **** **** ***'}
                </p>
                <button
                  onClick={handleCopyIban}
                  className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    copied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span className="font-medium">
                    {copied ? 'Copié !' : 'Copier'}
                  </span>
                </button>
              </div>
            </div>

            {showDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white rounded-lg p-3 md:p-4 border border-green-200">
                  <p className="text-xs md:text-sm text-gray-500 mb-2">Code BIC/SWIFT</p>
                  <p className="text-sm md:text-lg font-mono font-semibold text-gray-900">{billingData.billingBic}</p>
                </div>
                <div className="bg-white rounded-lg p-3 md:p-4 border border-green-200">
                  <p className="text-xs md:text-sm text-gray-500 mb-2">Titulaire du compte</p>
                  <p className="text-sm md:text-lg font-semibold text-gray-900">{billingData.billingHolder}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-green-200 space-y-3 md:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs md:text-sm text-gray-600">RIB de facturation actif</span>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={handleDownloadRib}
                  className="flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger RIB</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Partager</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages de la Banque */}
      {billingData.billingText && (
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Message de la Banque</h2>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Informations importantes</h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {billingData.billingText}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informations importantes */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Informations importantes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Building className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">RIB de Facturation</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Ce RIB est spécifiquement destiné aux opérations de facturation et de validation de compte. 
                  Il est différent de votre RIB personnel.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Validation de Compte</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Utilisez ce RIB pour effectuer les virements de validation requis pour activer 
                  toutes les fonctionnalités de votre compte.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <AlertCircle className="w-4 md:w-5 h-4 md:h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Différence avec RIB Personnel</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Ce RIB est différent de votre RIB personnel affiché dans la section "Mon IBAN". 
                  Il est utilisé uniquement pour les opérations de facturation.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <FileText className="w-4 md:w-5 h-4 md:h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Messages de la Banque</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Consultez régulièrement les messages de la banque pour rester informé des 
                  exigences et procédures importantes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utilisation du RIB de Facturation */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Utilisation du RIB de Facturation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold text-base md:text-lg">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Validation de compte</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Effectuez le virement de validation requis pour activer toutes les fonctionnalités.
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold text-base md:text-lg">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Opérations bancaires</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Utilisez ce RIB pour les opérations spécifiques demandées par votre conseiller.
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold text-base md:text-lg">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Facturation</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Ce RIB est utilisé pour les opérations de facturation et de gestion de compte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage; 