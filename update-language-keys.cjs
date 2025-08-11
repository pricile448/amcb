#!/usr/bin/env node

/**
 * Script pour ajouter les clés de langues à tous les fichiers de traduction
 * Usage: node update-language-keys.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('🌍 Ajout des clés de langues à tous les fichiers de traduction');
console.log('=============================================================\n');

// Charger le fichier français mis à jour (référence)
const frPath = path.join(__dirname, 'src/locales/fr.json');
const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));

console.log('📚 Référence française chargée');

// Les clés de langues sont universelles (même dans toutes les langues)
const languageKeys = {
  languages: {
    fr: "Français",
    en: "English", 
    es: "Español",
    pt: "Português",
    it: "Italiano",
    nl: "Nederlands",
    de: "Deutsch"
  }
};

// Fonction pour fusionner profondément les objets
function deepMerge(target, source) {
  const output = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

// Mettre à jour chaque fichier de langue
const languages = ['en', 'es', 'de', 'it', 'nl', 'pt'];

languages.forEach(lang => {
  const langPath = path.join(__dirname, `src/locales/${lang}.json`);
  
  // Charger le contenu existant
  let existingContent = {};
  if (fs.existsSync(langPath)) {
    existingContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  }
  
  // Fusionner les clés de langues (identiques pour toutes les langues)
  const updatedContent = deepMerge(existingContent, languageKeys);
  
  // Sauvegarder
  fs.writeFileSync(langPath, JSON.stringify(updatedContent, null, 2), 'utf8');
  console.log(`✅ ${lang.toUpperCase()}: Clés de langues ajoutées`);
});

console.log('\n🎉 Mise à jour terminée !');
console.log('\n📊 Clés ajoutées:');
console.log('- languages.fr: "Français"');
console.log('- languages.en: "English"');
console.log('- languages.es: "Español"');
console.log('- languages.pt: "Português"');
console.log('- languages.it: "Italiano"');
console.log('- languages.nl: "Nederlands"');
console.log('- languages.de: "Deutsch"');

console.log('\n🎯 Impact:');
console.log('- Le sélecteur de langue affichera les noms corrects');
console.log('- Les noms des langues restent cohérents peu importe la langue active');
console.log('- Plus de texte en dur dans PublicLayout.tsx');
