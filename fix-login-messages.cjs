#!/usr/bin/env node

/**
 * Script pour corriger tous les messages dans LoginPage.tsx
 * Usage: node fix-login-messages.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction des messages dans LoginPage.tsx');
console.log('=============================================\n');

// Lire le fichier LoginPage.tsx
const loginPath = path.join(__dirname, 'src/pages/auth/LoginPage.tsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');

console.log('📄 Fichier LoginPage.tsx chargé');

// Définir toutes les corrections à effectuer
const corrections = [
  // Messages de validation Zod
  { 
    old: '"Email invalide"',
    new: 't("validation.emailInvalid")'
  },
  { 
    old: '"Le mot de passe doit contenir au moins 6 caractères"',
    new: 't("validation.passwordMinLength6")'
  },
  
  // Messages d'erreur dans le code
  { 
    old: "'Utilisateur non trouvé dans la base de données'",
    new: 't("auth.userNotFoundInDatabase")'
  },
  { 
    old: "'Veuillez vérifier votre email avant de vous connecter. Vérifiez vos spams ou demandez un nouveau code.'",
    new: 't("auth.verifyEmailBeforeLogin")'
  },
  { 
    old: "'Veuillez vérifier votre email avant de vous connecter.'",
    new: 't("auth.verifyEmailBeforeLoginShort")'
  },
  { 
    old: "'Bienvenue ! Votre compte a été vérifié avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.'",
    new: 't("auth.welcomeAccountVerified")'
  },
  { 
    old: "'Email ou mot de passe incorrect'",
    new: 't("auth.invalidCredentials")'
  },
  { 
    old: "'Trop de tentatives. Veuillez réessayer plus tard.'",
    new: 't("auth.tooManyAttempts")'
  },
  { 
    old: "'Ce compte a été désactivé.'",
    new: 't("auth.accountDisabled")'
  },
  { 
    old: "'Email invalide'",
    new: 't("validation.emailInvalid")'
  },
];

let changesCount = 0;

// Appliquer toutes les corrections
corrections.forEach(correction => {
  const regex = new RegExp(correction.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = loginContent.match(regex);
  if (matches) {
    loginContent = loginContent.replace(regex, correction.new);
    changesCount += matches.length;
    console.log(`✅ Remplacé "${correction.old}" par "${correction.new}" (${matches.length}x)`);
  }
});

// Sauvegarder le fichier modifié
fs.writeFileSync(loginPath, loginContent, 'utf8');

console.log(`\n🎉 LoginPage.tsx corrigé !`);
console.log(`📊 Total: ${changesCount} remplacements effectués`);

// Maintenant ajouter les nouvelles clés aux fichiers de traduction
console.log('\n🌍 Ajout des nouvelles clés de login aux fichiers de traduction...');

const newAuthKeys = {
  validation: {
    passwordMinLength6: "Le mot de passe doit contenir au moins 6 caractères"
  },
  auth: {
    userNotFoundInDatabase: "Utilisateur non trouvé dans la base de données",
    verifyEmailBeforeLogin: "Veuillez vérifier votre email avant de vous connecter. Vérifiez vos spams ou demandez un nouveau code.",
    verifyEmailBeforeLoginShort: "Veuillez vérifier votre email avant de vous connecter.",
    welcomeAccountVerified: "Bienvenue ! Votre compte a été vérifié avec succès. Vous pouvez maintenant accéder à toutes les fonctionnalités.",
    invalidCredentials: "Email ou mot de passe incorrect",
    tooManyAttempts: "Trop de tentatives. Veuillez réessayer plus tard.",
    accountDisabled: "Ce compte a été désactivé"
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

// Ajouter ces clés au fichier français
const frPath = path.join(__dirname, 'src/locales/fr.json');
const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));

const updatedFrContent = deepMerge(frContent, newAuthKeys);
fs.writeFileSync(frPath, JSON.stringify(updatedFrContent, null, 2), 'utf8');

console.log('✅ Nouvelles clés ajoutées au fichier français');

// Traductions pour les autres langues
const loginTranslations = {
  en: {
    validation: {
      passwordMinLength6: "Password must contain at least 6 characters"
    },
    auth: {
      userNotFoundInDatabase: "User not found in database",
      verifyEmailBeforeLogin: "Please verify your email before logging in. Check your spam or request a new code.",
      verifyEmailBeforeLoginShort: "Please verify your email before logging in.",
      welcomeAccountVerified: "Welcome! Your account has been verified successfully. You can now access all features.",
      invalidCredentials: "Invalid email or password",
      tooManyAttempts: "Too many attempts. Please try again later.",
      accountDisabled: "This account has been disabled"
    }
  },
  es: {
    validation: {
      passwordMinLength6: "La contraseña debe contener al menos 6 caracteres"
    },
    auth: {
      userNotFoundInDatabase: "Usuario no encontrado en la base de datos",
      verifyEmailBeforeLogin: "Por favor verifique su email antes de iniciar sesión. Revise su spam o solicite un nuevo código.",
      verifyEmailBeforeLoginShort: "Por favor verifique su email antes de iniciar sesión.",
      welcomeAccountVerified: "¡Bienvenido! Su cuenta ha sido verificada exitosamente. Ahora puede acceder a todas las funciones.",
      invalidCredentials: "Email o contraseña incorrectos",
      tooManyAttempts: "Demasiados intentos. Por favor intente más tarde.",
      accountDisabled: "Esta cuenta ha sido desactivada"
    }
  },
  de: {
    validation: {
      passwordMinLength6: "Das Passwort muss mindestens 6 Zeichen enthalten"
    },
    auth: {
      userNotFoundInDatabase: "Benutzer nicht in der Datenbank gefunden",
      verifyEmailBeforeLogin: "Bitte verifizieren Sie Ihre E-Mail vor der Anmeldung. Überprüfen Sie Ihren Spam oder fordern Sie einen neuen Code an.",
      verifyEmailBeforeLoginShort: "Bitte verifizieren Sie Ihre E-Mail vor der Anmeldung.",
      welcomeAccountVerified: "Willkommen! Ihr Konto wurde erfolgreich verifiziert. Sie können jetzt auf alle Funktionen zugreifen.",
      invalidCredentials: "Ungültige E-Mail oder Passwort",
      tooManyAttempts: "Zu viele Versuche. Bitte versuchen Sie es später erneut.",
      accountDisabled: "Dieses Konto wurde deaktiviert"
    }
  },
  it: {
    validation: {
      passwordMinLength6: "La password deve contenere almeno 6 caratteri"
    },
    auth: {
      userNotFoundInDatabase: "Utente non trovato nel database",
      verifyEmailBeforeLogin: "Si prega di verificare la propria email prima di accedere. Controllare lo spam o richiedere un nuovo codice.",
      verifyEmailBeforeLoginShort: "Si prega di verificare la propria email prima di accedere.",
      welcomeAccountVerified: "Benvenuto! Il tuo account è stato verificato con successo. Ora puoi accedere a tutte le funzionalità.",
      invalidCredentials: "Email o password non validi",
      tooManyAttempts: "Troppi tentativi. Riprovare più tardi.",
      accountDisabled: "Questo account è stato disabilitato"
    }
  },
  nl: {
    validation: {
      passwordMinLength6: "Wachtwoord moet minimaal 6 tekens bevatten"
    },
    auth: {
      userNotFoundInDatabase: "Gebruiker niet gevonden in database",
      verifyEmailBeforeLogin: "Verifieer eerst uw e-mail voordat u inlogt. Controleer uw spam of vraag een nieuwe code aan.",
      verifyEmailBeforeLoginShort: "Verifieer eerst uw e-mail voordat u inlogt.",
      welcomeAccountVerified: "Welkom! Uw account is succesvol geverifieerd. U heeft nu toegang tot alle functies.",
      invalidCredentials: "Ongeldige e-mail of wachtwoord",
      tooManyAttempts: "Te veel pogingen. Probeer het later opnieuw.",
      accountDisabled: "Dit account is gedeactiveerd"
    }
  },
  pt: {
    validation: {
      passwordMinLength6: "A senha deve conter pelo menos 6 caracteres"
    },
    auth: {
      userNotFoundInDatabase: "Utilizador não encontrado na base de dados",
      verifyEmailBeforeLogin: "Por favor verifique o seu email antes de fazer login. Verifique o spam ou solicite um novo código.",
      verifyEmailBeforeLoginShort: "Por favor verifique o seu email antes de fazer login.",
      welcomeAccountVerified: "Bem-vindo! A sua conta foi verificada com sucesso. Agora pode aceder a todas as funcionalidades.",
      invalidCredentials: "Email ou senha incorretos",
      tooManyAttempts: "Muitas tentativas. Tente novamente mais tarde.",
      accountDisabled: "Esta conta foi desativada"
    }
  }
};

// Mettre à jour toutes les langues
Object.keys(loginTranslations).forEach(lang => {
  const langPath = path.join(__dirname, `src/locales/${lang}.json`);
  
  let existingContent = {};
  if (fs.existsSync(langPath)) {
    existingContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  }
  
  const updatedContent = deepMerge(existingContent, loginTranslations[lang]);
  fs.writeFileSync(langPath, JSON.stringify(updatedContent, null, 2), 'utf8');
  
  console.log(`✅ ${lang.toUpperCase()}: Clés de login traduites`);
});

console.log('\n🎉 LoginPage.tsx entièrement corrigé !');
console.log('📋 Impact: Tous les messages d\'erreur de connexion sont maintenant traduits');
