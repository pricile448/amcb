import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, Share2, QrCode, Building, CreditCard, Eye, EyeOff, Loader2, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { FirebaseDataService, FirebaseIban } from '../../services/firebaseData';
import { useNotifications, useKycSync } from '../../hooks/useNotifications';
import VerificationState from '../../components/VerificationState';

const IbanPage: React.FC = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useNotifications();
  const { syncKycStatus } = useKycSync();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requestingIban, setRequestingIban] = useState(false);
  const [ibanData, setIbanData] = useState<FirebaseIban | null>(null);
  const [userStatus, setUserStatus] = useState<string>('pending');
  const [isUnverified, setIsUnverified] = useState(false);


  // Charger les données IBAN depuis Firestore
  useEffect(() => {
    const loadIbanData = async () => {
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        if (!userId) {
          console.error('❌ Aucun utilisateur connecté');
          setLoading(false);
          return;
        }

        // Synchroniser le statut KYC avant de vérifier
        await syncKycStatus();

        // Récupérer le statut de l'utilisateur
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setUserStatus(user.verificationStatus || 'pending');
            setIsUnverified(user.verificationStatus !== 'verified');
          } catch (error) {
            console.error('Erreur parsing user:', error);
            setUserStatus('pending');
            setIsUnverified(true);
          }
        } else {
          setUserStatus('pending');
          setIsUnverified(true);
        }

        console.log('🏦 Chargement des données IBAN pour userId:', userId);
        

        
        // Récupérer les données utilisateur connecté
        const userDataStr = localStorage.getItem('user');
        let userFirstName = 'Client';
        let userLastName = 'AmCbunq';
        
        if (userDataStr) {
          try {
            const user = JSON.parse(userDataStr);
            userFirstName = user.firstName || 'Client';
            userLastName = user.lastName || 'AmCbunq';
            console.log('👤 Nom utilisateur récupéré:', `${userFirstName} ${userLastName}`);
          } catch (error) {
            console.error('❌ Erreur parsing user:', error);
          }
        }
        
        // Récupérer les données IBAN depuis l'API
        const firebaseIban = await FirebaseDataService.getUserIban(userId);
        console.log('🔍 Données IBAN reçues:', firebaseIban);
        
        // Récupérer aussi les comptes pour avoir les vraies données
        const firebaseAccounts = await FirebaseDataService.getUserAccounts(userId);
        console.log('🔍 Comptes récupérés pour IBAN:', firebaseAccounts);
        
        if (firebaseIban) {
          // Utiliser les données IBAN reçues de l'API
          setIbanData(firebaseIban);
          console.log('✅ Données IBAN chargées avec succès:', firebaseIban);
        } else {
          // Fallback en cas d'erreur - utiliser le statut approprié selon la vérification
          console.log('⚠️ Aucune donnée IBAN reçue, affichage du statut par défaut');
          const userStr = localStorage.getItem('user');
          let userStatus = 'unverified';
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              userStatus = user.kycStatus || user.verificationStatus || 'unverified';
            } catch (error) {
              console.error('Erreur parsing user:', error);
            }
          }
          
          const defaultIbanData: FirebaseIban = {
            id: 'default-iban',
            userId: userId,
            iban: 'Non disponible',
            bic: 'AMCBFRPPXXX',
            accountHolder: `${userFirstName} ${userLastName}`,
            bankName: 'AmCbunq Bank',
            accountType: 'Compte principal',
            status: userStatus === 'verified' ? 'request_required' : 'unavailable',
            balance: 0,
            currency: 'EUR'
          };
          setIbanData(defaultIbanData);
        }
              } catch (error) {
          console.error('❌ Erreur lors du chargement des données IBAN:', error);
          // En cas d'erreur, afficher le statut en attente
          const errorIbanData: FirebaseIban = {
            id: 'error-iban',
            userId: 'unknown',
            iban: 'Erreur de chargement',
            bic: 'AMCBFRPPXXX',
            accountHolder: 'Client AmCbunq',
            bankName: 'AmCbunq Bank',
            accountType: 'Compte principal',
            status: 'error',
            balance: 0,
            currency: 'EUR'
          };
          setIbanData(errorIbanData);
      } finally {
        setLoading(false);
      }
    };

    loadIbanData();
  }, [syncKycStatus]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleCopyIban = async () => {
    if (!ibanData) return;
    try {
      await navigator.clipboard.writeText(ibanData.iban.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleDownloadRib = () => {
    if (!ibanData) return;
    // Créer un fichier RIB à télécharger
    const ribContent = `
RIB AmCbunq
Titulaire: ${ibanData.accountHolder}
IBAN: ${ibanData.iban}
BIC: ${ibanData.bic}
Banque: ${ibanData.bankName}
Date: ${new Date().toLocaleDateString('fr-FR')}
    `;
    
    const blob = new Blob([ribContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIB_${ibanData.accountHolder.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleRequestIban = async () => {
    if (!ibanData?.userId) {
      showError('Erreur', 'Impossible de demander le RIB');
      return;
    }

    setRequestingIban(true);
    try {
      const success = await FirebaseDataService.requestIban(ibanData.userId);
      
      if (success) {
        showSuccess('Demande enregistrée', 'Votre demande de RIB a été enregistrée. Il sera disponible sous 24-48h.');
        // Recharger les données IBAN
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showError('Erreur', 'Impossible de traiter votre demande de RIB');
      }
    } catch (error) {
      console.error('Erreur lors de la demande de RIB:', error);
      showError('Erreur', 'Une erreur est survenue lors de la demande de RIB');
    } finally {
      setRequestingIban(false);
    }
  };

  const handleShare = () => {
    // Logique pour partager
    console.log('Partage de l\'IBAN...');
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Chargement des données IBAN...</span>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas vérifié, afficher le composant VerificationState
  if (isUnverified) {
    return (
      <VerificationState 
        userStatus={userStatus}
        title="Vérification d'identité requise"
        description="Pour accéder à vos informations IBAN et gérer vos comptes, vous devez d'abord valider votre identité."
        showFeatures={true}
      />
    );
  }

  if (!ibanData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Aucune donnée IBAN disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Mon IBAN</h1>
            <p className="text-blue-100 text-sm md:text-base">Votre identifiant bancaire unique</p>
          </div>
          {ibanData.status === 'available' && (
            <div className="flex items-center space-x-2 bg-green-500/30 px-2 md:px-3 py-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs md:text-sm font-medium">Disponible</span>
            </div>
          )}
          {ibanData.status === 'processing' && (
            <div className="flex items-center space-x-2 bg-yellow-500/30 px-2 md:px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              <span className="text-xs md:text-sm font-medium">En cours</span>
            </div>
          )}
          {ibanData.status === 'request_required' && (
            <div className="flex items-center space-x-2 bg-blue-500/30 px-2 md:px-3 py-1 rounded-full">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs md:text-sm font-medium">Demande requise</span>
            </div>
          )}
          {ibanData.status === 'unavailable' && (
            <div className="flex items-center space-x-2 bg-red-500/30 px-2 md:px-3 py-1 rounded-full">
              <XCircle className="w-4 h-4" />
              <span className="text-xs md:text-sm font-medium">Non disponible</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">Solde actuel</p>
            <p className="text-lg md:text-2xl font-bold">{formatCurrency(ibanData.balance, ibanData.currency)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">Statut</p>
            <p className="text-lg md:text-2xl font-bold">Actif</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">Type de compte</p>
            <p className="text-lg md:text-2xl font-bold">Principal</p>
          </div>
        </div>
      </div>

      {/* IBAN Principal */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">IBAN Principal</h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-2 md:px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-xs md:text-sm">{showDetails ? 'Masquer' : 'Afficher'} les détails</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 md:p-3 bg-blue-100 rounded-xl">
                <Building className="w-5 md:w-6 h-5 md:h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">{ibanData.bankName}</h3>
                <p className="text-xs md:text-sm text-gray-500">IBAN unique pour tous vos comptes</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Affichage conditionnel selon le statut */}
            {ibanData.status === 'available' && ibanData.iban && (
              <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                <p className="text-xs md:text-sm text-gray-500 mb-2">Numéro IBAN</p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                  <p className="text-lg md:text-xl font-mono font-bold text-gray-900 break-all">
                    {showDetails ? ibanData.iban : 'FR76 **** **** **** **** **** ***'}
                  </p>
                  <button
                    onClick={handleCopyIban}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      copied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span className="font-medium">
                      {copied ? 'Copié !' : 'Copier'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {ibanData.status === 'request_required' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">RIB non disponible</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      Pour effectuer des virements, vous devez d'abord demander votre RIB.
                    </p>
                    <button
                      onClick={handleRequestIban}
                      disabled={requestingIban}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {requestingIban ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Demande en cours...</span>
                        </>
                      ) : (
                        <>
                          <Building className="w-4 h-4" />
                          <span>Demander mon RIB</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {ibanData.status === 'processing' && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-1">RIB en cours de génération</h3>
                    <p className="text-sm text-yellow-700 mb-2">
                      Votre demande de RIB a été enregistrée. Il sera disponible sous 24-48h.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {ibanData.status === 'unavailable' && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">RIB non disponible</h3>
                    <p className="text-sm text-red-700">
                      Votre compte doit être vérifié pour pouvoir demander un RIB.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showDetails && ibanData.status === 'available' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="text-xs md:text-sm text-gray-500 mb-2">Code BIC/SWIFT</p>
                  <p className="text-sm md:text-lg font-mono font-semibold text-gray-900">{ibanData.bic}</p>
                </div>
                <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="text-xs md:text-sm text-gray-500 mb-2">Titulaire du compte</p>
                  <p className="text-sm md:text-lg font-semibold text-gray-900">{ibanData.accountHolder}</p>
                </div>
              </div>
            )}

            {ibanData.status === 'available' && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-gray-200 space-y-3 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs md:text-sm text-gray-600">RIB disponible et actif</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleDownloadRib}
                    className="flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
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
            )}
          </div>
        </div>
      </div>

      {/* Informations importantes */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Informations importantes</h2>
        
        {/* Messages selon le statut */}
        {ibanData.status === 'unavailable' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-2">RIB non disponible</h3>
                <p className="text-red-700 text-sm">
                  Votre compte doit être vérifié pour pouvoir demander un RIB. Veuillez d'abord valider votre identité via la page KYC.
                </p>
              </div>
            </div>
          </div>
        )}

        {ibanData.status === 'processing' && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">RIB en cours de génération</h3>
                <p className="text-yellow-700 text-sm">
                  Votre demande de RIB a été enregistrée et est en cours de traitement. 
                  Le RIB sera disponible sous 24-48h.
                </p>
                <p className="text-yellow-600 text-xs mt-2">
                  Vous recevrez une notification dès que votre RIB sera disponible.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <Building className="w-4 md:w-5 h-4 md:h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">IBAN Unique</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Cet IBAN est utilisé pour tous vos comptes (courant, épargne, carte de crédit). 
                  Les virements seront automatiquement dirigés vers votre compte principal.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <CreditCard className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Virements SEPA</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Compatible avec tous les virements SEPA européens. 
                  Délai de traitement : 1-2 jours ouvrés.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <QrCode className="w-4 md:w-5 h-4 md:h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Code QR</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Utilisez le code QR pour partager facilement vos coordonnées bancaires 
                  avec d'autres applications.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <Eye className="w-4 md:w-5 h-4 md:h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Sécurité</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Votre IBAN est sécurisé et ne peut être utilisé que pour recevoir des fonds. 
                  Aucun prélèvement automatique n'est possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utilisation de l'IBAN */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Comment utiliser votre IBAN</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold text-base md:text-lg">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Recevoir des virements</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Partagez votre IBAN pour recevoir des virements de n'importe quelle banque européenne.
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold text-base md:text-lg">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Salaire et prestations</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Utilisez cet IBAN pour recevoir votre salaire, allocations ou autres prestations.
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold text-base md:text-lg">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">Paiements en ligne</h3>
            <p className="text-xs md:text-sm text-gray-600">
              Certains services en ligne acceptent les paiements par IBAN pour plus de sécurité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IbanPage; 