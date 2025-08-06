const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de base
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'dist')));

// Initialiser Resend
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// Endpoint email simple
app.post('/api/send-email', async (req, res) => {
  console.log('📧 Email request received:', req.body);
  
  try {
    const { email, code, userName } = req.body;

    if (!email || !code) {
      console.log('❌ Missing email or code');
      return res.status(400).json({ error: 'Email et code requis' });
    }

    console.log('📧 Sending email to:', email);

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: 'Vérification de votre compte AMCB',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Vérification AMCB</title>
        </head>
        <body>
          <h1>🔐 Vérification de votre compte AMCB</h1>
          <p>Bonjour ${userName || email},</p>
          <p>Votre code de vérification : <strong>${code}</strong></p>
          <p>Ce code expire dans 15 minutes.</p>
        </body>
        </html>
      `
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    console.log('✅ Email sent successfully:', result.data?.id);
    return res.status(200).json({ success: true, message: 'Email envoyé avec succès' });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ error: error.message || 'Erreur serveur' });
  }
});

// Route simple pour servir l'app React
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Catch-all pour les autres routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`🌐 App available at: http://localhost:${PORT}`);
}); 