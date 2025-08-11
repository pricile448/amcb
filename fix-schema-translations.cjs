#!/usr/bin/env node

/**
 * Script pour corriger les schémas Zod qui ne peuvent pas utiliser t() directement
 * Usage: node fix-schema-translations.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des schémas Zod et messages de validation');
console.log('=====================================================\n');

// Corriger RegisterPage.tsx
const registerPath = path.join(__dirname, 'src/pages/auth/RegisterPage.tsx');
let registerContent = fs.readFileSync(registerPath, 'utf8');

console.log('📄 Correction de RegisterPage.tsx...');

// Pour les schémas Zod, on doit utiliser des chaînes statiques et les traduire dans l'interface
const registerSchemaFixes = [
  {
    old: 't("validation.firstNameMinLength")',
    new: '"Le prénom doit contenir au moins 2 caractères"'
  },
  {
    old: 't("validation.lastNameMinLength")', 
    new: '"Le nom doit contenir au moins 2 caractères"'
  },
  {
    old: 't("validation.emailInvalid")',
    new: '"Email invalide"'
  },
  {
    old: 't("validation.phoneInvalid")',
    new: '"Numéro de téléphone invalide"'
  },
  {
    old: 't("validation.birthPlaceMinLength")',
    new: '"Le lieu de naissance doit contenir au moins 2 caractères"'
  },
  {
    old: 't("validation.nationalityMinLength")',
    new: '"La nationalité doit contenir au moins 2 caractères"'
  },
  {
    old: 't("validation.residenceCountryMinLength")',
    new: '"Le pays de résidence doit contenir au moins 2 caractères"'
  },
  {
    old: 't("validation.addressMinLength")',
    new: '"L\'adresse doit contenir au moins 5 caractères"'
  },
  {
    old: 't("validation.cityMinLength")',
    new: '"La ville doit contenir au moins 2 caractères"'
  },
  {
    old: 't("validation.postalCodeMinLength")',
    new: '"Le code postal doit contenir au moins 4 caractères"'
  },
  {
    old: 't("validation.professionMinLength")',
    new: '"La profession doit contenir au moins 2 caractères"'
  },
  {
    old: 't("validation.salaryRequired")',
    new: '"Le salaire est requis"'
  },
  {
    old: 't("validation.passwordMinLength")',
    new: '"Le mot de passe doit contenir au moins 8 caractères"'
  },
  {
    old: 't("validation.acceptTermsRequired")',
    new: '"Vous devez accepter les conditions"'
  },
  {
    old: 't("validation.passwordMismatch")',
    new: '"Les mots de passe ne correspondent pas"'
  }
];

// Appliquer les corrections au schéma
registerSchemaFixes.forEach(fix => {
  registerContent = registerContent.replace(fix.old, fix.new);
});

// Corriger les autres messages avec cast de type
registerContent = registerContent.replace(
  /t\("auth\.emailSendError"\)/g,
  '(t("auth.emailSendError") as string)'
);

fs.writeFileSync(registerPath, registerContent, 'utf8');
console.log('✅ RegisterPage.tsx corrigé');

// Corriger LoginPage.tsx
const loginPath = path.join(__dirname, 'src/pages/auth/LoginPage.tsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');

console.log('📄 Correction de LoginPage.tsx...');

const loginSchemaFixes = [
  {
    old: 't("validation.emailInvalid")',
    new: '"Email invalide"'
  },
  {
    old: 't("validation.passwordMinLength6")',
    new: '"Le mot de passe doit contenir au moins 6 caractères"'
  }
];

// Appliquer les corrections au schéma
loginSchemaFixes.forEach(fix => {
  loginContent = loginContent.replace(fix.old, fix.new);
});

// Corriger les messages avec cast de type
const loginMessageFixes = [
  't("auth.userNotFoundInDatabase")',
  't("auth.invalidCredentials")',
  't("validation.emailInvalid")'
];

loginMessageFixes.forEach(msg => {
  const regex = new RegExp(msg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  loginContent = loginContent.replace(regex, `(${msg} as string)`);
});

fs.writeFileSync(loginPath, loginContent, 'utf8');
console.log('✅ LoginPage.tsx corrigé');

console.log('\n🎉 Corrections terminées !');
console.log('📋 Changements:');
console.log('- Schémas Zod: retour aux chaînes statiques françaises');
console.log('- Messages d\'erreur: cast explicite avec "as string"');
console.log('- Interface: traductions dynamiques avec t() conservées');

console.log('\n💡 Note:');
console.log('- Les schémas Zod utilisent le français par défaut');
console.log('- L\'internationalisation se fait dans l\'interface utilisateur');
console.log('- Cela garantit la compatibilité TypeScript tout en conservant la traduction des erreurs visibles');
