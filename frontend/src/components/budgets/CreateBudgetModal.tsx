import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, Calendar, Target, Euro } from 'lucide-react';
import { FirebaseDataService } from '../../services/firebaseData';
import { logger } from '../../utils/logger';

interface CreateBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetCreated: () => void;
}

interface BudgetFormData {
  name: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  description: string;
}

const CreateBudgetModal: React.FC<CreateBudgetModalProps> = ({
  isOpen,
  onClose,
  onBudgetCreated
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    category: '',
    amount: 0,
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creationError, setCreationError] = useState<string>('');

  // Fonction pour formater l'affichage du montant
  const formatAmountDisplay = (amount: number): string => {
    if (amount === 0) return '';
    return amount.toLocaleString('fr-FR');
  };

  const categories = [
    { value: 'alimentation', label: t('budgets.create.categories.alimentation'), icon: '🛒' },
    { value: 'transport', label: t('budgets.create.categories.transport'), icon: '🚇' },
    { value: 'logement', label: t('budgets.create.categories.logement'), icon: '🏠' },
    { value: 'loisirs', label: t('budgets.create.categories.loisirs'), icon: '🎬' },
    { value: 'sante', label: t('budgets.create.categories.sante'), icon: '💊' },
    { value: 'vetements', label: t('budgets.create.categories.vetements'), icon: '👕' },
    { value: 'education', label: t('budgets.create.categories.education'), icon: '📚' },
    { value: 'autres', label: t('budgets.create.categories.autres'), icon: '💰' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('budgets.create.errors.nameRequired') || 'Le nom du budget est requis';
    }

    if (!formData.category) {
      newErrors.category = t('budgets.create.errors.categoryRequired') || 'La catégorie est requise';
    }

    if (formData.amount <= 0) {
      newErrors.amount = t('budgets.create.errors.amountRequired') || 'Le montant doit être supérieur à 0';
    }

    if (formData.amount > 999999) {
      newErrors.amount = t('budgets.expense.errors.amountTooHigh');
    }

    if (!formData.startDate) {
      newErrors.startDate = t('budgets.create.errors.startDateRequired') || 'La date de début est requise';
    }

    if (!formData.endDate) {
      newErrors.endDate = t('budgets.create.errors.endDateRequired') || 'La date de fin est requise';
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = t('budgets.create.errors.endDateAfterStart') || 'La date de fin doit être après la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.debug('Soumission du formulaire de budget...');
    
    // Réinitialiser les erreurs
    setCreationError('');
    
    if (!validateForm()) {
      logger.debug('Validation du formulaire échouée');
      return;
    }

    try {
      setLoading(true);
      logger.debug('Début de la création du budget...');
      
      const userId = FirebaseDataService.getCurrentUserId();
      
      if (!userId) {
        const errorMsg = 'Aucun utilisateur connecté';
        logger.error(errorMsg);
        setCreationError(errorMsg);
        return;
      }

      logger.debug('UserId récupéré:', userId);

      const budgetData = {
        name: formData.name.trim(),
        category: formData.category,
        amount: formData.amount,
        period: formData.period,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        description: formData.description.trim(),
        spent: 0,
        status: 'on-track' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.debug('Données du budget à créer:', budgetData);

      const result = await FirebaseDataService.createUserBudget(userId, budgetData);
      
      if (!result) {
        const errorMsg = 'Échec de la création du budget. Veuillez réessayer.';
        logger.error(errorMsg);
        setCreationError(errorMsg);
        return;
      }
      
      logger.success('Budget créé avec succès:', result);
      
      logger.debug('Appel de onBudgetCreated...');
      onBudgetCreated();
      
      logger.debug('Fermeture du modal...');
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        amount: 0,
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        description: ''
      });
      setErrors({});
      
      logger.debug('Formulaire réinitialisé');

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue lors de la création du budget';
      logger.error('Erreur lors de la création du budget:', error);
      setCreationError(errorMsg);
    } finally {
      logger.debug('Fin de handleSubmit, loading mis à false');
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BudgetFormData, value: string | number) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[95vh] overflow-y-auto mx-2">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            {t('budgets.create.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Nom du budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('budgets.create.fields.name')} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('budgets.create.placeholders.name') || 'Ex: Budget alimentation'}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('budgets.create.fields.category')} *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">{t('budgets.create.placeholders.selectCategory')}</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.icon} {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Montant */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('budgets.create.fields.amount')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Euro className="h-5 w-5 text-gray-400" />
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
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
            </div>
                         <p className="mt-1 text-xs text-gray-500">
               {t('budgets.create.amountHelper')}
             </p>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('budgets.create.fields.period')} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <label className="flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="period"
                  value="monthly"
                  checked={formData.period === 'monthly'}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm sm:text-base">{t('budgets.create.periods.monthly')}</span>
              </label>
              <label className="flex items-center p-2 sm:p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="period"
                  value="yearly"
                  checked={formData.period === 'yearly'}
                  onChange={(e) => handleInputChange('period', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm sm:text-base">{t('budgets.create.periods.yearly')}</span>
              </label>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('budgets.create.fields.startDate')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('budgets.create.fields.endDate')} *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('budgets.create.fields.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('budgets.create.placeholders.description') || 'Description optionnelle du budget'}
            />
          </div>

          {/* Erreur de création */}
          {creationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{creationError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              {t('budgets.create.actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t('budgets.create.actions.create')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBudgetModal;
