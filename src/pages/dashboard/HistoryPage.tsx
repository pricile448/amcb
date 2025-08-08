import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Download, Calendar, TrendingUp, TrendingDown, CreditCard, Building, Loader2 } from 'lucide-react';
import { FirebaseDataService } from '../../services/firebaseData';
import { parseFirestoreDate, formatDate, formatAmount, truncateTransactionDescription } from '../../utils/dateUtils';
import VerificationState from '../../components/VerificationState';
import { useKycSync } from '../../hooks/useNotifications';
import { logger } from '../../utils/logger';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  account: string;
  reference: string;
}

const HistoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { userStatus, isUnverified, isLoading: kycLoading } = useKycSync();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Charger les données Firebase au montage du composant
  useEffect(() => {
    const loadFirebaseData = async () => {
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        if (!userId) {
          logger.error('Aucun utilisateur connecté');
          return;
        }

        // Charger les transactions
        const firebaseTransactions = await FirebaseDataService.getUserTransactions(userId);
        logger.debug('Transactions reçues dans HistoryPage:', firebaseTransactions);
        
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
            accountName = t('history.accounts.checking');
          } else if (accountName === 'savings-1') {
            accountName = t('history.accounts.savings');
          }
          
          logger.debug(`History Transaction ${trans.id}: amount=${amount}, type=${transactionType}, date=${parsedDate}, category=${trans.category}`);
          
          // Déterminer le statut
          let status: 'completed' | 'pending' | 'failed' = 'completed';
          if (transactionType === 'expense' && (trans.category === 'Virement sortant' || trans.description?.includes('Überweisung'))) {
            status = 'pending';
          } else if (trans.status) {
            status = trans.status as 'completed' | 'pending' | 'failed';
          }
          
          // Corriger les descriptions pour utiliser les noms d'affichage des comptes
          let correctedDescription = trans.description;
          if (trans.description.includes('savings-1')) {
            correctedDescription = trans.description.replace('savings-1', t('history.accounts.savings'));
          }
          if (trans.description.includes('checking-1')) {
            correctedDescription = trans.description.replace('checking-1', t('history.accounts.checking'));
          }
          if (trans.description.includes('credit-1')) {
            correctedDescription = trans.description.replace('credit-1', t('history.accounts.credit'));
          }
          
          return {
            id: trans.id,
            type: transactionType,
            category: trans.category || t('history.categories.other'),
            description: truncateTransactionDescription(correctedDescription || 'Transaction'),
            amount: amount,
            currency: trans.currency || 'EUR',
            date: parsedDate,
            status: status,
            account: accountName || t('history.accounts.default'),
            reference: trans.reference || trans.id
          };
        });
        setTransactions(mappedTransactions);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseData();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'income' && transaction.type === 'income') ||
                         (selectedFilter === 'expense' && transaction.type === 'expense') ||
                         (selectedFilter === 'transfer' && transaction.type === 'transfer');

    return matchesSearch && matchesFilter;
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const formatDateDisplay = (date: Date) => {
    return formatDate(date, 'short');
  };

  const formatTimeDisplay = (date: Date) => {
    return formatDate(date, 'time');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('history.status.completed');
      case 'pending':
        return t('history.status.pending');
      case 'failed':
        return t('history.status.failed');
      default:
        return t('history.status.unknown');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'transfer':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <Building className="w-4 h-4 text-gray-600" />;
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

  // Vérification du statut KYC
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
        description="Pour consulter l'historique de vos transactions, vous devez d'abord valider votre identité."
      />
    );
  }

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('history.title')}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t('history.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">{t('history.summary.income')}</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {totalIncome.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">{t('history.summary.expenses')}</p>
              <p className="text-lg sm:text-2xl font-bold text-red-600">
                {totalExpenses.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">{t('history.summary.netBalance')}</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {(totalIncome - totalExpenses).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
            <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder={t('history.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">{t('history.filters.allTypes')}</option>
              <option value="income">{t('history.filters.income')}</option>
              <option value="expense">{t('history.filters.expense')}</option>
              <option value="transfer">{t('history.filters.transfer')}</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="7days">{t('history.filters.periods.7Days')}</option>
              <option value="30days">{t('history.filters.periods.30Days')}</option>
              <option value="90days">{t('history.filters.periods.90Days')}</option>
              <option value="1year">{t('history.filters.periods.1Year')}</option>
            </select>

            <button className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t('history.filters.export')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('history.table.headers.transaction')}
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('history.table.headers.category')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('history.table.headers.amount')}
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('history.table.headers.date')}
                </th>
                <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('history.table.headers.status')}
                </th>
                <th className="hidden 2xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('history.table.headers.reference')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Chargement des transactions...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {transaction.description}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {transaction.account}
                        </div>
                        <div className="sm:hidden text-xs text-gray-400 mt-1">
                          {formatDateDisplay(transaction.date)} • {transaction.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount >= 0 ? '+' : '-'}
                      {Math.abs(transaction.amount).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: transaction.currency
                      })}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                                              <div>{formatDateDisplay(transaction.date)}</div>
                                              <div className="text-xs">{formatTimeDisplay(transaction.date)}</div>
                    </div>
                  </td>
                  <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </span>
                  </td>
                  <td className="hidden 2xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {formatReference(transaction.reference)}
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <Calendar className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('history.emptyState.title')}</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              {t('history.emptyState.description')}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
          <span>{t('history.pagination.showing')} {filteredTransactions.length} {t('history.pagination.transactions')}</span>
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm">{t('history.pagination.previous')}</button>
            <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs sm:text-sm">1</span>
            <button className="px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm">{t('history.pagination.next')}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage; 