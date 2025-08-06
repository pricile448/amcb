const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const EMAIL_SERVER_URL = 'http://localhost:3001';

async function testEmailServer() {
  console.log('🧪 Test du serveur email AMCB');
  console.log('==============================\n');

  try {
    // Test 1: Health check
    console.log('1. Test de santé du serveur...');
    const healthResponse = await fetch(`${EMAIL_SERVER_URL}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Serveur en ligne:', healthData);
    } else {
      console.log('❌ Serveur non accessible');
      return;
    }

    // Test 2: Email sending
    console.log('\n2. Test d\'envoi d\'email...');
    const testEmailData = {
      email: 'test@example.com',
      code: '123456',
      userName: 'Test User'
    };

    const emailResponse = await fetch(`${EMAIL_SERVER_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testEmailData)
    });

    const emailResult = await emailResponse.json();
    
    if (emailResponse.ok && emailResult.success) {
      console.log('✅ Email envoyé avec succès:', emailResult);
    } else {
      console.log('❌ Erreur envoi email:', emailResult);
      
      if (emailResult.error && emailResult.error.includes('VITE_RESEND_API_KEY')) {
        console.log('\n💡 Solution: Configurez votre clé API Resend');
        console.log('   1. Obtenez une clé sur https://resend.com');
        console.log('   2. Ajoutez VITE_RESEND_API_KEY=re_xxxxx dans le fichier .env');
        console.log('   3. Redémarrez le serveur');
      }
    }

  } catch (error) {
    console.error('❌ Erreur de test:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Démarrez le serveur email');
      console.log('   node email-server.cjs');
    }
  }
}

// Run test
testEmailServer().catch(console.error);
