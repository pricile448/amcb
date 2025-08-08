import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, Shield, Lock } from 'lucide-react';
import { FirebaseDataService, FirebaseBudget } from '../../services/firebaseData';
import { useKycSync } from '../../hooks/useNotifications';
import { logger } from '../../utils/logger';

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
}

const BudgetsPage: React.FC = () => {
  const { t } = useTranslation();
  const { userStatus, isUnverified, isLoading: kycLoading, syncKycStatus } = useKycSync();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

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
          
          return {
            id: budget.id,
            category: budget.category,
            name: budget.name,
            amount: budget.amount,
            spent: budget.spent,
            period: budget.period as 'monthly' | 'yearly',
            startDate: new Date(budget.startDate),
            endDate: new Date(budget.endDate),
            status: status,
            color: style.color,
            icon: style.icon
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
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Afficher un indicateur de chargement pendant le chargement des données ou la synchronisation KYC
  if (loading || kycLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Chargement de vos budgets...' : 'Vérification de votre statut...'}
          </p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas vérifié, afficher un état vierge
  if (isUnverified) {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600">Suivez vos dépenses et respectez vos budgets</p>
        </div>

        {/* État vierge pour utilisateurs non vérifiés */}
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {userStatus === 'unverified' 
                ? 'Vérification d\'identité requise' 
                : 'Vérification en cours'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {userStatus === 'unverified'
                ? 'Pour créer et gérer vos budgets, vous devez d\'abord valider votre identité.'
                : 'Votre compte est en cours de vérification. Vous pourrez créer des budgets une fois validé.'
              }
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Compte sécurisé</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Target className="w-4 h-4" />
                <span>Budgets personnalisés</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('budgets.title')}</h1>
        <p className="text-gray-600">{t('budgets.subtitle')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('budgets.summary.totalBudget')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalBudget.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
            <Target className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('budgets.summary.spent')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalSpent.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('budgets.summary.remaining')}</p>
              <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {remainingBudget.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('budgets.summary.usage')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {spendingPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-600">
                {Math.round(spendingPercentage)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('budgets.progress.title')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{t('budgets.progress.budgetUsage')}</span>
            <span className="text-sm font-medium text-gray-900">
              {spendingPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(spendingPercentage)}`}
              style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Add Budget Button */}
      <div className="mb-6">
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          {t('budgets.actions.createNew')}
        </button>
      </div>

      {/* Budgets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.amount) * 100;
          const remaining = budget.amount - budget.spent;
          
          return (
            <div key={budget.id} className="bg-white rounded-lg shadow-sm border p-6">
              {/* Budget Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full ${budget.color} flex items-center justify-center text-white text-lg`}>
                    {budget.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                    <p className="text-sm text-gray-500">{budget.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(budget.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status)}`}>
                    {getStatusText(budget.status)}
                  </span>
                </div>
              </div>

              {/* Budget Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{t('budgets.card.progression')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(percentage)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Budget Details */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t('budgets.card.budget')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {budget.amount.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t('budgets.card.spent')}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {budget.spent.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">{t('budgets.card.remaining')}</span>
                  <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {remaining.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    })}
                  </span>
                </div>
              </div>

              {/* Period */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {budget.period === 'monthly' ? t('budgets.card.monthly') : t('budgets.card.yearly')}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                    {t('budgets.actions.edit')}
                  </button>
                  <button className="bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                    {t('budgets.actions.details')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('budgets.tips.title')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('budgets.tips.planning.title')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('budgets.tips.planning.tip1')}</li>
              <li>• {t('budgets.tips.planning.tip2')}</li>
              <li>• {t('budgets.tips.planning.tip3')}</li>
              <li>• {t('budgets.tips.planning.tip4')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('budgets.tips.optimization.title')}</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {t('budgets.tips.optimization.tip1')}</li>
              <li>• {t('budgets.tips.optimization.tip2')}</li>
              <li>• {t('budgets.tips.optimization.tip3')}</li>
              <li>• {t('budgets.tips.optimization.tip4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetsPage; 