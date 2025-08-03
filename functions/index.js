const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configuration email (à remplacer par vos vraies données)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

// Fonction pour envoyer le code de validation
exports.sendVerificationCode = functions.https.onCall(async (data, context) => {
  try {
    const { email } = data;
    
    if (!email) {
      throw new functions.https.HttpsError('invalid-argument', 'Email requis');
    }
    
    // Générer un code à 6 chiffres
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
    // Stocker le code dans Firestore avec expiration (15 min)
    await db.collection('verificationCodes').doc(email).set({
      code: verificationCode,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      attempts: 0
    });
    
    // Template email
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Code de validation AmCbunq</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #2563eb; margin: 0;">AmCbunq</h1>
              </div>
              
              <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
                  <h2 style="color: #1f2937; margin-bottom: 20px;">Vérification de votre email</h2>
                  
                  <p style="margin-bottom: 20px;">
                      Votre code de validation à 6 chiffres est :
                  </p>
                  
                  <div style="background: #2563eb; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0;">
                      ${verificationCode}
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
                      Ce code expirera dans 15 minutes.
                  </p>
                  
                  <p style="color: #6b7280; font-size: 14px;">
                      Si vous n'avez pas demandé ce code, ignorez cet email.
                  </p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px;">
                  <p>© 2024 AmCbunq. Tous droits réservés.</p>
              </div>
          </div>
      </body>
      </html>
    `;
    
    // Envoyer l'email
    const mailOptions = {
      from: 'AmCbunq <noreply@amcbunq.com>',
      to: email,
      subject: 'Code de validation AmCbunq',
      html: emailTemplate
    };
    
    await transporter.sendMail(mailOptions);
    
    return { success: true, message: 'Code envoyé avec succès' };
    
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code:', error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de l\'envoi du code');
  }
});

// Fonction pour vérifier le code
exports.verifyCode = functions.https.onCall(async (data, context) => {
  try {
    const { email, code } = data;
    
    if (!email || !code) {
      throw new functions.https.HttpsError('invalid-argument', 'Email et code requis');
    }
    
    const doc = await db.collection('verificationCodes').doc(email).get();
    
    if (!doc.exists) {
      throw new functions.https.HttpsError('not-found', 'Code non trouvé');
    }
    
    const verificationData = doc.data();
    
    // Vérifier l'expiration
    if (new Date() > verificationData.expiresAt.toDate()) {
      // Supprimer le document expiré
      await doc.ref.delete();
      throw new functions.https.HttpsError('deadline-exceeded', 'Code expiré');
    }
    
    // Vérifier le nombre de tentatives
    if (verificationData.attempts >= 3) {
      // Supprimer le document après trop de tentatives
      await doc.ref.delete();
      throw new functions.https.HttpsError('permission-denied', 'Trop de tentatives. Veuillez demander un nouveau code.');
    }
    
    // Vérifier le code
    if (verificationData.code !== parseInt(code)) {
      // Incrémenter les tentatives
      await doc.ref.update({ attempts: verificationData.attempts + 1 });
      throw new functions.https.HttpsError('invalid-argument', 'Code incorrect');
    }
    
    // Code valide - marquer l'email comme vérifié dans Firestore
    const userQuery = await db.collection('users').where('email', '==', email).limit(1).get();
    
    if (!userQuery.empty) {
      const userDoc = userQuery.docs[0];
      await userDoc.ref.update({
        emailVerified: true,
        emailVerifiedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Supprimer le document de vérification
    await doc.ref.delete();
    
    return { success: true, message: 'Email vérifié avec succès' };
    
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    throw error;
  }
});

// Fonction pour nettoyer les codes expirés (cron job)
exports.cleanupExpiredCodes = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  try {
    const now = new Date();
    const expiredCodes = await db.collection('verificationCodes')
      .where('expiresAt', '<', now)
      .get();
    
    const batch = db.batch();
    expiredCodes.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    console.log(`Nettoyage terminé: ${expiredCodes.docs.length} codes expirés supprimés`);
    return null;
    
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
    return null;
  }
}); 