/**
 * Script pour mettre à jour KycPage.tsx en remplaçant les textes codés en dur par des clés de traduction
 */

const fs = require('fs');
const path = require('path');

// Chemin du fichier KycPage.tsx
const kycPagePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'KycPage.tsx');

// Fonction pour mettre à jour le fichier KycPage.tsx
function updateKycPage() {
  console.log('🔍 Mise à jour de KycPage.tsx...');
  
  try {
    // Lire le fichier existant
    if (!fs.existsSync(kycPagePath)) {
      console.error(`❌ Fichier ${kycPagePath} introuvable.`);
      return false;
    }
    
    let content = fs.readFileSync(kycPagePath, 'utf8');
    
    // Remplacer les textes codés en dur par des clés de traduction
    const replacements = [
      {
        from: /const userName = user\.displayName \|\| user\.firstName \+ ' ' \+ user\.lastName \|\| 'Utilisateur';/g,
        to: "const userName = user.displayName || user.firstName + ' ' + user.lastName || t('kyc.defaultUserName');"
      },
      {
        from: /showError\('Erreur', 'Informations utilisateur manquantes'\);/g,
        to: "showError(t('kyc.errors.title'), t('kyc.errors.userMissing'));"
      },
      {
        from: /console\.error\('Erreur parsing user:', error\);/g,
        to: "console.error(t('kyc.errors.parsingUser'), error);"
      },
      {
        from: /console\.error\('Erreur lors de la soumission:', error\);/g,
        to: "console.error(t('kyc.errors.submissionError'), error);"
      },
      {
        from: /showSuccess\('Succès', 'Documents soumis avec succès ! Vous recevrez un email de confirmation.'\);/g,
        to: "showSuccess(t('kyc.success.title'), t('kyc.success.message'));"
      },
      {
        from: /showError\('Erreur', 'Une erreur est survenue lors de la soumission'\);/g,
        to: "showError(t('kyc.errors.title'), t('kyc.errors.submissionFailed'));"
      }
    ];
    
    // Appliquer les remplacements
    replacements.forEach(({ from, to }) => {
      content = content.replace(from, to);
    });
    
    // Sauvegarder le fichier mis à jour
    fs.writeFileSync(kycPagePath, content, 'utf8');
    console.log(`✅ Fichier ${kycPagePath} mis à jour avec succès.`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${kycPagePath}:`, error);
    return false;
  }
}

// Exécuter le script
updateKycPage();