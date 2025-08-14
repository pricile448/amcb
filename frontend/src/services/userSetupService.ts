import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logger } from '../utils/logger';

export interface UserSetupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  residenceCountry: string;
  address: string;
  city: string;
  postalCode: string;
  profession: string;
  salary: string;
}

export class UserSetupService {
  /**
   * Crée automatiquement tous les sous-documents pour un nouvel utilisateur
   * Certains éléments seront visibles seulement après vérification KYC
   */
  static async createCompleteUserSetup(userId: string, userData: UserSetupData): Promise<void> {
    try {
      logger.debug('🔄 Création complète du setup utilisateur pour:', userId);

      // 1. Créer le document utilisateur principal
      await this.createMainUserDocument(userId, userData);
      
      // 2. Créer les comptes bancaires par défaut
      await this.createDefaultAccounts(userId);
      
      // 3. Créer la facturation par défaut (visible après KYC verified)
      await this.createDefaultBilling(userId, userData);
      
      // 4. Créer les budgets par défaut
      await this.createDefaultBudgets(userId);
      
      // 5. Créer les préférences de notifications
      await this.createNotificationPreferences(userId);
      
      // 6. Créer les limites de carte par défaut
      await this.createDefaultCardLimits(userId);
      
      // 7. Créer les documents par défaut
      await this.createDefaultDocuments(userId);
      
      // 8. Créer les transactions initiales
      await this.createInitialTransactions(userId);
      
      // 9. Créer les bénéficiaires par défaut (si applicable)
      await this.createDefaultBeneficiaries(userId, userData);
      
      // 10. Créer les virements par défaut
      await this.createDefaultTransfers(userId);

      logger.success('✅ Setup utilisateur complet créé avec succès');
      
    } catch (error) {
      logger.error('❌ Erreur lors de la création du setup utilisateur:', error);
      throw error;
    }
  }

  /**
   * Crée le document utilisateur principal
   */
  private static async createMainUserDocument(userId: string, userData: UserSetupData): Promise<void> {
    const userDoc = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      dob: new Date(userData.birthDate),
      pob: userData.birthPlace,
      nationality: userData.nationality,
      residenceCountry: userData.residenceCountry,
      address: userData.address,
      city: userData.city,
      postalCode: userData.postalCode,
      profession: userData.profession,
      salary: parseInt(userData.salary),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      emailVerified: false,
      emailVerificationCode: null,
      emailVerificationCodeExpires: null,
      emailVerifiedAt: null,
      isEmailVerified: false,
      isPhoneVerified: false,
      kycStatus: 'unverified',
      role: 'user',
      status: 'pending',
      inactivityTimeout: 5,
      hasPendingVirtualCardRequest: false,
      cardRequestedAt: null,
      cardStatus: 'not_requested',
      cardType: null,
      rejectedAt: null,
      validatedAt: null,
      verifiedAt: null
    };

    await setDoc(doc(db, 'users', userId), userDoc);
    logger.debug('✅ Document utilisateur principal créé');
  }

  /**
   * Crée les comptes bancaires par défaut
   */
  private static async createDefaultAccounts(userId: string): Promise<void> {
    const defaultAccounts = [
      {
        id: 'checking-1',
        name: 'checking',
        accountType: 'checking',
        balance: 0,
        currency: 'EUR',
        status: 'active',
        accountNumber: `**** **** **** ${Math.floor(Math.random() * 9000) + 1000}`,
        createdAt: new Date()
      },
      {
        id: 'savings-1',
        name: 'savings',
        accountType: 'savings',
        balance: 0,
        currency: 'EUR',
        status: 'active',
        accountNumber: `**** **** **** ${Math.floor(Math.random() * 9000) + 5000}`,
        createdAt: new Date()
      },
      {
        id: 'credit-1',
        name: 'credit',
        accountType: 'credit',
        balance: 0,
        currency: 'EUR',
        status: 'active',
        accountNumber: `**** **** **** ${Math.floor(Math.random() * 9000) + 9000}`,
        createdAt: new Date()
      }
    ];

    await updateDoc(doc(db, 'users', userId), {
      accounts: defaultAccounts,
      defaultAccountsCreated: true,
      defaultAccountsCreatedAt: new Date()
    });
    logger.debug('✅ Comptes bancaires par défaut créés');
  }

  /**
   * Crée la facturation par défaut (visible après KYC verified)
   */
  private static async createDefaultBilling(userId: string, userData: UserSetupData): Promise<void> {
    const billingData = {
      billingVisible: false, // Sera visible après KYC verified
      billingHolder: `${userData.firstName} ${userData.lastName}`,
      billingIban: `FR76 1652 8001 3100 0074 9591 ${Math.floor(Math.random() * 900) + 100}`,
      billingBic: 'SMOEFRP1',
      billingText: `Bonjour ${userData.firstName} ${userData.lastName}, votre compte est en cours de validation. Une fois votre KYC vérifié, vous aurez accès à toutes les fonctionnalités.`
    };

    await updateDoc(doc(db, 'users', userId), {
      billing: billingData
    });
    logger.debug('✅ Facturation par défaut créée (masquée jusqu\'à KYC verified)');
  }

  /**
   * Crée les budgets par défaut
   */
  private static async createDefaultBudgets(userId: string): Promise<void> {
    const defaultBudgets = [
      {
        id: `budget_${userId}_food`,
        name: 'Alimentation',
        category: 'Alimentation',
        amount: 300,
        spent: 0,
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: 'on-track',
        color: 'bg-green-500',
        icon: '🛒'
      },
      {
        id: `budget_${userId}_transport`,
        name: 'Transport',
        category: 'Transport',
        amount: 150,
        spent: 0,
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: 'on-track',
        color: 'bg-blue-500',
        icon: '🚇'
      },
      {
        id: `budget_${userId}_entertainment`,
        name: 'Loisirs',
        category: 'Loisirs',
        amount: 200,
        spent: 0,
        period: 'monthly',
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: 'on-track',
        color: 'bg-purple-500',
        icon: '🎬'
      }
    ];

    await updateDoc(doc(db, 'users', userId), {
      budgets: defaultBudgets,
      defaultBudgetsCreated: true,
      defaultBudgetsCreatedAt: new Date()
    });
    logger.debug('✅ Budgets par défaut créés');
  }

  /**
   * Crée les préférences de notifications
   */
  private static async createNotificationPreferences(userId: string): Promise<void> {
    const notificationPrefs = {
      email: true,
      security: true,
      promotions: false
    };

    await updateDoc(doc(db, 'users', userId), {
      notificationPrefs: notificationPrefs
    });
    logger.debug('✅ Préférences de notifications créées');
  }

  /**
   * Crée les limites de carte par défaut
   */
  private static async createDefaultCardLimits(userId: string): Promise<void> {
    const cardLimits = {
      monthly: 2000,
      withdrawal: 500
    };

    await updateDoc(doc(db, 'users', userId), {
      cardLimits: cardLimits
    });
    logger.debug('✅ Limites de carte par défaut créées');
  }

  /**
   * Crée les documents par défaut
   */
  private static async createDefaultDocuments(userId: string): Promise<void> {
    const defaultDocuments = [
      {
        id: `doc_${userId}_id`,
        name: 'Pièce d\'identité',
        type: 'identity',
        status: 'pending',
        uploadedAt: new Date(),
        verifiedAt: null
      },
      {
        id: `doc_${userId}_proof`,
        name: 'Justificatif de domicile',
        type: 'proof_of_address',
        status: 'pending',
        uploadedAt: new Date(),
        verifiedAt: null
      }
    ];

    await updateDoc(doc(db, 'users', userId), {
      documents: defaultDocuments
    });
    logger.debug('✅ Documents par défaut créés');
  }

  /**
   * Crée les transactions initiales
   */
  private static async createInitialTransactions(userId: string): Promise<void> {
    const initialTransactions = [
      {
        id: `txn_${Date.now()}`,
        accountId: 'checking-1',
        amount: 0,
        currency: 'EUR',
        category: 'Initialisation',
        description: 'Création du compte',
        date: new Date(),
        status: 'completed',
        type: 'initialization'
      }
    ];

    await updateDoc(doc(db, 'users', userId), {
      transactions: initialTransactions
    });
    logger.debug('✅ Transactions initiales créées');
  }

  /**
   * Crée les bénéficiaires par défaut
   */
  private static async createDefaultBeneficiaries(userId: string, userData: UserSetupData): Promise<void> {
    const defaultBeneficiaries = [
      {
        id: `beneficiary_${Date.now()}`,
        name: `${userData.firstName} ${userData.lastName}`,
        nickname: 'Moi-même',
        iban: `FR76 1652 8001 3100 0074 9591 ${Math.floor(Math.random() * 900) + 100}`,
        bic: 'SMOEFRP1'
      }
    ];

    await updateDoc(doc(db, 'users', userId), {
      beneficiaries: defaultBeneficiaries
    });
    logger.debug('✅ Bénéficiaires par défaut créés');
  }

  /**
   * Crée les virements par défaut
   */
  private static async createDefaultTransfers(userId: string): Promise<void> {
    const defaultTransfers: any[] = [];

    await updateDoc(doc(db, 'users', userId), {
      transfers: defaultTransfers
    });
    logger.debug('✅ Virements par défaut créés');
  }

  /**
   * Met à jour la visibilité des éléments après vérification KYC
   */
  static async updateVisibilityAfterKyc(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        'billing.billingVisible': true,
        kycStatus: 'verified',
        verifiedAt: new Date()
      });
      
      logger.success('✅ Visibilité mise à jour après vérification KYC');
    } catch (error) {
      logger.error('❌ Erreur lors de la mise à jour de la visibilité:', error);
      throw error;
    }
  }

  /**
   * Vérifie si le setup complet existe déjà
   */
  static async checkCompleteSetupExists(userId: string): Promise<boolean> {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData?.defaultAccountsCreated === true && 
               userData?.defaultBudgetsCreated === true;
      }
      return false;
    } catch (error) {
      logger.error('❌ Erreur lors de la vérification du setup complet:', error);
      return false;
    }
  }
}
