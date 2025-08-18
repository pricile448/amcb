import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, TrendingUp, TrendingDown, ArrowRight, Download, FileText, Calendar, Filter, Search } from 'lucide-react';
import { FirebaseDataService, FirebaseAccount, FirebaseTransaction } from '../../services/firebaseData';
import { parseFirestoreDate, formatAmount, truncateTransactionDescription, formatUserNameForDisplay } from '../../utils/dateUtils';
import { useKycSync } from '../../hooks/useNotifications';
import { KycProtectedContent } from '../../components/KycProtectedContent';
import { logger } from '../../utils/logger';

// Utiliser FirebaseAccount au lieu de l'interface locale
type Account = FirebaseAccount;

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  account: string;
  reference: string;
}

const AccountsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const { userStatus, isUnverified, syncKycStatus } = useKycSync();
  const [showBalances, setShowBalances] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'transfer' | 'details'>('transfer');
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fonction pour récupérer le nom de l'utilisateur connecté (formaté pour mobile)
  const getUserName = (): string => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return formatUserNameForDisplay(user.firstName || 'Client', user.lastName || 'AmCbunq');
      } catch (error) {
        console.error('❌ Erreur parsing user:', error);
      }
    }
    return 'Client AmCbunq';
  };

  const getDashboardLink = (path: string) => {
    const currentLang = lang || 'fr';
    return `/${currentLang}/dashboard/${path}`;
  };

  // Charger les données Firebase au montage du composant
  useEffect(() => {
    const loadFirebaseData = async () => {
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        logger.debug('UserID récupéré:', userId);
        
        if (!userId) {
          logger.error('Aucun utilisateur connecté');
          return;
        }

        // Charger les comptes
        logger.debug('Chargement des comptes pour userId:', userId);
        const firebaseAccounts = await FirebaseDataService.getUserAccounts(userId);
        logger.debug('Comptes Firebase récupérés:', firebaseAccounts);
        
        const mappedAccounts: Account[] = firebaseAccounts.map(acc => {
          logger.debug('Account data:', acc);
          logger.debug('Account name:', acc.name);
          logger.debug('Account type:', acc.accountType);
          
          const translatedName = translateAccountName(acc.name || acc.accountType || 'Compte');
          logger.debug('Translated name:', translatedName);
          
          // Déterminer le type de compte basé sur le nom
          let accountType: 'current' | 'savings' | 'credit' = 'savings';
          const accountName = (acc.name || acc.accountType || '').toLowerCase();
          
          if (accountName.includes('checking') || accountName.includes('courant')) {
            accountType = 'current';
          } else if (accountName.includes('credit')) {
            accountType = 'credit';
          } else if (accountName.includes('savings') || accountName.includes('epargne')) {
            accountType = 'savings';
          }
          
          return {
            id: acc.id,
            name: translatedName,
            type: accountType,
            accountNumber: acc.accountNumber,
            balance: Math.abs(acc.balance), // Utiliser la valeur absolue pour l'affichage
            currency: acc.currency,
            status: acc.status as 'active' | 'blocked' | 'pending',
            lastTransaction: {
              date: new Date(),
              amount: 0,
              description: t('transactions.noRecent')
            }
          };
        });
        logger.debug('Comptes mappés:', mappedAccounts);
        setAccounts(mappedAccounts);

        // Charger les transactions
        logger.debug('Chargement des transactions pour userId:', userId);
        const firebaseTransactions = await FirebaseDataService.getUserTransactions(userId);
        
        // 🔍 LOG SIMPLE: Vérifier que les transactions se chargent

        logger.debug('Transactions Firebase récupérées:', firebaseTransactions);
        
        const mappedTransactions: Transaction[] = firebaseTransactions.map(trans => {
          
          const parsedDate = parseFirestoreDate(trans.date);
          
          // Déterminer le type de transaction
          let transactionType: 'income' | 'expense' | 'transfer' = 'income';
          if (trans.type === 'debit' || trans.category === t('transactionCategories.outgoingTransfer') || 
              trans.description?.includes('Überweisung') || trans.description?.includes(t('transactionCategories.outgoingTransfer'))) {
            transactionType = 'expense';
          } else if (trans.amount < 0) {
            transactionType = 'expense';
          } else if (trans.amount > 0) {
            transactionType = 'income';
          }
          
          // Déterminer le montant (négatif pour les dépenses)
          let amount = trans.amount;
          if (transactionType === 'expense' && amount > 0) {
            amount = -amount;
          }
          
          // Déterminer le nom du compte
          let accountName = trans.accountId;
          if (accountName === 'checking-1') {
            accountName = t('accountTypes.current');
          } else if (accountName === 'savings-1') {
            accountName = t('accountTypes.savings');
          } else if (accountName === 'credit-1') {
            accountName = t('accountTypes.credit');
          }
          
          // 🔧 LAISSER les descriptions utilisateur dans leur langue d'origine
          // Pas de traduction forcée - l'utilisateur voit ses propres libellés
          let correctedDescription = trans.description;
          if (trans.description && trans.description.includes('savings-1')) {
            correctedDescription = trans.description.replace(/savings-1/g, t('accountTypes.savings'));
          }
          if (trans.description && trans.description.includes('checking-1')) {
            correctedDescription = trans.description.replace(/checking-1/g, t('accountTypes.current'));
          }
          if (trans.description && trans.description.includes('credit-1')) {
            correctedDescription = trans.description.replace(/credit-1/g, t('accountTypes.credit'));
          }
          
          logger.debug(`Accounts Transaction ${trans.id}: amount=${amount}, type=${transactionType}, date=${parsedDate}, category=${trans.category}`);
          
          // 🔧 TRADUIRE les catégories de transactions
          let translatedCategory = trans.category || t('transactionCategories.other');
          
          // Mapper les catégories vers les clés de traduction
          const categoryMap: { [key: string]: string } = {
            'Retirada': t('transactionCategories.withdrawal'),
            'Servizio AmCBunq': t('transactionCategories.amcbunqService'),
            'AmCBunq Service': t('transactionCategories.amcbunqService'),
            'Service AmCBunq': t('transactionCategories.amcbunqService'),
            'Depotfinanzierung': t('transactionCategories.amcbunqService'),
            'Überweisung': t('transactionCategories.outgoingTransfer'),
            'Servicio AmCBunq': t('transactionCategories.amcbunqService'),
            'Serviço AmCBunq': t('transactionCategories.amcbunqService'),
            'Bonifico Uscita': t('transactionCategories.outgoingTransfer'),
            'Outgoing Transfer': t('transactionCategories.outgoingTransfer'),
            'Transfert Sortant': t('transactionCategories.outgoingTransfer'),
            'Virement sortant': t('transactionCategories.outgoingTransfer'),
            'Virement Sortant': t('transactionCategories.outgoingTransfer'),
            'Ausgehende Überweisung': t('transactionCategories.outgoingTransfer'),
            'Transferencia Saliente': t('transactionCategories.outgoingTransfer'),
            'Transferência Saída': t('transactionCategories.outgoingTransfer'),
            'Bonifico Entrata': t('transactionCategories.incomingTransfer'),
            'Incoming Transfer': t('transactionCategories.incomingTransfer'),
            'Transfert Entrant': t('transactionCategories.incomingTransfer'),
            'Eingehende Überweisung': t('transactionCategories.incomingTransfer'),
            'Transferencia Entrante': t('transactionCategories.incomingTransfer'),
            'Transferência Entrada': t('transactionCategories.incomingTransfer')
          };
          
          // Utiliser la traduction si disponible, sinon garder la catégorie originale
          translatedCategory = categoryMap[trans.category] || trans.category || t('transactionCategories.other');
          
          return {
            id: trans.id,
            date: parsedDate,
            description: truncateTransactionDescription(correctedDescription || 'Transaction'),
            amount: amount,
            type: transactionType,
            category: translatedCategory,
            account: accountName || 'Compte',
            reference: trans.reference || trans.id
          };
        });
        logger.debug('Transactions mappées:', mappedTransactions);
        setTransactions(mappedTransactions);

      } catch (error) {
        logger.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseData();
  }, []);

  // Synchroniser le statut KYC au chargement
  useEffect(() => {
    syncKycStatus();
  }, [syncKycStatus]);

  const getAccountTypeText = (type: string) => {
    switch (type) {
      case 'current':
        return t('accountTypes.current');
      case 'savings':
        return t('accountTypes.savings');
      case 'credit':
        return t('accountTypes.credit');
      default:
        return t('accountTypes.account');
    }
  };

  // Fonction pour traduire les noms des comptes
  const translateAccountName = (name: string): string => {
    logger.debug('translateAccountName called with:', name);
    const lowerName = name.toLowerCase();
    logger.debug('Lowercase name:', lowerName);
    
    switch (lowerName) {
      case 'checking':
        logger.debug('Translating checking to Compte courant');
        return t('accountTypes.current');
      case 'savings':
        logger.debug('Translating savings to Compte épargne');
        return t('accountTypes.savings');
      case 'credit':
        logger.debug('Translating credit to Carte de crédit');
        return t('accountTypes.credit');
      default:
        logger.debug('No translation found, returning original:', name);
        return name;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'current':
        return 'bg-blue-100 text-blue-800';
      case 'savings':
        return 'bg-green-100 text-green-800';
      case 'credit':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'blocked':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('accountStatus.active');
      case 'blocked':
        return t('accountStatus.blocked');
      case 'pending':
        return t('accountStatus.pending');
      default:
        return t('accountStatus.unknown');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDateDisplay = (date: Date) => {
    if (!date || isNaN(date.getTime())) {
      return String(t('common.error'));
    }
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    
    if (isToday) {
      return `${String(t('accounts.todayAt'))} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `${String(t('accounts.yesterdayAt'))} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatDateShort = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return String(t('accounts.today'));
    } else if (diffDays === 2) {
      return String(t('accounts.yesterday'));
    } else if (diffDays <= 7) {
      return String(t('accounts.daysAgo', { count: diffDays - 1 }));
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatReference = (reference: string) => {
    if (!reference) return '-';
    
    // Nettoyer la référence
    let cleanRef = reference.replace(/[^a-zA-Z0-9_-]/g, '');
    
    // Alternative 1: Afficher seulement les 6 derniers caractères avec préfixe
    if (cleanRef.length > 8) {
      const lastChars = cleanRef.slice(-6);
      const prefix = cleanRef.startsWith('txn_') ? 'TXN' : 
                    cleanRef.startsWith('txn_out_') ? 'OUT' : 'REF';
      return `${prefix}-${lastChars}`;
    }
    
    return cleanRef;
  };

  const handleInternalTransfer = (fromAccount: string, toAccount: string) => {
    if (isUnverified) {
      setVerificationAction('transfer');
      setShowVerificationDialog(true);
      return;
    }
    // Rediriger vers la page virements
    navigate(getDashboardLink('virements'));
  };

  const handleAccountDetails = (accountId: string) => {
    if (isUnverified) {
      setVerificationAction('details');
      setShowVerificationDialog(true);
      return;
    }
    setSelectedAccount(accountId);
    setShowTransactionDetails(true);
  };

  // 🔧 NOUVEAU: Gérer l'affichage des comptes selon le statut KYC
  const displayAccounts = userStatus === 'verified' ? accounts : [];
  const sortedTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculs de pagination
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayTransactions = sortedTransactions.slice(startIndex, endIndex);
  
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('accounts.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête de la page */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t('accounts.title')}</h1>
            <p className="text-blue-100 text-sm sm:text-base">{t('accounts.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center space-x-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{showBalances ? t('accounts.hideBalances') : t('accounts.showBalances')}</span>
              <span className="sm:hidden">{showBalances ? t('accounts.hide') : t('accounts.show')}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm">{t('accounts.totalBalance')}</p>
            <p className="text-lg sm:text-2xl font-bold">
              {showBalances ? formatCurrency(totalBalance, 'EUR') : '••••••••'}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm">{t('accounts.activeAccounts')}</p>
            <p className="text-lg sm:text-2xl font-bold">{displayAccounts.filter(a => a.status === 'active').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <p className="text-blue-100 text-xs sm:text-sm">{t('accounts.status')}</p>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                userStatus === 'verified' ? 'bg-green-100 text-green-800' :
                userStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {userStatus === 'verified' ? t('accountStatus.verified') :
                 userStatus === 'pending' ? t('accountStatus.pendingVerification') :
                 t('accountStatus.unverified')}
              </span>
            </div>
          </div>
                </div>

                {/* RIB commun */}
        <div className="bg-white/10 rounded-xl p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('accounts.ribAmcbunq')}</p>
              <p className="text-sm sm:text-lg font-mono break-all sm:break-normal">
                {(() => {
                  // PRIORITÉ 1: Vérifier le statut KYC AVANT tout
                  if (userStatus === 'unverified') {
                    return t('accounts.ribUnavailable');
                  } else if (userStatus === 'pending') {
                    return t('accounts.ribUnavailable');
                  } else if (userStatus === 'verified') {
                    // Même si vérifié, ne pas afficher l'IBAN sans demande explicite
                    return t('accounts.ribUnavailable');
                  }
                  
                  // PRIORITÉ 2: Fallback vers les données des comptes seulement si statut OK
                  const firstAccount = accounts[0];
                  if (firstAccount && firstAccount.rib && firstAccount.rib.displayValue) {
                    // Vérifier si l'IBAN est vraiment disponible (pas juste stocké)
                    return t('accounts.ribUnavailable');
                  }
                  
                  return t('accounts.ribUnavailable');
                })()}
              </p>
              <p className="text-blue-100 text-xs">
                {(() => {
                  if (userStatus === 'unverified') {
                    return t('accounts.ribVerificationRequired');
                  } else if (userStatus === 'pending') {
                    return t('accounts.ribVerificationRequired');
                  } else if (userStatus === 'verified') {
                    return t('accounts.ribRequestPage');
                  }
                  return t('accounts.ribVerificationRequired');
                })()}
              </p>
            </div>
            <button
              className="px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm bg-gray-400 text-gray-200 cursor-not-allowed"
              disabled={true}
            >
              {t('accounts.ribUnavailable')}
            </button>
          </div>
        </div>
        </div>

      {/* Comptes */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">{t('accounts.title')}</h2>
        
        {/* 🔧 NOUVEAU: Message informatif pour les utilisateurs vérifiés */}
        {userStatus === 'verified' && displayAccounts.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="text-blue-600 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {t('accounts.creatingDefaultAccounts')}
              </h3>
              <p className="text-blue-700 text-sm">
                {t('accounts.defaultAccountsMessage')}
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {displayAccounts.map((account) => (
            <div key={account.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 sm:p-3 rounded-xl ${getAccountTypeColor(account.type || 'savings')}`}>
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{account.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{getAccountTypeText(account.type || 'savings')}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(account.status)}`}>
                  {getStatusText(account.status)}
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">{t('accounts.accountNumber')}</p>
                  <p className="font-mono text-xs sm:text-sm text-gray-900 break-all">
                    {(() => {
                      // PRIORITÉ 1: Vérifier le statut KYC AVANT tout
                      if (userStatus === 'unverified') {
                        return t('accounts.ribUnavailable');
                      } else if (userStatus === 'pending') {
                        return t('accounts.ribUnavailable');
                      } else if (userStatus === 'verified') {
                        // Même si vérifié, ne pas afficher l'IBAN sans demande explicite
                        return t('accounts.ribUnavailable');
                      }
                      
                      // PRIORITÉ 2: Fallback vers les données du compte seulement si statut OK
                      if (account.rib && account.rib.displayValue) {
                        // Vérifier si l'IBAN est vraiment disponible (pas juste stocké)
                        return t('accounts.ribUnavailable');
                      }
                      
                      return t('accounts.ribUnavailable');
                    })()}
                  </p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-500">{t('accounts.balance')}</p>
                  <p className={`text-lg sm:text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {showBalances ? formatCurrency(account.balance, account.currency) : '••••••••'}
                  </p>
                </div>

                {account.lastTransaction && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">{t('accounts.lastTransaction')}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-900 truncate">{account.lastTransaction.description}</p>
                        <p className="text-xs text-gray-500">{formatDateShort(account.lastTransaction.date)}</p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {account.lastTransaction.amount >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className={`text-xs sm:text-sm font-medium ${
                          account.lastTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {account.lastTransaction.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(account.lastTransaction.amount), account.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
                  <button 
                    onClick={() => handleAccountDetails(account.id)}
                    className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors font-medium"
                  >
                    {t('accounts.details')}
                  </button>
                  <button 
                    onClick={() => handleInternalTransfer(account.id, '')}
                    className="flex-1 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-green-700 transition-colors font-medium"
                  >
                    {t('accounts.transfer')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grand livre des transactions */}
      <KycProtectedContent 
        titleKey="accounts.transactionLedger"
        fallbackMessage={String(t('kyc.noTransactionsAvailable'))}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={String(t('accounts.search'))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button className="flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Filter className="w-4 h-4" />
              <span>{t('accounts.filter')}</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Download className="w-4 h-4" />
              <span>{t('accounts.export')}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('transactions.fields.date')}</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('transactions.fields.description')}</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('transactions.fields.account')}</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('transactions.fields.category')}</th>
                <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('transactions.fields.reference')}</th>
                <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('transactions.fields.amount')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-4 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {formatDateDisplay(transaction.date)}
                  </td>
                  <td className="px-2 sm:px-4 py-4 text-xs sm:text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      ) : transaction.type === 'expense' ? (
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      ) : (
                        <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      )}
                      <span className="truncate max-w-[100px] sm:max-w-[150px] lg:max-w-none">{transaction.description}</span>
                    </div>
                    <div className="sm:hidden text-xs text-gray-500 mt-1">
                      {transaction.account} • {transaction.category}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-4 text-xs sm:text-sm text-gray-500">{transaction.account}</td>
                  <td className="hidden lg:table-cell px-4 py-4 text-xs sm:text-sm text-gray-500">{transaction.category}</td>
                  <td className="hidden xl:table-cell px-4 py-4 text-xs sm:text-sm text-gray-500 font-mono">
                    {formatReference(transaction.reference)}
                  </td>
                  <td className={`px-2 sm:px-4 py-4 text-xs sm:text-sm font-medium text-right ${
                    transaction.type === 'income' ? 'text-green-600' :
                    transaction.type === 'expense' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), 'EUR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
          <span>{t('accounts.displaying')} {startIndex + 1} à {Math.min(endIndex, sortedTransactions.length)} sur {sortedTransactions.length} {t('accounts.transactions')}</span>
          {totalPages > 1 && (
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('accounts.previous')}
              </button>
              <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs sm:text-sm">
                {currentPage} / {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('accounts.next')}
              </button>
            </div>
          )}
        </div>
      </KycProtectedContent>

      {/* Modal de détails du compte */}
      {showTransactionDetails && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {t('accounts.accountDetails')}
              </h3>
              <button 
                onClick={() => setShowTransactionDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            {/* Contenu du modal */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{t('accounts.accountInfo')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">{t('accounts.accountNumber')}</p>
                    <p className="font-mono text-xs sm:text-sm text-gray-900 break-all">
                      {(() => {
                        const account = accounts.find(acc => acc.id === selectedAccount);
                        if (account && account.rib && account.rib.displayValue) {
                          return account.rib.displayValue;
                        }
                        
                        // Fallback selon le statut KYC
                        if (userStatus === 'unverified') {
                          return t('accounts.ribUnavailable');
                        } else if (userStatus === 'pending') {
                          return t('accounts.ribUnavailable');
                        } else if (userStatus === 'verified') {
                          return t('accounts.ribUnavailable'); // Jusqu'à ce qu'une demande soit faite
                        }
                        return t('accounts.ribUnavailable');
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">{t('accounts.currentBalance')}</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">
                      {(() => {
                        const account = accounts.find(acc => acc.id === selectedAccount);
                        return account ? formatCurrency(account.balance, account.currency) : '0,00 €';
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">{t('accounts.status')}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (() => {
                        const account = accounts.find(acc => acc.id === selectedAccount);
                        const status = account ? account.status : 'active';
                        return status === 'active' ? 'bg-green-100 text-green-800' :
                               status === 'blocked' ? 'bg-red-100 text-red-800' :
                               'bg-yellow-100 text-yellow-800';
                      })()
                    }`}>
                      {(() => {
                        const account = accounts.find(acc => acc.id === selectedAccount);
                        return account ? getStatusText(account.status) : t('accountStatus.active');
                      })()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">{t('accounts.openingDate')}</p>
                    <p className="text-xs sm:text-sm text-gray-900">
                      {(() => {
                        const account = accounts.find(acc => acc.id === selectedAccount);
                        return account && account.createdAt ? 
                          formatDate(new Date(account.createdAt)) : 
                          t('accounts.notAvailable');
                      })()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{t('accounts.recentTransactions')}</h4>
                <div className="space-y-2">
                  {displayTransactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-2 bg-white rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{formatDateShort(transaction.date)}</p>
                      </div>
                      <span className={`text-xs sm:text-sm font-medium ml-2 ${
                        transaction.type === 'income' ? 'text-green-600' :
                        transaction.type === 'expense' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), 'EUR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Boîte de dialogue de vérification d'identité */}
      {showVerificationDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {t('accounts.verificationRequired')}
              </h3>
              <button 
                onClick={() => setShowVerificationDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm sm:text-base text-gray-900 font-medium">
                    {verificationAction === 'transfer' ? t('accounts.transfer') : t('accounts.details')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {verificationAction === 'transfer' ? t('accounts.verificationMessage') : t('accounts.detailsVerificationMessage')}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowVerificationDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  {t('accounts.cancel')}
                </button>
                <button
                  onClick={() => {
                    setShowVerificationDialog(false);
                    // Ici on pourrait naviguer vers la page de vérification
                    logger.debug('Vérification d\'identité', 'Redirection vers la page de vérification d\'identité');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  {t('accounts.verifyIdentity')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AccountsPage;