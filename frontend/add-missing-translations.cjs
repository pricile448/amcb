const fs = require('fs');
const path = require('path');

// Ajouter les clés manquantes aux autres langues
function addMissingTranslations() {
  const languages = ['en', 'es', 'pt', 'it', 'nl', 'de'];
  
  const translations = {
    en: {
      "accounts": {
        "lastTransaction": "Last operation"
      },
      "transactions": {
        "noRecent": "No recent transactions"
      }
    },
    es: {
      "accounts": {
        "lastTransaction": "Última operación"
      },
      "transactions": {
        "noRecent": "Sin transacciones recientes"
      }
    },
    pt: {
      "accounts": {
        "lastTransaction": "Última operação"
      },
      "transactions": {
        "noRecent": "Nenhuma transação recente"
      }
    },
    it: {
      "accounts": {
        "lastTransaction": "Ultima operazione"
      },
      "transactions": {
        "noRecent": "Nessuna transazione recente"
      }
    },
    nl: {
      "accounts": {
        "lastTransaction": "Laatste operatie"
      },
      "transactions": {
        "noRecent": "Geen recente transacties"
      }
    },
    de: {
      "accounts": {
        "lastTransaction": "Letzte Operation"
      },
      "transactions": {
        "noRecent": "Keine kürzlichen Transaktionen"
      }
    }
  };
  
  languages.forEach(lang => {
    const langPath = path.join(__dirname, 'src', 'locales', `${lang}.json`);
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    
    // Fusionner les nouvelles traductions
    const updatedLang = { ...langData, ...translations[lang] };
    
    fs.writeFileSync(langPath, JSON.stringify(updatedLang, null, 2));
    console.log(`✅ Clés manquantes ajoutées au fichier ${lang}.json`);
  });
}

// Exécuter le script
console.log('🔧 Ajout des clés manquantes...');
addMissingTranslations();
console.log('✅ Toutes les clés manquantes ont été ajoutées !');
