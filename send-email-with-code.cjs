// 📧 Script pour envoyer des emails avec codes de vérification
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.cjs');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function sendEmailWithCode() {
  console.log('📧 ENVOI D\'EMAIL AVEC CODE DE VÉRIFICATION');
  
  try {
    // Chercher les codes de vérification non expirés
    const codesSnapshot = await db.collection('emailVerificationCodes').get();
    
    if (codesSnapshot.empty) {
      console.log('❌ Aucun code de vérification trouvé');
      return;
    }
    
    console.log(`📧 ${codesSnapshot.size} codes trouvés`);
    
    codesSnapshot.forEach(doc => {
      const codeData = doc.data();
      const email = codeData.email;
      const code = codeData.code;
      const expires = codeData.expires.toDate();
      
      console.log(`\n📧 Email: ${email}`);
      console.log(`🔑 Code: ${code}`);
      console.log(`⏰ Expire: ${expires}`);
      
      // Ici vous pouvez intégrer votre service d'envoi d'email
      // Par exemple : SendGrid, Mailgun, Nodemailer, etc.
      console.log(`📤 Email à envoyer à ${email} avec le code ${code}`);
    });
    
    console.log('\n✅ Script terminé. Intégrez votre service d\'email pour l\'envoi automatique.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

sendEmailWithCode(); 