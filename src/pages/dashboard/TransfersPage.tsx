import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Send, 
  UserPlus, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Users, 
  CreditCard, 
  Building,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Star,
  Shield
} from "lucide-react";
import { FirebaseDataService, FirebaseBeneficiary } from '../../services/firebaseData';
import { parseFirestoreDate } from '../../utils/dateUtils';
import { useNotifications, useKycSync } from '../../hooks/useNotifications';
import NotificationContainer from '../../components/NotificationContainer';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import VerificationState from '../../components/VerificationState';

interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bic: string;
  bank: string;
  isFavorite: boolean;
  lastUsed?: Date;
}

interface Transfer {
  id: string;
  type: 'internal' | 'external' | 'scheduled';
  fromAccount: string;
  toAccount: string;
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'scheduled';
  date: Date;
  scheduledDate?: Date;
  beneficiaryName?: string; // Add beneficiary name field
  category?: string; // Add category field
}

const TransfersPage: React.FC = () => {
  const { t } = useTranslation();
  const { syncKycStatus } = useKycSync();
  const [activeTab, setActiveTab] = useState<'new' | 'beneficiaries' | 'scheduled' | 'history'>('new');
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [showEditBeneficiary, setShowEditBeneficiary] = useState(false);
  const [transferType, setTransferType] = useState<'internal' | 'external' | 'scheduled'>('internal');
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [userStatus, setUserStatus] = useState<string>('pending');
  const [isUnverified, setIsUnverified] = useState(false);
  
  // États pour les formulaires
  const [formData, setFormData] = useState({
    beneficiaryName: '',
    beneficiaryIban: '',
    beneficiaryBic: '',
    beneficiaryBank: '',
    isFavorite: false,
    fromAccount: '',
    toAccount: '',
    amount: '',
    description: '',
    scheduledDate: ''
  });
  
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [pendingTransferData, setPendingTransferData] = useState<any>(null);


  // Charger les données Firebase au montage du composant
  useEffect(() => {
    const loadFirebaseData = async () => {
      try {
        setLoading(true);
        const userId = FirebaseDataService.getCurrentUserId();
        
        if (!userId) {
          console.error('Aucun utilisateur connecté');
          return;
        }

        // Synchroniser le statut KYC avant de vérifier
        await syncKycStatus();

        // Récupérer le statut de l'utilisateur
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setUserStatus(user.verificationStatus || 'pending');
            setIsUnverified(user.verificationStatus !== 'verified');
          } catch (error) {
            console.error('Erreur parsing user:', error);
            setUserStatus('pending');
            setIsUnverified(true);
          }
        } else {
          setUserStatus('pending');
          setIsUnverified(true);
        }

        // Charger les virements
        const firebaseTransfers = await FirebaseDataService.getUserTransfers(userId);
        console.log('🔍 Virements reçus dans TransfersPage:', firebaseTransfers);
        
        const mappedTransfers: Transfer[] = firebaseTransfers.map(trans => {
          // Utiliser parseFirestoreDate pour une conversion sécurisée
          const transferDate = parseFirestoreDate(trans.date);

          // Déterminer le type de virement basé sur la catégorie
          let transferType: 'internal' | 'external' | 'scheduled' = 'external';
          if (trans.category === 'Virement interne') {
            transferType = 'internal';
          } else if (trans.status === 'scheduled') {
            transferType = 'scheduled';
          }

          return {
            id: trans.id,
            type: transferType,
            fromAccount: trans.fromAccountId,
            toAccount: trans.toAccountId,
            amount: trans.amount,
            description: trans.description,
            status: trans.status as 'pending' | 'completed' | 'failed' | 'scheduled',
            date: transferDate,
            beneficiaryName: trans.beneficiaryName,
            category: trans.category
          };
        });
        setTransfers(mappedTransfers);

        // Récupérer les vrais bénéficiaires de Firestore
        const firebaseBeneficiaries = await FirebaseDataService.getUserBeneficiaries(userId);
        console.log('🔍 Bénéficiaires reçus dans TransfersPage:', firebaseBeneficiaries);
        
        const mappedBeneficiaries: Beneficiary[] = firebaseBeneficiaries.map(ben => {
          // Utiliser parseFirestoreDate pour une conversion sécurisée
          const lastUsedDate = parseFirestoreDate(ben.lastUsed);

          return {
            id: ben.id,
            name: ben.name,
            iban: ben.iban,
            bic: ben.bic,
            bank: ben.bankName,
            isFavorite: ben.isFavorite,
            lastUsed: lastUsedDate
          };
        });
        setBeneficiaries(mappedBeneficiaries);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseData();
  }, [syncKycStatus]);

  const [accounts, setAccounts] = useState<any[]>([]);

  // Charger les comptes depuis Firebase
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const userId = FirebaseDataService.getCurrentUserId();
        if (userId) {
          const firebaseAccounts = await FirebaseDataService.getUserAccounts(userId);
          console.log('🔍 Comptes reçus dans TransfersPage:', firebaseAccounts);
          
                               const mappedAccounts = firebaseAccounts.map(account => ({
            id: account.id,
            name: account.name || (account.name === 'checking' ? 'Compte Courant' : 
                                 account.name === 'savings' ? 'Compte Épargne' : 
                                 account.name === 'credit' ? 'Carte de Crédit' : 'Compte'),
            balance: Math.abs(account.balance || 0), // Utiliser la valeur absolue pour l'affichage
            type: account.name || 'checking',
            displayName: account.name === 'checking' ? 'Compte Courant' : 
                        account.name === 'savings' ? 'Compte Épargne' : 
                        account.name === 'credit' ? 'Carte de Crédit' : 'Compte'
          }));
          setAccounts(mappedAccounts);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des comptes:', error);
        // Fallback avec des comptes par défaut
                 setAccounts([
           { id: 'checking-1', name: 'Compte Courant', balance: 0, type: 'checking', displayName: 'Compte Courant' },
           { id: 'savings-1', name: 'Compte Épargne', balance: 0, type: 'savings', displayName: 'Compte Épargne' },
           { id: 'credit-1', name: 'Carte de Crédit', balance: 0, type: 'credit', displayName: 'Carte de Crédit' }
         ]);
      }
    };

    loadAccounts();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Fonction pour obtenir le nom d'affichage d'un compte
  const getAccountDisplayName = (accountId: string): string => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      return account.displayName;
    }
    
    // Fallback pour les IDs de compte connus
    switch (accountId) {
      case 'checking-1': return 'Compte Courant';
      case 'savings-1': return 'Compte Épargne';
      case 'credit-1': return 'Carte de Crédit';
      default: return accountId;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'scheduled':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Effectué';
      case 'pending':
        return 'En cours';
      case 'failed':
        return 'Échoué';
      case 'scheduled':
        return 'Programmé';
      default:
        return 'Inconnu';
    }
  };

  // Fonctions pour gérer les actions
  const resetFormData = () => {
    setFormData({
      beneficiaryName: '',
      beneficiaryIban: '',
      beneficiaryBic: '',
      beneficiaryBank: '',
      isFavorite: false,
      fromAccount: '',
      toAccount: '',
      amount: '',
      description: '',
      scheduledDate: ''
    });
  };

  const handleAddBeneficiary = async () => {
    try {
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) return;

      const newBeneficiary = {
        userId,
        name: formData.beneficiaryName,
        iban: formData.beneficiaryIban,
        bic: formData.beneficiaryBic,
        bankName: formData.beneficiaryBank,
        isFavorite: formData.isFavorite,
        lastUsed: new Date()
      };

      console.log('Ajout du bénéficiaire:', newBeneficiary);
      
      // Appel API réel pour créer le bénéficiaire
      const createdBeneficiary = await FirebaseDataService.createBeneficiary(newBeneficiary);
      
      if (createdBeneficiary) {
        const addedBeneficiary: Beneficiary = {
          id: createdBeneficiary.id,
          name: createdBeneficiary.name,
          iban: createdBeneficiary.iban,
          bic: createdBeneficiary.bic,
          bank: createdBeneficiary.bankName,
          isFavorite: createdBeneficiary.isFavorite,
          lastUsed: new Date(createdBeneficiary.lastUsed)
        };

        setBeneficiaries(prev => [...prev, addedBeneficiary]);
        setShowAddBeneficiary(false);
        resetFormData();
        console.log('Bénéficiaire ajouté avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bénéficiaire:', error);
      console.error('Erreur lors de l\'ajout du bénéficiaire');
    }
  };

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setFormData({
      ...formData,
      beneficiaryName: beneficiary.name,
      beneficiaryIban: beneficiary.iban,
      beneficiaryBic: beneficiary.bic,
      beneficiaryBank: beneficiary.bank,
      isFavorite: beneficiary.isFavorite
    });
    setShowEditBeneficiary(true);
  };

  const handleUpdateBeneficiary = async () => {
    try {
      if (!editingBeneficiary) return;

      const updateData = {
        name: formData.beneficiaryName,
        iban: formData.beneficiaryIban,
        bic: formData.beneficiaryBic,
        bankName: formData.beneficiaryBank,
        isFavorite: formData.isFavorite
      };

      console.log('Mise à jour du bénéficiaire:', updateData);

      // Appel API réel pour mettre à jour le bénéficiaire
      const updatedBeneficiary = await FirebaseDataService.updateBeneficiary(editingBeneficiary.id, updateData);
      
      if (updatedBeneficiary) {
        const updatedBeneficiaryLocal: Beneficiary = {
          id: updatedBeneficiary.id,
          name: updatedBeneficiary.name,
          iban: updatedBeneficiary.iban,
          bic: updatedBeneficiary.bic,
          bank: updatedBeneficiary.bankName,
          isFavorite: updatedBeneficiary.isFavorite,
          lastUsed: editingBeneficiary.lastUsed
        };

        setBeneficiaries(prev => 
          prev.map(b => b.id === editingBeneficiary.id ? updatedBeneficiaryLocal : b)
        );
        setShowEditBeneficiary(false);
        setEditingBeneficiary(null);
        resetFormData();
        console.log('Bénéficiaire mis à jour avec succès !');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bénéficiaire:', error);
      console.log('❌ Erreur lors de la mise à jour du bénéficiaire:', (error as Error).message);
    }
  };

  const handleDeleteBeneficiary = async (beneficiaryId: string) => {
    try {
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) return;

      console.log('Suppression du bénéficiaire:', beneficiaryId);

      // Appel API réel pour supprimer le bénéficiaire
      const success = await FirebaseDataService.deleteBeneficiary(beneficiaryId, userId);
      
      if (success) {
        const beneficiaryToDelete = beneficiaries.find(b => b.id === beneficiaryId);
        setBeneficiaries(prev => prev.filter(b => b.id !== beneficiaryId));
        console.log('✅ Bénéficiaire supprimé avec succès:', beneficiaryToDelete?.name || 'Bénéficiaire');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du bénéficiaire:', error);
      console.log('❌ Erreur lors de la suppression du bénéficiaire:', (error as Error).message);
    }
  };

    const handleTransfer = async () => {
    try {
      const userId = FirebaseDataService.getCurrentUserId();
      if (!userId) return;

      // Validation des données
      if (!formData.fromAccount || !formData.toAccount || !formData.amount || !formData.description) {
        console.log('⚠️ Champs manquants: Veuillez remplir tous les champs obligatoires pour effectuer le virement.');
        return;
      }

      if (parseFloat(formData.amount) <= 0) {
        console.log('⚠️ Montant invalide: Le montant du virement doit être supérieur à 0.');
        return;
      }

      // Pour les virements externes, afficher une confirmation moderne
      if (transferType === 'external') {
        setPendingTransferData({
          userId,
          fromAccountId: formData.fromAccount,
          toAccountId: formData.toAccount,
          amount: parseFloat(formData.amount),
          currency: 'EUR',
          description: formData.description,
          status: 'pending',
          date: new Date()
        });
        setShowConfirmationDialog(true);
        return;
      }

      const newTransfer = {
        userId,
        fromAccountId: formData.fromAccount,
        toAccountId: formData.toAccount,
        amount: parseFloat(formData.amount),
        currency: 'EUR',
        description: formData.description,
        status: transferType === 'scheduled' ? 'scheduled' : 'pending',
        date: transferType === 'scheduled' ? new Date(formData.scheduledDate) : new Date()
      };

      console.log('Création du virement:', newTransfer);

      // Appel API réel pour créer le virement
      const createdTransfer = await FirebaseDataService.createTransfer(newTransfer);
      
      if (createdTransfer) {
        const addedTransfer: Transfer = {
          id: createdTransfer.id,
          type: transferType,
          fromAccount: accounts.find(a => a.id === formData.fromAccount)?.displayName || '',
          toAccount: formData.toAccount,
          amount: parseFloat(formData.amount),
          description: formData.description,
          status: transferType === 'scheduled' ? 'scheduled' : 'pending',
          date: new Date(createdTransfer.date),
          scheduledDate: transferType === 'scheduled' ? new Date(formData.scheduledDate) : undefined,
          beneficiaryName: formData.beneficiaryName, // Map beneficiaryName
          category: 'Quick Transfer' // Map category
        };

        setTransfers(prev => [addedTransfer, ...prev]);
        setShowTransferForm(false);
        resetFormData();
        
        // Message de succès différent selon le type de virement
        if (transferType === 'internal') {
          console.log('✅ Virement interne créé avec succès:', formatCurrency(parseFloat(formData.amount)));
        } else if (transferType === 'scheduled') {
          console.log('✅ Virement programmé avec succès:', formatCurrency(parseFloat(formData.amount)));
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création du virement:', error);
      console.log('❌ Erreur lors de la création du virement:', (error as Error).message);
    }
  };

  const handleQuickTransfer = (beneficiary: Beneficiary) => {
    setTransferType('external');
    setFormData(prev => ({
      ...prev,
      toAccount: beneficiary.id
    }));
    setShowTransferForm(true);
  };

  const handleConfirmExternalTransfer = async () => {
    if (!pendingTransferData) return;

    try {
      console.log('Création du virement externe confirmé:', pendingTransferData);

      // Appel API réel pour créer le virement
      const createdTransfer = await FirebaseDataService.createTransfer(pendingTransferData);
      
      if (createdTransfer) {
        const addedTransfer: Transfer = {
          id: createdTransfer.id,
          type: 'external',
          fromAccount: accounts.find(a => a.id === pendingTransferData.fromAccountId)?.displayName || '',
          toAccount: pendingTransferData.toAccountId,
          amount: pendingTransferData.amount,
          description: pendingTransferData.description,
          status: 'pending',
          date: new Date(createdTransfer.date),
          beneficiaryName: formData.beneficiaryName,
          category: 'Virement sortant'
        };

        setTransfers(prev => [addedTransfer, ...prev]);
        setShowTransferForm(false);
        resetFormData();
        
        console.log('✅ Virement externe soumis avec succès:', formatCurrency(pendingTransferData.amount));
      }
    } catch (error) {
      console.error('Erreur lors de la création du virement externe:', error);
      console.log('❌ Erreur lors de la création du virement externe:', (error as Error).message);
    } finally {
      setPendingTransferData(null);
    }
  };

  // Filtrage des virements
  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toAccount.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'completed' && transfer.status === 'completed') ||
                         (selectedFilter === 'pending' && transfer.status === 'pending') ||
                         (selectedFilter === 'scheduled' && transfer.status === 'scheduled');

    return matchesSearch && matchesFilter;
  });



  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des virements...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas vérifié, afficher le composant VerificationState
  if (isUnverified) {
    return (
      <VerificationState 
        userStatus={userStatus}
        title="Vérification d'identité requise"
        description="Pour effectuer des virements et gérer vos transferts, vous devez d'abord valider votre identité."
        showFeatures={true}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Virements</h1>
            <p className="text-blue-100 text-sm sm:text-base">Gérez vos transferts d'argent</p>
          </div>
          <div className="flex items-center space-x-3">
                          <button
                onClick={() => setShowTransferForm(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
              >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau virement</span>
              <span className="sm:hidden">Nouveau</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm">Virements ce mois</p>
            <p className="text-lg sm:text-2xl font-bold">{transfers.filter(t => t.status === 'completed').length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm">Montant total</p>
            <p className="text-lg sm:text-2xl font-bold">
              {formatCurrency(transfers.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0))}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm">Bénéficiaires</p>
            <p className="text-lg sm:text-2xl font-bold">{beneficiaries.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4">
            <p className="text-blue-100 text-xs sm:text-sm">Programmés</p>
            <p className="text-lg sm:text-2xl font-bold">{transfers.filter(t => t.status === 'scheduled').length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg">
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
            {[
              { id: 'new', label: 'Nouveau virement', icon: Plus },
              { id: 'beneficiaries', label: 'Bénéficiaires', icon: Users },
              { id: 'scheduled', label: 'Virements programmés', icon: Clock },
              { id: 'history', label: 'Historique', icon: Calendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Nouveau virement */}
          {activeTab === 'new' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <button
                  onClick={() => {
                    setTransferType('internal');
                    setShowTransferForm(true);
                  }}
                  className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 sm:p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-base sm:text-lg">Virement interne</p>
                      <p className="text-blue-100 text-xs sm:text-sm">Entre vos comptes</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setTransferType('external');
                    setShowTransferForm(true);
                  }}
                  className="group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 sm:p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-base sm:text-lg">Virement externe</p>
                      <p className="text-green-100 text-xs sm:text-sm">Vers un autre compte</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setTransferType('scheduled');
                    setShowTransferForm(true);
                  }}
                  className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 sm:p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg sm:col-span-2 lg:col-span-1"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-base sm:text-lg">Virement programmé</p>
                      <p className="text-purple-100 text-xs sm:text-sm">Planifier un virement</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Virements rapides</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                     {beneficiaries.filter(b => b.isFavorite).map((beneficiary) => (
                     <button
                       key={beneficiary.id}
                       onClick={() => handleQuickTransfer(beneficiary)}
                       className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                     >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 text-sm sm:text-base">{beneficiary.name}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">{beneficiary.bank}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Dernier virement: {beneficiary.lastUsed ? formatDate(beneficiary.lastUsed) : 'Jamais'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bénéficiaires */}
          {activeTab === 'beneficiaries' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Mes bénéficiaires</h3>
                <button
                  onClick={() => setShowAddBeneficiary(true)}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Ajouter un bénéficiaire</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{beneficiary.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-500">{beneficiary.bank}</p>
                      </div>
                                             <div className="flex items-center space-x-2 ml-2">
                         {beneficiary.isFavorite && (
                           <Star className="w-4 h-4 text-yellow-500 fill-current" />
                         )}
                         <button 
                           onClick={() => handleEditBeneficiary(beneficiary)}
                           className="text-gray-400 hover:text-gray-600"
                         >
                           <Edit className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                           className="text-gray-400 hover:text-red-600"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">IBAN</p>
                      <p className="text-xs sm:text-sm font-mono text-gray-900 break-all">{beneficiary.iban}</p>
                      <p className="text-xs text-gray-500">BIC</p>
                      <p className="text-xs sm:text-sm font-mono text-gray-900">{beneficiary.bic}</p>
                    </div>
                                         <div className="mt-4 flex space-x-2">
                       <button 
                         onClick={() => handleQuickTransfer(beneficiary)}
                         className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors"
                       >
                         Virement rapide
                       </button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Virements programmés */}
          {activeTab === 'scheduled' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Virements programmés</h3>
              <div className="space-y-3 sm:space-y-4">
                                 {filteredTransfers.filter(t => t.status === 'scheduled').map((transfer) => (
                  <div key={transfer.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{transfer.description}</h4>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {getAccountDisplayName(transfer.fromAccount)} → {transfer.beneficiaryName || getAccountDisplayName(transfer.toAccount)}
                          </p>
                          <p className="text-xs text-gray-400">
                            Programmé pour le {transfer.scheduledDate ? formatDate(transfer.scheduledDate) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(transfer.amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transfer.status)}`}>
                          {getStatusText(transfer.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historique */}
          {activeTab === 'history' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Historique des virements</h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                     <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input
                       type="text"
                       placeholder="Rechercher..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                     />
                   </div>
                   <select
                     value={selectedFilter}
                     onChange={(e) => setSelectedFilter(e.target.value)}
                     className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   >
                     <option value="all">Tous les statuts</option>
                     <option value="completed">Effectués</option>
                     <option value="pending">En cours</option>
                     <option value="scheduled">Programmés</option>
                   </select>
                  <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    <span>Exporter</span>
                  </button>
                </div>
              </div>

                             <div className="space-y-3 sm:space-y-4">
                 {filteredTransfers.map((transfer) => (
                  <div key={transfer.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`p-2 rounded-lg ${
                          transfer.type === 'internal' ? 'bg-blue-100' :
                          transfer.type === 'external' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          {transfer.type === 'internal' ? (
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          ) : transfer.type === 'external' ? (
                            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{transfer.description}</h4>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {getAccountDisplayName(transfer.fromAccount)} → {transfer.beneficiaryName || getAccountDisplayName(transfer.toAccount)}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(transfer.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{formatCurrency(transfer.amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transfer.status)}`}>
                          {getStatusText(transfer.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajout bénéficiaire */}
      {showAddBeneficiary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ajouter un bénéficiaire</h3>
              <button 
                onClick={() => setShowAddBeneficiary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
                         <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nom du bénéficiaire</label>
                 <input
                   type="text"
                   value={formData.beneficiaryName}
                   onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="Nom et prénom"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                 <input
                   type="text"
                   value={formData.beneficiaryIban}
                   onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryIban: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="FR76 1234 5678 9012 3456 7890 123"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Code BIC/SWIFT</label>
                 <input
                   type="text"
                   value={formData.beneficiaryBic}
                   onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryBic: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="BNPAFRPPXXX"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la banque</label>
                 <input
                   type="text"
                   value={formData.beneficiaryBank}
                   onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryBank: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="Nom de la banque"
                 />
               </div>
               <div className="flex items-center space-x-2">
                 <input 
                   type="checkbox" 
                   id="favorite" 
                   checked={formData.isFavorite}
                   onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                   className="rounded" 
                 />
                 <label htmlFor="favorite" className="text-sm text-gray-700">Marquer comme favori</label>
               </div>
               <div className="flex space-x-3 pt-4">
                 <button
                   onClick={() => {
                     setShowAddBeneficiary(false);
                     resetFormData();
                   }}
                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                 >
                   {t('common.cancel')}
                 </button>
                 <button 
                   onClick={handleAddBeneficiary}
                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                 >
                   Ajouter
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

             {/* Modal Édition bénéficiaire */}
       {showEditBeneficiary && editingBeneficiary && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg sm:text-xl font-bold text-gray-900">Modifier le bénéficiaire</h3>
               <button 
                 onClick={() => {
                   setShowEditBeneficiary(false);
                   setEditingBeneficiary(null);
                   resetFormData();
                 }}
                 className="text-gray-400 hover:text-gray-600"
               >
                 ✕
               </button>
             </div>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nom du bénéficiaire</label>
                 <input
                   type="text"
                   value={formData.beneficiaryName}
                   onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="Nom et prénom"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                 <input
                   type="text"
                   value={formData.beneficiaryIban}
                   onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryIban: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="FR76 1234 5678 9012 3456 7890 123"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Code BIC/SWIFT</label>
                 <input
                   type="text"
                   value={formData.beneficiaryBic}
                   onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryBic: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="BNPAFRPPXXX"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la banque</label>
                 <input
                   type="text"
                   value={formData.beneficiaryBank}
                   onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryBank: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="Nom de la banque"
                 />
               </div>
               <div className="flex items-center space-x-2">
                 <input 
                   type="checkbox" 
                   id="edit-favorite" 
                   checked={formData.isFavorite}
                   onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                   className="rounded" 
                 />
                 <label htmlFor="edit-favorite" className="text-sm text-gray-700">Marquer comme favori</label>
               </div>
               <div className="flex space-x-3 pt-4">
                 <button
                   onClick={() => {
                     setShowEditBeneficiary(false);
                     setEditingBeneficiary(null);
                     resetFormData();
                   }}
                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                 >
                   {t('common.cancel')}
                 </button>
                 <button 
                   onClick={handleUpdateBeneficiary}
                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                 >
                   Modifier
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Modal Formulaire de virement */}
       {showTransferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                {transferType === 'internal' ? 'Virement interne' :
                 transferType === 'external' ? 'Virement externe' : 'Virement programmé'}
              </h3>
                             <button 
                 onClick={() => {
                   setShowTransferForm(false);
                   resetFormData();
                 }}
                 className="text-gray-400 hover:text-gray-600"
               >
                 ✕
               </button>
             </div>
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Compte source</label>
                 <select 
                   value={formData.fromAccount}
                   onChange={(e) => setFormData(prev => ({ ...prev, fromAccount: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                 >
                   <option value="">Sélectionner un compte</option>
                   {accounts.map(account => (
                     <option key={account.id} value={account.id}>
                       {account.displayName} - {formatCurrency(account.balance)}
                     </option>
                   ))}
                 </select>
               </div>
                             {transferType === 'internal' ? (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Compte destination</label>
                   <select 
                     value={formData.toAccount}
                     onChange={(e) => setFormData(prev => ({ ...prev, toAccount: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   >
                     <option value="">Sélectionner un compte</option>
                     {accounts.filter(account => account.id !== formData.fromAccount).map(account => (
                       <option key={account.id} value={account.id}>
                         {account.displayName}
                       </option>
                     ))}
                   </select>
                 </div>
               ) : (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Bénéficiaire</label>
                   <select 
                     value={formData.toAccount}
                     onChange={(e) => setFormData(prev => ({ ...prev, toAccount: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   >
                     <option value="">Sélectionner un bénéficiaire</option>
                     {beneficiaries.map(beneficiary => (
                       <option key={beneficiary.id} value={beneficiary.id}>
                         {beneficiary.name} - {beneficiary.iban}
                       </option>
                     ))}
                   </select>
                 </div>
               )}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                 <input
                   type="number"
                   value={formData.amount}
                   onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="0.00"
                   step="0.01"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                 <input
                   type="text"
                   value={formData.description}
                   onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   placeholder="Libellé du virement"
                 />
               </div>
               {transferType === 'scheduled' && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Date de programmation</label>
                   <input
                     type="date"
                     value={formData.scheduledDate}
                     onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   />
                 </div>
               )}
               <div className="flex space-x-3 pt-4">
                 <button
                   onClick={() => {
                     setShowTransferForm(false);
                     resetFormData();
                   }}
                   className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                 >
                   {t('common.cancel')}
                 </button>
                 <button 
                   onClick={handleTransfer}
                   className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                 >
                   {transferType === 'scheduled' ? 'Programmer' : 'Effectuer'} le virement
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications */}
      {/* <NotificationContainer notifications={notifications} /> */}

      {/* Confirmation Dialog pour les virements externes */}
      <ConfirmationDialog
        isOpen={showConfirmationDialog}
        onClose={() => {
          setShowConfirmationDialog(false);
          setPendingTransferData(null);
        }}
        onConfirm={handleConfirmExternalTransfer}
        title={t('transferMessages.externalTransferTitle') || 'Virement externe'}
        message={t('transferMessages.externalTransferMessage') || 'Les virements externes sont soumis à un examen de sécurité avant leur validation.'}
        type="warning"
        confirmText={t('transferMessages.confirmTransfer') || 'Confirmer le virement'}
        cancelText={t('common.cancel') || 'Annuler'}
      />


    </div>
  );
};

export default TransfersPage; 