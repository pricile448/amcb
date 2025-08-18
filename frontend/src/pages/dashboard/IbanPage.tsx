import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Download, Share2, QrCode, Building, CreditCard, Eye, EyeOff, Loader2, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { FirebaseDataService, FirebaseIban } from '../../services/firebaseData';
import { useNotifications, useKycSync } from '../../hooks/useNotifications';
import VerificationState from '../../components/VerificationState';
import { logger } from '../../utils/logger';
import { ribService, RibSubDocument } from '../../services/ribService';
import { auth } from '../../config/firebase';

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
  const [ribSubDocument, setRibSubDocument] = useState<RibSubDocument | null>(null);
  const [ribRequestStatus, setRibRequestStatus] = useState<'none' | 'pending' | 'processing' | 'completed' | 'rejected'>('none');


    // ✅ NOUVEAU: Listener d'authentification optimisé
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        logger.debug('Utilisateur connecté, chargement des données...');
        // Charger les données une seule fois si pas encore chargées
        if (!ribSubDocument && !ibanData) {
          loadIbanData();
        }
      } else {
        logger.debug('Utilisateur déconnecté');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [ribSubDocument, ibanData]);

  // Charger les données IBAN depuis Firestore
  const loadIbanData = async () => {
    try {
      setLoading(true);
      
      // ✅ NOUVEAU: Attendre que l'authentification soit prête
      if (!auth.currentUser) {
        logger.debug('En attente de l\'authentification...');
        setLoading(false);
        return;
      }
      
      const userId = auth.currentUser.uid;
      logger.debug('Utilisateur authentifié:', userId);

      // Synchroniser le statut KYC avant de vérifier
      await syncKycStatus();

      // Récupérer le statut de l'utilisateur
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const status = user.kycStatus || user.verificationStatus || 'pending';
          setUserStatus(status);
          setIsUnverified(status !== 'verified');
        } catch (error) {
          console.error('Erreur parsing user:', error);
          setUserStatus('pending');
          setIsUnverified(true);
        }
      } else {
        setUserStatus('pending');
        setIsUnverified(true);
      }

      logger.debug('Chargement des données IBAN pour userId:', userId);
      
      // Récupérer les données utilisateur connecté
      const userDataStr = localStorage.getItem('user');
      let userFirstName = t('common.defaultClient') || 'Client';
      let userLastName = t('common.defaultCompany') || 'AmCbunq';
      
      if (userDataStr) {
        try {
          const user = JSON.parse(userDataStr);
          userFirstName = user.firstName || t('common.defaultClient') || 'Client';
          userLastName = user.lastName || t('common.defaultCompany') || 'AmCbunq';
          logger.debug('Nom utilisateur récupéré:', `${userFirstName} ${userLastName}`);
        } catch (error) {
          logger.error('Erreur parsing user:', error);
        }
      }
      
      // Récupérer les données IBAN depuis l'API
      const firebaseIban = await FirebaseDataService.getUserIban(userId);
      logger.debug('Données IBAN reçues:', firebaseIban);
      
      // Récupérer aussi les comptes pour avoir les vraies données
      const firebaseAccounts = await FirebaseDataService.getUserAccounts(userId);
      logger.debug('Comptes récupérés pour IBAN:', firebaseAccounts);
      
      // ✅ NOUVEAU: Charger les données RIB depuis le service
      const ribSubDoc = await ribService.getRibSubDocument(userId);
      if (ribSubDoc) {
        setRibSubDocument(ribSubDoc);
        logger.debug('Sous-document RIB chargé:', ribSubDoc);
      }
      
      // ✅ NOUVEAU: Vérifier le statut de la demande RIB
      const ribRequest = await ribService.getRibRequestStatus(userId);
      if (ribRequest) {
        setRibRequestStatus(ribRequest.status);
        logger.debug('Statut de la demande RIB:', ribRequest.status);
      }
      
      if (firebaseIban) {
        // Utiliser les données IBAN reçues de l'API
        setIbanData(firebaseIban);
        logger.success('Données IBAN chargées avec succès:', firebaseIban);
      } else {
        // Fallback en cas d'erreur - utiliser le statut approprié selon la vérification
        logger.warn('Aucune donnée IBAN reçue, affichage du statut par défaut');
        const userStr = localStorage.getItem('user');
        let userStatus = 'unverified';
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            userStatus = user.kycStatus || user.verificationStatus || 'unverified';
          } catch (error) {
            logger.error('Erreur parsing user:', error);
          }
        }
        
        const defaultIbanData: FirebaseIban = {
          id: 'default-iban',
          userId: userId,
          iban: t('iban.noData') || 'Non disponible',
          bic: 'AMCBFRPPXXX',
          accountHolder: `${userFirstName} ${userLastName}`,
          bankName: t('iban.bankName') || 'AmCbunq Bank',
          accountType: t('iban.principal') || 'Compte principal',
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
        iban: t('iban.errorLoading') || 'Erreur de chargement',
        bic: 'AMCBFRPPXXX',
        accountHolder: t('common.defaultUser') || 'Client AmCbunq',
        bankName: t('iban.bankName') || 'AmCbunq Bank',
        accountType: t('iban.principal') || 'Compte principal',
        status: 'error',
        balance: 0,
        currency: 'EUR'
      };
      setIbanData(errorIbanData);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage du composant (une seule fois)
  useEffect(() => {
    if (auth.currentUser && !ribSubDocument && !ibanData) {
      loadIbanData();
    }
  }, []); // Supprimé syncKycStatus pour éviter les rechargements

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const handleCopyIban = async () => {
    // ✅ NOUVEAU: Utiliser les données RIB si disponibles
    const ibanToCopy = ribSubDocument && ribSubDocument.isDisplayed ? ribSubDocument.iban : ibanData?.iban;
    
    if (!ibanToCopy || ibanToCopy === 'En attente') return;
    
    try {
      await navigator.clipboard.writeText(ibanToCopy.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleDownloadRib = () => {
    // ✅ NOUVEAU: Utiliser les données RIB si disponibles
    const ribData = ribSubDocument && ribSubDocument.isDisplayed ? ribSubDocument : ibanData;
    
    if (!ribData || (ribSubDocument && ribSubDocument.iban === 'En attente')) return;
    
    // Créer un fichier RIB à télécharger
    const ribContent = `
RIB AmCbunq
Titulaire: ${ribData.accountHolder}
IBAN: ${ribData.iban}
BIC: ${ribData.bic}
Banque: ${ribData.bankName}
Date: ${new Date().toLocaleDateString('fr-FR')}
    `;
    
    const blob = new Blob([ribContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIB_${ribData.accountHolder.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleRequestIban = async () => {
    if (!ibanData?.userId) {
      showError(t('common.error'), t('iban.errors.errorRequest') || 'Impossible de demander le RIB');
      return;
    }

    // ✅ NOUVEAU: Éviter les appels multiples
    if (requestingIban || ribRequestStatus === 'pending') {
      return;
    }

    setRequestingIban(true);
    try {
      // ✅ NOUVEAU: Mettre à jour l'état local IMMÉDIATEMENT pour éviter le flash
      setRibRequestStatus('pending');
      
      // ✅ NOUVEAU: Créer un sous-document RIB local temporaire
      const tempRibDoc: RibSubDocument = {
        iban: 'En attente',
        bic: 'AMCBFRPPXXX',
        accountHolder: 'En attente',
        bankName: 'AmCbunq Bank',
        accountType: 'Compte principal',
        isDisplayed: false,
        createdAt: new Date() as any, // Temporaire
        updatedAt: new Date() as any, // Temporaire
        adminNotes: 'RIB en cours de génération'
      };
      setRibSubDocument(tempRibDoc);
      
      // ✅ NOUVEAU: Utiliser le service RIB
      const success = await ribService.createRibRequest(ibanData.userId);
      
      if (success) {
        showSuccess(
          t('iban.requestRib.successTitle') || 'Demande enregistrée', 
          t('iban.requestRib.successMessage') || 'Votre demande de RIB a été enregistrée. Il sera disponible sous 24h.'
        );
        
        // ✅ NOUVEAU: Recharger les vraies données depuis Firestore
        setTimeout(async () => {
          try {
            const realRibDoc = await ribService.getRibSubDocument(ibanData.userId);
            if (realRibDoc) {
              setRibSubDocument(realRibDoc);
            }
          } catch (error) {
            logger.error('Erreur lors du rechargement des données RIB:', error);
          }
        }, 1000);
      } else {
        // ✅ NOUVEAU: Restaurer l'état précédent en cas d'échec
        setRibRequestStatus('none');
        setRibSubDocument(null);
        showError(t('common.error'), t('iban.requestRib.errorMessage') || 'Impossible de traiter votre demande de RIB');
      }
    } catch (error) {
      console.error('Erreur lors de la demande de RIB:', error);
      // ✅ NOUVEAU: Restaurer l'état précédent en cas d'erreur
      setRibRequestStatus('none');
      setRibSubDocument(null);
      showError(t('common.error'), t('iban.requestRib.errorGeneric') || 'Une erreur est survenue lors de la demande de RIB');
    } finally {
      setRequestingIban(false);
    }
  };

  const handleShare = () => {
    // Logique pour partager
            logger.debug('Partage de l\'IBAN...');
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>{t('iban.loading')}</span>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas vérifié, afficher le composant VerificationState
  if (isUnverified) {
    return (
      <VerificationState 
        userStatus={userStatus}
        title={t('iban.verification.title') || 'Verification Required'}
                  description={t('iban.verification.description') || 'Please verify your identity to access IBAN services'}
        showFeatures={true}
      />
    );
  }

  if (!ibanData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">{t('iban.noData')}</p>
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
            <h1 className="text-xl md:text-2xl font-bold">{t('iban.title')}</h1>
            <p className="text-blue-100 text-sm md:text-base">{t('iban.subtitle')}</p>
          </div>
                      {ibanData.status === 'available' && (
              <div className="flex items-center space-x-2 bg-green-500/30 px-2 md:px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium">{t('iban.messages.ribAvailable')}</span>
              </div>
            )}
            {ibanData.status === 'processing' && (
              <div className="flex items-center space-x-2 bg-yellow-500/30 px-2 md:px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium">{t('iban.processing.title')}</span>
              </div>
            )}
            {ibanData.status === 'request_required' && (
              <div className="flex items-center space-x-2 bg-blue-500/30 px-2 md:px-3 py-1 rounded-full">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium">{t('iban.requestRib.title')}</span>
              </div>
            )}
            {ibanData.status === 'unavailable' && (
              <div className="flex items-center space-x-2 bg-red-500/30 px-2 md:px-3 py-1 rounded-full">
                <XCircle className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium">{t('iban.messages.ribUnavailable')}</span>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">{t('iban.currentBalance')}</p>
            <p className="text-lg md:text-2xl font-bold">{formatCurrency(ibanData.balance, ibanData.currency)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">{t('iban.status')}</p>
            <p className="text-lg md:text-2xl font-bold">{t('iban.active')}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">{t('iban.accountType')}</p>
            <p className="text-lg md:text-2xl font-bold">{t('iban.principal')}</p>
          </div>
        </div>
      </div>

      {/* IBAN Principal */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{t('iban.mainIban')}</h2>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 px-2 md:px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-xs md:text-sm">{showDetails ? t('iban.hideDetails') : t('iban.showDetails')}</span>
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
                <p className="text-xs md:text-sm text-gray-500">{t('iban.ibanDescription')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* ✅ NOUVEAU: Affichage conditionnel selon le statut RIB */}
            {ribSubDocument && ribSubDocument.isDisplayed && ribSubDocument.iban !== 'En attente' ? (
              <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                <p className="text-xs md:text-sm text-gray-500 mb-2">{t('iban.ibanNumber')}</p>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                  <p className="text-lg md:text-xl font-mono font-bold text-gray-900 break-all">
                    {showDetails ? ribSubDocument.iban : 'FR76 **** **** **** **** **** ***'}
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
                      {copied ? t('iban.copied') : t('iban.copy')}
                    </span>
                  </button>
                </div>
                
                {/* ✅ NOUVEAU: Informations supplémentaires du RIB */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">BIC:</span> {ribSubDocument.bic}
                    </div>
                    <div>
                      <span className="font-medium">Titulaire:</span> {ribSubDocument.accountHolder}
                    </div>
                    <div>
                      <span className="font-medium">Banque:</span> {ribSubDocument.bankName}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {ribSubDocument.accountType}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* ✅ NOUVEAU: Affichage du bouton de demande selon le statut RIB */}
            {(!ribSubDocument || !ribSubDocument.isDisplayed || ribSubDocument.iban === 'En attente') && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">{t('iban.requestRib.title')}</h3>
                    <p className="text-sm text-blue-700 mb-3">
                      {ribRequestStatus === 'pending' 
                        ? t('iban.requestRib.processingMessage') || 'Votre demande est en cours de traitement. Le RIB sera disponible sous 24h.'
                        : t('iban.requestRib.description') || 'Demandez votre RIB pour effectuer des virements et recevoir des paiements.'
                      }
                    </p>
                    {ribRequestStatus === 'none' && (
                      <button
                        onClick={handleRequestIban}
                        disabled={requestingIban}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {requestingIban ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{t('iban.requestRib.requesting')}</span>
                          </>
                        ) : (
                          <>
                            <Building className="w-4 h-4" />
                            <span>{t('iban.requestRib.button')}</span>
                          </>
                        )}
                      </button>
                    )}
                    {ribRequestStatus === 'pending' && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{t('iban.requestRib.pendingMessage') || 'Demande en cours de traitement...'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {ibanData.status === 'processing' && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-1">{t('iban.processing.title')}</h3>
                    <p className="text-sm text-yellow-700 mb-2">
                      {t('iban.processing.description')}
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
                    <h3 className="text-sm font-semibold text-red-900 mb-1">{t('iban.messages.ribUnavailable')}</h3>
                    <p className="text-sm text-red-700">
                      {t('iban.unavailable.description')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showDetails && ibanData.status === 'available' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="text-xs md:text-sm text-gray-500 mb-2">{t('iban.bicCode')}</p>
                  <p className="text-sm md:text-lg font-mono font-semibold text-gray-900">{ibanData.bic}</p>
                </div>
                <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-200">
                  <p className="text-xs md:text-sm text-gray-500 mb-2">{t('iban.accountHolder')}</p>
                  <p className="text-sm md:text-lg font-semibold text-gray-900">{ibanData.accountHolder}</p>
                </div>
              </div>
            )}

            {ibanData.status === 'available' && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-4 border-t border-gray-200 space-y-3 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs md:text-sm text-gray-600">{t('iban.ribActiveStatus')}</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleDownloadRib}
                    className="flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('iban.downloadRib')}</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{t('iban.share')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations importantes */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{t('iban.importantInfo.title')}</h2>
        
        {/* Messages selon le statut */}
        {ibanData.status === 'unavailable' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 mb-2">{t('iban.info.unavailable.title')}</h3>
                <p className="text-red-700 text-sm">
                  {t('iban.info.unavailable.description')}
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
                <h3 className="font-semibold text-yellow-800 mb-2">{t('iban.info.processing.title')}</h3>
                <p className="text-yellow-700 text-sm">
                  {t('iban.info.processing.description')}
                </p>
                <p className="text-yellow-600 text-xs mt-2">
                  {t('iban.info.processing.notification')}
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
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{t('iban.importantInfo.uniqueIban.title')}</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {t('iban.importantInfo.uniqueIban.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <CreditCard className="w-4 md:w-5 h-4 md:h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{t('iban.importantInfo.sepaTransfers.title')}</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {t('iban.importantInfo.sepaTransfers.description')}
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
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{t('iban.importantInfo.qrCode.title')}</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {t('iban.importantInfo.qrCode.description')}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                <Eye className="w-4 md:w-5 h-4 md:h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{t('iban.importantInfo.security.title')}</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {t('iban.importantInfo.security.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utilisation de l'IBAN */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{t('iban.usage.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold text-base md:text-lg">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{t('iban.usage.receiveTransfers.title')}</h3>
            <p className="text-xs md:text-sm text-gray-600">
              {t('iban.usage.receiveTransfers.description')}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold text-base md:text-lg">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{t('iban.usage.salaryBenefits.title')}</h3>
            <p className="text-xs md:text-sm text-gray-600">
              {t('iban.usage.salaryBenefits.description')}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="w-10 md:w-12 h-10 md:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold text-base md:text-lg">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">{t('iban.usage.onlinePayments.title')}</h3>
            <p className="text-xs md:text-sm text-gray-600">
              {t('iban.usage.onlinePayments.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IbanPage; 