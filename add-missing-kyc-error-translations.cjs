/**
 * Script pour ajouter les clés de traduction manquantes pour les erreurs KYC
 * dans tous les fichiers de localisation
 */

const fs = require('fs');
const path = require('path');

// Chemins des fichiers de localisation
const localesDir = path.join(__dirname, 'src', 'locales');
const localeFiles = [
  'fr.json',
  'en.json',
  'es.json',
  'pt.json',
  'it.json',
  'nl.json',
  'de.json'
];

// Nouvelles clés de traduction à ajouter
const newTranslations = {
  fr: {
    kyc: {
      errors: {
        title: "Erreur",
        userMissing: "Informations utilisateur manquantes",
        parsingUser: "Erreur parsing user:",
        submissionError: "Erreur lors de la soumission:",
        submissionFailed: "Une erreur est survenue lors de la soumission"
      },
      success: {
        title: "Succès",
        message: "Documents soumis avec succès ! Vous recevrez un email de confirmation."
      }
    }
  },
  en: {
    kyc: {
      errors: {
        title: "Error",
        userMissing: "Missing user information",
        parsingUser: "Error parsing user:",
        submissionError: "Submission error:",
        submissionFailed: "An error occurred during submission"
      },
      success: {
        title: "Success",
        message: "Documents successfully submitted! You will receive a confirmation email."
      }
    }
  },
  es: {
    kyc: {
      errors: {
        title: "Error",
        userMissing: "Información de usuario faltante",
        parsingUser: "Error al analizar usuario:",
        submissionError: "Error durante el envío:",
        submissionFailed: "Se produjo un error durante el envío"
      },
      success: {
        title: "Éxito",
        message: "¡Documentos enviados con éxito! Recibirás un correo electrónico de confirmación."
      }
    }
  },
  pt: {
    kyc: {
      errors: {
        title: "Erro",
        userMissing: "Informações do usuário ausentes",
        parsingUser: "Erro ao analisar usuário:",
        submissionError: "Erro durante o envio:",
        submissionFailed: "Ocorreu um erro durante o envio"
      },
      success: {
        title: "Sucesso",
        message: "Documentos enviados com sucesso! Você receberá um e-mail de confirmação."
      }
    }
  },
  it: {
    kyc: {
      errors: {
        title: "Errore",
        userMissing: "Informazioni utente mancanti",
        parsingUser: "Errore durante l'analisi dell'utente:",
        submissionError: "Errore durante l'invio:",
        submissionFailed: "Si è verificato un errore durante l'invio"
      },
      success: {
        title: "Successo",
        message: "Documenti inviati con successo! Riceverai un'email di conferma."
      }
    }
  },
  nl: {
    kyc: {
      errors: {
        title: "Fout",
        userMissing: "Gebruikersinformatie ontbreekt",
        parsingUser: "Fout bij het verwerken van gebruiker:",
        submissionError: "Fout tijdens het indienen:",
        submissionFailed: "Er is een fout opgetreden tijdens het indienen"
      },
      success: {
        title: "Succes",
        message: "Documenten succesvol ingediend! Je ontvangt een bevestigingsmail."
      }
    }
  },
  de: {
    kyc: {
      errors: {
        title: "Fehler",
        userMissing: "Benutzerinformationen fehlen",
        parsingUser: "Fehler beim Parsen des Benutzers:",
        submissionError: "Fehler bei der Übermittlung:",
        submissionFailed: "Bei der Übermittlung ist ein Fehler aufgetreten"
      },
      success: {
        title: "Erfolg",
        message: "Dokumente erfolgreich eingereicht! Sie erhalten eine Bestätigungs-E-Mail."
      }
    }
  }
};

// Fonction pour mettre à jour un fichier de localisation
function updateLocaleFile(filePath, locale) {
  console.log(`🔍 Mise à jour de ${filePath}...`);
  
  try {
    // Lire le fichier existant
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Fichier ${filePath} introuvable.`);
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let localeData = JSON.parse(content);
    
    // Fonction récursive pour fusionner les objets
    function deepMerge(target, source) {
      for (const key in source) {
        if (source.hasOwnProperty(key)) {
          if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
            deepMerge(target[key], source[key]);
          } else if (!(key in target)) {
            // Ajouter uniquement si la clé n'existe pas déjà
            target[key] = source[key];
          }
        }
      }
      return target;
    }
    
    // Fusionner les nouvelles traductions avec les données existantes
    deepMerge(localeData, newTranslations[locale]);
    
    // Sauvegarder le fichier mis à jour
    fs.writeFileSync(filePath, JSON.stringify(localeData, null, 2), 'utf8');
    console.log(`✅ Fichier ${filePath} mis à jour avec succès.`);
    
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour de ${filePath}:`, error);
    return false;
  }
}

// Mettre à jour tous les fichiers de localisation
function updateAllLocaleFiles() {
  console.log('🔄 Mise à jour de tous les fichiers de localisation...');
  
  let successCount = 0;
  let errorCount = 0;
  
  localeFiles.forEach(file => {
    const locale = file.split('.')[0];
    if (newTranslations[locale]) {
      const filePath = path.join(localesDir, file);
      const success = updateLocaleFile(filePath, locale);
      
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    } else {
      console.warn(`⚠️ Aucune traduction disponible pour la locale ${locale}.`);
    }
  });
  
  console.log(`\n📊 Résumé:`);
  console.log(`✅ ${successCount} fichiers mis à jour avec succès.`);
  console.log(`❌ ${errorCount} fichiers avec des erreurs.`);
}

// Exécuter le script
updateAllLocaleFiles();