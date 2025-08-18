import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { FirebaseDataService, FirebaseBudget } from '../../services/firebaseData';
import { useKycSync } from '../../hooks/useNotifications';
import { logger } from '../../utils/logger';
import VerificationState from '../../components/VerificationState';
import CreateBudgetModal from '../../components/budgets/CreateBudgetModal';
import EditBudgetModal from '../../components/budgets/EditBudgetModal';
import BudgetDetailsModal from '../../components/budgets/BudgetDetailsModal';
import AddExpenseModal from '../../components/budgets/AddExpenseModal';
import DeleteBudgetModal from '../../components/budgets/DeleteBudgetModal';
import SuccessNotification from '../../components/common/SuccessNotification';
import ErrorNotification from '../../components/common/ErrorNotification';

interface Budget {
  id: string;
  category: string;
  name: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  status: 'on-track' | 'over-budget' | 'under-budget';
  color: string;
  icon: string;
  description: string;
}

const BudgetsPage: React.FC = () => {
  const { t } = useTranslation();
  const { userStatus, isUnverified, isLoading: kycLoading, syncKycStatus } = useKycSync();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingBudget, setViewingBudget] = useState<Budget | null>(null);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [addingExpenseToBudget, setAddingExpenseToBudget] = useState<Budget | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

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

        // Charger les budgets depuis Firestore
        logger.debug('Chargement des budgets pour userId:', userId);
        const firebaseBudgets = await FirebaseDataService.getUserBudgets(userId);
        logger.debug('Budgets Firebase récupérés:', firebaseBudgets);
        
        const mappedBudgets: Budget[] = firebaseBudgets.map(budget => {
          // Déterminer le statut basé sur le pourcentage d'utilisation
          const percentage = (budget.spent / budget.amount) * 100;
          let status: 'on-track' | 'over-budget' | 'under-budget' = 'on-track';
          
          if (percentage > 100) {
            status = 'over-budget';
          } else if (percentage < 80) {
            status = 'under-budget';
          }
          
          // Déterminer la couleur et l'icône basées sur la catégorie
          const getBudgetStyle = (category: string) => {
            const lowerCategory = category.toLowerCase();
            if (lowerCategory.includes('alimentation') || lowerCategory.includes('food')) {
              return { color: 'bg-green-500', icon: '🛒' };
            } else if (lowerCategory.includes('transport')) {
              return { color: 'bg-blue-500', icon: '🚇' };
            } else if (lowerCategory.includes('loisirs') || lowerCategory.includes('entertainment')) {
              return { color: 'bg-purple-500', icon: '🎬' };
            } else if (lowerCategory.includes('logement') || lowerCategory.includes('housing')) {
              return { color: 'bg-orange-500', icon: '🏠' };
            } else if (lowerCategory.includes('santé') || lowerCategory.includes('health')) {
              return { color: 'bg-pink-500', icon: '💊' };
            } else {
              return { color: 'bg-gray-500', icon: '💰' };
            }
          };
          
          const style = getBudgetStyle(budget.category);
          
          // Gestion robuste des dates
          let startDate: Date;
          let endDate: Date;
          
          try {
            startDate = budget.startDate instanceof Date ? budget.startDate : new Date(budget.startDate);
            endDate = budget.endDate instanceof Date ? budget.endDate : new Date(budget.endDate);
            
            // Vérifier si les dates sont valides
            if (isNaN(startDate.getTime())) {
              startDate = new Date(); // Date par défaut
              logger.warn('Date de début invalide pour le budget:', budget.id, 'utilisation de la date actuelle');
            }
            if (isNaN(endDate.getTime())) {
              endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)); // +1 mois par défaut
              logger.warn('Date de fin invalide pour le budget:', budget.id, 'utilisation de la date +1 mois');
            }
          } catch (error) {
            logger.error('Erreur lors de la conversion des dates pour le budget:', budget.id, error);
            startDate = new Date();
            endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
          }
          
          return {
            id: budget.id,
            category: budget.category,
            name: budget.name,
            amount: budget.amount,
            spent: budget.spent,
            period: budget.period as 'monthly' | 'yearly',
            startDate: startDate,
            endDate: endDate,
            status: status,
            color: style.color,
            icon: style.icon,
            description: budget.description || ''
          };
        });
        
        logger.debug('Budgets mappés:', mappedBudgets);
        setBudgets(mappedBudgets);

      } catch (error) {
        logger.error('Erreur lors du chargement des budgets:', error);
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

  // Fonction pour recharger les budgets après création
  const handleBudgetCreated = () => {
    logger.debug('Budget créé, rechargement des budgets...');
    
    // Recharger les budgets sans changer l'état de loading global
    const reloadBudgets = async () => {
      try {
        const userId = FirebaseDataService.getCurrentUserId();
        
        if (!userId) {
          logger.error('Aucun utilisateur connecté');
          return;
        }

        logger.debug('Rechargement des budgets pour userId:', userId);
        const firebaseBudgets = await FirebaseDataService.getUserBudgets(userId);
        logger.debug('Budgets récupérés après création:', firebaseBudgets);
        
        const mappedBudgets: Budget[] = firebaseBudgets.map(budget => {
          // Déterminer le statut basé sur le pourcentage d'utilisation
          const percentage = (budget.spent / budget.amount) * 100;
          let status: 'on-track' | 'over-budget' | 'under-budget' = 'on-track';
          
          if (percentage > 100) {
            status = 'over-budget';
          } else if (percentage < 80) {
            status = 'under-budget';
          }
          
          // Déterminer la couleur et l'icône basées sur la catégorie
          const getBudgetStyle = (category: string) => {
            const lowerCategory = category.toLowerCase();
            if (lowerCategory.includes('alimentation') || lowerCategory.includes('food')) {
              return { color: 'bg-green-500', icon: '🛒' };
            } else if (lowerCategory.includes('transport')) {
              return { color: 'bg-blue-500', icon: '🚇' };
            } else if (lowerCategory.includes('loisirs') || lowerCategory.includes('entertainment')) {
              return { color: 'bg-purple-500', icon: '🎬' };
            } else if (lowerCategory.includes('logement') || lowerCategory.includes('housing')) {
              return { color: 'bg-orange-500', icon: '🏠' };
            } else if (lowerCategory.includes('santé') || lowerCategory.includes('health')) {
              return { color: 'bg-pink-500', icon: '💊' };
            } else {
              return { color: 'bg-gray-500', icon: '💰' };
            }
          };
          
          const style = getBudgetStyle(budget.category);
          
          // Gestion robuste des dates
          let startDate: Date;
          let endDate: Date;
          
          try {
            startDate = budget.startDate instanceof Date ? budget.startDate : new Date(budget.startDate);
            endDate = budget.endDate instanceof Date ? budget.endDate : new Date(budget.endDate);
            
            // Vérifier si les dates sont valides
            if (isNaN(startDate.getTime())) {
              startDate = new Date(); // Date par défaut
              logger.warn('Date de début invalide pour le budget:', budget.id, 'utilisation de la date actuelle');
            }
            if (isNaN(endDate.getTime())) {
              endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)); // +1 mois par défaut
              logger.warn('Date de fin invalide pour le budget:', budget.id, 'utilisation de la date +1 mois');
            }
          } catch (error) {
            logger.error('Erreur lors de la conversion des dates pour le budget:', budget.id, error);
            startDate = new Date();
            endDate = new Date(new Date().setMonth(new Date().getMonth() + 1));
          }
          
          return {
            id: budget.id,
            category: budget.category,
            name: budget.name,
            amount: budget.amount,
            spent: budget.spent,
            period: budget.period as 'monthly' | 'yearly',
            startDate: startDate,
            endDate: endDate,
            status: status,
            color: style.color,
            icon: style.icon,
            description: budget.description || ''
          };
        });
        
        logger.debug('Budgets mappés après création:', mappedBudgets);
        setBudgets(mappedBudgets);
        logger.success('Budgets rechargés avec succès après création');
        
      } catch (error) {
        logger.error('Erreur lors du rechargement des budgets:', error);
      }
    };

    reloadBudgets();
  };



  // Fonction pour éditer un budget
  const handleEditBudget = (budget: Budget) => {
    logger.debug('Édition du budget:', budget.id);
    setEditingBudget(budget);
    setIsEditModalOpen(true);
  };

  // Fonction pour afficher les détails d'un budget
  const handleViewDetails = (budget: Budget) => {
    logger.debug('Affichage des détails du budget:', budget.id);
    setViewingBudget(budget);
    setIsDetailsModalOpen(true);
  };

  // Fonction pour ajouter une dépense à un budget
  const handleAddExpense = (budget: Budget) => {
    logger.debug('Ajout de dépense au budget:', budget.id);
    setAddingExpenseToBudget(budget);
    setIsAddExpenseModalOpen(true);
  };

  // Fonction pour ouvrir le modal de suppression
  const handleDeleteBudget = (budget: Budget) => {
    setDeletingBudget(budget);
    setIsDeleteModalOpen(true);
  };

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!deletingBudget) return;
    
    try {
      logger.debug('Suppression du budget:', deletingBudget.id);
      const userId = FirebaseDataService.getCurrentUserId();
      
      if (!userId) {
        setErrorMessage(t('budgets.messages.noUser') || '❌ Aucun utilisateur connecté');
        setShowError(true);
        return;
      }

      // Suppression réelle dans Firestore
      await FirebaseDataService.deleteUserBudget(userId, deletingBudget.id);
      
      setSuccessMessage((t('budgets.messages.deleteSuccess', { budgetName: deletingBudget.name }) as string) || (t('budgets.messages.fallbackDeleteSuccess', { budgetName: deletingBudget.name }) as string));
      setShowSuccess(true);
      
      // Recharger les budgets
      handleBudgetCreated();
      
      // Fermer le modal
      setIsDeleteModalOpen(false);
      setDeletingBudget(null);
      
    } catch (error) {
      logger.error('Erreur lors de la suppression du budget:', error);
      setErrorMessage((t('budgets.messages.deleteError', { error: error instanceof Error ? error.message : 'Erreur inconnue' }) as string) || (t('budgets.messages.fallbackDeleteError', { error: error instanceof Error ? error.message : 'Erreur inconnue' }) as string));
      setShowError(true);
    }
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const remainingBudget = totalBudget - totalSpent;
  const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'over-budget':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'under-budget':
        return <TrendingDown className="w-4 h-4 text-blue-600" />;
      default:
        return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-track':
        return t('budgets.status.onTrack');
      case 'over-budget':
        return t('budgets.status.overBudget');
      case 'under-budget':
        return t('budgets.status.underBudget');
      default:
        return t('budgets.status.unknown');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600 bg-green-100';
      case 'over-budget':
        return 'text-red-600 bg-red-100';
      case 'under-budget':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (date: Date) => {
    // Vérifier si la date est valide
    if (!date || isNaN(date.getTime())) {
      return t('common.invalidDate') || 'Date invalide';
    }
    
    try {
      return date.toLocaleDateString(t('common.locale') || 'fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      logger.error('Erreur formatage date:', error);
      return 'Date invalide';
    }
  };

  // Afficher un indicateur de chargement pendant le chargement des données ou la synchronisation KYC
  if (loading || kycLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? t('budgets.loading.budgets') || 'Chargement de vos budgets...' : t('budgets.loading.status') || 'Vérification de votre statut...'}
          </p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas vérifié, afficher un état vierge
  if (isUnverified) {
    return (
      <div className="max-w-6xl mx-auto">
        <VerificationState userStatus={userStatus} showFeatures={true} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('budgets.title')}</h1>
          <p className="text-gray-600 text-lg">{t('budgets.subtitle')}</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t('budgets.create.title')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-8 mb-10 md:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">{t('budgets.summary.totalBudget')}</p>
              <p className="text-3xl font-bold">
                {totalBudget.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">{t('budgets.summary.spent')}</p>
              <p className="text-3xl font-bold">
                {totalSpent.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">{t('budgets.summary.remaining')}</p>
              <p className="text-3xl font-bold">
                {remainingBudget.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">{t('budgets.summary.usage')}</p>
              <p className="text-3xl font-bold">
                {spendingPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {Math.round(spendingPercentage)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-10">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Target className="w-4 h-4 text-white" />
          </div>
          {t('budgets.progress.title')}
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-700">{t('budgets.progress.budgetUsage')}</span>
            <span className="text-2xl font-bold text-gray-900">
              {spendingPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-4 rounded-full transition-all duration-500 shadow-sm ${
                spendingPercentage >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                spendingPercentage >= 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                'bg-gradient-to-r from-green-500 to-emerald-500'
              }`}
              style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 font-medium">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Add Budget Button */}
      <div className="mb-8 text-center">
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-lg font-semibold"
        >
          <Plus className="w-6 h-6 mr-3" />
          {t('budgets.actions.createNew')}
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.amount) * 100;
          const remaining = budget.amount - budget.spent;
          
          return (
            <div key={budget.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              {/* Budget Header avec design amélioré */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-2xl ${budget.color} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {budget.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{budget.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{budget.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(budget.status)}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(budget.status)} shadow-sm`}>
                    {getStatusText(budget.status)}
                  </span>
                </div>
              </div>

              {/* Budget Progress avec design amélioré */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{t('budgets.details.progression')}</span>
                  <span className="text-lg font-bold text-gray-900">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                      percentage >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                      percentage >= 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                      'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Budget Details avec design amélioré */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('budgets.details.budgetTotal')}</span>
                  <span className="text-lg font-bold text-gray-900">
                    {budget.amount.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('budgets.details.spent')}</span>
                  <span className="text-lg font-bold text-red-600">
                    {budget.spent.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">{t('budgets.details.remaining')}</span>
                  <span className={`text-lg font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {remaining.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>
              </div>

              {/* Period avec design amélioré */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">
                    {budget.period === 'monthly' ? t('budgets.details.monthly') : t('budgets.details.yearly')}
                  </span>
                  <span className="text-sm text-blue-600 font-medium">
                    {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                  </span>
                </div>
              </div>

              {/* Actions avec design amélioré */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleEditBudget(budget)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    {t('budgets.actions.edit')}
                  </button>
                  <button 
                    onClick={() => handleViewDetails(budget)}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-4 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    {t('budgets.actions.details')}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleAddExpense(budget)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    {t('budgets.actions.addExpense')}
                  </button>
                  <button 
                    onClick={() => handleDeleteBudget(budget)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105"
                  >
                    {t('budgets.actions.delete')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
            <Target className="w-5 h-5 text-white" />
          </div>
          {t('budgets.tips.title')}
        </h3>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
            <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm">📋</span>
              </div>
              {t('budgets.tips.planning.title')}
            </h4>
            <ul className="text-gray-700 space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{t('budgets.tips.planning.tip1')}</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{t('budgets.tips.planning.tip2')}</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{t('budgets.tips.planning.tip3')}</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{t('budgets.tips.planning.tip4')}</span>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 hover:shadow-lg transition-shadow">
            <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
              <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-indigo-600 text-sm">⚡</span>
              </div>
              {t('budgets.tips.optimization.title')}
            </h4>
            <ul className="text-gray-700 space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{t('budgets.tips.optimization.tip1')}</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{t('budgets.tips.optimization.tip2')}</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{t('budgets.tips.optimization.tip3')}</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{t('budgets.tips.optimization.tip4')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de création de budget */}
      <CreateBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBudgetCreated={handleBudgetCreated}
      />

      {/* Modal d'édition de budget */}
      <EditBudgetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        budget={editingBudget}
        onBudgetUpdated={handleBudgetCreated}
      />

      {/* Modal de détails du budget */}
      <BudgetDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        budget={viewingBudget}
      />

      {/* Modal d'ajout de dépense */}
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onClose={() => setIsAddExpenseModalOpen(false)}
        budget={addingExpenseToBudget}
        onExpenseAdded={handleBudgetCreated}
      />

      {/* Modal de suppression de budget */}
      <DeleteBudgetModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingBudget(null);
        }}
        onConfirm={handleConfirmDelete}
        budgetName={deletingBudget?.name || ''}
        loading={false}
      />

      {/* Notifications */}
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
      <ErrorNotification
        message={errorMessage}
        isVisible={showError}
        onClose={() => setShowError(false)}
      />
    </div>
  );
};

export default BudgetsPage; 