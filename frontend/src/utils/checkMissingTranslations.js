/**
 * Script pour vérifier les clés de traduction manquantes dans le code
 * Ce script analyse les fichiers du projet pour trouver les appels à la fonction de traduction
 * et vérifie si les clés utilisées existent dans les fichiers de traduction.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Chemins des fichiers
const translationsPath = path.join(__dirname, '../locales/fr.json');
const srcPath = path.join(__dirname, '../');

// Fonction pour charger les traductions
function loadTranslations() {
  try {
    const translationsContent = fs.readFileSync(translationsPath, 'utf8');
    return JSON.parse(translationsContent);
  } catch (error) {
    console.error(`Erreur lors de la lecture du fichier de traductions: ${error.message}`);
    process.exit(1);
  }
}

// Fonction pour vérifier si une clé existe dans les traductions
function keyExists(translations, key) {
  const parts = key.split('.');
  let current = translations;
  
  for (const part of parts) {
    if (current === undefined || current[part] === undefined) {
      return false;
    }
    current = current[part];
  }
  
  return true;
}

// Fonction pour extraire les clés de traduction des fichiers
function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = [];
  
  // Regex pour trouver les appels à t("key") ou t('key')
  const regex = /t\(["']([^"']+)["']\)/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }
  
  return keys;
}

// Fonction principale
async function checkMissingTranslations() {
  const translations = loadTranslations();
  const files = await glob(path.join(srcPath, '**/*.{ts,tsx,js,jsx}'), {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
  
  const missingKeys = {};
  let totalMissingKeys = 0;
  
  for (const file of files) {
    const keys = extractTranslationKeys(file);
    const relativePath = path.relative(srcPath, file);
    
    for (const key of keys) {
      if (!keyExists(translations, key)) {
        if (!missingKeys[relativePath]) {
          missingKeys[relativePath] = [];
        }
        if (!missingKeys[relativePath].includes(key)) {
          missingKeys[relativePath].push(key);
          totalMissingKeys++;
        }
      }
    }
  }
  
  // Afficher les résultats
  if (totalMissingKeys > 0) {
    console.log('\n🔍 Clés de traduction manquantes détectées:');
    console.log('===========================================');
    
    for (const file in missingKeys) {
      console.log(`\n📄 ${file}:`);
      missingKeys[file].forEach(key => {
        console.log(`  - ${key}`);
      });
    }
    
    console.log('\n===========================================');
    console.log(`Total: ${totalMissingKeys} clés manquantes`);
    
    // Générer un fichier JSON avec les clés manquantes
    const missingKeysOutput = {};
    
    for (const file in missingKeys) {
      for (const key of missingKeys[file]) {
        const parts = key.split('.');
        let current = missingKeysOutput;
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (i === parts.length - 1) {
            current[part] = "";
          } else {
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
        }
      }
    }
    
    const outputPath = path.join(__dirname, '../locales/missing_keys.json');
    fs.writeFileSync(outputPath, JSON.stringify(missingKeysOutput, null, 2), 'utf8');
    console.log(`\n✅ Un fichier avec les clés manquantes a été généré: ${outputPath}`);
  } else {
    console.log('\n✅ Aucune clé de traduction manquante détectée!');
  }
}

// Exécuter la fonction principale
checkMissingTranslations().catch(error => {
  console.error(`\n❌ Erreur: ${error.message}`);
  process.exit(1);
});