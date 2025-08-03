const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5173;

// Middleware
app.use(cors());
app.use(express.json());

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
    
    // Vérifier si l'utilisateur existe dans Firestore
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      console.log(`❌ Utilisateur non trouvé: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(`✅ Utilisateur trouvé: ${userData.email}`);
    
    // Vérifier le mot de passe
    if (userData.password !== password) {
      console.log(`❌ Mot de passe incorrect pour: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }
    
    // Créer un token personnalisé
    const customToken = await admin.auth().createCustomToken(userDoc.id);
    
    console.log(`✅ Connexion réussie pour: ${email}`);
    
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
    console.log(`📝 Tentative d'inscription pour: ${email}`);
    
    // Vérifier si l'utilisateur existe déjà
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('email', '==', email).get();
    
    if (!userSnapshot.empty) {
      console.log(`❌ Email déjà utilisé: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    
    // Créer le nouvel utilisateur dans Firestore
    const newUser = {
      email,
      password,
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
    
    console.log(`✅ Inscription réussie pour: ${email}`);
    
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

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Route catch-all pour React (utiliser app.use au lieu de app.get('*'))
app.use((req, res) => {
  // Ne pas intercepter les routes API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Pour toutes les autres routes, servir l'application React
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur FIREBASE démarré sur http://localhost:${PORT}`);
  console.log(`📱 Application React servie depuis /dist`);
  console.log(`🔐 Authentification: FIREBASE RÉELLE`);
  console.log(`🔌 Notifications: FIRESTORE RÉEL`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`📊 Status: http://localhost:${PORT}/api/status`);
}); 