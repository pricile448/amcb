/**
 * Script pour ajouter les clés de traduction manquantes dans les fichiers de localisation
 * Ce script identifie les textes codés en dur dans KycPage.tsx et les ajoute à tous les fichiers de localisation
 */

const fs = require('fs');
const path = require('path');

// Chemins des fichiers de localisation
const localesDir = path.join(__dirname, 'src', 'locales');
const frontendLocalesDir = path.join(__dirname, 'frontend', 'src', 'locales');

// Liste des langues supportées
const languages = ['fr', 'en', 'es', 'pt', 'it', 'nl', 'de'];

// Textes codés en dur identifiés dans KycPage.tsx
const hardcodedTexts = [
  { key: 'kyc.errors.userMissing', fr: 'Informations utilisateur manquantes', en: 'User information missing', es: 'Información de usuario faltante', pt: 'Informações do usuário ausentes', it: 'Informazioni utente mancanti', nl: 'Gebruikersinformatie ontbreekt', de: 'Benutzerinformationen fehlen' },
  { key: 'kyc.errors.parsingUser', fr: 'Erreur parsing user:', en: 'Error parsing user:', es: 'Error al analizar usuario:', pt: 'Erro ao analisar usuário:', it: 'Errore durante l\'analisi dell\'utente:', nl: 'Fout bij het verwerken van gebruiker:', de: 'Fehler beim Parsen des Benutzers:' },
  { key: 'kyc.errors.submissionError', fr: 'Erreur lors de la soumission:', en: 'Error during submission:', es: 'Error durante el envío:', pt: 'Erro durante o envio:', it: 'Errore durante l\'invio:', nl: 'Fout tijdens het indienen:', de: 'Fehler bei der Übermittlung:' },
  { key: 'kyc.success.title', fr: 'Succès', en: 'Success', es: 'Éxito', pt: 'Sucesso', it: 'Successo', nl: 'Succes', de: 'Erfolg' },
  { key: 'kyc.success.message', fr: 'Documents soumis avec succès ! Vous recevrez un email de confirmation.', en: 'Documents submitted successfully! You will receive a confirmation email.', es: 'Documentos enviados con éxito! Recibirás un correo electrónico de confirmación.', pt: 'Documentos enviados com sucesso! Você receberá um e-mail de confirmação.', it: 'Documenti inviati con successo! Riceverai un\'email di conferma.', nl: 'Documenten succesvol ingediend! U ontvangt een bevestigingsmail.', de: 'Dokumente erfolgreich eingereicht! Sie erhalten eine Bestätigungs-E-Mail.' },
  { key: 'kyc.errors.title', fr: 'Erreur', en: 'Error', es: 'Error', pt: 'Erro', it: 'Errore', nl: 'Fout', de: 'Fehler' },
  { key: 'kyc.errors.submissionFailed', fr: 'Une erreur est survenue lors de la soumission', en: 'An error occurred during submission', es: 'Ocurrió un error durante el envío', pt: 'Ocorreu um erro durante o envio', it: 'Si è verificato un errore durante l\'invio', nl: 'Er is een fout opgetreden tijdens het indienen', de: 'Bei der Übermittlung ist ein Fehler aufgetreten' },
  { key: 'kyc.defaultUserName', fr: 'Utilisateur', en: 'User', es: 'Usuario', pt: 'Usuário', it: 'Utente', nl: 'Gebruiker', de: 'Benutzer' }
];

// Fonction pour mettre à jour un fichier de localisation
function updateLocaleFile(filePath, language) {
  console.log(`Mise à jour du fichier ${filePath}...`);
  
  try {
    // Lire le fichier existant
    let localeData = {};
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      localeData = JSON.parse(fileContent);
    }
    
    // Ajouter les clés manquantes
    let updated = false;
    
    hardcodedTexts.forEach(text => {
      const keyParts = text.key.split('.');
      let current = localeData;
      
      // Naviguer dans l'objet pour atteindre le bon niveau
      for (let i = 0; i < keyParts.length - 1; i++) {
        if (!current[keyParts[i]]) {
          current[keyParts[i]] = {};
          updated = true;
        }
        current = current[keyParts[i]];
      }
      
      // Ajouter la clé si elle n'existe pas
      const lastKey = keyParts[keyParts.length - 1];
      if (!current[lastKey]) {
        current[lastKey] = text[language] || text.en; // Utiliser la traduction spécifique ou l'anglais par défaut
        updated = true;
      }
    });
    
    // Sauvegarder le fichier si des modifications ont été apportées
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(localeData, null, 2), 'utf8');
      console.log(`✅ Fichier ${filePath} mis à jour avec succès.`);
    } else {
      console.log(`ℹ️ Aucune modification nécessaire pour ${filePath}.`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error);
    return false;
  }
}

// Fonction principale
function addMissingTranslations() {
  console.log('🔍 Ajout des clés de traduction manquantes...');
  
  // Traiter les fichiers de localisation dans src/locales
  if (fs.existsSync(localesDir)) {
    languages.forEach(lang => {
      const filePath = path.join(localesDir, `${lang}.json`);
      updateLocaleFile(filePath, lang);
    });
  } else {
    console.warn(`⚠️ Répertoire ${localesDir} introuvable.`);
  }
  
  // Traiter les fichiers de localisation dans frontend/src/locales
  if (fs.existsSync(frontendLocalesDir)) {
    languages.forEach(lang => {
      const filePath = path.join(frontendLocalesDir, `${lang}.json`);
      updateLocaleFile(filePath, lang);
    });
  } else {
    console.warn(`⚠️ Répertoire ${frontendLocalesDir} introuvable.`);
  }
  
  console.log('✅ Processus terminé.');
}

// Exécuter le script
addMissingTranslations();