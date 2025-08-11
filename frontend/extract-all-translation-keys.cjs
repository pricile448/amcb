#!/usr/bin/env node

/**
 * Script pour extraire toutes les clés de traduction utilisées dans l'application
 * Usage: node extract-all-translation-keys.cjs
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔍 Extraction de toutes les clés de traduction utilisées dans l\'application');
console.log('========================================================================\n');

// Fonction pour extraire les clés de traduction d'un fichier
function extractTranslationKeys(filePath, content) {
  const keys = new Set();
  
  // Patterns pour trouver les clés de traduction
  const patterns = [
    // t("key") ou t('key')
    /t\(\s*["']([^"']+)["']\s*\)/g,
    // t(`key`)
    /t\(\s*`([^`]+)`\s*\)/g,
    // Patterns avec interpolation
    /t\(\s*["']([^"']+)["']\s*,\s*\{[^}]*\}\s*\)/g,
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  });
  
  return Array.from(keys);
}

// Trouver tous les fichiers TypeScript/React
const files = glob.sync('src/**/*.{ts,tsx}', { cwd: __dirname });

const allKeys = new Set();
const keysByFile = {};

console.log(`📁 Analyse de ${files.length} fichiers...\n`);

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('useTranslation') || content.includes('t(')) {
    const keys = extractTranslationKeys(file, content);
    
    if (keys.length > 0) {
      keysByFile[file] = keys;
      keys.forEach(key => allKeys.add(key));
      console.log(`📄 ${file}: ${keys.length} clés trouvées`);
    }
  }
});

console.log(`\n🎯 Total: ${allKeys.size} clés de traduction uniques trouvées\n`);

// Organiser les clés par section
const keysBySection = {};
Array.from(allKeys).forEach(key => {
  const sections = key.split('.');
  if (sections.length >= 2) {
    const section = sections[0];
    if (!keysBySection[section]) {
      keysBySection[section] = [];
    }
    keysBySection[section].push(key);
  } else {
    if (!keysBySection['root']) {
      keysBySection['root'] = [];
    }
    keysBySection['root'].push(key);
  }
});

console.log('📊 Répartition par section:');
Object.keys(keysBySection).sort().forEach(section => {
  console.log(`  ${section}: ${keysBySection[section].length} clés`);
});

// Charger le fichier français actuel
const frPath = path.join(__dirname, 'src/locales/fr.json');
const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// Fonction pour vérifier si une clé existe dans l'objet de traduction
function hasKey(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return false;
    }
  }
  
  return true;
}

// Trouver les clés manquantes
const missingKeys = Array.from(allKeys).filter(key => !hasKey(frContent, key));

console.log(`\n❌ Clés manquantes dans fr.json: ${missingKeys.length}`);
if (missingKeys.length > 0) {
  console.log('\nClés manquantes:');
  missingKeys.forEach(key => {
    console.log(`  - ${key}`);
  });
}

// Créer un fichier avec toutes les clés manquantes
if (missingKeys.length > 0) {
  const missingKeysStructure = {};
  
  missingKeys.forEach(key => {
    const parts = key.split('.');
    let current = missingKeysStructure;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // Dernière partie, ajouter la clé avec une valeur par défaut
        current[part] = `[MISSING] ${key}`;
      } else {
        // Partie intermédiaire, créer un objet
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }
  });
  
  const missingKeysPath = path.join(__dirname, 'missing-translation-keys.json');
  fs.writeFileSync(missingKeysPath, JSON.stringify(missingKeysStructure, null, 2), 'utf8');
  console.log(`\n📄 Clés manquantes sauvegardées dans: missing-translation-keys.json`);
}

console.log('\n📝 Rapport d\'extraction terminé:');
console.log(`- Fichiers analysés: ${files.length}`);
console.log(`- Clés trouvées: ${allKeys.size}`);
console.log(`- Clés présentes dans fr.json: ${allKeys.size - missingKeys.length}`);
console.log(`- Clés manquantes: ${missingKeys.length}`);

if (missingKeys.length > 0) {
  console.log('\n🔧 Actions recommandées:');
  console.log('1. Examiner missing-translation-keys.json');
  console.log('2. Ajouter les clés manquantes à fr.json');
  console.log('3. Relancer les scripts de traduction');
  console.log('4. Vérifier que toutes les traductions fonctionnent');
}
