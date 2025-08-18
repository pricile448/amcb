import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Plus, Euro, Calendar, FileText, TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import { FirebaseDataService } from '../../services/firebaseData';
import { logger } from '../../utils/logger';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded: () => void;
  budget: {
    id: string;
    name: string;
    amount: number;
    spent: number;
  } | null;
}

interface ExpenseFormData {
  amount: number;
  date: string;
  description: string;
  category: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseAdded,
  budget
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addError, setAddError] = useState<string>('');

  // Fonction pour formater l'affichage du montant
  const formatAmountDisplay = (amount: number): string => {
    if (amount === 0) return '';
    return amount.toLocaleString('fr-FR');
  };

  const categories = [
    { value: 'general', label: t('budgets.expense.categories.general'), icon: '💰', color: 'bg-gray-500' },
    { value: 'food', label: t('budgets.expense.categories.food'), icon: '🍽️', color: 'bg-green-500' },
    { value: 'transport', label: t('budgets.expense.categories.transport'), icon: '🚇', color: 'bg-blue-500' },
    { value: 'entertainment', label: t('budgets.expense.categories.entertainment'), icon: '🎬', color: 'bg-purple-500' },
    { value: 'shopping', label: t('budgets.expense.categories.shopping'), icon: '🛍️', color: 'bg-pink-500' },
    { value: 'health', label: t('budgets.expense.categories.health'), icon: '💊', color: 'bg-red-500' },
    { value: 'bills', label: t('budgets.expense.categories.bills'), icon: '📄', color: 'bg-orange-500' },
    { value: 'other', label: t('budgets.expense.categories.other'), icon: '📝', color: 'bg-indigo-500' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = t('budgets.expense.errors.amountRequired');
    }

    if (formData.amount > 999999) {
      newErrors.amount = t('budgets.expense.errors.amountTooHigh');
    }

    if (!formData.date) {
      newErrors.date = t('budgets.expense.errors.dateRequired');
    }

    if (!formData.description.trim()) {
      newErrors.description = t('budgets.expense.errors.descriptionRequired');
    }

    if (formData.description.trim().length > 200) {
      newErrors.description = t('budgets.expense.errors.descriptionTooLong');
    }

    // Vérifier que la dépense ne dépasse pas le budget restant
    if (budget) {
      const remaining = budget.amount - budget.spent;
      if (formData.amount > remaining) {
        newErrors.amount = t('budgets.expense.errors.exceedsBudget', { remaining: remaining.toLocaleString('fr-FR') });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!budget) return;
    
    logger.debug('Ajout de dépense pour le budget:', budget.id);
    
    // Réinitialiser les erreurs
    setAddError('');
    
    if (!validateForm()) {
      logger.debug('Validation du formulaire échouée');
      return;
    }

    try {
      setLoading(true);
      logger.debug('Début de l\'ajout de dépense...');
      
      const userId = FirebaseDataService.getCurrentUserId();
      
      if (!userId) {
        const errorMsg = t('common.noUser') || 'Aucun utilisateur connecté';
        logger.error(errorMsg);
        setAddError(errorMsg);
        return;
      }

      logger.debug('UserId récupéré:', userId);

      // Créer l'objet dépense
      const expenseData = {
        id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        budgetId: budget.id,
        amount: formData.amount,
        date: new Date(formData.date),
        description: formData.description.trim(),
        category: formData.category,
        createdAt: new Date()
      };

      logger.debug('Données de la dépense:', expenseData);

      // TODO: Implémenter l'ajout de dépense dans Firestore
      // await FirebaseDataService.addExpenseToBudget(userId, budget.id, expenseData);
      
      // Pour l'instant, simuler l'ajout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.success('Dépense ajoutée avec succès:', expenseData);
      
      logger.debug('Appel de onExpenseAdded...');
      onExpenseAdded();
      
      logger.debug('Fermeture du modal...');
      onClose();

      // Réinitialiser le formulaire
      setFormData({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: 'general'
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'ajout de la dépense';
      logger.error('Erreur lors de l\'ajout de la dépense:', error);
      setAddError(errorMsg);
    } finally {
      logger.debug('Fin de handleSubmit, loading mis à false');
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen || !budget) return null;

  const remaining = budget.amount - budget.spent;
  const percentage = (budget.spent / budget.amount) * 100;
  const selectedCategory = categories.find(cat => cat.value === formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header avec gradient et icônes */}
        <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white p-8 rounded-t-2xl relative overflow-hidden">
          {/* Éléments décoratifs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
                             <div>
                 <h2 className="text-2xl font-bold">{t('budgets.expense.title')}</h2>
                 <p className="text-emerald-100 text-lg">{t('budgets.expense.budgetFor', { budgetName: budget.name })}</p>
               </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-100 transition-all duration-200 p-3 hover:bg-white hover:bg-opacity-20 rounded-xl hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Budget Summary avec design amélioré */}
        <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                {budget.amount.toLocaleString('fr-FR')}€
              </div>
                             <div className="text-xs text-gray-600 font-medium">{t('budgets.expense.summary.totalBudget')}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-xl font-bold text-red-600">
                {budget.spent.toLocaleString('fr-FR')}€
              </div>
                             <div className="text-xs text-gray-600 font-medium">{t('budgets.expense.summary.spent')}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${remaining >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className={`w-6 h-6 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {remaining >= 0 ? '💰' : '⚠️'}
                </div>
              </div>
              <div className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {remaining.toLocaleString('fr-FR')}€
              </div>
                             <div className="text-xs text-gray-600 font-medium">{t('budgets.expense.summary.remaining')}</div>
            </div>
          </div>
          
          {/* Progress Bar améliorée */}
          <div className="mt-6">
                         <div className="flex justify-between text-sm text-gray-600 mb-3">
               <span className="font-medium">{t('budgets.expense.summary.usage')}</span>
               <span className="font-bold">{percentage.toFixed(1)}%</span>
             </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  percentage >= 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                  percentage >= 75 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                  'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Form avec design amélioré */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Montant avec design spécial */}
          <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-3">
               <div className="flex items-center space-x-2">
                 <Euro className="w-5 h-5 text-emerald-600" />
                 <span>{t('budgets.expense.fields.amount')} *</span>
               </div>
             </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-focus-within:bg-emerald-200 transition-colors">
                  <Euro className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={formatAmountDisplay(formData.amount)}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  const numValue = value === '' ? 0 : parseInt(value, 10);
                  handleInputChange('amount', numValue);
                }}
                className={`w-full pl-16 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-200 ${
                  errors.amount ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="0"
              />
            </div>
                         <p className="mt-2 text-xs text-gray-500 flex items-center">
               <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
               {t('budgets.expense.amountHelper')}
             </p>
            {errors.amount && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Date avec design amélioré */}
          <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-3">
               <div className="flex items-center space-x-2">
                 <Calendar className="w-5 h-5 text-blue-600" />
                 <span>{t('budgets.expense.fields.date')} *</span>
               </div>
             </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-focus-within:bg-blue-200 transition-colors">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-300 transition-all duration-200"
              />
            </div>
            {errors.date && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Catégorie avec design amélioré */}
          <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-3">
               <div className="flex items-center space-x-2">
                 <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-400 rounded"></div>
                 <span>{t('budgets.expense.fields.category')}</span>
               </div>
             </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleInputChange('category', category.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                    formData.category === category.value
                      ? 'border-emerald-500 bg-emerald-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                      {category.icon}
                    </div>
                    <span className="font-medium text-gray-700">{category.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description avec design amélioré */}
          <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-3">
               <div className="flex items-center space-x-2">
                 <FileText className="w-5 h-5 text-indigo-600" />
                 <span>{t('budgets.expense.fields.description')} *</span>
               </div>
             </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-focus-within:bg-indigo-200 transition-colors">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full pl-16 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 hover:border-gray-300 transition-all duration-200 resize-none"
                                 placeholder={t('budgets.expense.placeholders.description') || 'Décrivez cette dépense...'}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
                             <p className="text-xs text-gray-500 flex items-center">
                 <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
                 {t('budgets.expense.descriptionHelper', { current: formData.description.length })}
               </p>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    formData.description.length > 150 ? 'bg-red-500' : 
                    formData.description.length > 100 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(formData.description.length / 200) * 100}%` }}
                ></div>
              </div>
            </div>
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Erreur d'ajout avec design amélioré */}
          {addError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm text-red-600 font-medium">{addError}</p>
              </div>
            </div>
          )}

          {/* Actions avec design amélioré */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                         <button
               type="button"
               onClick={onClose}
               className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium hover:scale-105"
             >
               {t('budgets.expense.actions.cancel')}
             </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium hover:scale-105 shadow-lg hover:shadow-xl"
            >
                             {loading ? (
                 <div className="flex items-center justify-center space-x-2">
                   <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                   <span>{t('budgets.expense.actions.adding')}</span>
                 </div>
               ) : (
                 <div className="flex items-center justify-center space-x-2">
                   <Plus className="w-5 h-5" />
                   <span>{t('budgets.expense.actions.add')}</span>
                 </div>
               )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
