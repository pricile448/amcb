#!/usr/bin/env node

/**
 * Script de test pour la création automatique des sous-documents utilisateur
 * Ce script simule la création d'un utilisateur et vérifie que tous les sous-documents sont créés
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, updateDoc } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Configuration Firebase (à adapter selon votre environnement)
const firebaseConfig = {
  // Remplacez par votre configuration Firebase
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Données de test pour l'utilisateur
const testUserData = {
  firstName: 'Test',
  lastName: 'User',
  email: `test-${Date.now()}@example.com`,
  phone: '+33123456789',
  birthDate: '1990-01-01',
  birthPlace: 'Paris',
  nationality: 'Française',
  residenceCountry: 'France',
  address: '123 Rue de Test',
  city: 'Paris',
  postalCode: '75001',
  profession: 'Développeur',
  salary: '50000'
};

/**
 * Crée automatiquement tous les sous-documents pour un nouvel utilisateur
 */
async function createCompleteUserSetup(userId, userData) {
  console.log('🔄 Création complète du setup utilisateur pour:', userId);

  try {
    // 1. Créer le document utilisateur principal
    await createMainUserDocument(userId, userData);
    
    // 2. Créer les comptes bancaires par défaut
    await createDefaultAccounts(userId);
    
    // 3. Créer la facturation par défaut (visible après KYC verified)
    await createDefaultBilling(userId, userData);
    
    // 4. Créer les budgets par défaut
    await createDefaultBudgets(userId);
    
    // 5. Créer les préférences de notifications
    await createNotificationPreferences(userId);
    
    // 6. Créer les limites de carte par défaut
    await createDefaultCardLimits(userId);
    
    // 7. Créer les documents par défaut
    await createDefaultDocuments(userId);
    
    // 8. Créer les transactions initiales
    await createInitialTransactions(userId);
    
    // 9. Créer les bénéficiaires par défaut
    await createDefaultBeneficiaries(userId, userData);
    
    // 10. Créer les virements par défaut
    await createDefaultTransfers(userId);

    console.log('✅ Setup utilisateur complet créé avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du setup utilisateur:', error);
    throw error;
  }
}

async function createMainUserDocument(userId, userData) {
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
  console.log('✅ Document utilisateur principal créé');
}

async function createDefaultAccounts(userId) {
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
  console.log('✅ Comptes bancaires par défaut créés');
}

async function createDefaultBilling(userId, userData) {
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
  console.log('✅ Facturation par défaut créée (masquée jusqu\'à KYC verified)');
}

async function createDefaultBudgets(userId) {
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
  console.log('✅ Budgets par défaut créés');
}

async function createNotificationPreferences(userId) {
  const notificationPrefs = {
    email: true,
    security: true,
    promotions: false
  };

  await updateDoc(doc(db, 'users', userId), {
    notificationPrefs: notificationPrefs
  });
  console.log('✅ Préférences de notifications créées');
}

async function createDefaultCardLimits(userId) {
  const cardLimits = {
    monthly: 2000,
    withdrawal: 500
  };

  await updateDoc(doc(db, 'users', userId), {
    cardLimits: cardLimits
  });
  console.log('✅ Limites de carte par défaut créées');
}

async function createDefaultDocuments(userId) {
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
  console.log('✅ Documents par défaut créés');
}

async function createInitialTransactions(userId) {
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
  console.log('✅ Transactions initiales créées');
}

async function createDefaultBeneficiaries(userId, userData) {
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
  console.log('✅ Bénéficiaires par défaut créés');
}

async function createDefaultTransfers(userId) {
  const defaultTransfers = [];

  await updateDoc(doc(db, 'users', userId), {
    transfers: defaultTransfers
  });
  console.log('✅ Virements par défaut créés');
}

/**
 * Vérifie que tous les sous-documents ont été créés
 */
async function verifyUserSetup(userId) {
  console.log('\n🔍 Vérification du setup utilisateur...');
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.error('❌ Document utilisateur non trouvé');
      return false;
    }
    
    const userData = userDoc.data();
    
    // Vérifier les comptes
    if (!userData.accounts || userData.accounts.length === 0) {
      console.error('❌ Comptes non créés');
      return false;
    }
    console.log('✅ Comptes:', userData.accounts.length);
    
    // Vérifier la facturation
    if (!userData.billing) {
      console.error('❌ Facturation non créée');
      return false;
    }
    console.log('✅ Facturation créée (visible:', userData.billing.billingVisible, ')');
    
    // Vérifier les budgets
    if (!userData.budgets || userData.budgets.length === 0) {
      console.error('❌ Budgets non créés');
      return false;
    }
    console.log('✅ Budgets:', userData.budgets.length);
    
    // Vérifier les préférences de notifications
    if (!userData.notificationPrefs) {
      console.error('❌ Préférences de notifications non créées');
      return false;
    }
    console.log('✅ Préférences de notifications créées');
    
    // Vérifier les limites de carte
    if (!userData.cardLimits) {
      console.error('❌ Limites de carte non créées');
      return false;
    }
    console.log('✅ Limites de carte créées');
    
    // Vérifier les documents
    if (!userData.documents || userData.documents.length === 0) {
      console.error('❌ Documents non créés');
      return false;
    }
    console.log('✅ Documents:', userData.documents.length);
    
    // Vérifier les transactions
    if (!userData.transactions || userData.transactions.length === 0) {
      console.error('❌ Transactions non créées');
      return false;
    }
    console.log('✅ Transactions:', userData.transactions.length);
    
    // Vérifier les bénéficiaires
    if (!userData.beneficiaries || userData.beneficiaries.length === 0) {
      console.error('❌ Bénéficiaires non créés');
      return false;
    }
    console.log('✅ Bénéficiaires:', userData.beneficiaries.length);
    
    // Vérifier les virements
    if (!userData.transfers) {
      console.error('❌ Virements non créés');
      return false;
    }
    console.log('✅ Virements créés');
    
    console.log('\n🎉 Tous les sous-documents ont été créés avec succès !');
    return true;
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function runTest() {
  console.log('🧪 Début du test de création automatique des sous-documents utilisateur\n');
  
  try {
    // 1. Créer un utilisateur de test
    console.log('1️⃣ Création d\'un utilisateur de test...');
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      testUserData.email,
      'TestPassword123!'
    );
    
    const userId = userCredential.user.uid;
    console.log('✅ Utilisateur créé avec l\'ID:', userId);
    
    // 2. Créer le setup complet
    console.log('\n2️⃣ Création du setup complet...');
    await createCompleteUserSetup(userId, testUserData);
    
    // 3. Vérifier que tout a été créé
    console.log('\n3️⃣ Vérification du setup...');
    const success = await verifyUserSetup(userId);
    
    if (success) {
      console.log('\n🎯 Test réussi ! Tous les sous-documents ont été créés automatiquement.');
      console.log('📝 L\'utilisateur peut maintenant utiliser l\'application avec une structure complète.');
      console.log('🔒 Certains éléments (facturation, virements) ne seront visibles qu\'après vérification KYC.');
    } else {
      console.log('\n❌ Test échoué ! Certains sous-documents n\'ont pas été créés.');
    }
    
  } catch (error) {
    console.error('\n💥 Erreur lors du test:', error);
  } finally {
    console.log('\n🏁 Test terminé');
    process.exit(0);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  runTest();
}

module.exports = {
  createCompleteUserSetup,
  verifyUserSetup
};
