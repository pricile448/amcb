import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Eye, EyeOff, TrendingUp, TrendingDown, ArrowRight, Download, FileText, Calendar, Filter, Search } from 'lucide-react';
import { FirebaseDataService, FirebaseAccount, FirebaseTransaction } from '../../services/firebaseData';
import { parseFirestoreDate, formatAmount, truncateTransactionDescription, formatUserNameForDisplay } from '../../utils/dateUtils';
import { useKycSync } from '../../hooks/useNotifications';


interface Account {
  id: string;
  name: string;
  type: 'current' | 'savings' | 'credit';
  accountNumber: string;
  balance: number;
  currency: string;
  status: 'active' | 'blocked' | 'pending';
  lastTransaction?: {
    date: Date;
    amount: number;
    description: string;
  };
}

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
  const { t } = useTranslation();
  const { userStatus, isUnverified, syncKycStatus } = useKycSync();
  const [showBalances, setShowBalances] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'transfer' | 'details'>('transfer');
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  // Charger les données Firebase au montage du composant
  useEffect(() => {
    const loadFirebaseData = async () => {
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        console.log('🔍 UserID récupéré:', userId);
        
        if (!userId) {
          console.error('❌ Aucun utilisateur connecté');
          return;
        }

        // Charger les comptes
        console.log('📊 Chargement des comptes pour userId:', userId);
        const firebaseAccounts = await FirebaseDataService.getUserAccounts(userId);
        console.log('📊 Comptes Firebase récupérés:', firebaseAccounts);
        
        const mappedAccounts: Account[] = firebaseAccounts.map(acc => {
          console.log('🔍 Account data:', acc);
          console.log('🔍 Account name:', acc.name);
          console.log('🔍 Account type:', acc.accountType);
          
          const translatedName = translateAccountName(acc.name || acc.accountType || 'Compte');
          console.log('🔍 Translated name:', translatedName);
          
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
              description: 'Aucune transaction récente'
            }
          };
        });
        console.log('📊 Comptes mappés:', mappedAccounts);
        setAccounts(mappedAccounts);

        // Charger les transactions
        console.log('💰 Chargement des transactions pour userId:', userId);
        const firebaseTransactions = await FirebaseDataService.getUserTransactions(userId);
        console.log('💰 Transactions Firebase récupérées:', firebaseTransactions);
        
        const mappedTransactions: Transaction[] = firebaseTransactions.map(trans => {
          const parsedDate = parseFirestoreDate(trans.date);
          
          // Déterminer le type de transaction
          let transactionType: 'income' | 'expense' | 'transfer' = 'income';
          if (trans.type === 'debit' || trans.category === 'Virement sortant' || trans.description?.includes('Überweisung')) {
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
            accountName = 'Compte Courant';
          } else if (accountName === 'savings-1') {
            accountName = 'Compte Épargne';
          } else if (accountName === 'credit-1') {
            accountName = 'Carte de Crédit';
          }
          
          // Corriger la description pour remplacer les IDs de compte par des noms lisibles
          let correctedDescription = trans.description;
          if (trans.description && trans.description.includes('savings-1')) {
            correctedDescription = trans.description.replace(/savings-1/g, 'Compte Épargne');
          }
          if (trans.description && trans.description.includes('checking-1')) {
            correctedDescription = trans.description.replace(/checking-1/g, 'Compte Courant');
          }
          if (trans.description && trans.description.includes('credit-1')) {
            correctedDescription = trans.description.replace(/credit-1/g, 'Carte de Crédit');
          }
          
          console.log(`💰 Accounts Transaction ${trans.id}: amount=${amount}, type=${transactionType}, date=${parsedDate}, category=${trans.category}`);
          
          return {
            id: trans.id,
            date: parsedDate,
            description: truncateTransactionDescription(correctedDescription || 'Transaction'),
            amount: amount,
            type: transactionType,
            category: trans.category || 'Autre',
            account: accountName || 'Compte',
            reference: trans.reference || trans.id
          };
        });
        console.log('💰 Transactions mappées:', mappedTransactions);
        setTransactions(mappedTransactions);

      } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
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
        return 'Compte courant';
      case 'savings':
        return 'Compte épargne';
      case 'credit':
        return 'Carte de crédit';
      default:
        return 'Compte';
    }
  };

  // Fonction pour traduire les noms des comptes
  const translateAccountName = (name: string): string => {
    console.log('🔍 translateAccountName called with:', name);
    const lowerName = name.toLowerCase();
    console.log('🔍 Lowercase name:', lowerName);
    
    switch (lowerName) {
      case 'checking':
        console.log('🔍 Translating checking to Compte courant');
        return 'Compte courant';
      case 'savings':
        console.log('🔍 Translating savings to Compte épargne');
        return 'Compte épargne';
      case 'credit':
        console.log('🔍 Translating credit to Carte de crédit');
        return 'Carte de crédit';
      default:
        console.log('🔍 No translation found, returning original:', name);
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
        return 'Actif';
      case 'blocked':
        return 'Bloqué';
      case 'pending':
        return 'En attente';
      default:
        return 'Inconnu';
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
      return 'Date invalide';
    }
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    
    if (isToday) {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
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
    if (!date || isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();
    
    if (isToday) {
      return `Aujourd'hui`;
    } else if (isYesterday) {
      return `Hier`;
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    }
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
    // Logique de virement interne
    console.log(`Virement interne de ${fromAccount} vers ${toAccount}`);
    // Ici on pourrait ouvrir un modal ou naviguer vers la page de virement
    console.log(
      t('transfers.internalTransfer') || 'Virement interne',
      t('transfers.internalTransferDescription') || 'Fonctionnalité de virement interne en cours de développement'
    );
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

  // Pour les utilisateurs non vérifiés, afficher des données vierges
  const displayAccounts = userStatus === 'verified' ? accounts : [];
  const displayTransactions = userStatus === 'verified' ? transactions : [];
  const totalBalance = userStatus === 'verified' ? accounts.reduce((sum, account) => sum + account.balance, 0) : 0;

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos comptes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header avec RIB commun */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Mes Comptes</h1>
            <p className="text-blue-100 text-sm sm:text-base">Gérez vos comptes et cartes</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center space-x-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">{showBalances ? 'Masquer' : 'Afficher'} les soldes</span>
              <span className="sm:hidden">{showBalances ? 'Masquer' : 'Afficher'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm">Solde total</p>
            <p className="text-lg sm:text-2xl font-bold">
              {showBalances ? formatCurrency(totalBalance, 'EUR') : '••••••••'}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm">Comptes actifs</p>
            <p className="text-lg sm:text-2xl font-bold">{displayAccounts.filter(a => a.status === 'active').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <p className="text-blue-100 text-xs sm:text-sm">Statut</p>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                userStatus === 'verified' ? 'bg-green-100 text-green-800' :
                userStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {userStatus === 'verified' ? 'Vérifié' :
                 userStatus === 'pending' ? 'En cours' :
                 'Non vérifié'}
              </span>
            </div>
          </div>
        </div>


      </div>

      {/* Comptes */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Mes Comptes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {displayAccounts.map((account) => (
            <div key={account.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 sm:p-3 rounded-xl ${getAccountTypeColor(account.type)}`}>
                    <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{account.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{getAccountTypeText(account.type)}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(account.status)}`}>
                  {getStatusText(account.status)}
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Numéro de compte</p>
                  <p className="font-mono text-xs sm:text-sm text-gray-900 break-all">{account.accountNumber}</p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Solde</p>
                  <p className={`text-lg sm:text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {showBalances ? formatCurrency(account.balance, account.currency) : '••••••••'}
                  </p>
                </div>

                {account.lastTransaction && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Dernière transaction</p>
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
                    Détails
                  </button>
                  <button 
                    onClick={() => handleInternalTransfer(account.id, '')}
                    className="flex-1 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-green-700 transition-colors font-medium"
                  >
                    Virement
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grand livre des transactions */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Grand livre des transactions</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <button className="flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              <Filter className="w-4 h-4" />
              <span>Filtrer</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="px-2 sm:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
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
          <span>Affichage de {displayTransactions.length} transactions</span>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm">Précédent</button>
            <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs sm:text-sm">1</span>
            <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm">Suivant</button>
          </div>
        </div>
      </div>

      {/* Modal de détails du compte */}
      {showTransactionDetails && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Détails du compte
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
                <h4 className="font-semibold text-gray-900 mb-2">Informations du compte</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Numéro de compte</p>
                    <p className="font-mono text-xs sm:text-sm text-gray-900 break-all">FR76 **** **** **** 1234 5678 901</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Solde actuel</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">2 847,50 €</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Statut</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Actif
                    </span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Date d'ouverture</p>
                    <p className="text-xs sm:text-sm text-gray-900">15/01/2024</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Dernières transactions</h4>
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
                Vérification d'identité requise
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
                    {verificationAction === 'transfer' ? 'Virement' : 'Détails du compte'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Pour {verificationAction === 'transfer' ? 'effectuer un virement' : 'voir les détails du compte'}, vous devez d'abord valider votre identité.
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowVerificationDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowVerificationDialog(false);
                    // Ici on pourrait naviguer vers la page de vérification
                    console.log('Vérification d\'identité', 'Redirection vers la page de vérification d\'identité');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Vérifier mon identité
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