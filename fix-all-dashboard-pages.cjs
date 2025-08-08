const fs = require('fs');
const path = require('path');

// Pages du dashboard à vérifier
const dashboardPages = [
  'AccountsPage.tsx',
  'IbanPage.tsx', 
  'CardsPage.tsx',
  'BudgetsPage.tsx',
  'HelpPage.tsx',
  'DocumentsPage.tsx',
  'HistoryPage.tsx',
  'MessagesPage.tsx'
];

// Textes hardcodés communs trouvés dans les pages du dashboard
const commonHardcodedTexts = {
  // Titres de pages
  "Mes Comptes": "accounts.title",
  "Mon IBAN": "nav.iban", 
  "Mes Cartes": "cards.title",
  "Mes Budgets": "budgets.title",
  "Aide & Support": "nav.help",
  "Mes Documents": "nav.documents",
  "Historique": "nav.history",
  "Messages": "nav.messages",
  
  // Actions communes
  "Voir tout": "dashboard.viewAll",
  "Voir tous": "dashboard.viewAll",
  "Ajouter": "common.add",
  "Modifier": "common.edit",
  "Supprimer": "common.delete",
  "Enregistrer": "common.save",
  "Annuler": "common.cancel",
  "Confirmer": "common.confirm",
  "Fermer": "common.close",
  "Rechercher": "common.search",
  "Filtrer": "common.filter",
  "Trier": "common.sort",
  "Voir": "common.view",
  "Télécharger": "common.download",
  "Télécharger": "common.upload",
  
  // Statuts
  "Actif": "accounts.active",
  "Inactif": "accounts.inactive",
  "En cours": "verification.status.pending",
  "Terminé": "transfers.status.completed",
  "En attente": "transfers.status.pending",
  "Échoué": "transfers.status.failed",
  
  // Messages
  "Aucun résultat trouvé": "common.noResults",
  "Chargement...": "common.loading",
  "Erreur": "common.error",
  "Succès": "common.success",
  
  // Formulaires
  "Prénom": "settings.firstName",
  "Nom": "settings.lastName", 
  "Email": "settings.email",
  "Téléphone": "settings.phone",
  "Adresse": "settings.address",
  "Ville": "settings.city",
  "Code postal": "settings.postalCode",
  "Pays": "settings.country",
  "Devise": "settings.currency",
  "Montant": "transfers.amount",
  "Description": "transfers.description",
  "Date": "common.date",
  "Catégorie": "transactions.category"
};

// Fonction pour lire un fichier et identifier les textes hardcodés
function findHardcodedTexts(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const foundTexts = [];
    
    // Chercher les textes hardcodés français
    Object.keys(commonHardcodedTexts).forEach(text => {
      if (content.includes(`"${text}"`) || content.includes(`'${text}'`)) {
        foundTexts.push({
          text: text,
          key: commonHardcodedTexts[text],
          file: path.basename(filePath)
        });
      }
    });
    
    return foundTexts;
  } catch (error) {
    console.error(`❌ Erreur lecture fichier ${filePath}:`, error.message);
    return [];
  }
}

// Fonction pour analyser toutes les pages du dashboard
function analyzeDashboardPages() {
  console.log('🔍 Analyse des pages du dashboard...');
  
  const allHardcodedTexts = [];
  
  dashboardPages.forEach(page => {
    const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', page);
    
    if (fs.existsSync(filePath)) {
      const hardcodedTexts = findHardcodedTexts(filePath);
      allHardcodedTexts.push(...hardcodedTexts);
      console.log(`📄 ${page}: ${hardcodedTexts.length} textes hardcodés trouvés`);
    } else {
      console.log(`⚠️  Fichier non trouvé: ${page}`);
    }
  });
  
  return allHardcodedTexts;
}

// Fonction pour ajouter les clés manquantes aux fichiers de traduction
function addMissingTranslationKeys(hardcodedTexts) {
  console.log('\n🔧 Ajout des clés manquantes aux fichiers de traduction...');
  
  // Extraire les clés uniques
  const uniqueKeys = [...new Set(hardcodedTexts.map(item => item.key))];
  
  // Ajouter les nouvelles clés au fichier fr.json
  const frPath = path.join(__dirname, 'src', 'locales', 'fr.json');
  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  
  // Créer les nouvelles clés avec des valeurs par défaut
  const newKeys = {};
  
  uniqueKeys.forEach(key => {
    const parts = key.split('.');
    let current = newKeys;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    // Trouver le texte français correspondant
    const hardcodedItem = hardcodedTexts.find(item => item.key === key);
    current[parts[parts.length - 1]] = hardcodedItem ? hardcodedItem.text : key;
  });
  
  // Fusionner avec le fichier existant
  const updatedFr = { ...fr, ...newKeys };
  fs.writeFileSync(frPath, JSON.stringify(updatedFr, null, 2));
  
  console.log('✅ Nouvelles clés ajoutées au fichier fr.json');
  
  // Ajouter les traductions aux autres langues
  const languages = ['en', 'es', 'pt', 'it', 'nl', 'de'];
  
  const translations = {
    en: {
      "accounts": {
        "inactive": "Inactive"
      },
      "common": {
        "noResults": "No results found",
        "date": "Date"
      },
      "transfers": {
        "amount": "Amount",
        "description": "Description"
      },
      "transactions": {
        "category": "Category"
      },
      "settings": {
        "country": "Country"
      }
    },
    es: {
      "accounts": {
        "inactive": "Inactivo"
      },
      "common": {
        "noResults": "No se encontraron resultados",
        "date": "Fecha"
      },
      "transfers": {
        "amount": "Cantidad",
        "description": "Descripción"
      },
      "transactions": {
        "category": "Categoría"
      },
      "settings": {
        "country": "País"
      }
    },
    pt: {
      "accounts": {
        "inactive": "Inativo"
      },
      "common": {
        "noResults": "Nenhum resultado encontrado",
        "date": "Data"
      },
      "transfers": {
        "amount": "Valor",
        "description": "Descrição"
      },
      "transactions": {
        "category": "Categoria"
      },
      "settings": {
        "country": "País"
      }
    },
    it: {
      "accounts": {
        "inactive": "Inattivo"
      },
      "common": {
        "noResults": "Nessun risultato trovato",
        "date": "Data"
      },
      "transfers": {
        "amount": "Importo",
        "description": "Descrizione"
      },
      "transactions": {
        "category": "Categoria"
      },
      "settings": {
        "country": "Paese"
      }
    },
    nl: {
      "accounts": {
        "inactive": "Inactief"
      },
      "common": {
        "noResults": "Geen resultaten gevonden",
        "date": "Datum"
      },
      "transfers": {
        "amount": "Bedrag",
        "description": "Beschrijving"
      },
      "transactions": {
        "category": "Categorie"
      },
      "settings": {
        "country": "Land"
      }
    },
    de: {
      "accounts": {
        "inactive": "Inaktiv"
      },
      "common": {
        "noResults": "Keine Ergebnisse gefunden",
        "date": "Datum"
      },
      "transfers": {
        "amount": "Betrag",
        "description": "Beschreibung"
      },
      "transactions": {
        "category": "Kategorie"
      },
      "settings": {
        "country": "Land"
      }
    }
  };
  
  languages.forEach(lang => {
    const langPath = path.join(__dirname, 'src', 'locales', `${lang}.json`);
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    
    // Fusionner les nouvelles traductions
    const updatedLang = { ...langData, ...translations[lang] };
    
    fs.writeFileSync(langPath, JSON.stringify(updatedLang, null, 2));
    console.log(`✅ Traductions ajoutées au fichier ${lang}.json`);
  });
}

// Fonction pour générer un rapport
function generateReport(hardcodedTexts) {
  console.log('\n📊 RAPPORT D\'ANALYSE:');
  console.log('========================');
  console.log(`Total de textes hardcodés trouvés: ${hardcodedTexts.length}`);
  
  // Grouper par fichier
  const byFile = {};
  hardcodedTexts.forEach(item => {
    if (!byFile[item.file]) {
      byFile[item.file] = [];
    }
    byFile[item.file].push(item);
  });
  
  Object.keys(byFile).forEach(file => {
    console.log(`\n📄 ${file}:`);
    byFile[file].forEach(item => {
      console.log(`  - "${item.text}" → ${item.key}`);
    });
  });
  
  console.log('\n💡 PROCHAINES ÉTAPES:');
  console.log('1. Remplacer les textes hardcodés par t() dans chaque fichier');
  console.log('2. Tester la compilation');
  console.log('3. Vérifier que toutes les traductions fonctionnent');
}

// Exécuter l'analyse
console.log('🚀 Début de l\'analyse des pages du dashboard...\n');

const hardcodedTexts = analyzeDashboardPages();
addMissingTranslationKeys(hardcodedTexts);
generateReport(hardcodedTexts);

console.log('\n✅ Analyse terminée !');
