import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Plus, 
  Shield, 
  Zap, 
  Globe,
  Star,
  Gift,
  Award,
  Sparkles,
  Building,
  Eye,
  EyeOff
} from "lucide-react";
import { FirebaseDataService, FirebaseAccount, FirebaseTransaction } from '../../services/firebaseData';
import { parseFirestoreDate, formatDate, formatAmount, truncateTransactionDescription, formatUserNameForDisplay } from '../../utils/dateUtils';
import { useKycSync } from '../../hooks/useNotifications';

import { logger } from '../../utils/logger';

// Utiliser FirebaseAccount au lieu de l'interface locale
type Account = FirebaseAccount;

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  type: 'income' | 'expense' | 'transfer';
}

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { userStatus, syncKycStatus, hasInitialized } = useKycSync();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [showBalances, setShowBalances] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Charger les données Firebase au montage du composant UNE SEULE FOIS
  useEffect(() => {
    const loadFirebaseData = async () => {
      if (dataLoaded) return;
      
      // Synchroniser le statut KYC seulement si pas encore initialisé
      if (!hasInitialized) {
        await syncKycStatus();
      }
      
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        if (!userId) {
          console.error('Aucun utilisateur connecté');
          return;
        }

        // Charger les comptes
        const firebaseAccounts = await FirebaseDataService.getUserAccounts(userId);
        const mappedAccounts: Account[] = firebaseAccounts.map(acc => {
          logger.debug('Dashboard - Account data:', acc);
          logger.debug('Dashboard - Account name:', acc.name);
          logger.debug('Dashboard - Account type:', acc.accountType);
          
          const translatedName = translateAccountName(acc.name || acc.accountType || 'Compte');
          logger.debug('Dashboard - Translated name:', translatedName);
          
          return {
            ...acc, // Garder toutes les propriétés originales
            name: translatedName,
            type: (acc.name || acc.accountType || '').includes('checking') ? 'current' : 
                  (acc.name || acc.accountType || '').includes('credit') ? 'credit' : 'savings',
            balance: Math.abs(acc.balance), // Utiliser la valeur absolue pour l'affichage
            lastTransaction: {
              date: new Date(),
              amount: 0,
              description: 'Aucune transaction récente'
            }
          };
        });
        
        setAccounts(mappedAccounts);
        setDataLoaded(true);
      } catch (error) {
        console.error('❌ Erreur chargement données dashboard:', error);
        setDataLoaded(true);
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseData();
  }, [syncKycStatus, hasInitialized, dataLoaded]);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const currentAccount = accounts.find(a => a.type === 'current');
  const savingsAccount = accounts.find(a => a.type === 'savings');

  const formatCurrency = (amount: number, currency: string) => {
    // Pour les comptes non vérifiés ou en attente, afficher 00.00
    if (userStatus === 'unverified' || userStatus === 'pending') {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
      }).format(0);
    }
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDateDisplay = (date: Date) => {
    return formatDate(date, 'datetime');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'expense':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'transfer':
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      default:
        return <ArrowRight className="w-4 h-4 text-gray-500" />;
    }
  };

  // Fonction pour traduire les noms des comptes
  const [userName, setUserName] = useState('Client AmCbunq');
  const [userEmail, setUserEmail] = useState('');

  // Charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = FirebaseDataService.getCurrentUserId();
        if (userId) {
          const userData = await FirebaseDataService.getUserData(userId);
          if (userData && userData.firstName && userData.lastName) {
            const fullName = formatUserNameForDisplay(userData.firstName, userData.lastName);
            setUserName(fullName);
          }
          if (userData && userData.email) {
            setUserEmail(userData.email);
          }
        }
      } catch (error) {
        console.error('❌ Erreur chargement données utilisateur:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Fonction pour récupérer l'email de l'utilisateur
  const getUserEmail = (): string => {
    return userEmail || 'client@amcbunq.com';
  };

  const translateAccountName = (name: string): string => {
    logger.debug('Dashboard translateAccountName called with:', name);
    const lowerName = name.toLowerCase();
    logger.debug('Dashboard lowercase name:', lowerName);
    
    switch (lowerName) {
      case 'checking':
        logger.debug('Dashboard translating checking to Compte courant');
        return 'Compte courant';
      case 'savings':
        logger.debug('Dashboard translating savings to Compte épargne');
        return 'Compte épargne';
      case 'credit':
        logger.debug('Dashboard translating credit to Carte de crédit');
        return 'Carte de crédit';
      default:
        logger.debug('Dashboard no translation found, returning original:', name);
        return name;
    }
  };

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header avec RIB */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Bonjour, {userName}</h1>
            <p className="text-blue-100 text-sm md:text-base">Votre tableau de bord financier</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
            >
              {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-xs md:text-sm font-medium">
                {showBalances ? 'Masquer' : 'Afficher'} les soldes
              </span>
            </button>
            <div className="flex items-center space-x-2 bg-blue-500/30 px-2 md:px-3 py-1 rounded-full">
              {userStatus === 'verified' ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-xs md:text-sm font-medium">Vérifié</span>
                </>
              ) : userStatus === 'pending' ? (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs md:text-sm font-medium">En cours</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-xs md:text-sm font-medium">Non vérifié</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">Solde total</p>
            <p className="text-lg md:text-2xl font-bold">
              {showBalances ? formatCurrency(totalBalance, 'EUR') : '••••••••'}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">Compte courant</p>
            <p className="text-lg md:text-2xl font-bold text-green-300">
              {showBalances 
                ? (currentAccount ? formatCurrency(currentAccount.balance, 'EUR') : '0,00 €')
                : '••••••••'
              }
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">Compte épargne</p>
            <p className="text-lg md:text-2xl font-bold text-blue-300">
              {showBalances 
                ? (savingsAccount ? formatCurrency(savingsAccount.balance, 'EUR') : '0,00 €')
                : '••••••••'
              }
            </p>
          </div>
                </div>

        {/* RIB */}
        <div className="bg-white/10 rounded-xl p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div>
              <p className="text-blue-100 text-xs md:text-sm font-medium">RIB</p>
              <p className="text-sm md:text-lg font-mono">
                {(() => {
                  // PRIORITÉ 1: Vérifier le statut KYC AVANT tout
                  if (userStatus === 'unverified') {
                    return 'RIB non disponible';
                  } else if (userStatus === 'pending') {
                    return 'RIB non disponible';
                  } else if (userStatus === 'verified') {
                    // Même si vérifié, ne pas afficher l'IBAN sans demande explicite
                    return 'RIB non disponible';
                  }
                  
                  // PRIORITÉ 2: Fallback vers les données des comptes seulement si statut OK
                  const firstAccount = accounts[0];
                  if (firstAccount && firstAccount.rib && firstAccount.rib.displayValue) {
                    // Vérifier si l'IBAN est vraiment disponible (pas juste stocké)
                    return 'RIB non disponible';
                  }
                  
                  return 'RIB non disponible';
                })()}
              </p>
              <p className="text-blue-100 text-xs">
                {(() => {
                  if (userStatus === 'unverified') {
                    return 'Vérifiez votre identité pour accéder à votre RIB';
                  } else if (userStatus === 'pending') {
                    return 'Vérifiez votre identité pour accéder à votre RIB';
                  } else if (userStatus === 'verified') {
                    return 'Demandez votre RIB sur la page IBAN';
                  }
                  return 'Vérifiez votre identité pour accéder à votre RIB';
                })()}
              </p>
            </div>
            <button 
              className="px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base bg-gray-400 text-gray-200 cursor-not-allowed"
              disabled={true}
            >
              RIB non disponible
            </button>
          </div>
        </div>
        </div>

      {/* Actions rapides modernisées */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Link to="/dashboard/virements" className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 md:p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer block">
            <div className="flex flex-col items-center space-y-2 md:space-y-3">
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <ArrowRight className="w-4 md:w-6 h-4 md:h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm md:text-base">Virement</p>
                <p className="text-blue-100 text-xs md:text-sm">Transférer</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/comptes" className="group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 md:p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer block">
            <div className="flex flex-col items-center space-y-2 md:space-y-3">
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <Plus className="w-4 md:w-6 h-4 md:h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm md:text-base">Dépôt</p>
                <p className="text-green-100 text-xs md:text-sm">Ajouter</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/cartes" className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 md:p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer block">
            <div className="flex flex-col items-center space-y-2 md:space-y-3">
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <CreditCard className="w-4 md:w-6 h-4 md:h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm md:text-base">Cartes</p>
                <p className="text-purple-100 text-xs md:text-sm">Gérer</p>
              </div>
            </div>
          </Link>

          <Link to="/dashboard/facturation" className="group bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-4 md:p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer block">
            <div className="flex flex-col items-center space-y-2 md:space-y-3">
              <div className="bg-white/20 p-2 md:p-3 rounded-full">
                <Zap className="w-4 md:w-6 h-4 md:h-6" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm md:text-base">Paiements</p>
                <p className="text-orange-100 text-xs md:text-sm">Rapides</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Comptes */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Mes Comptes</h2>
          <Link to="/dashboard/comptes" className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base cursor-pointer">Voir tous</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className={`p-2 md:p-3 rounded-lg ${
                    account.type === 'current' ? 'bg-blue-100 text-blue-600' :
                    account.type === 'savings' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <CreditCard className="w-4 md:w-6 h-4 md:h-6" />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm md:text-base">{account.name}</span>
                </div>
              </div>
              <p className={`text-lg md:text-2xl font-bold mb-2 ${
                account.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {showBalances ? formatCurrency(account.balance, account.currency) : '••••••••'}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mb-3">
                Dernière opération: {account.lastTransaction?.description || 'Aucune transaction récente'}
              </p>
              <div className="flex space-x-2">
                <Link to="/dashboard/comptes" className="flex-1 bg-blue-600 text-white px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm hover:bg-blue-700 transition-colors text-center cursor-pointer block">
                  Détails
                </Link>
                <Link to="/dashboard/virements" className="flex-1 bg-gray-200 text-gray-700 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm hover:bg-gray-300 transition-colors text-center cursor-pointer block">
                  Virement
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Transactions récentes</h2>
          <Link to="/dashboard/historique" className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base cursor-pointer">Voir toutes</Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                {getTransactionIcon(transaction.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm md:text-base truncate max-w-[200px] sm:max-w-[300px] lg:max-w-none">{transaction.description}</p>
                  <p className="text-xs md:text-sm text-gray-500 truncate">{transaction.category} • {formatDateDisplay(transaction.date)}</p>
                </div>
              </div>
                             <span className={`font-semibold text-sm md:text-base ${
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

      {/* Sections publicitaires avec couleurs améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Offre spéciale */}
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 md:w-6 h-5 md:h-6" />
              <h3 className="text-lg md:text-xl font-bold">Offre Spéciale</h3>
            </div>
            <Sparkles className="w-5 md:w-6 h-5 md:h-6" />
          </div>
          <p className="text-emerald-100 text-sm md:text-base mb-3 md:mb-4">
            Ouvrez un compte épargne et bénéficiez de 2% d'intérêts pendant 6 mois !
          </p>
                      <Link to="/dashboard/parametres" className="bg-white/20 hover:bg-white/30 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base cursor-pointer inline-block">
              En savoir plus
            </Link>
        </div>

        {/* Assurance */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 md:p-6 text-white">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 md:w-6 h-5 md:h-6" />
              <h3 className="text-lg md:text-xl font-bold">Protection Premium</h3>
            </div>
            <Award className="w-5 md:w-6 h-5 md:h-6" />
          </div>
          <p className="text-indigo-100 text-sm md:text-base mb-3 md:mb-4">
            Protégez vos transactions avec notre assurance fraudes avancée.
          </p>
                      <Link to="/dashboard/parametres" className="bg-white/20 hover:bg-white/30 text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base cursor-pointer inline-block">
              Activer
            </Link>
        </div>
      </div>

      {/* Cadeau de bienvenue */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-4 md:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex items-center space-x-3 md:space-x-4">
            <Gift className="w-10 md:w-12 h-10 md:h-12" />
            <div>
              <h3 className="text-lg md:text-xl font-bold">Cadeau de bienvenue !</h3>
              <p className="text-rose-100 text-sm md:text-base">
                Parrainez un ami et recevez 50€ chacun. Conditions applicables.
              </p>
            </div>
          </div>
                      <Link to="/dashboard/parametres" className="bg-white/20 hover:bg-white/30 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg transition-colors font-medium text-sm md:text-base cursor-pointer inline-block">
              Parrainer
            </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 