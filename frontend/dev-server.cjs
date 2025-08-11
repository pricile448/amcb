const express = require('express');
const cors = require('cors');
const path = require('path');
const { admin, db } = require('./firebase-config.cjs');

const app = express();
const PORT = 5173; // Port Vite par défaut

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage pour les données simulées
let accounts = [
  {
    id: 'acc1',
    userId: 'user123',
    accountNumber: 'FR1234567890123456789012345',
    balance: 2500.50,
    currency: 'EUR',
    type: 'current',
    status: 'active'
  }
];

let transactions = [
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

let documents = [
  {
    id: 'doc1',
    userId: 'user123',
    name: 'Justificatif de domicile',
    type: 'proof_of_address',
    status: 'approved',
    uploadDate: new Date().toISOString()
  }
];

let supportTickets = [
  {
    id: 'ticket1',
    userId: 'user123',
    subject: 'Question sur mon compte',
    status: 'open',
    priority: 'medium',
    createdAt: new Date().toISOString()
  }
];

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ===== AUTHENTIFICATION FIREBASE RÉELLE =====
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Vérifier si l'utilisateur existe dans Firestore
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
    
    // Pour l'instant, on accepte n'importe quel mot de passe
    // En production, il faudrait vérifier le hash du mot de passe
    if (userData.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Créer un token personnalisé
    const customToken = await admin.auth().createCustomToken(userDoc.id);
    
    res.json({
      success: true,
      data: {
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
  const { email, password, firstName, lastName } = req.body;
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();
    
    if (!userSnapshot.empty) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Créer le nouvel utilisateur dans Firestore
    const newUser = {
      email,
      password, // En production, il faudrait hasher le mot de passe
      firstName: firstName || 'Nouveau',
      lastName: lastName || 'Utilisateur',
      verificationStatus: 'unverified',
      role: 'user',
      isEmailVerified: false,
      isPhoneVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const userRef = await usersRef.add(newUser);
    
    // Créer un token personnalisé
    const customToken = await admin.auth().createCustomToken(userRef.id);
    
    res.status(201).json({
      success: true,
      data: {
        access: customToken,
        refresh: `refresh_${generateId()}`,
        user: {
          id: userRef.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified,
          isPhoneVerified: newUser.isPhoneVerified,
          verificationStatus: newUser.verificationStatus
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur création utilisateur Firebase:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refresh } = req.body;
  
  if (refresh) {
    const accessToken = `access_${generateId()}`;
    const refreshToken = `refresh_${generateId()}`;
    
    res.json({
      success: true,
      data: {
        access: accessToken,
        refresh: refreshToken
      }
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
    // Récupérer l'utilisateur depuis Firestore
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
    console.error('❌ Erreur récupération profil:', error);
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
  res.json({
    success: true,
    data: transactions
  });
});

app.get('/api/transactions/history/', (req, res) => {
  res.json({
    success: true,
    data: transactions
  });
});

app.post('/api/transactions/', (req, res) => {
  const newTransaction = {
    id: generateId(),
    ...req.body,
    date: new Date().toISOString(),
    status: 'pending'
  };
  transactions.push(newTransaction);
  
  res.status(201).json({
    success: true,
    data: newTransaction
  });
});

app.get('/api/transactions/transfers/', (req, res) => {
  const transfers = transactions.filter(t => t.type === 'transfer');
  res.json({
    success: true,
    data: transfers
  });
});

// ===== DOCUMENTS =====
app.get('/api/documents/', (req, res) => {
  res.json({
    success: true,
    data: documents
  });
});

app.post('/api/documents/upload/', (req, res) => {
  const newDocument = {
    id: generateId(),
    ...req.body,
    uploadDate: new Date().toISOString(),
    status: 'pending'
  };
  documents.push(newDocument);
  
  res.status(201).json({
    success: true,
    data: newDocument
  });
});

// ===== SUPPORT =====
app.get('/api/support/tickets/', (req, res) => {
  res.json({
    success: true,
    data: supportTickets
  });
});

app.post('/api/support/tickets/create/', (req, res) => {
  const newTicket = {
    id: generateId(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'open'
  };
  supportTickets.push(newTicket);
  
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

// ===== NOTIFICATIONS FIRESTORE =====
app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    console.log(`📋 Récupération des notifications Firestore pour ${userId}`);
    
    // Récupérer les notifications depuis Firestore
    const notificationsRef = db.collection('notifications');
    const notificationsSnapshot = await notificationsRef.where('userId', '==', userId).get();
    
    const notifications = [];
    notificationsSnapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Si aucune notification, retourner une notification par défaut
    if (notifications.length === 0) {
      notifications.push({
        id: 'notif1',
        userId: userId,
        title: 'Bienvenue !',
        message: 'Votre compte a été créé avec succès',
        type: 'success',
        date: new Date().toISOString(),
        read: false,
        priority: 'medium',
        category: 'general'
      });
    }
    
    res.json(notifications);
  } catch (error) {
    console.error('❌ Erreur Firestore:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/notifications', async (req, res) => {
  const notificationData = req.body;
  
  try {
    console.log(`✅ Création notification Firestore:`, notificationData.title);
    
    // Ajouter la notification dans Firestore
    const notificationsRef = db.collection('notifications');
    const newNotification = {
      ...notificationData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await notificationsRef.add(newNotification);
    
    res.status(201).json({
      id: docRef.id,
      ...newNotification
    });
  } catch (error) {
    console.error('❌ Erreur création notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  try {
    console.log(`✅ Mise à jour notification Firestore: ${id}`);
    
    // Mettre à jour la notification dans Firestore
    await db.collection('notifications').doc(id).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const updatedNotification = {
      id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    res.json(updatedNotification);
  } catch (error) {
    console.error('❌ Erreur mise à jour notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    console.log(`✅ Suppression notification Firestore: ${id}`);
    
    // Supprimer la notification de Firestore
    await db.collection('notifications').doc(id).delete();
    
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

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Route pour la page d'accueil
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour le dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour la page de connexion
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour la page d'inscription
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour les comptes
app.get('/accounts', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour les transactions
app.get('/transactions', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour les messages
app.get('/messages', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour le KYC
app.get('/kyc', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour les documents
app.get('/documents', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour le support
app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour les paramètres
app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour le profil
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour les notifications
app.get('/notifications', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour l'administration
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route pour les tests de migration
app.get('/admin/migration', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Route catch-all pour toutes les autres routes React
app.use((req, res) => {
  // Ne pas intercepter les routes API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Pour toutes les autres routes, servir l'application React
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur FIREBASE démarré sur http://localhost:${PORT}`);
  console.log(`📱 Application React servie depuis /dist`);
  console.log(`🔐 Authentification: FIREBASE RÉELLE`);
  console.log(`🔌 Notifications: FIRESTORE RÉEL`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
}); 