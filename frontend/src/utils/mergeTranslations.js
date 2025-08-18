/**
 * Script pour fusionner les traductions manquantes avec le fichier fr.json principal
 */

const fs = require('fs');
const path = require('path');

// Chemins des fichiers
const mainTranslationsPath = path.join(__dirname, '../locales/fr.json');
const missingTranslationsPath = path.join(__dirname, '../locales/missing_translations.json');
const outputPath = path.join(__dirname, '../locales/fr.json');

// Fonction pour fusionner récursivement deux objets
function deepMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

// Lecture des fichiers
try {
  const mainTranslations = JSON.parse(fs.readFileSync(mainTranslationsPath, 'utf8'));
  const missingTranslations = JSON.parse(fs.readFileSync(missingTranslationsPath, 'utf8'));

  // Fusion des traductions
  const mergedTranslations = deepMerge(mainTranslations, missingTranslations);

  // Écriture du fichier fusionné
  fs.writeFileSync(outputPath, JSON.stringify(mergedTranslations, null, 2), 'utf8');

  console.log('✅ Fusion des traductions réussie !');
  console.log(`Les traductions manquantes ont été ajoutées à ${outputPath}`);
} catch (error) {
  console.error('❌ Erreur lors de la fusion des traductions:', error.message);
}