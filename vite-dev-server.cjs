const express = require('express');
const cors = require('cors');
const { createServer: createViteServer } = require('vite');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5173;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration email avec SMTP professionnel
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'mail.votre-domaine.com', // ex: mail.amcb.com
  port: process.env.SMTP_PORT || 587, // 587 pour TLS, 465 pour SSL
  secure: process.env.SMTP_SECURE === 'true', // true pour 465, false pour 587
  auth: {
    user: process.env.SMTP_USER || 'noreply@votre-domaine.com',
    pass: process.env.SMTP_PASS || 'votre-mot-de-passe-email'
  },
  tls: {
    rejectUnauthorized: false // Pour éviter les erreurs de certificat en développement
  }
});

// Test Firebase import
let admin, db;
try {
  const firebaseConfig = require('./firebase-config.cjs');
  admin = firebaseConfig.admin;
  db = firebaseConfig.db;
  console.log('✅ Firebase importé avec succès');
} catch (error) {
  console.error('❌ Erreur import Firebase:', error);
  process.exit(1);
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ===== AUTHENTIFICATION FIREBASE =====
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log(`🔐 Tentative de connexion pour: ${email}`);
    
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    if (userData.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    const customToken = await admin.auth().createCustomToken(userDoc.id);
    
    console.log(`✅ Connexion réussie pour: ${email}`);
    
    res.json({
      access: customToken,
      refresh: `refresh_${generateId()}`,
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName || 'Utilisateur',
        lastName: userData.lastName || '',
        role: userData.role || 'user',
        isEmailVerified: userData.isEmailVerified || false,
        isPhoneVerified: userData.isPhoneVerified || false,
        verificationStatus: userData.verificationStatus || 'unverified'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur authentification Firebase:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    phone, 
    birthDate, 
    birthPlace, 
    nationality, 
    residenceCountry, 
    address, 
    city, 
    postalCode, 
    profession, 
    salary 
  } = req.body;
  
  try {
    console.log(`📝 Tentative d'inscription pour: ${email}`);
    console.log('📋 Données reçues:', { 
      email, firstName, lastName, phone, birthDate, birthPlace, 
      nationality, residenceCountry, address, city, postalCode, 
      profession, salary 
    });
    
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();
    
    if (!userSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Créer l'objet utilisateur complet avec tous les champs
    const newUser = {
      // Informations de base
      email,
      password,
      firstName: firstName || 'Nouveau',
      lastName: lastName || 'Utilisateur',
      
      // Informations de contact
      phone: phone || '',
      
      // Informations personnelles
      birthDate: birthDate || '',
      birthPlace: birthPlace || '',
      nationality: nationality || '',
      residenceCountry: residenceCountry || '',
      
      // Adresse
      address: address || '',
      city: city || '',
      postalCode: postalCode || '',
      
      // Informations professionnelles
      profession: profession || '',
      salary: salary ? parseInt(salary) : 0,
      
      // Statuts et rôles
      verificationStatus: 'unverified',
      kycStatus: 'unverified',
      role: 'user',
      isEmailVerified: false,
      isPhoneVerified: false,
      
      // Données bancaires (initialisées vides)
      accounts: [],
      transactions: [],
      beneficiaries: [],
      iban: null,
      budgets: [],
      notifications: [],
      
      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const userRef = await usersRef.add(newUser);
    const customToken = await admin.auth().createCustomToken(userRef.id);
    
    console.log(`✅ Inscription réussie pour: ${email} (ID: ${userRef.id})`);
    console.log('📊 Utilisateur créé avec tous les champs:', Object.keys(newUser));
    
    res.status(201).json({
      access: customToken,
      refresh: `refresh_${generateId()}`,
      user: {
        id: userRef.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        birthDate: newUser.birthDate,
        birthPlace: newUser.birthPlace,
        nationality: newUser.nationality,
        residenceCountry: newUser.residenceCountry,
        address: newUser.address,
        city: newUser.city,
        postalCode: newUser.postalCode,
        profession: newUser.profession,
        salary: newUser.salary,
        role: newUser.role,
        isEmailVerified: newUser.isEmailVerified,
        isPhoneVerified: newUser.isPhoneVerified,
        verificationStatus: newUser.verificationStatus,
        kycStatus: newUser.kycStatus
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur création utilisateur Firebase:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du compte'
    });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refresh } = req.body;
  
  if (refresh) {
    const accessToken = `access_${generateId()}`;
    const refreshToken = `refresh_${generateId()}`;
    
    res.json({
      access: accessToken,
      refresh: refreshToken
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Token de rafraîchissement invalide'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// ===== COMPTES =====
app.get('/api/accounts/profile/', async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.limit(1).get();
    
    if (userSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    res.json({
      success: true,
      data: {
        id: userDoc.id,
        // Informations de base
        email: userData.email,
        firstName: userData.firstName || 'Utilisateur',
        lastName: userData.lastName || '',
        
        // Informations de contact
        phone: userData.phone || '',
        
        // Informations personnelles
        birthDate: userData.birthDate || '',
        birthPlace: userData.birthPlace || '',
        nationality: userData.nationality || '',
        residenceCountry: userData.residenceCountry || '',
        
        // Adresse
        address: userData.address || '',
        city: userData.city || '',
        postalCode: userData.postalCode || '',
        
        // Informations professionnelles
        profession: userData.profession || '',
        salary: userData.salary || 0,
        
        // Statuts et rôles
        role: userData.role || 'user',
        isEmailVerified: userData.isEmailVerified || false,
        isPhoneVerified: userData.isPhoneVerified || false,
        verificationStatus: userData.verificationStatus || 'unverified',
        kycStatus: userData.kycStatus || 'unverified',
        
        // Timestamps
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Endpoint pour récupérer les comptes d'un utilisateur spécifique
app.get('/api/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Récupérer les comptes depuis la collection users
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = userDoc.data();
    const accounts = userData.accounts || [];
    
    console.log(`✅ ${accounts.length} comptes récupérés pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      accounts: accounts
    });
  } catch (error) {
    console.error('❌ Erreur récupération comptes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});



app.post('/api/accounts/profile/update/', async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    
    if (userId) {
      await db.collection('users').doc(userId).update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.json({
      success: true,
      message: 'Profil mis à jour'
    });
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.post('/api/accounts/change-password/', (req, res) => {
  res.json({
    success: true,
    message: 'Mot de passe modifié'
  });
});

app.post('/api/accounts/verify-email/', (req, res) => {
  res.json({
    success: true,
    message: 'Email vérifié'
  });
});

app.post('/api/accounts/reset-password/', (req, res) => {
  res.json({
    success: true,
    message: 'Email de réinitialisation envoyé'
  });
});

// ===== TRANSACTIONS =====
app.get('/api/transactions/', (req, res) => {
  const mockTransactions = [
    {
      id: 'tx1',
      userId: 'user123',
      accountId: 'acc1',
      type: 'transfer',
      amount: -150.00,
      currency: 'EUR',
      description: 'Paiement carte',
      date: new Date().toISOString(),
      status: 'completed'
    },
    {
      id: 'tx2',
      userId: 'user123',
      accountId: 'acc1',
      type: 'deposit',
      amount: 500.00,
      currency: 'EUR',
      description: 'Virement reçu',
      date: new Date().toISOString(),
      status: 'completed'
    }
  ];
  
  res.json({
    success: true,
    data: mockTransactions
  });
});

// Endpoint pour récupérer les transactions d'un utilisateur spécifique
app.get('/api/transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Récupérer les transactions depuis la collection users
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = userDoc.data();
    const transactions = userData.transactions || [];
    
    console.log(`✅ ${transactions.length} transactions récupérées pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      transactions: transactions
    });
  } catch (error) {
    console.error('❌ Erreur récupération transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});



app.get('/api/transactions/history/', (req, res) => {
  const mockTransactions = [
    {
      id: 'tx1',
      userId: 'user123',
      accountId: 'acc1',
      type: 'transfer',
      amount: -150.00,
      currency: 'EUR',
      description: 'Paiement carte',
      date: new Date().toISOString(),
      status: 'completed'
    },
    {
      id: 'tx2',
      userId: 'user123',
      accountId: 'acc1',
      type: 'deposit',
      amount: 500.00,
      currency: 'EUR',
      description: 'Virement reçu',
      date: new Date().toISOString(),
      status: 'completed'
    }
  ];
  
  res.json({
    success: true,
    data: mockTransactions
  });
});

app.post('/api/transactions/', async (req, res) => {
  try {
    const { userId, ...transactionData } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId requis'
      });
    }
    
    const newTransaction = {
      id: generateId(),
      ...transactionData,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    // Récupérer l'utilisateur actuel
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = userDoc.data();
    const currentTransactions = userData.transactions || [];
    
    // Ajouter la nouvelle transaction
    const updatedTransactions = [...currentTransactions, newTransaction];
    
    // Mettre à jour l'utilisateur avec la nouvelle transaction
    await db.collection('users').doc(userId).update({
      transactions: updatedTransactions
    });
    
    console.log(`✅ Nouvelle transaction ajoutée pour l'utilisateur ${userId}`);
    
    res.status(201).json({
      success: true,
      data: newTransaction
    });
  } catch (error) {
    console.error('❌ Erreur création transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/transactions/transfers/', (req, res) => {
  const mockTransfers = [
    {
      id: 'tx1',
      userId: 'user123',
      accountId: 'acc1',
      type: 'transfer',
      amount: -150.00,
      currency: 'EUR',
      description: 'Paiement carte',
      date: new Date().toISOString(),
      status: 'completed'
    }
  ];
  
  res.json({
    success: true,
    data: mockTransfers
  });
});

// ===== DOCUMENTS =====
app.get('/api/documents/', (req, res) => {
  const mockDocuments = [
    {
      id: 'doc1',
      userId: 'user123',
      name: 'Justificatif de domicile',
      type: 'proof_of_address',
      status: 'approved',
      uploadDate: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: mockDocuments
  });
});

// Endpoint pour récupérer les documents d'un utilisateur spécifique
app.get('/api/documents/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Récupérer les vrais documents depuis Firestore
    const documentsRef = db.collection('documents');
    const documentsSnapshot = await documentsRef.where('userId', '==', userId).get();
    
    const documents = [];
    documentsSnapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${documents.length} documents récupérés pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      documents: documents
    });
  } catch (error) {
    console.error('❌ Erreur récupération documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.post('/api/documents/upload/', (req, res) => {
  const newDocument = {
    id: generateId(),
    ...req.body,
    uploadDate: new Date().toISOString(),
    status: 'pending'
  };
  
  res.status(201).json({
    success: true,
    data: newDocument
  });
});

// ===== SUPPORT =====
app.get('/api/support/tickets/', (req, res) => {
  const mockTickets = [
    {
      id: 'ticket1',
      userId: 'user123',
      subject: 'Question sur mon compte',
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: mockTickets
  });
});

app.post('/api/support/tickets/create/', (req, res) => {
  const newTicket = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'open'
  };
  
  res.status(201).json({
    success: true,
    data: newTicket
  });
});

app.get('/api/support/messages/', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// ===== ENDPOINTS MANQUANTS =====

// Endpoint pour récupérer les virements d'un utilisateur
app.get('/api/transfers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Récupérer les vrais virements depuis Firestore
    const transfersRef = db.collection('transfers');
    const transfersSnapshot = await transfersRef.where('userId', '==', userId).get();
    
    const transfers = [];
    transfersSnapshot.forEach(doc => {
      transfers.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${transfers.length} virements récupérés pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      transfers: transfers
    });
  } catch (error) {
    console.error('❌ Erreur récupération virements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Endpoint pour récupérer les bénéficiaires d'un utilisateur
app.get('/api/beneficiaries/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Récupérer les bénéficiaires depuis la collection users
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = userDoc.data();
    const beneficiaries = userData.beneficiaries || [];
    
    console.log(`✅ ${beneficiaries.length} bénéficiaires récupérés pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      beneficiaries: beneficiaries
    });
  } catch (error) {
    console.error('❌ Erreur récupération bénéficiaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Endpoint pour récupérer les messages de chat d'un utilisateur
app.get('/api/chat/:userId', async (req, res) => {
  console.log(`💬 Endpoint chat appelé pour userId: ${req.params.userId}`);
  try {
    const { userId } = req.params;
    
    // Récupérer le chat de l'utilisateur (ou le créer s'il n'existe pas)
    // D'abord, essayer de trouver un chat avec userId
    let chatDoc = await db.collection('chats').where('userId', '==', userId).limit(1).get();
    
    // Si pas trouvé, chercher dans les participants
    if (chatDoc.empty) {
      console.log('🔍 Chat avec userId non trouvé, recherche dans les participants...');
      chatDoc = await db.collection('chats').where('participants', 'array-contains', userId).limit(1).get();
    }
    
    // Si toujours pas trouvé, chercher tous les chats et filtrer manuellement
    if (chatDoc.empty) {
      console.log('🔍 Aucun chat trouvé avec array-contains, recherche manuelle...');
      const allChats = await db.collection('chats').get();
      
      for (const doc of allChats.docs) {
        const chatData = doc.data();
        if (chatData.participants && chatData.participants.includes(userId)) {
          console.log(`✅ Chat trouvé manuellement: ${doc.id}`);
          chatDoc = { docs: [doc], empty: false };
          break;
        }
      }
    }
    
    let chatId;
    if (chatDoc.empty) {
      // Créer un nouveau chat pour l'utilisateur
      console.log('⚠️ Aucun chat trouvé, création d\'un nouveau chat');
      const newChat = {
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        participants: [userId, 'support']
      };
      
      const chatRef = await db.collection('chats').add(newChat);
      chatId = chatRef.id;
      
      // Créer un message de bienvenue
      const welcomeMessage = {
        text: 'Bonjour ! Je suis votre assistant virtuel AmCbunq. Comment puis-je vous aider aujourd\'hui ?',
        senderId: 'support',
        timestamp: new Date(),
        status: 'read'
      };
      
      await db.collection('chats').doc(chatId).collection('messages').add(welcomeMessage);
    } else {
      chatId = chatDoc.docs[0].id;
      console.log(`✅ Chat existant trouvé: ${chatId}`);
    }
    
    // Récupérer tous les messages du chat
    const messagesSnapshot = await db.collection('chats').doc(chatId).collection('messages').orderBy('timestamp', 'asc').get();
    
    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${messages.length} messages récupérés pour l'utilisateur ${userId} (chatId: ${chatId})`);
    
    res.json({
      success: true,
      messages: messages,
      chatId: chatId
    });
  } catch (error) {
    console.error('❌ Erreur récupération messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Endpoint pour ajouter un nouveau message
app.post('/api/chat/:userId', async (req, res) => {
  console.log(`💬 Endpoint ajout message appelé pour userId: ${req.params.userId}`);
  try {
    const { userId } = req.params;
    const { text, sender } = req.body;
    
    if (!text || !sender) {
      return res.status(400).json({
        success: false,
        message: 'Texte et expéditeur requis'
      });
    }
    
    // Récupérer ou créer le chat de l'utilisateur
    // D'abord, essayer de trouver un chat avec userId
    let chatDoc = await db.collection('chats').where('userId', '==', userId).limit(1).get();
    
    // Si pas trouvé, chercher dans les participants
    if (chatDoc.empty) {
      console.log('🔍 Chat avec userId non trouvé, recherche dans les participants...');
      chatDoc = await db.collection('chats').where('participants', 'array-contains', userId).limit(1).get();
    }
    
    // Si toujours pas trouvé, chercher tous les chats et filtrer manuellement
    if (chatDoc.empty) {
      console.log('🔍 Aucun chat trouvé avec array-contains, recherche manuelle...');
      const allChats = await db.collection('chats').get();
      
      for (const doc of allChats.docs) {
        const chatData = doc.data();
        if (chatData.participants && chatData.participants.includes(userId)) {
          console.log(`✅ Chat trouvé manuellement: ${doc.id}`);
          chatDoc = { docs: [doc], empty: false };
          break;
        }
      }
    }
    
    let chatId;
    if (chatDoc.empty) {
      // Créer un nouveau chat pour l'utilisateur
      const newChat = {
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        participants: [userId, 'support']
      };
      
      const chatRef = await db.collection('chats').add(newChat);
      chatId = chatRef.id;
    } else {
      chatId = chatDoc.docs[0].id;
      console.log(`✅ Chat existant trouvé: ${chatId}`);
    }
    
    const newMessage = {
      text: text,
      senderId: sender === 'user' ? userId : 'support',
      timestamp: new Date(),
      status: 'sent'
    };
    
    // Ajouter le message à la sous-collection messages
    const messageRef = await db.collection('chats').doc(chatId).collection('messages').add(newMessage);
    
    // Mettre à jour la date de modification du chat
    await db.collection('chats').doc(chatId).update({
      updatedAt: new Date()
    });
    
    const messageWithId = {
      id: messageRef.id,
      ...newMessage
    };
    
    console.log(`✅ Nouveau message ajouté pour l'utilisateur ${userId} (chatId: ${chatId})`);
    
    res.json({
      success: true,
      message: messageWithId
    });
  } catch (error) {
    console.error('❌ Erreur ajout message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Endpoint pour récupérer les données IBAN d'un utilisateur
app.get('/api/iban/:userId', async (req, res) => {
  console.log(`🏦 Endpoint IBAN appelé pour userId: ${req.params.userId}`);
  try {
    const { userId } = req.params;
    
    // Récupérer les données IBAN depuis le document utilisateur
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = userDoc.data();
    
    // Debug: afficher les valeurs IBAN
    console.log(`🔍 Debug IBAN pour ${userId}:`);
    console.log('billingIban:', userData.billingIban);
    console.log('billingBic:', userData.billingBic);
    console.log('billingIban type:', typeof userData.billingIban);
    console.log('billingBic type:', typeof userData.billingBic);
    console.log('billingIban truthy:', !!userData.billingIban);
    console.log('billingBic truthy:', !!userData.billingBic);
    
    // Vérifier si l'utilisateur a des données IBAN
    if (userData.billingIban && userData.billingBic) {
      // Créer les données IBAN à partir des informations de facturation
      const ibanData = {
        id: 'user-iban',
        userId: userId,
        iban: userData.billingIban,
        bic: userData.billingBic,
        accountHolder: userData.billingHolder || `${userData.firstName} ${userData.lastName}`,
        bankName: 'AmCbunq Bank',
        accountType: 'Compte principal',
        status: 'available',
        balance: userData.accounts && userData.accounts.length > 0 ? userData.accounts[0].balance : 0,
        currency: 'EUR'
      };
      
      console.log(`✅ Données IBAN récupérées pour l'utilisateur ${userId}`);
      
      res.json({
        success: true,
        iban: ibanData
      });
    } else {
      // Pas d'IBAN disponible
      console.log(`⚠️ Aucune donnée IBAN trouvée pour l'utilisateur ${userId}`);
      
      res.json({
        success: false,
        iban: null
      });
    }
  } catch (error) {
    console.error('❌ Erreur récupération IBAN:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Endpoint pour demander un IBAN
app.post('/api/iban/request/:userId', (req, res) => {
  res.json({
    success: true,
    message: 'Demande d\'IBAN enregistrée'
  });
});

// Endpoint pour récupérer les données utilisateur complètes
app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Récupérer les vraies données utilisateur depuis Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };
    
    console.log(`✅ Données utilisateur récupérées pour ${userId}`);
    
    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('❌ Erreur récupération utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// Endpoint pour les documents KYC
app.get('/api/kyc/:userId', (req, res) => {
  const { userId } = req.params;
  
  const mockKyc = {
    userId: userId,
    status: 'pending',
    documents: [
      {
        id: 'doc1',
        type: 'identity',
        status: 'pending',
        uploadDate: new Date().toISOString()
      },
      {
        id: 'doc2',
        type: 'address',
        status: 'approved',
        uploadDate: new Date().toISOString()
      }
    ]
  };
  
  res.json({
    success: true,
    kyc: mockKyc
  });
});

app.post('/api/kyc/submit', (req, res) => {
  res.json({
    success: true,
    message: 'Documents KYC soumis avec succès'
  });
});

// Endpoints pour les bénéficiaires (CRUD)
app.post('/api/beneficiaries', (req, res) => {
  const newBeneficiary = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    beneficiary: newBeneficiary
  });
});

app.put('/api/beneficiaries/:id', (req, res) => {
  const { id } = req.params;
  
  const updatedBeneficiary = {
    id,
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    beneficiary: updatedBeneficiary
  });
});

app.delete('/api/beneficiaries/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Bénéficiaire supprimé'
  });
});

// Endpoints pour les virements
app.post('/api/transfers', (req, res) => {
  const newTransfer = {
    id: generateId(),
    ...req.body,
    date: new Date().toISOString(),
    status: 'pending'
  };
  
  res.status(201).json({
    success: true,
    transfer: newTransfer
  });
});

// ===== BUDGETS FIRESTORE =====
app.get('/api/budgets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Récupérer les budgets depuis la collection users
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    const userData = userDoc.data();
    const budgets = userData.budgets || [];
    
    console.log(`✅ ${budgets.length} budgets récupérés pour l'utilisateur ${userId}`);
    
    res.json({
      success: true,
      budgets: budgets
    });
  } catch (error) {
    console.error('❌ Erreur récupération budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ===== NOTIFICATIONS FIRESTORE =====
app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    console.log(`🔔 Récupération des notifications pour l'utilisateur: ${userId}`);
    
    if (!userId) {
      console.log('❌ userId manquant dans les paramètres');
      return res.status(400).json({ error: 'userId requis' });
    }
    
    // Récupérer le document utilisateur
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`⚠️ Utilisateur ${userId} non trouvé`);
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userData = userDoc.data();
    console.log(`📊 Données utilisateur récupérées pour ${userId}:`, Object.keys(userData));
    
    const notifications = userData.notifications || [];
    console.log(`📋 Notifications trouvées: ${notifications.length}`);
    
    // Tri par date décroissante
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log(`✅ ${notifications.length} notifications récupérées pour l'utilisateur ${userId}`);
    
    if (notifications.length === 0) {
      console.log(`📭 Aucune notification trouvée pour l'utilisateur ${userId}`);
    }
    
    res.json(notifications);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des notifications:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/notifications', async (req, res) => {
  const notificationData = req.body;
  
  try {
    const { userId } = notificationData;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }
    
    // Récupérer le document utilisateur
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userData = userDoc.data();
    const currentNotifications = userData.notifications || [];
    
    // Créer la nouvelle notification avec un ID unique
    const newNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      title: notificationData.title || 'Notification',
      message: notificationData.message || '',
      type: notificationData.type || 'info',
      date: notificationData.date || new Date().toISOString(),
      read: notificationData.read || false,
      priority: notificationData.priority || 'medium',
      category: notificationData.category || 'general',
      createdAt: new Date().toISOString()
    };
    
    // Ajouter la notification au tableau
    const updatedNotifications = [...currentNotifications, newNotification];
    
    // Mettre à jour le document utilisateur
    await userRef.update({
      notifications: updatedNotifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Notification ajoutée pour l'utilisateur ${userId}`);
    
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('❌ Erreur création notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    console.log(`📝 Mise à jour de la notification: ${id}`, updateData);
    
    const { userId } = updateData;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }
    
    // Récupérer le document utilisateur
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    // Trouver et mettre à jour la notification
    const notificationIndex = notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      console.log(`⚠️ Notification ${id} non trouvée`);
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    
    // Mettre à jour la notification
    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    // Mettre à jour le document utilisateur
    await userRef.update({
      notifications: notifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Notification ${id} mise à jour avec succès`);
    res.json(notifications[notificationIndex]);
  } catch (error) {
    console.error('❌ Erreur mise à jour notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  
  try {
    console.log(`🗑️ Suppression de la notification: ${id} pour l'utilisateur: ${userId}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'userId requis' });
    }
    
    // Récupérer le document utilisateur
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    // Trouver et supprimer la notification
    const notificationIndex = notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      console.log(`⚠️ Notification ${id} non trouvée`);
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    
    // Supprimer la notification du tableau
    notifications.splice(notificationIndex, 1);
    
    // Mettre à jour le document utilisateur
    await userRef.update({
      notifications: notifications,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Notification ${id} supprimée avec succès`);
    res.status(204).send();
  } catch (error) {
    console.error('❌ Erreur suppression notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== ROUTES DE TEST =====
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Serveur Firebase fonctionnel !',
    mode: 'firebase',
    auth: 'firebase',
    data: 'firestore'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    server: 'firebase',
    authentication: 'firebase',
    notifications: 'firestore',
    port: PORT
  });
});

// Endpoint pour créer des notifications de test
app.post('/api/test/create-notifications', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId requis' });
  }
  
  try {
    const notificationsRef = db.collection('notifications');
    
    const testNotifications = [
      {
        userId: userId,
        title: 'Bienvenue sur AmCbunq !',
        message: 'Votre compte a été créé avec succès. Commencez à utiliser nos services.',
        type: 'success',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'general'
      },
      {
        userId: userId,
        title: 'Vérification KYC en cours',
        message: 'Votre demande de vérification d\'identité est en cours de traitement.',
        type: 'info',
        date: new Date().toISOString(),
        read: false,
        priority: 'high',
        category: 'security'
      },
      {
        userId: userId,
        title: 'Nouvelle fonctionnalité disponible',
        message: 'Découvrez nos nouveaux outils de gestion de budget !',
        type: 'feature',
        date: new Date().toISOString(),
        read: false,
        priority: 'low',
        category: 'feature'
      },
      {
        userId: userId,
        title: 'Nouveau message reçu',
        message: 'Vous avez reçu un nouveau message de notre équipe support.',
        type: 'info',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'chat'
      },
      {
        userId: userId,
        title: 'Transaction approuvée',
        message: 'Votre virement de 500€ a été approuvé et sera traité dans les 24h.',
        type: 'success',
        date: new Date().toISOString(),
        read: false,
        priority: 'high',
        category: 'transaction'
      },
      {
        userId: userId,
        title: 'Maintenance prévue',
        message: 'Une maintenance est prévue ce soir de 23h à 2h du matin. Certains services pourront être temporairement indisponibles.',
        type: 'warning',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'general'
      },
      {
        userId: userId,
        title: 'Carte débitée',
        message: 'Votre carte a été débitée de 25,50€ pour l\'achat en ligne.',
        type: 'info',
        date: new Date().toISOString(),
        read: false,
        priority: 'low',
        category: 'transaction'
      },
      {
        userId: userId,
        title: 'Sécurité renforcée',
        message: 'Nous avons détecté une connexion depuis un nouvel appareil. Veuillez vérifier que c\'est bien vous.',
        type: 'warning',
        date: new Date().toISOString(),
        read: false,
        priority: 'high',
        category: 'security'
      },
      {
        userId: userId,
        title: 'Offre spéciale',
        message: 'Profitez de notre offre spéciale : 0% de frais sur tous vos virements internationaux ce mois-ci.',
        type: 'feature',
        date: new Date().toISOString(),
        read: false,
        priority: 'low',
        category: 'feature'
      },
      {
        userId: userId,
        title: 'Document validé',
        message: 'Votre justificatif de domicile a été validé. Votre compte est maintenant entièrement fonctionnel.',
        type: 'success',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'general'
      },
      {
        userId: userId,
        title: 'Rappel de paiement',
        message: 'N\'oubliez pas que votre prélèvement automatique de 150€ sera effectué demain.',
        type: 'info',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'transaction'
      },
      {
        userId: userId,
        title: 'Nouvelle interface',
        message: 'Découvrez notre nouvelle interface utilisateur plus intuitive et moderne.',
        type: 'feature',
        date: new Date().toISOString(),
        read: false,
        priority: 'low',
        category: 'feature'
      },
      {
        userId: userId,
        title: 'Support technique',
        message: 'Notre équipe technique a résolu le problème que vous avez signalé. Merci de votre patience.',
        type: 'success',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'support'
      }
    ];
    
    const results = [];
    for (const notification of testNotifications) {
      const docRef = await notificationsRef.add({
        ...notification,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      results.push({ id: docRef.id, ...notification });
    }
    
    console.log(`✅ ${results.length} notifications de test créées pour l'utilisateur ${userId}`);
    res.json({ 
      success: true, 
      message: `${results.length} notifications créées`,
      notifications: results 
    });
    
  } catch (error) {
    console.error('❌ Erreur création notifications de test:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ===== VALIDATION EMAIL =====
// Stockage temporaire des codes de validation (en production, utiliser une base de données)
const verificationCodes = new Map();

// Générer un code à 6 chiffres
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

       // Endpoint pour envoyer le code de validation
       app.post('/api/sendVerificationCode', async (req, res) => {
         const { email } = req.body;
         
         try {
           console.log(`📧 Envoi code de validation pour: ${email}`);
           
           // Générer un code à 6 chiffres
           const code = generateVerificationCode();
           
           // Stocker le code avec expiration (15 minutes)
           const expiration = Date.now() + (15 * 60 * 1000); // 15 minutes
           verificationCodes.set(email, {
             code,
             expiration,
             attempts: 0
           });
           
           // Envoyer l'email avec le code
           const mailOptions = {
             from: process.env.SMTP_USER || 'noreply@votre-domaine.com',
             to: email,
             subject: 'Code de vérification - AMCB',
             html: `
               <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                 <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                   <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Vérification de votre compte AMCB</h2>
                   
                   <p style="color: #555; font-size: 16px; line-height: 1.6;">
                     Bonjour,<br><br>
                     Vous avez récemment créé un compte sur AMCB. Pour finaliser votre inscription, 
                     veuillez utiliser le code de vérification suivant :
                   </p>
                   
                   <div style="background-color: #3498db; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
                     <h1 style="font-size: 32px; margin: 0; letter-spacing: 5px; font-weight: bold;">${code}</h1>
                   </div>
                   
                   <p style="color: #555; font-size: 14px; line-height: 1.6;">
                     <strong>Important :</strong>
                     <ul style="margin: 10px 0;">
                       <li>Ce code expire dans 15 minutes</li>
                       <li>Ne partagez jamais ce code avec qui que ce soit</li>
                       <li>Si vous n'avez pas demandé ce code, ignorez cet email</li>
                     </ul>
                   </p>
                   
                   <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                     <p style="color: #999; font-size: 12px;">
                       Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                     </p>
                   </div>
                 </div>
               </div>
             `
           };
           
           // Envoyer l'email
           await transporter.sendMail(mailOptions);
           
           console.log(`✅ Email envoyé avec succès à ${email}`);
           console.log(`🔐 Code de validation: ${code} (pour debug)`);
           
           res.json({
             success: true,
             message: 'Code de vérification envoyé par email'
           });
           
         } catch (error) {
           console.error('❌ Erreur envoi email:', error);
           
           // En cas d'erreur, afficher le code dans la console pour le développement
           console.log(`🔐 Code de validation pour ${email}: ${code}`);
           console.log(`⏰ Expire dans 15 minutes`);
           
           res.json({
             success: true,
             message: 'Code envoyé avec succès (mode debug)',
             debug: {
               code: code,
               email: email,
               error: error.message
             }
           });
         }
       });

// Endpoint pour vérifier le code
app.post('/api/verifyCode', async (req, res) => {
  const { email, code } = req.body;
  
  try {
    console.log(`🔍 Vérification code pour: ${email}`);
    
    const verificationData = verificationCodes.get(email);
    
    if (!verificationData) {
      return res.status(400).json({
        success: false,
        message: 'Code expiré ou non trouvé'
      });
    }
    
    // Vérifier l'expiration
    if (Date.now() > verificationData.expiration) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Code expiré'
      });
    }
    
    // Vérifier le nombre de tentatives
    if (verificationData.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Trop de tentatives. Code supprimé.'
      });
    }
    
    // Incrémenter les tentatives
    verificationData.attempts++;
    
    // Vérifier le code
    if (verificationData.code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Code incorrect'
      });
    }
    
    // Code correct ! Mettre à jour l'utilisateur dans Firestore
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();
    
    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      await userDoc.ref.update({
        emailVerified: true,
        emailVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      });
      
      console.log(`✅ Email vérifié pour: ${email}`);
    }
    
    // Supprimer le code utilisé
    verificationCodes.delete(email);
    
    res.json({
      success: true,
      message: 'Email vérifié avec succès'
    });
    
  } catch (error) {
    console.error('❌ Erreur vérification code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
});

// Nettoyage périodique des codes expirés
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expiration) {
      verificationCodes.delete(email);
      console.log(`🧹 Code expiré supprimé pour: ${email}`);
    }
  }
}, 5 * 60 * 1000); // Nettoyage toutes les 5 minutes

// Démarrer le serveur avec Vite
async function startServer() {
  try {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);

    // Route catch-all pour React Router (doit être en dernier)
    app.use((req, res, next) => {
      const url = req.originalUrl;
      
      // Ne pas intercepter les routes API
      if (url.startsWith('/api/')) {
        return next();
      }

      // Pour toutes les autres routes, servir l'application React
      vite.transformIndexHtml(url, '')
        .then(template => {
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        })
        .catch(e => {
          vite.ssrFixStacktrace(e);
          next(e);
        });
    });

    app.listen(PORT, () => {
      console.log(`🚀 Serveur VITE + FIREBASE démarré sur http://localhost:${PORT}`);
      console.log(`🔐 Authentification: FIREBASE RÉELLE`);
      console.log(`🔌 Notifications: FIRESTORE RÉEL`);
      console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
      console.log(`📊 Status: http://localhost:${PORT}/api/status`);
    });

  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
}

startServer(); 