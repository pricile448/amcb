import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Target, Euro, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface BudgetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: {
    id: string;
    name: string;
    category: string;
    amount: number;
    spent: number;
    period: 'monthly' | 'yearly';
    startDate: Date;
    endDate: Date;
    status: 'on-track' | 'over-budget' | 'under-budget';
    description?: string;
  } | null;
}

const BudgetDetailsModal: React.FC<BudgetDetailsModalProps> = ({
  isOpen,
  onClose,
  budget
}) => {
  const { t } = useTranslation();

  if (!isOpen || !budget) return null;

  const percentage = (budget.spent / budget.amount) * 100;
  const remaining = budget.amount - budget.spent;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'over-budget':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'under-budget':
        return <TrendingDown className="w-5 h-5 text-blue-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-track':
        return t('budgets.status.onTrack') || 'Dans les limites';
      case 'over-budget':
        return t('budgets.status.overBudget') || 'Dépassé';
      case 'under-budget':
        return t('budgets.status.underBudget') || 'Sous le budget';
      default:
        return t('budgets.status.unknown') || 'Inconnu';
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
    if (!date || isNaN(date.getTime())) {
      return t('common.invalidDate');
    }
    
    try {
      return date.toLocaleDateString(t('common.locale') || 'fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return t('common.invalidDate');
    }
  };

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('alimentation') || lowerCategory.includes('food')) {
      return '🛒';
    } else if (lowerCategory.includes('transport')) {
      return '🚇';
    } else if (lowerCategory.includes('loisirs') || lowerCategory.includes('entertainment')) {
      return '🎬';
    } else if (lowerCategory.includes('logement') || lowerCategory.includes('housing')) {
      return '🏠';
    } else if (lowerCategory.includes('santé') || lowerCategory.includes('health')) {
      return '💊';
    } else if (lowerCategory.includes('vetements') || lowerCategory.includes('clothing')) {
      return '👕';
    } else if (lowerCategory.includes('education')) {
      return '📚';
    } else {
      return '💰';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl">
                {getCategoryIcon(budget.category)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{budget.name}</h2>
                <p className="text-blue-100 capitalize">{budget.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getStatusColor(budget.status)}`}>
              {getStatusIcon(budget.status)}
              <span className="font-medium">{getStatusText(budget.status)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{t('budgets.details.progression')}</span>
              <span className="text-sm font-bold text-gray-900">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{t('budgets.details.percentageMarkers.zero')}</span>
              <span>{t('budgets.details.percentageMarkers.fifty')}</span>
              <span>{t('budgets.details.percentageMarkers.hundred')}</span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {budget.amount.toLocaleString('fr-FR')}€
              </div>
              <div className="text-xs text-blue-600 font-medium">{t('budgets.expense.details.budget')}</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {budget.spent.toLocaleString('fr-FR')}€
              </div>
              <div className="text-xs text-red-600 font-medium">{t('budgets.expense.details.spent')}</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {remaining.toLocaleString('fr-FR')}€
              </div>
              <div className="text-xs text-green-600 font-medium">{t('budgets.expense.details.remaining')}</div>
            </div>
          </div>

          {/* Period Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">{t('budgets.expense.details.period')}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{t('budgets.expense.details.type')}:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {budget.period === 'monthly' ? t('budgets.expense.details.monthly') : t('budgets.expense.details.yearly')}
                </span>
              </div>
              <div>
                <span className="text-gray-500">{t('budgets.expense.details.start')}:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatDate(budget.startDate)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">{t('budgets.expense.details.end')}:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatDate(budget.endDate)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">{t('budgets.expense.details.duration')}:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {budget.period === 'monthly' ? t('budgets.expense.details.oneMonth') : t('budgets.expense.details.oneYear')}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {budget.description && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">{t('budgets.expense.details.description')}</span>
              </div>
              <p className="text-sm text-blue-800">{budget.description}</p>
            </div>
          )}

          {/* Insights */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-3">{t('budgets.expense.details.insights')}</h4>
            <div className="space-y-2 text-sm text-purple-800">
              {percentage > 100 ? (
                <p>{t('budgets.expense.details.budgetExceeded', { percentage: (percentage - 100).toFixed(1) })}</p>
              ) : percentage > 80 ? (
                <p>{t('budgets.expense.details.budgetWarning', { percentage: percentage.toFixed(1) })}</p>
              ) : percentage > 50 ? (
                <p>{t('budgets.expense.details.budgetHalfway', { percentage: percentage.toFixed(1) })}</p>
              ) : (
                <p>{t('budgets.expense.details.budgetExcellent', { percentage: percentage.toFixed(1) })}</p>
              )}
              
              {budget.period === 'monthly' && (
                <p>{t('budgets.expense.details.monthlyBudgetValid', { date: formatDate(budget.endDate) })}</p>
              )}
              
              {remaining > 0 && (
                <p>{t('budgets.expense.details.budgetRemaining', { amount: remaining.toLocaleString('fr-FR') })}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t('budgets.details.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetailsModal;
