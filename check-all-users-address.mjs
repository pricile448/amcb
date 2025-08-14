#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Configuration Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "amcbunq",
  private_key_id: "9d1db9a2146a57391679cfa7907c2cf4b3863e44",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDqmT6oKPmU5RBT\nKFejWOyBd0WHsqjI7RBZ2c8WAZIBZb0lv2/5PBm9tpULSHsuUG6inZLbfUGhD7N0\nZ8vYECjv1TYC0aqNTHoUS438hiLhaaGVGoU/9UKgRW0YsTCIJoEV08vDbOS7WXMi\nv8/Ka6w8EIy2xqPvsR/+QqC6md0O58NIkqd3Gf0nS9yD6IL+tcllH5qXIB75a4so\n5WkkHNi+X1NUGAQoJRBxTVxPNGnv1d7xv8ppvNWx1PPpz93khA6hHjQStm1ptVtp\nQ6xTImoXwKFCPDJjtj4lSwlKZMBqpTWE/5EbJQnkYFcwEtyCds6w2Ln+7PrBtWV+\n40P6x6dHAgMBAAECggEAB4gT8uId4SHZfFH3Pk9EiIODv++Ea67wr3HGrDYwscrK\nX8PdnGrJiMWr00joa3w5kQ7uAA3tZXZTlJEggjdCmTCHI2AH0bF62dvzGwBTblkt\nztOjI4KEOREBh6FopXZW/pRmHkgIr9sXTy5JRX5fcS421kdaS/+rv0X0UwlNh4Tp\nirCRgxtYktAVwfjHpbNhHnctnkPn+TWN8+OpQiT3/DsHCzEubfOcKILVospGJxsJ\nVUSjV0ennzOLtmJJXgywRaZ5SX9OFyawP3LbqIASgu4JXe658hflbO7PvUxYGoea\nOpkbc4OoHmagQAf7UAOLv8KRgpHsVB4qkvsMstneAQKBgQD65oE7zf8433avxbcJ\nirQt7GJgy2ivXVZ9CujWJ1nGrkL58BDLvrXTzERVB5jtZtJ9TE1uV4lj4O8NhH8Q\nzSX0B6wQe+azsxKTwxg7sVClDwDapsPrKn1s7yeXVqcFenLBu8yiDlwH6FlZGc/V\nAuorDQ8d2Nbwl9DX2bbu0PFkYQKBgQDvXeryg4ZdU27maLahi/j9jxdA66caTYn2\nlIsJCKiHskyet7Y7cAADr91znUav9OoFI0KW+IdKC+OZQ32baGUfLoa1majXGlAd\niJcbigEZWnJbDVgr3nkefqBxc7sgTqat69W57MWlQzyxWl7Zv+5+P7vT+tbnXDSH\nqlRHyp6spwKBgQDazKlmvf4UWsvl/UXhzFPUuJASWVCxnXQPF7R1DVv9J3rA+9mp\n1GY8jaYJgNacMU7edewQjcYCk+Xko+crf7vZU9d5iJNnooJQ2ZIIfFkXmD3mcAfq\nzOMUXHrqP2boICBzUpLhwCQBwV4plZjo6eHMKVdFcBQBPGOj2Pjuyse4AQKBgFgn\ndoep+KoWOBmTJu+H5UM8l4vJPdlqBQ1S14GUNr0C5UTu06ZAMUEqW5xgp8/VmvoZ\nakS/ctPKXR/swy2g3N0G/YWT+aJ+hlLaIwx5Xr4/mS3/VCGT5XddmyktPhU/4hLb\nb/LxSDj88jU+2v/Gt8a3Ii2Hi+3Y/1+XU0K9VIKxAoGBAIZ0sQDMdQCjagCb49A1\nj55cHMqnt8VSPihtWvy74FjFuBnUAKCDFxIQna/qPwaEakC6mMdZ36EPgo69ywH+\nar8A1q+GNsOge67L2O4ordsimreLgoRBoewAqd0YX8LfbX8RjnnPVoL43450V5Fs\n9AZ8V4xU6If/vTJZLm15lPrL\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@amcbunq.iam.gserviceaccount.com",
  client_id: "117639555901342878348",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40amcbunq.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Initialiser Firebase Admin
const adminApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'amcbunq'
});

const db = getFirestore(adminApp);

async function checkAllUsersAddress() {
  try {
    console.log('🔍 Vérification des champs address et advisorId pour tous les utilisateurs...\n');
    
    // Récupérer tous les utilisateurs
    const usersSnapshot = await db.collection('users').get();
    
    const users = [];
    usersSnapshot.forEach((doc) => {
      // Ignorer les documents de statistiques et de sauvegarde
      if (doc.id.startsWith('stats_') || doc.id.startsWith('backup_')) {
        return;
      }
      
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`📊 Total d'utilisateurs trouvés: ${users.length}\n`);
    
    // Vérifier chaque utilisateur
    let usersWithAddress = 0;
    let usersWithAdvisorId = 0;
    let usersWithBoth = 0;
    let usersMissingBoth = 0;
    
    for (const user of users) {
      const hasAddress = user.address !== undefined && user.address !== "";
      const hasAdvisorId = user.advisorId !== undefined && user.advisorId !== "";
      
      if (hasAddress) usersWithAddress++;
      if (hasAdvisorId) usersWithAdvisorId++;
      if (hasAddress && hasAdvisorId) usersWithBoth++;
      if (!hasAddress && !hasAdvisorId) usersMissingBoth++;
      
      const status = [];
      if (hasAddress) status.push('✅ address');
      else status.push('❌ address');
      
      if (hasAdvisorId) status.push('✅ advisorId');
      else status.push('❌ advisorId');
      
      console.log(`${user.email || user.id}: ${status.join(' | ')}`);
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA VÉRIFICATION');
    console.log('='.repeat(60));
    console.log(`🏠 Utilisateurs avec address: ${usersWithAddress}/${users.length}`);
    console.log(`👨‍💼 Utilisateurs avec advisorId: ${usersWithAdvisorId}/${users.length}`);
    console.log(`✅ Utilisateurs avec les deux: ${usersWithBoth}/${users.length}`);
    console.log(`❌ Utilisateurs sans les deux: ${usersMissingBoth}/${users.length}`);
    
    if (usersMissingBoth > 0) {
      console.log('\n⚠️  ATTENTION: Certains utilisateurs manquent ces champs !');
      console.log('💡 Ils devront être ajoutés pour avoir la structure complète.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

// Lancer la vérification
checkAllUsersAddress().then(() => {
  console.log('\n🏁 Vérification terminée');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erreur fatale:', error.message);
  process.exit(1);
});
