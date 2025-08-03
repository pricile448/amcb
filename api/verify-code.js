// Stockage temporaire des codes (en production, utilisez Redis ou une base de données)
const verificationCodes = new Map();

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Gérer les requêtes OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vérifier que c'est une requête POST
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Méthode non autorisée. Utilisez POST.'
    });
    return;
  }

  try {
    const { email, code } = req.body;

    // Valider les données
    if (!email || !code) {
      res.status(400).json({
        success: false,
        error: 'Email et code requis'
      });
      return;
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Format d\'email invalide'
      });
      return;
    }

    // Valider le format du code (6 chiffres)
    if (!/^\d{6}$/.test(code)) {
      res.status(400).json({
        success: false,
        error: 'Code invalide (doit contenir 6 chiffres)'
      });
      return;
    }

    // Récupérer le code stocké
    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      res.status(400).json({
        success: false,
        error: 'Code expiré ou non trouvé. Veuillez demander un nouveau code.'
      });
      return;
    }

    // Vérifier l'expiration (15 minutes)
    if (Date.now() > storedData.expires) {
      verificationCodes.delete(email);
      res.status(400).json({
        success: false,
        error: 'Code expiré. Veuillez demander un nouveau code.'
      });
      return;
    }

    // Vérifier le nombre de tentatives (max 3)
    if (storedData.attempts >= 3) {
      verificationCodes.delete(email);
      res.status(400).json({
        success: false,
        error: 'Trop de tentatives. Veuillez demander un nouveau code.'
      });
      return;
    }

    // Incrémenter le nombre de tentatives
    storedData.attempts++;

    // Vérifier le code
    if (storedData.code !== code) {
      res.status(400).json({
        success: false,
        error: 'Code incorrect. Tentatives restantes: ' + (3 - storedData.attempts)
      });
      return;
    }

    // Code correct - supprimer le code utilisé
    verificationCodes.delete(email);

    console.log('✅ Code vérifié avec succès pour:', email);

    res.status(200).json({
      success: true,
      message: 'Code vérifié avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur vérification code:', error);

    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
}

// Fonction pour stocker un code (appelée par send-email.js)
export function storeVerificationCode(email, code) {
  verificationCodes.set(email, {
    code: code,
    expires: Date.now() + (15 * 60 * 1000), // 15 minutes
    attempts: 0
  });
} 