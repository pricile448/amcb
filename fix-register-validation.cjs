#!/usr/bin/env node

/**
 * Script pour corriger tous les messages de validation dans RegisterPage.tsx
 * Usage: node fix-register-validation.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des messages de validation dans RegisterPage.tsx');
console.log('===========================================================\n');

// Lire le fichier RegisterPage.tsx
const registerPath = path.join(__dirname, 'src/pages/auth/RegisterPage.tsx');
let registerContent = fs.readFileSync(registerPath, 'utf8');

console.log('📄 Fichier RegisterPage.tsx chargé');

// Définir toutes les corrections à effectuer
const corrections = [
  // Messages de validation Zod
  { 
    old: '"Le prénom doit contenir au moins 2 caractères"',
    new: 't("validation.firstNameMinLength")'
  },
  { 
    old: '"Le nom doit contenir au moins 2 caractères"',
    new: 't("validation.lastNameMinLength")'
  },
  { 
    old: '"Email invalide"',
    new: 't("validation.emailInvalid")'
  },
  { 
    old: '"Numéro de téléphone invalide"',
    new: 't("validation.phoneInvalid")'
  },
  { 
    old: '"Le lieu de naissance doit contenir au moins 2 caractères"',
    new: 't("validation.birthPlaceMinLength")'
  },
  { 
    old: '"La nationalité doit contenir au moins 2 caractères"',
    new: 't("validation.nationalityMinLength")'
  },
  { 
    old: '"Le pays de résidence doit contenir au moins 2 caractères"',
    new: 't("validation.residenceCountryMinLength")'
  },
  { 
    old: '"L\'adresse doit contenir au moins 5 caractères"',
    new: 't("validation.addressMinLength")'
  },
  { 
    old: '"La ville doit contenir au moins 2 caractères"',
    new: 't("validation.cityMinLength")'
  },
  { 
    old: '"Le code postal doit contenir au moins 4 caractères"',
    new: 't("validation.postalCodeMinLength")'
  },
  { 
    old: '"La profession doit contenir au moins 2 caractères"',
    new: 't("validation.professionMinLength")'
  },
  { 
    old: '"Le salaire est requis"',
    new: 't("validation.salaryRequired")'
  },
  { 
    old: '"Le mot de passe doit contenir au moins 8 caractères"',
    new: 't("validation.passwordMinLength")'
  },
  { 
    old: '"Vous devez accepter les conditions"',
    new: 't("validation.acceptTermsRequired")'
  },
  { 
    old: '"Les mots de passe ne correspondent pas"',
    new: 't("validation.passwordMismatch")'
  },
  
  // Messages d'erreur dans le code
  { 
    old: "'Erreur lors de l\\'envoi de l\\'email'",
    new: 't("auth.emailSendError")'
  },
  { 
    old: "'Compte créé ! Veuillez vérifier votre email pour activer votre compte.'",
    new: 't("auth.accountCreatedSuccess")'
  },
  { 
    old: "'Vérifiez votre email pour activer votre compte'",
    new: 't("auth.verifyEmailMessage")'
  },
  { 
    old: "'Erreur lors de la création du compte'",
    new: 't("auth.accountCreationError")'
  },
  { 
    old: "'Cet email est déjà utilisé'",
    new: 't("auth.emailAlreadyUsed")'
  },
  { 
    old: "'Le mot de passe est trop faible'",
    new: 't("auth.passwordTooWeak")'
  },
  
  // Textes dans les placeholders
  { 
    old: '"Ex: Française"',
    new: 't("placeholders.nationality")'
  },
];

let changesCount = 0;

// Appliquer toutes les corrections
corrections.forEach(correction => {
  const regex = new RegExp(correction.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = registerContent.match(regex);
  if (matches) {
    registerContent = registerContent.replace(regex, correction.new);
    changesCount += matches.length;
    console.log(`✅ Remplacé "${correction.old}" par "${correction.new}" (${matches.length}x)`);
  }
});

// Sauvegarder le fichier modifié
fs.writeFileSync(registerPath, registerContent, 'utf8');

console.log(`\n🎉 RegisterPage.tsx corrigé !`);
console.log(`📊 Total: ${changesCount} remplacements effectués`);

// Maintenant ajouter toutes ces clés aux fichiers de traduction
console.log('\n🌍 Ajout des clés de validation aux fichiers de traduction...');

const validationKeys = {
  validation: {
    firstNameMinLength: "Le prénom doit contenir au moins 2 caractères",
    lastNameMinLength: "Le nom doit contenir au moins 2 caractères", 
    emailInvalid: "Email invalide",
    phoneInvalid: "Numéro de téléphone invalide",
    birthPlaceMinLength: "Le lieu de naissance doit contenir au moins 2 caractères",
    nationalityMinLength: "La nationalité doit contenir au moins 2 caractères",
    residenceCountryMinLength: "Le pays de résidence doit contenir au moins 2 caractères",
    addressMinLength: "L'adresse doit contenir au moins 5 caractères",
    cityMinLength: "La ville doit contenir au moins 2 caractères",
    postalCodeMinLength: "Le code postal doit contenir au moins 4 caractères",
    professionMinLength: "La profession doit contenir au moins 2 caractères",
    salaryRequired: "Le salaire est requis",
    passwordMinLength: "Le mot de passe doit contenir au moins 8 caractères",
    acceptTermsRequired: "Vous devez accepter les conditions",
    passwordMismatch: "Les mots de passe ne correspondent pas"
  },
  auth: {
    emailSendError: "Erreur lors de l'envoi de l'email",
    accountCreatedSuccess: "Compte créé ! Veuillez vérifier votre email pour activer votre compte.",
    verifyEmailMessage: "Vérifiez votre email pour activer votre compte",
    accountCreationError: "Erreur lors de la création du compte",
    emailAlreadyUsed: "Cet email est déjà utilisé",
    passwordTooWeak: "Le mot de passe est trop faible"
  },
  placeholders: {
    nationality: "Ex: Française"
  }
};

// Ajouter ces clés au fichier français
const frPath = path.join(__dirname, 'src/locales/fr.json');
const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// Fusionner les nouvelles clés
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

const updatedFrContent = deepMerge(frContent, validationKeys);
fs.writeFileSync(frPath, JSON.stringify(updatedFrContent, null, 2), 'utf8');

console.log('✅ Clés ajoutées au fichier français');

// Traductions pour les autres langues
const translations = {
  en: {
    validation: {
      firstNameMinLength: "First name must contain at least 2 characters",
      lastNameMinLength: "Last name must contain at least 2 characters",
      emailInvalid: "Invalid email",
      phoneInvalid: "Invalid phone number", 
      birthPlaceMinLength: "Birth place must contain at least 2 characters",
      nationalityMinLength: "Nationality must contain at least 2 characters",
      residenceCountryMinLength: "Country of residence must contain at least 2 characters",
      addressMinLength: "Address must contain at least 5 characters",
      cityMinLength: "City must contain at least 2 characters",
      postalCodeMinLength: "Postal code must contain at least 4 characters",
      professionMinLength: "Profession must contain at least 2 characters",
      salaryRequired: "Salary is required",
      passwordMinLength: "Password must contain at least 8 characters",
      acceptTermsRequired: "You must accept the terms",
      passwordMismatch: "Passwords do not match"
    },
    auth: {
      emailSendError: "Error sending email",
      accountCreatedSuccess: "Account created! Please check your email to activate your account.",
      verifyEmailMessage: "Check your email to activate your account",
      accountCreationError: "Error creating account",
      emailAlreadyUsed: "This email is already used", 
      passwordTooWeak: "Password is too weak"
    },
    placeholders: {
      nationality: "Ex: French"
    }
  },
  es: {
    validation: {
      firstNameMinLength: "El nombre debe contener al menos 2 caracteres",
      lastNameMinLength: "El apellido debe contener al menos 2 caracteres",
      emailInvalid: "Email inválido",
      phoneInvalid: "Número de teléfono inválido",
      birthPlaceMinLength: "El lugar de nacimiento debe contener al menos 2 caracteres",
      nationalityMinLength: "La nacionalidad debe contener al menos 2 caracteres",
      residenceCountryMinLength: "El país de residencia debe contener al menos 2 caracteres",
      addressMinLength: "La dirección debe contener al menos 5 caracteres",
      cityMinLength: "La ciudad debe contener al menos 2 caracteres",
      postalCodeMinLength: "El código postal debe contener al menos 4 caracteres",
      professionMinLength: "La profesión debe contener al menos 2 caracteres",
      salaryRequired: "El salario es requerido",
      passwordMinLength: "La contraseña debe contener al menos 8 caracteres",
      acceptTermsRequired: "Debe aceptar los términos",
      passwordMismatch: "Las contraseñas no coinciden"
    },
    auth: {
      emailSendError: "Error al enviar email",
      accountCreatedSuccess: "¡Cuenta creada! Por favor revise su email para activar su cuenta.",
      verifyEmailMessage: "Revise su email para activar su cuenta",
      accountCreationError: "Error al crear la cuenta",
      emailAlreadyUsed: "Este email ya está en uso",
      passwordTooWeak: "La contraseña es muy débil"
    },
    placeholders: {
      nationality: "Ej: Española"
    }
  }
  // Note: Je peux ajouter DE, IT, NL, PT si nécessaire
};

// Mettre à jour les autres langues
Object.keys(translations).forEach(lang => {
  const langPath = path.join(__dirname, `src/locales/${lang}.json`);
  
  let existingContent = {};
  if (fs.existsSync(langPath)) {
    existingContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  }
  
  const updatedContent = deepMerge(existingContent, translations[lang]);
  fs.writeFileSync(langPath, JSON.stringify(updatedContent, null, 2), 'utf8');
  
  console.log(`✅ ${lang.toUpperCase()}: Clés de validation traduites`);
});

console.log('\n🎉 RegisterPage.tsx entièrement corrigé !');
console.log('📋 Prochaine étape: Corriger LoginPage.tsx');
