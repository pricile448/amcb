#!/usr/bin/env node

/**
 * Script pour trouver tous les textes français en dur dans le code
 * Usage: node find-hardcoded-french.cjs
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Recherche de tous les textes français en dur dans le code');
console.log('=========================================================\n');

// Patterns pour identifier du texte français
const frenchPatterns = [
  // Textes avec accents français
  /['"`]([^'"`]*[àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ][^'"`]*)['"]/g,
  // Mots français courants
  /['"`]((?:Bonjour|Salut|Mon|Ma|Mes|Le|La|Les|Un|Une|Des|Votre|Vos|Notre|Nos|avec|pour|dans|sur|sous|par|de|du|des|et|ou|mais|donc|car|ni|Créer|Modifier|Supprimer|Enregistrer|Annuler|Confirmer|Retour|Suivant|Précédent|Rechercher|Filtrer|Trier|Voir|Télécharger|Importer|Exporter|Partager|Copier|Coller|Couper)[^'"`]*)['"]/gi,
  // Phrases complètes en français
  /['"`]([A-Z][^'"`]*(?:de|du|des|le|la|les|un|une|et|ou|avec|pour|dans|sur|par|ment|tion|sion)[^'"`]*)['"]/g
];

// Trouver tous les fichiers TypeScript/React
const files = glob.sync('src/**/*.{ts,tsx}', { cwd: __dirname });

console.log(`📁 Analyse de ${files.length} fichiers...\n`);

const hardcodedTexts = [];
const fileResults = {};

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Ignorer les fichiers de traduction et les imports
  if (file.includes('locales/') || file.includes('i18n.')) {
    return;
  }
  
  const lines = content.split('\n');
  const fileMatches = [];
  
  lines.forEach((line, lineIndex) => {
    // Ignorer les lignes de commentaires et d'imports
    if (line.trim().startsWith('//') || 
        line.trim().startsWith('/*') || 
        line.trim().startsWith('*') ||
        line.includes('import ') ||
        line.includes('from ') ||
        line.includes('t(') || // Déjà traduit
        line.includes('useTranslation') ||
        line.includes('console.') ||
        line.includes('logger.')) {
      return;
    }
    
    frenchPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const text = match[1];
        
        // Filtrer les faux positifs
        if (text.length < 3 || 
            /^[A-Z_]+$/.test(text) || // Constantes
            /^\d/.test(text) || // Commence par un chiffre
            /^[a-z]+$/.test(text) || // Mots simples anglais
            text.includes('http') ||
            text.includes('www') ||
            text.includes('@') ||
            text.includes('.com') ||
            text.includes('firebase') ||
            text.includes('src/') ||
            text.includes('../')) {
          continue;
        }
        
        const result = {
          file: file,
          line: lineIndex + 1,
          text: text,
          fullLine: line.trim(),
          suggested: `t('${text.toLowerCase().replace(/\s+/g, '.')}')`
        };
        
        fileMatches.push(result);
        hardcodedTexts.push(result);
      }
    });
  });
  
  if (fileMatches.length > 0) {
    fileResults[file] = fileMatches;
    console.log(`📄 ${file}: ${fileMatches.length} textes français trouvés`);
  }
});

console.log(`\n🎯 Total: ${hardcodedTexts.length} textes français en dur trouvés\n`);

// Grouper par fichier et afficher les détails
console.log('📋 Détails par fichier:\n');
Object.keys(fileResults).forEach(file => {
  console.log(`📄 ${file}:`);
  fileResults[file].forEach(match => {
    console.log(`  Ligne ${match.line}: "${match.text}"`);
    console.log(`    Context: ${match.fullLine}`);
    console.log(`    Suggestion: ${match.suggested}\n`);
  });
});

// Sauvegarder les résultats
const results = {
  totalFiles: files.length,
  filesWithFrench: Object.keys(fileResults).length,
  totalHardcodedTexts: hardcodedTexts.length,
  results: fileResults
};

fs.writeFileSync(
  path.join(__dirname, 'hardcoded-french-texts.json'), 
  JSON.stringify(results, null, 2), 
  'utf8'
);

console.log('\n📊 Résumé:');
console.log(`- Fichiers analysés: ${results.totalFiles}`);
console.log(`- Fichiers avec du français en dur: ${results.filesWithFrench}`);
console.log(`- Textes français à traduire: ${results.totalHardcodedTexts}`);
console.log('\n📄 Résultats sauvegardés dans: hardcoded-french-texts.json');

if (results.totalHardcodedTexts > 0) {
  console.log('\n🔧 Prochaines étapes:');
  console.log('1. Examiner hardcoded-french-texts.json');
  console.log('2. Remplacer les textes par des clés t(...)');
  console.log('3. Ajouter les clés dans les fichiers de traduction');
  console.log('4. Tester toutes les langues');
}
