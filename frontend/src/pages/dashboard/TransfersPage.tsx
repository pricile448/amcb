import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  ArrowLeftRight,
  ExternalLink,
  Search,
  Filter,
  Download,
  Calendar,
  Loader2,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Plus,
  Send,
  Clock as ClockIcon,
  User,
  Trash2,
  Edit
} from 'lucide-react';
import { formatCurrency, formatDate, formatReference } from '../../utils/formatters';
import { debugLog } from '../../utils/logger';
import { useAuth } from "../../hooks/useAuth";
import { useKycSync } from '../../hooks/useKycSync';
import KycProtectedContent from '../../components/KycProtectedContent';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Types
interface Transfer {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'internal' | 'external' | 'recurring';
  status: 'completed' | 'pending' | 'processing' | 'failed' | 'cancelled';
  fromAccount: string;
  fromAccountId?: string;
  toAccount: string;
  toAccountId?: string;
  reference: string;
  category?: string;
  fee?: number;
  exchangeRate?: number;
  scheduledDate?: Date;
  beneficiaryId?: string;
  transferType?: 'internal' | 'external' | 'scheduled';
  adminStatus?: 'pending_review' | 'approved' | 'rejected';
  adminNotes?: string;
}

interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bankName: string;
  accountType: string;
  createdAt: Date;
  lastUsed?: Date;
}

interface TransferLimit {
  type: string;
  amount: number;
  currency: string;
  description: string;
}

interface FilterOptions {
  type: string;
  status: string;
  dateRange: string;
  amount: string;
}

// Composant principal
const TransfersPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const { user } = useAuth();
  const { kycStatus, isUnverified } = useKycSync();
  
  // États
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    status: "all",
    dateRange: "all",
    amount: "all"
  });
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [scheduledTransfers, setScheduledTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [activeTab, setActiveTab] = useState<'new' | 'beneficiaries' | 'scheduled'>('new');
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  const [showScheduledTransferModal, setShowScheduledTransferModal] = useState(false);
  const [transferType, setTransferType] = useState<'internal' | 'external' | 'scheduled'>('internal');
  const [showExternalTransferDialog, setShowExternalTransferDialog] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    fromAccount: '',
    toAccount: '',
    toIban: '',
    beneficiaryName: '',
    scheduledDate: '',
    reference: ''
  });
  const [beneficiaryFormData, setBeneficiaryFormData] = useState({
    name: '',
    iban: '',
    bic: '',
    nickname: ''
  });
  const [accounts, setAccounts] = useState<any[]>([]);

  // Fonction pour obtenir le nom traduit d'un compte
  const getAccountName = (accountIdOrNameOrAccount: string | { id: string; name: string; balance: number; currency: string } | { name: string }): string => {
    // Si c'est un objet account
    if (typeof accountIdOrNameOrAccount === 'object' && accountIdOrNameOrAccount.name) {
      return t(`transactions.accounts.${accountIdOrNameOrAccount.name}`);
    }
    
    // Si c'est une chaîne (ID ou nom)
    if (typeof accountIdOrNameOrAccount === 'string') {
      // Vérifier si c'est un nom de compte connu
      if (['checking', 'savings', 'credit'].includes(accountIdOrNameOrAccount)) {
        return t(`transactions.accounts.${accountIdOrNameOrAccount}`);
      }
      
      // Sinon, chercher par ID dans les comptes
      const account = accounts.find(acc => acc.id === accountIdOrNameOrAccount);
      if (account) {
        return t(`transactions.accounts.${account.name}`);
      }
      
      // Si c'est déjà un nom traduit ou un nom de bénéficiaire, le retourner tel quel
      if (accountIdOrNameOrAccount.includes(' ') || accountIdOrNameOrAccount.length > 10) {
        return accountIdOrNameOrAccount;
      }
      
      return t("transfers.unknownAccount");
    }
    
    return t("transfers.unknownAccount");
  };



  // Limites de transfert
  const transferLimits: TransferLimit[] = [
    { type: 'daily', amount: 5000, currency: 'EUR', description: t("transfers.dailyLimit") },
    { type: 'monthly', amount: 20000, currency: 'EUR', description: t("transfers.monthlyLimit") },
    { type: 'minimum', amount: 0.01, currency: 'EUR', description: t("transfers.minimumAmount") },
    { type: 'processing', amount: 0, currency: '', description: t("transfers.processingTime") }
  ];

  // Chargement des données depuis Firebase Firestore
  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        
        // Charger les données utilisateur depuis Firestore
        const userDocRef = doc(db, 'users', user.uid);
        
        const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            
            // Traiter les transactions (transferts)
            const transactions = userData.transactions || [];
            const transfersData: Transfer[] = [];
            const scheduledData: Transfer[] = [];
            
            transactions.forEach((transaction: any) => {
              // Filtrer seulement les transferts
              if (transaction.type === 'debit' || transaction.type === 'credit' || transaction.type === 'outgoing_transfer') {
                const transfer: Transfer = {
                  id: transaction.id || transaction.transferId || `transfer_${Date.now()}`,
                  date: transaction.date?.toDate() || new Date(),
                  description: transaction.description || '',
                  amount: Math.abs(transaction.amount) || 0,
                  type: transaction.category === 'Virement interne' ? 'internal' : 'external',
                  status: transaction.status || 'completed',
                  fromAccount: getAccountName(transaction.accountId) || transaction.accountId || '',
                  fromAccountId: transaction.accountId,
                  toAccount: (() => {
                    // Pour les virements internes, utiliser un compte de destination logique
                    if (transaction.category === 'Virement interne') {
                      // Si le compte source est 'checking', destination = 'savings', sinon 'checking'
                      const sourceAccount = transaction.accountId;
                      if (sourceAccount === 'checking') {
                        return getAccountName('savings');
                      } else {
                        return getAccountName('checking');
                      }
                    }
                    // Pour les virements externes, utiliser le nom du bénéficiaire
                    return transaction.beneficiaryName || getAccountName(transaction.toAccountId) || transaction.category || '';
                  })(),
                  toAccountId: transaction.beneficiaryId,
                  reference: transaction.reference || transaction.transferId || '',
                  category: transaction.category,
                  fee: 0,
                  exchangeRate: undefined,
                  scheduledDate: undefined,
                  beneficiaryId: transaction.beneficiaryId
                };
                
                // Séparer les transferts programmés (pour l'instant, tous sont complétés)
                if (transfer.status === 'pending' && transfer.scheduledDate && transfer.scheduledDate > new Date()) {
                  scheduledData.push(transfer);
                } else {
                  transfersData.push(transfer);
                }
              }
            });
            
            setTransfers(transfersData);
            setScheduledTransfers(scheduledData);
            
            // Traiter les bénéficiaires
            const beneficiaries = userData.beneficiaries || [];
            const beneficiariesData: Beneficiary[] = [];
            
            beneficiaries.forEach((beneficiary: any) => {
              const beneficiaryData: Beneficiary = {
                id: beneficiary.id || `beneficiary_${Date.now()}`,
                name: beneficiary.name || '',
                iban: beneficiary.iban || '',
                bankName: 'Banque externe', // Pas de banque spécifique dans les données
                accountType: 'current',
                createdAt: new Date(), // Pas de date de création dans les données
                lastUsed: undefined
              };
              beneficiariesData.push(beneficiaryData);
            });
            
            setBeneficiaries(beneficiariesData);
            
            // Charger les comptes
            setAccounts(userData.accounts || []);
          }
        });
        
        return () => {
          unsubscribeUser();
        };
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.uid]);

  // Filtrage et tri des transferts
  const filteredTransfers = useMemo(() => {
    const filtered = transfers.filter((transfer) => {
      // Filtre par terme de recherche
      const matchesSearch = 
        transfer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.toAccount.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par type
      const matchesType = 
        filters.type === "all" ||
        filters.type === transfer.type;
      
      // Filtre par statut
      const matchesStatus = 
        filters.status === "all" ||
        filters.status === transfer.status;
      
      // Filtre par plage de dates
      let matchesDateRange = true;
      const now = new Date();
      const transferDate = new Date(transfer.date);
      
      if (filters.dateRange === "today") {
        matchesDateRange = transferDate.toDateString() === now.toDateString();
      } else if (filters.dateRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDateRange = transferDate >= weekAgo;
      } else if (filters.dateRange === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDateRange = transferDate >= monthAgo;
      }
      
      // Filtre par montant
      let matchesAmount = true;
      if (filters.amount === "small") {
        matchesAmount = transfer.amount <= 100;
      } else if (filters.amount === "medium") {
        matchesAmount = transfer.amount > 100 && transfer.amount <= 500;
      } else if (filters.amount === "large") {
        matchesAmount = transfer.amount > 500;
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesDateRange && matchesAmount;
    });

    // Tri par date décroissante (plus récent en premier)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transfers, searchTerm, filters]);

  // Calculs de pagination pour les transferts
  const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransfers = filteredTransfers.slice(startIndex, endIndex);

  // Réinitialiser la page courante quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Gestionnaires d'événements
  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: "all",
      status: "all",
      dateRange: "all",
      amount: "all"
    });
    setSearchTerm("");
  };

  const handleTransferClick = (transfer: Transfer) => {
    setSelectedTransfer(transfer);
  };

  // Fonctions pour les boutons
  const handleNewTransfer = (type: 'internal' | 'external' | 'scheduled') => {
    setTransferType(type);
    if (type === 'scheduled') {
      setShowScheduledTransferModal(true);
    } else {
      setShowNewTransferModal(true);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBeneficiaryFormChange = (field: string, value: string) => {
    setBeneficiaryFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForms = () => {
    setFormData({
      amount: '',
      description: '',
      fromAccount: '',
      toAccount: '',
      toIban: '',
      beneficiaryName: '',
      scheduledDate: '',
      reference: ''
    });
    setBeneficiaryFormData({
      name: '',
      iban: '',
      bic: '',
      nickname: ''
    });
  };

  const handleAddBeneficiary = () => {
    setSelectedBeneficiary(null);
    resetForms();
    setShowBeneficiaryModal(true);
  };

  const handleEditBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setBeneficiaryFormData({
      name: beneficiary.name,
      iban: beneficiary.iban,
      bic: '',
      nickname: ''
    });
    setShowBeneficiaryModal(true);
  };

  const handleSubmitTransfer = async () => {
    debugLog('handleSubmitTransfer appelé', { transferType, formData });
    if (!user?.uid) return;
    
    // Validation des données requises
    if (!formData.fromAccount || !formData.toAccount || !formData.amount || !formData.description) {
      console.error('Données manquantes pour le transfert');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const transactions = userData.transactions || [];
        const accounts = userData.accounts || [];
        
        const transferAmount = parseFloat(formData.amount);
        
        // Vérifier que le compte source a suffisamment de fonds
        const sourceAccount = accounts.find((account: any) => account.id === formData.fromAccount);
        if (!sourceAccount) {
          console.error('Compte source non trouvé');
          return;
        }
        
        if (sourceAccount.balance < transferAmount) {
          console.error('Solde insuffisant pour effectuer le transfert');
          alert('Solde insuffisant pour effectuer ce transfert');
          return;
        }
        
        // Mettre à jour les soldes des comptes
        let updatedAccounts = [...accounts];
        
        if (transferType === 'internal') {
          // Vérifier que le compte destination existe
          const destinationAccount = accounts.find((account: any) => account.id === formData.toAccount);
          if (!destinationAccount) {
            console.error('Compte destination non trouvé');
            alert('Compte destination non trouvé');
            return;
          }
          
          // Virement interne : déduire du compte source et ajouter au compte destination
          updatedAccounts = updatedAccounts.map((account: any) => {
            if (account.id === formData.fromAccount) {
              return { ...account, balance: account.balance - transferAmount };
            }
            if (account.id === formData.toAccount) {
              return { ...account, balance: account.balance + transferAmount };
            }
            return account;
          });
        } else if (transferType === 'external') {
          // Virement externe : déduire du compte source seulement
          updatedAccounts = updatedAccounts.map((account: any) => {
            if (account.id === formData.fromAccount) {
              return { ...account, balance: account.balance - transferAmount };
            }
            return account;
          });
        }
        
        const newTransfer = {
          id: `txn_${Date.now()}`,
          accountId: formData.fromAccount,
          amount: transferAmount,
          description: formData.description,
          category: transferType === 'internal' ? 'Virement interne' : 'Virement sortant',
          currency: 'EUR',
          date: new Date(),
          status: transferType === 'internal' ? 'completed' : 'pending',
          type: 'debit',
          reference: formData.reference || `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          transferId: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.uid,
          beneficiaryName: formData.beneficiaryName || '',
          beneficiaryId: formData.toAccount,
          scheduledDate: transferType === 'scheduled' && formData.scheduledDate ? new Date(formData.scheduledDate) : null,
          transferType: transferType,
          adminStatus: transferType === 'external' ? 'pending_review' : null,
          adminNotes: transferType === 'external' ? 'En attente d\'évaluation par l\'administrateur' : null
        };
        
        const updatedTransactions = [...transactions, cleanDataForFirestore(newTransfer)];
        
        // Mettre à jour à la fois les transactions et les comptes
        await updateDoc(userDocRef, {
          transactions: updatedTransactions,
          accounts: updatedAccounts
        });
        
        debugLog('Transfert effectué et soldes mis à jour:', {
          transferType,
          amount: transferAmount,
          fromAccount: formData.fromAccount,
          toAccount: formData.toAccount,
          updatedAccounts
        });
        
        // Fermer les modales
        setShowNewTransferModal(false);
        setShowScheduledTransferModal(false);
        resetForms();
        
        // Si c'est un virement externe, afficher la boîte de dialogue
        if (transferType === 'external') {
          setPendingTransfer(newTransfer);
          setShowExternalTransferDialog(true);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création du transfert:', error);
    }
  };

  const handleConfirmExternalTransfer = () => {
    setShowExternalTransferDialog(false);
    setPendingTransfer(null);
  };

  const closeAllModals = () => {
    setShowNewTransferModal(false);
    setShowBeneficiaryModal(false);
    setShowScheduledTransferModal(false);
    setShowExternalTransferDialog(false);
    setSelectedTransfer(null);
    setSelectedBeneficiary(null);
    resetForms();
  };

  // Fonction pour nettoyer les données avant envoi à Firebase
  const cleanDataForFirestore = (obj: any) => {
    const cleaned = { ...obj };
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });
    return cleaned;
  };

  const handleSubmitBeneficiary = async () => {
    debugLog('handleSubmitBeneficiary appelé', { beneficiaryFormData, selectedBeneficiary });
    if (!user?.uid) return;
    
    // Validation des données requises
    if (!beneficiaryFormData.name || !beneficiaryFormData.iban) {
      console.error('Données manquantes pour le bénéficiaire');
      return;
    }
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const beneficiaries = userData.beneficiaries || [];
        
        const newBeneficiary = {
          id: selectedBeneficiary ? selectedBeneficiary.id : `beneficiary_${Date.now()}`,
          name: beneficiaryFormData.name,
          iban: beneficiaryFormData.iban,
          bic: beneficiaryFormData.bic || 'BANKFUI9388',
          nickname: beneficiaryFormData.nickname || ''
        };
        
        let updatedBeneficiaries;
        if (selectedBeneficiary) {
          // Modification
          updatedBeneficiaries = beneficiaries.map((b: any) => 
            b.id === selectedBeneficiary.id ? cleanDataForFirestore(newBeneficiary) : b
          );
        } else {
          // Ajout
          updatedBeneficiaries = [...beneficiaries, cleanDataForFirestore(newBeneficiary)];
        }
        
        await updateDoc(userDocRef, {
          beneficiaries: updatedBeneficiaries
        });
        
        setShowBeneficiaryModal(false);
        resetForms();
        setSelectedBeneficiary(null);
        setActiveTab('beneficiaries'); // Rester sur l'onglet bénéficiaires
      }
    } catch (error) {
      console.error('Erreur lors de la gestion du bénéficiaire:', error);
    }
  };

  const handleDeleteBeneficiary = async (beneficiaryId: string) => {
    if (!user?.uid) return;
    
    try {
      // Récupérer le document utilisateur actuel
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const beneficiaries = userData.beneficiaries || [];
        
        // Filtrer le bénéficiaire à supprimer
        const updatedBeneficiaries = beneficiaries.filter((b: any) => b.id !== beneficiaryId);
        
        // Mettre à jour le document utilisateur
        await updateDoc(userDocRef, {
          beneficiaries: updatedBeneficiaries
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du bénéficiaire:', error);
    }
  };

  const handleCancelTransfer = async (transferId: string) => {
    if (!user?.uid) return;
    
    try {
      // Récupérer le document utilisateur actuel
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const transactions = userData.transactions || [];
        
        // Trouver et mettre à jour la transaction
        const updatedTransactions = transactions.map((t: any) => {
          if (t.id === transferId || t.transferId === transferId) {
            return {
              ...t,
              status: 'cancelled',
              cancelledAt: new Date()
            };
          }
          return t;
        });
        
        // Mettre à jour le document utilisateur
        await updateDoc(userDocRef, {
          transactions: updatedTransactions
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation du transfert:', error);
    }
  };

  const handleDownloadReceipt = async (transfer: Transfer) => {
    // Simulation de téléchargement de reçu
    const receiptData = {
      transferId: transfer.id,
      date: transfer.date,
      amount: transfer.amount,
      description: transfer.description,
      reference: transfer.reference
    };
    
    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transfer.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Composants utilitaires pour le modal de détails
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'completed':
          return {
            bg: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
            text: t(`transfers.status.${status}`)
          };
        case 'pending':
          return {
            bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            icon: <Clock className="w-3 h-3 mr-1" />,
            text: t(`transfers.status.${status}`)
          };
        case 'processing':
          return {
            bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />,
            text: t(`transfers.status.${status}`)
          };
        case 'failed':
          return {
            bg: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            icon: <AlertCircle className="w-3 h-3 mr-1" />,
            text: t(`transfers.status.${status}`)
          };
        case 'cancelled':
          return {
            bg: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            icon: <X className="w-3 h-3 mr-1" />,
            text: t(`transfers.status.${status}`)
          };
        default:
          return {
            bg: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            icon: null,
            text: t(`transfers.status.${status}`)
          };
      }
    };

    const config = getStatusConfig(status);
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.bg}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const DetailRow = ({ 
    label, 
    value, 
    isMobile = false, 
    valueClassName = "" 
  }: { 
    label: string; 
    value: React.ReactNode; 
    isMobile?: boolean; 
    valueClassName?: string;
  }) => {
    if (isMobile) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">{label}:</span>
            <span className={`text-sm ${valueClassName}`}>{value}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center">
        <span className="text-gray-600 dark:text-gray-400">{label}:</span>
        <span className={valueClassName}>{value}</span>
      </div>
    );
  };

  const TransferDetailsContent = ({ transfer, isMobile = false }: { transfer: Transfer; isMobile?: boolean }) => {
    const amountValue = (
      <span className={`font-semibold ${transfer.type === 'external' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
        {transfer.type === 'external' ? '-' : ''}{formatCurrency(transfer.amount, 'EUR')}
      </span>
    );

    const details = [
      {
        label: t("common.status"),
        value: <StatusBadge status={transfer.status} />,
        mobile: true
      },
      {
        label: t("common.date"),
        value: formatDate(transfer.date, 'long'),
        mobile: true
      },
      {
        label: t("transfers.amount"),
        value: amountValue,
        mobile: true
      },
      {
        label: t("transfers.fromAccount"),
        value: getAccountName(transfer.fromAccount),
        mobile: true
      },
      {
        label: t("transfers.toAccount"),
        value: getAccountName(transfer.toAccount),
        mobile: true
      },
      {
        label: t("transfers.reference"),
        value: transfer.reference,
        mobile: true
      },
      {
        label: t("transfers.fee"),
        value: formatCurrency(transfer.fee || 0, 'EUR'),
        mobile: transfer.fee !== undefined,
        desktop: transfer.fee !== undefined
      },
      {
        label: t("transfers.exchangeRate"),
        value: `1 EUR = ${transfer.exchangeRate} GBP`,
        mobile: transfer.exchangeRate !== undefined,
        desktop: transfer.exchangeRate !== undefined
      },
      {
        label: t("transfers.category"),
        value: transfer.category ? t(`transfers.categories.${transfer.category}`) : t("transfers.unknownAccount"),
        mobile: !!transfer.category,
        desktop: !!transfer.category
      }
    ];

    return (
      <div className={isMobile ? "space-y-3" : "space-y-6"}>
        {details.map((detail, index) => {
          if (isMobile && !detail.mobile) return null;
          if (!isMobile && !detail.desktop) return null;
          
          return (
            <DetailRow
              key={index}
              label={detail.label}
              value={detail.value}
              isMobile={isMobile}
              valueClassName={isMobile ? "text-gray-900 dark:text-white" : "text-gray-900 dark:text-white"}
            />
          );
        })}
      </div>
    );
  };

  const TransferDetailsModal = ({ transfer, onClose }: { transfer: Transfer; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
              {t("transfers.transferDetails")}
            </h3>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              onClick={onClose}
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Version Mobile */}
            <div className="block md:hidden">
              <TransferDetailsContent transfer={transfer} isMobile={true} />
            </div>

            {/* Version Desktop */}
            <div className="hidden md:block">
              <TransferDetailsContent transfer={transfer} isMobile={false} />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={onClose}
            >
              {t("common.close")}
            </button>
            
            {transfer.status === 'pending' && (
              <button 
                className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                onClick={() => handleCancelTransfer(transfer.id)}
              >
                {t("transfers.cancelTransfer")}
              </button>
            )}
            
            <button 
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              onClick={() => handleDownloadReceipt(transfer)}
            >
              {t("transfers.downloadReceipt")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Rendu du composant
  return (
    <div className="space-y-6">
      {/* Section bleue avec métriques */}
      <div className="bg-blue-600 rounded-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">{t("transfers.title")}</h1>
            <p className="text-blue-100">{t("transfers.subtitle")}</p>
          </div>
          <div>
            <button 
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition-colors font-medium flex items-center space-x-2"
              onClick={handleAddBeneficiary}
            >
              <Plus className="w-4 h-4" />
              <span>{t("transfers.beneficiaries.add")}</span>
            </button>
          </div>
        </div>
        
        {/* Métriques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-6">
          <div className="bg-blue-500 rounded-lg p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">{t("transfers.stats.thisMonth")}</p>
            <p className="text-white text-lg md:text-2xl font-bold">
              {transfers.filter(t => {
                const now = new Date();
                const transferDate = new Date(t.date);
                return transferDate.getMonth() === now.getMonth() && 
                       transferDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-blue-500 rounded-lg p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">{t("transfers.stats.totalAmount")}</p>
            <p className="text-white text-lg md:text-2xl font-bold">
              {formatCurrency(
                transfers.reduce((sum, t) => sum + t.amount, 0),
                'EUR'
              )}
            </p>
          </div>
          <div className="bg-blue-500 rounded-lg p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">{t("transfers.status.pending")}</p>
            <p className="text-white text-lg md:text-2xl font-bold">
              {transfers.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-blue-500 rounded-lg p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">{t("transfers.status.processing")}</p>
            <p className="text-white text-lg md:text-2xl font-bold">
              {transfers.filter(t => t.status === 'processing').length}
            </p>
          </div>
          <div className="bg-blue-500 rounded-lg p-3 md:p-4">
            <p className="text-blue-100 text-xs md:text-sm">{t("transfers.stats.beneficiaries")}</p>
            <p className="text-white text-lg md:text-2xl font-bold">{beneficiaries.length}</p>
          </div>
        </div>
      </div>

      {/* Section blanche avec onglets et cartes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Onglets */}
        <div className="flex flex-wrap md:flex-nowrap space-x-2 md:space-x-8 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          <button
            className={`pb-2 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
              activeTab === 'new'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('new')}
          >
            + {t("transfers.newShort")}
          </button>
          <button
            className={`pb-2 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
              activeTab === 'beneficiaries'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('beneficiaries')}
          >
            {t("transfers.tabs.beneficiaries")}
          </button>
          <button
            className={`pb-2 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
              activeTab === 'scheduled'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('scheduled')}
          >
            {t("transfers.tabs.scheduled")}
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'new' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Carte Virement interne */}
            <div 
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 md:p-6 border-2 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleNewTransfer('internal')}
            >
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
                <div className="bg-blue-600 p-3 md:p-4 rounded-full">
                  <ArrowLeftRight className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t("transfers.internalTransfer")}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1">{t("transfers.internalDesc")}</p>
                </div>
              </div>
            </div>

            {/* Carte Virement externe */}
            <div 
              className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 md:p-6 border-2 border-green-200 dark:border-green-800 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleNewTransfer('external')}
            >
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
                <div className="bg-green-600 p-3 md:p-4 rounded-full">
                  <Send className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t("transfers.externalTransfer")}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1">{t("transfers.externalDesc")}</p>
                </div>
              </div>
            </div>

            {/* Carte Virement programmé */}
            <div 
              className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 md:p-6 border-2 border-purple-200 dark:border-purple-800 hover:shadow-md transition-shadow cursor-pointer sm:col-span-2 lg:col-span-1"
              onClick={() => setShowScheduledTransferModal(true)}
            >
              <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
                <div className="bg-purple-600 p-3 md:p-4 rounded-full">
                  <ClockIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">{t("transfers.scheduledLabel")}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1">{t("transfers.scheduledDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'beneficiaries' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("transfers.beneficiaries.title")}</h3>
            </div>
            
            {beneficiaries.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t("transfers.beneficiaries.noBeneficiaries")}</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">{t("transfers.beneficiaries.addFirstBeneficiary")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-1"
                          onClick={() => handleEditBeneficiary(beneficiary)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          onClick={() => handleDeleteBeneficiary(beneficiary.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm md:text-base">{beneficiary.name}</h4>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2 break-all">{beneficiary.iban}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{beneficiary.bankName}</p>
                    {beneficiary.lastUsed && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {t("transfers.beneficiaries.lastUsed")}: {formatDate(beneficiary.lastUsed, 'short')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("transfers.scheduled.title")}</h3>
            </div>
            
            {scheduledTransfers.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">{t("transfers.scheduled.noScheduledTransfers")}</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">{t("transfers.scheduled.scheduleTransfersMessage")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledTransfers
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transfer) => (
                  <div key={transfer.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                          <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{transfer.description}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {transfer.fromAccount} → {transfer.toAccount}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {t("transfers.scheduled.for")}: {transfer.scheduledDate && formatDate(transfer.scheduledDate, 'long')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transfer.type === 'external' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {transfer.type === 'external' ? '-' : ''}{formatCurrency(transfer.amount, 'EUR')}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <Clock className="w-3 h-3 mr-1" />
                          {t("transfers.status.scheduled")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Limites de transfert et Historique - seulement pour l'onglet principal */}
      {activeTab === 'new' && (
        <>
          {/* Limites de transfert */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("transfers.transferLimits")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {transferLimits.map((limit) => (
                <div key={limit.type} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 md:p-4">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{limit.description}</p>
                  <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {limit.type === 'processing' ? (
                      <>0-2 <span className="text-xs md:text-sm font-normal">{t("transfers.businessDays")}</span></>
                    ) : (
                      formatCurrency(limit.amount, limit.currency)
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Historique des transferts - Version responsive */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("transfers.history")}</h2>
            </div>

            <KycProtectedContent
              titleKey="transfers.history"
              fallbackMessage={String(t('kyc.noTransfersAvailable'))}
            >
              {loading ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t("common.loading")}</span>
                  </div>
                </div>
              ) : filteredTransfers.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">{t("transfers.noTransfersFound")}</p>
                </div>
              ) : (
                <>
                                  {/* Version Mobile - Cartes */}
                <div className="block md:hidden space-y-3">
                  {paginatedTransfers.map((transfer) => (
                    <div 
                      key={transfer.id} 
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                    >
                      {/* En-tête de la carte */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            transfer.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                            transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                            transfer.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            transfer.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {transfer.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {transfer.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {transfer.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {transfer.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {transfer.status === 'cancelled' && <X className="w-3 h-3 mr-1" />}
                            {transfer.status === 'completed' ? 'Terminé' : 
                             transfer.status === 'pending' ? 'En attente' : 
                             transfer.status === 'processing' ? 'En cours' :
                             transfer.status === 'failed' ? 'Échoué' : 
                             transfer.status === 'cancelled' ? 'Annulé' : 'Inconnu'}
                          </span>
                        </div>
                        <span className={`text-lg font-bold ${transfer.type === 'external' ? 'text-red-600' : 'text-blue-600'}`}>
                          {transfer.type === 'external' ? '-' : ''}{formatCurrency(transfer.amount, 'EUR')}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                          {transfer.description}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getAccountName(transfer.fromAccount)} → {getAccountName(transfer.toAccount)}
                        </p>
                      </div>

                      {/* Date et bouton détails */}
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transfer.date, 'short')}
                        </div>
                        <button
                          onClick={() => handleTransferClick(transfer)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          {t("transfers.viewDetails")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                  {/* Version Desktop - Table */}
                  <div className="hidden md:block overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t("common.date")}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t("transfers.description")}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t("common.type")}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t("common.status")}
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t("transfers.amount")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedTransfers.map((transfer) => (
                          <tr 
                            key={transfer.id} 
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            onClick={() => handleTransferClick(transfer)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatDate(transfer.date, 'short')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {transfer.description}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {getAccountName(transfer.fromAccount)} → {getAccountName(transfer.toAccount)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transfer.type === 'internal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : transfer.type === 'external' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>
                                {t(`transfers.type.${transfer.type}`)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                transfer.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                transfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                                transfer.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                transfer.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}>
                                {transfer.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {transfer.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                {transfer.status === 'processing' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                {transfer.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {transfer.status === 'cancelled' && <X className="w-3 h-3 mr-1" />}
                                {transfer.status === 'completed' ? 'Terminé' : 
                                 transfer.status === 'pending' ? 'En attente' : 
                                 transfer.status === 'processing' ? 'En cours' :
                                 transfer.status === 'failed' ? 'Échoué' : 
                                 transfer.status === 'cancelled' ? 'Annulé' : 'Inconnu'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                              <span className={transfer.type === 'external' ? 'text-red-600' : 'text-blue-600'}>
                                {transfer.type === 'external' ? '-' : ''}{formatCurrency(transfer.amount, 'EUR')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Contrôles de pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {t("transactions.pagination.showing")} {startIndex + 1} à {Math.min(endIndex, filteredTransfers.length)} {t("transactions.pagination.transactions")} {t("transactions.pagination.of")} {filteredTransfers.length}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("transactions.pagination.previous")}
                        </button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {t("transactions.pagination.page")} {currentPage} {t("transactions.pagination.of")} {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {t("transactions.pagination.next")}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </KycProtectedContent>
          </div>

      {/* Modal de détails du transfert */}
      {selectedTransfer && (
        <TransferDetailsModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
        />
      )}

      {/* Modal Nouveau Transfert */}
      {showNewTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {transferType === 'internal' ? t("transfers.internalTransfer") : t("transfers.externalTransfer")}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                onClick={closeAllModals}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {/* Compte source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.form.sourceAccount")}
                </label>
                <select 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.fromAccount}
                  onChange={(e) => handleFormChange('fromAccount', e.target.value)}
                >
                  <option value="">{t("transfers.form.selectAccount")}</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {getAccountName(account)} - {formatCurrency(account.balance, account.currency)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Compte destination */}
              {transferType === 'internal' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("transfers.form.destinationAccount")}
                  </label>
                  <select 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.toAccount}
                    onChange={(e) => handleFormChange('toAccount', e.target.value)}
                  >
                    <option value="">{t("transfers.form.selectAccount")}</option>
                    {accounts.filter(acc => acc.id !== formData.fromAccount).map((account) => (
                      <option key={account.id} value={account.id}>
                        {getAccountName(account)} - {formatCurrency(account.balance, account.currency)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("transfers.form.beneficiary")}
                    </label>
                    <select 
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={formData.toAccount}
                      onChange={(e) => {
                        const beneficiary = beneficiaries.find(b => b.id === e.target.value);
                        handleFormChange('toAccount', e.target.value);
                        handleFormChange('beneficiaryName', beneficiary?.name || '');
                      }}
                    >
                      <option value="">{t("transfers.form.selectBeneficiary")}</option>
                      {beneficiaries
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((beneficiary) => (
                          <option key={beneficiary.id} value={beneficiary.id}>
                            {beneficiary.name} - {beneficiary.iban}
                          </option>
                        ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("transfers.form.ibanNewBeneficiary")}
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="FR76 3000 6000 0112 3456 7890 189"
                      value={formData.toIban}
                      onChange={(e) => handleFormChange('toIban', e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.form.amount")} (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.form.description")}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={String(t("transfers.form.descriptionPlaceholder"))}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </div>

              {/* Référence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.form.reference")} ({t("common.optional")})
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={String(t("transfers.form.referencePlaceholder"))}
                  value={formData.reference}
                  onChange={(e) => handleFormChange('reference', e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button 
                className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={closeAllModals}
              >
                {t("common.cancel")}
              </button>
              <button 
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmitTransfer}
                disabled={!formData.fromAccount || !formData.toAccount || !formData.amount || !formData.description}
              >
                {t("transfers.form.submitTransfer")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bénéficiaire */}
      {showBeneficiaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedBeneficiary ? t("transfers.beneficiaries.editTitle") : t("transfers.beneficiaries.addTitle")}
              </h3>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                onClick={() => {
                  setShowBeneficiaryModal(false);
                  resetForms();
                  setActiveTab('beneficiaries'); // Rester sur l'onglet bénéficiaires
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {/* Nom du bénéficiaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.beneficiaries.form.fullName")} *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={String(t("transfers.beneficiaries.form.fullNamePlaceholder"))}
                  value={beneficiaryFormData.name}
                  onChange={(e) => handleBeneficiaryFormChange('name', e.target.value)}
                />
              </div>

              {/* IBAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IBAN *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="FR76 3000 6000 0112 3456 7890 189"
                  value={beneficiaryFormData.iban}
                  onChange={(e) => handleBeneficiaryFormChange('iban', e.target.value)}
                />
              </div>

              {/* BIC/SWIFT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  BIC/SWIFT
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="BANKFUI9388"
                  value={beneficiaryFormData.bic}
                  onChange={(e) => handleBeneficiaryFormChange('bic', e.target.value)}
                />
              </div>

              {/* Surnom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.beneficiaries.form.nickname")} ({t("common.optional")})
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={String(t("transfers.beneficiaries.form.nicknamePlaceholder"))}
                  value={beneficiaryFormData.nickname}
                  onChange={(e) => handleBeneficiaryFormChange('nickname', e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setShowBeneficiaryModal(false);
                  resetForms();
                  setActiveTab('beneficiaries'); // Rester sur l'onglet bénéficiaires
                }}
              >
                {t("common.cancel")}
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmitBeneficiary}
                disabled={!beneficiaryFormData.name || !beneficiaryFormData.iban}
              >
                {selectedBeneficiary ? t("common.edit") : t("common.add")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Virement Programmés */}
      {showScheduledTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[65] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("transfers.scheduled.modalTitle")}</h3>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => {
                  setShowScheduledTransferModal(false);
                  resetForms();
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Compte source */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.form.sourceAccount")}
                </label>
                <select 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.fromAccount}
                  onChange={(e) => handleFormChange('fromAccount', e.target.value)}
                >
                  <option value="">{t("transfers.form.selectAccount")}</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {getAccountName(account)} - {formatCurrency(account.balance, account.currency)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bénéficiaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.form.beneficiary")}
                </label>
                <select 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.toAccount}
                  onChange={(e) => {
                    const beneficiary = beneficiaries.find(b => b.id === e.target.value);
                    handleFormChange('toAccount', e.target.value);
                    handleFormChange('beneficiaryName', beneficiary?.name || '');
                  }}
                >
                  <option value="">{t("transfers.form.selectBeneficiary")}</option>
                  {beneficiaries
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((beneficiary) => (
                      <option key={beneficiary.id} value={beneficiary.id}>
                        {beneficiary.name} - {beneficiary.iban}
                      </option>
                    ))}
                </select>
              </div>

              {/* Montant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.form.amount")} (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0,00"
                  value={formData.amount}
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                />
              </div>

              {/* Date de programmation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.scheduled.scheduleDate")} *
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.scheduledDate}
                  onChange={(e) => handleFormChange('scheduledDate', e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.form.description")}
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={String(t("transfers.scheduled.descriptionPlaceholder"))}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                />
              </div>

              {/* Référence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("transfers.form.reference")} ({t("common.optional")})
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={String(t("transfers.form.referencePlaceholder"))}
                  value={formData.reference}
                  onChange={(e) => handleFormChange('reference', e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button 
                className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setShowScheduledTransferModal(false);
                  resetForms();
                }}
              >
                {t("common.cancel")}
              </button>
              <button 
                className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmitTransfer}
                disabled={!formData.fromAccount || !formData.toAccount || !formData.amount || !formData.description || !formData.scheduledDate}
              >
                {t("transfers.scheduled.scheduleTransfer")}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      )}

      {/* Boîte de dialogue pour virement externe */}
      {showExternalTransferDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                  <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("transfers.externalDialog.title")}
                </h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("transfers.externalDialog.message")}
                <strong>{t("transfers.externalDialog.evaluationMessage")}</strong>
              </p>
              
              {pendingTransfer && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("transfers.amount")}:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      -{formatCurrency(pendingTransfer.amount, 'EUR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("transfers.form.beneficiary")}:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {pendingTransfer.beneficiaryName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("transfers.reference")}:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {pendingTransfer.reference}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">{t("transfers.externalDialog.nextSteps")}:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <strong>{t("transfers.status.pending")}</strong> : {t("transfers.externalDialog.pendingDescription")}</li>
                  <li>• <strong>{t("transfers.status.processing")}</strong> : {t("transfers.externalDialog.processingDescription")}</li>
                  <li>• <strong>{t("transfers.status.completed")}</strong> : {t("transfers.externalDialog.completedDescription")}</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors font-medium"
                onClick={handleConfirmExternalTransfer}
              >
                {t("transfers.externalDialog.understood")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransfersPage;