import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, Download, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { FirebaseDataService } from "../../services/firebaseData";
import { parseFirestoreDate, formatDate, formatAmount, truncateTransactionDescription } from "../../utils/dateUtils";
import { logger } from "../../utils/logger";

const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Charger les transactions depuis Firestore
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        if (!userId) {
          logger.error('Aucun utilisateur connecté');
          setLoading(false);
          return;
        }

        logger.debug('Chargement des transactions pour userId:', userId);
        const firebaseTransactions = await FirebaseDataService.getUserTransactions(userId);
        
        logger.debug('Transactions reçues:', firebaseTransactions);
        
                 // Mapper les transactions Firebase avec les dates correctes
         const mappedTransactions = firebaseTransactions.map(tx => {
           const parsedDate = parseFirestoreDate(tx.date);
           
           // Déterminer le type de transaction
           let transactionType = tx.type;
           if (!transactionType) {
             if (tx.category === t('transactionCategories.outgoingTransfer') || tx.description?.includes('Überweisung')) {
               transactionType = 'debit';
             } else if (tx.amount > 0) {
               transactionType = 'credit';
             } else {
               transactionType = 'debit';
             }
           }
           
           // Déterminer le nom du compte
           let accountName = tx.accountId;
           if (accountName === 'checking-1') {
             accountName = String(t('transactions.accounts.checking'));
           } else if (accountName === 'savings-1') {
             accountName = String(t('transactions.accounts.savings'));
           }
           
           logger.debug(`Transaction ${tx.id}: amount=${tx.amount}, type=${transactionType}, date=${parsedDate}, category=${tx.category}`);
           
           // Corriger les descriptions pour utiliser les noms d'affichage des comptes
           let correctedDescription = tx.description;
           if (tx.description.includes('savings-1')) {
             correctedDescription = tx.description.replace('savings-1', String(t('transactions.accounts.savings')));
           }
           if (tx.description.includes('checking-1')) {
             correctedDescription = tx.description.replace('checking-1', String(t('transactions.accounts.checking')));
           }
           if (tx.description.includes('credit-1')) {
             correctedDescription = tx.description.replace('credit-1', String(t('transactions.accounts.credit')));
           }
           
           // 🔧 TRADUIRE les descriptions allemandes
           if (correctedDescription === 'Depotfinanzierung') {
             correctedDescription = t('transactionCategories.amcbunqService');
           } else if (correctedDescription === 'Überweisung') {
             correctedDescription = t('transactionCategories.outgoingTransfer');
           }
           
           return {
             id: tx.id,
             description: truncateTransactionDescription(correctedDescription || 'Transaction'),
             amount: tx.amount,
             type: transactionType,
             date: parsedDate,
             category: tx.category || 'Autre',
             account: accountName || 'Compte',
             reference: tx.id,
             formattedAmount: formatAmount(Math.abs(tx.amount), tx.currency || 'EUR'),
             formattedDate: formatDate(parsedDate, 'datetime')
           };
         });
        
        setTransactions(mappedTransactions);
        logger.success('Transactions chargées avec succès');
      } catch (error) {
        logger.error('Erreur lors du chargement des transactions:', error);
        // En cas d'erreur, utiliser des données de test
        setTransactions([
          {
            id: 1,
            description: "Salaire - Entreprise ABC",
            amount: 2500,
            type: "income",
            date: new Date(),
            category: "Salaire",
            account: String(t('transactions.accounts.checking')),
            reference: "REF123456",
            formattedAmount: "2 500,00 €",
            formattedDate: "Aujourd'hui"
          },
          {
            id: 2,
            description: "Courses - Supermarché",
            amount: -85.50,
            type: "expense",
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            category: "Alimentation",
            account: String(t('transactions.accounts.checking')),
            reference: "REF123457",
            formattedAmount: "85,50 €",
            formattedDate: "Hier"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const filters = [
    { value: "all", label: t("transactions.all") },
    { value: "income", label: t("transactions.income") },
    { value: "expense", label: t("transactions.expense") },
    { value: "transfer", label: t("transactions.transfer") },
  ];

  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        selectedFilter === "all" || transaction.type === selectedFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculs de pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("transactions.title")}
          </h1>
          <p className="text-gray-600">
            {t("transactions.subtitle")}
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Download className="w-5 h-5" />
          <span>{t("transactions.export")}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("transactions.searchPlaceholder") as string}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {filters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("transactions.recentTransactions")}
          </h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Chargement des transactions...</span>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {paginatedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === "credit"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {transaction.type === "credit" ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[300px] lg:max-w-none">
                        {transaction.description}
                      </p>
                      <div className="flex items-center space-x-2 sm:space-x-4 text-sm text-gray-600">
                        <span className="truncate">{transaction.category}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="truncate">{transaction.account}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{transaction.formattedDate || formatDate(transaction.date, 'short')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold text-lg ${
                        transaction.type === "credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}{transaction.formattedAmount || formatAmount(Math.abs(transaction.amount), 'EUR')}
                    </p>
                                         <p className="text-sm text-gray-500 font-mono">
                       {formatReference(transaction.reference)}
                     </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contrôles de pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredTransactions.length)} sur {filteredTransactions.length} transactions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t("transactions.totalIncome")}</p>
              <p className="text-2xl font-bold text-green-600">€2,650.00</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t("transactions.totalExpenses")}</p>
              <p className="text-2xl font-bold text-red-600">€695.30</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t("transactions.netBalance")}</p>
              <p className="text-2xl font-bold text-blue-600">€1,954.70</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage; 