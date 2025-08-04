// 🧪 Script pour tester la connexion Resend
const { Resend } = require('resend');

// Charger les variables d'environnement
require('dotenv').config();

const resend = new Resend('re_4s8nQUEp_23F1EG5Ce8Jyd6xZXkPxaVdg');

async function testResend() {
  console.log('🧪 TEST DE CONNEXION RESEND');
  console.log('🔑 Clé API: ✅ Configurée');

  try {
    console.log('\n📧 Test d\'envoi d\'email...');
    
         const result = await resend.emails.send({
       from: 'onboarding@resend.dev',
       to: ['pricilemenayamondo@gmail.com'],
      subject: 'Test de connexion Resend - AMCB',
      html: `
        <h1>Test de connexion Resend</h1>
        <p>Si vous recevez cet email, la connexion Resend fonctionne correctement !</p>
        <p>Code de test: <strong>123456</strong></p>
        <p>Date: ${new Date().toLocaleString()}</p>
      `
    });

    if (result.error) {
      console.log('❌ Erreur:', result.error);
    } else {
      console.log('✅ Email envoyé avec succès !');
      console.log('📧 ID:', result.data?.id);
      console.log('📧 À:', result.data?.to);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testResend(); 