#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🧪 TEST DES TRADUCTIONS KYC\n');

// Vérifier que tous les fichiers de langue ont la section KYC
const localesDir = './frontend/src/locales';
const languages = ['fr', 'en', 'de', 'pt', 'nl', 'it', 'es'];

const requiredKeys = [
  'kyc.noActiveAccounts',
  'kyc.noTransactionsAvailable', 
  'kyc.noDataAvailable',
  'kyc.kycRequired',
  'kyc.kycPending',
  'kyc.kycVerified'
];

console.log('📋 VÉRIFICATION DES FICHIERS DE LANGUE:');
console.log('=====================================\n');

let allValid = true;

for (const lang of languages) {
  const filePath = path.join(localesDir, `${lang}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${lang.toUpperCase()}: Fichier manquant`);
    allValid = false;
    continue;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);
    
    if (!translations.kyc) {
      console.log(`❌ ${lang.toUpperCase()}: Section 'kyc' manquante`);
      allValid = false;
      continue;
    }

    const missingKeys = [];
    for (const key of requiredKeys) {
      const keyParts = key.split('.');
      let value = translations;
      
      for (const part of keyParts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          missingKeys.push(key);
          break;
        }
      }
    }

    if (missingKeys.length === 0) {
      console.log(`✅ ${lang.toUpperCase()}: Toutes les clés KYC présentes`);
      
      // Afficher quelques exemples
      const examples = [
        translations.kyc.noActiveAccounts,
        translations.kyc.noTransactionsAvailable,
        translations.kyc.noDataAvailable
      ];
      console.log(`   Exemples: ${examples.join(' | ')}`);
    } else {
      console.log(`❌ ${lang.toUpperCase()}: Clés manquantes: ${missingKeys.join(', ')}`);
      allValid = false;
    }
    
  } catch (error) {
    console.log(`❌ ${lang.toUpperCase()}: Erreur de lecture/parsing: ${error.message}`);
    allValid = false;
  }
  
  console.log('');
}

console.log('📊 RÉSULTAT:');
console.log('============');
if (allValid) {
  console.log('✅ TOUTES LES TRADUCTIONS KYC SONT PRÉSENTES !');
  console.log('🎯 Le problème vient probablement du rendu des composants React');
} else {
  console.log('❌ CERTAINES TRADUCTIONS KYC SONT MANQUANTES');
  console.log('🔧 Vérifiez les fichiers de langue mentionnés ci-dessus');
}

console.log('\n💡 PROCHAINES ÉTAPES:');
console.log('====================');
console.log('1. Vérifiez que l\'application compile sans erreur');
console.log('2. Testez le composant TranslationTest dans le dashboard');
console.log('3. Vérifiez la console du navigateur pour les erreurs');
console.log('4. Assurez-vous que i18n est bien initialisé avant le rendu');
