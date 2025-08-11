#!/usr/bin/env node

/**
 * Script pour compléter toutes les traductions avec des traductions plus précises
 * Usage: node complete-translations.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('🌍 Finalisation des traductions pour l\'internationalisation complète');
console.log('===================================================================\n');

// Traductions spécialisées par langue
const specializedTranslations = {
  es: {
    // Traductions espagnoles complètes et spécialisées pour l'application bancaire
    nav: {
      features: "Características",
      pricing: "Precios",
      help: "Ayuda",
      login: "Iniciar sesión",
      openAccount: "Abrir cuenta",
      dashboard: "Mi área de cliente",
      accounts: "Cuentas",
      iban: "Mi IBAN",
      transfers: "Transferencias",
      cards: "Tarjetas",
      billing: "Facturación",
      history: "Historial",
      budgets: "Presupuestos",
      settings: "Configuración",
      documents: "Mis documentos",
      logout: "Cerrar sesión"
    },
    auth: {
      login: {
        title: "Iniciar sesión",
        subtitle: "Accede a tu cuenta AmCbunq",
        createAccount: "Crear cuenta",
        button: "Iniciar sesión"
      },
      register: {
        title: "Crear cuenta",
        subtitle: "Únete a AmCbunq en pocos pasos",
        alreadyHaveAccount: "¿Ya tienes cuenta?",
        button: "Crear cuenta"
      },
      email: "Dirección de correo",
      emailPlaceholder: "tu@email.com",
      password: "Contraseña",
      passwordPlaceholder: "Tu contraseña",
      confirmPassword: "Confirmar contraseña",
      confirmPasswordPlaceholder: "Confirma tu contraseña",
      firstName: "Nombre",
      firstNamePlaceholder: "Tu nombre",
      lastName: "Apellido",
      lastNamePlaceholder: "Tu apellido",
      phone: "Teléfono",
      phonePlaceholder: "+34 6 12 34 56 78",
      birthDate: "Fecha de nacimiento",
      rememberMe: "Recordarme",
      forgotPassword: "¿Olvidaste tu contraseña?",
      acceptTerms: "Acepto los",
      termsAndConditions: "términos y condiciones",
      or: "o",
      loginWithGoogle: "Iniciar sesión con Google",
      loginButton: "Iniciar sesión",
      registerButton: "Crear cuenta",
      loggingIn: "Iniciando sesión...",
      registering: "Creando cuenta...",
      loginSuccess: "Inicio de sesión exitoso",
      loginError: "Error de inicio de sesión",
      registerSuccess: "Cuenta creada exitosamente",
      registerError: "Error al crear la cuenta"
    },
    dashboard: {
      welcome: "Hola",
      overview: "Resumen de tus finanzas",
      totalBalance: "Saldo total",
      totalAccounts: "Cuentas",
      monthlyIncome: "Ingresos mensuales",
      monthlyExpenses: "Gastos mensuales",
      fromLastMonth: "vs mes pasado",
      currentAccount: "Cuenta Corriente",
      savingsAccount: "Cuenta de Ahorro",
      creditCard: "Tarjeta de Crédito",
      accounts: "Cuentas",
      recentTransactions: "Transacciones recientes",
      viewAll: "Ver todo",
      quickActions: "Acciones rápidas",
      newTransfer: "Nueva transferencia",
      newCard: "Nueva tarjeta",
      contacts: "Contactos",
      investments: "Inversiones"
    }
  },
  de: {
    // Traductions allemandes spécialisées
    nav: {
      features: "Funktionen",
      pricing: "Preise",
      help: "Hilfe",
      login: "Anmelden",
      openAccount: "Konto eröffnen",
      dashboard: "Mein Kundenbereich",
      accounts: "Konten",
      iban: "Meine IBAN",
      transfers: "Überweisungen",
      cards: "Karten",
      billing: "Abrechnung",
      history: "Verlauf",
      budgets: "Budgets",
      settings: "Einstellungen",
      documents: "Meine Dokumente",
      logout: "Abmelden"
    },
    auth: {
      login: {
        title: "Anmelden",
        subtitle: "Zugang zu Ihrem AmCbunq-Konto",
        createAccount: "Konto erstellen",
        button: "Anmelden"
      },
      register: {
        title: "Konto erstellen",
        subtitle: "Treten Sie AmCbunq in wenigen Schritten bei",
        alreadyHaveAccount: "Haben Sie bereits ein Konto?",
        button: "Konto erstellen"
      },
      email: "E-Mail-Adresse",
      emailPlaceholder: "ihre@email.com",
      password: "Passwort",
      passwordPlaceholder: "Ihr Passwort",
      firstName: "Vorname",
      lastName: "Nachname",
      phone: "Telefon",
      phonePlaceholder: "+49 6 12 34 56 78",
      birthDate: "Geburtsdatum"
    },
    dashboard: {
      welcome: "Hallo",
      overview: "Übersicht Ihrer Finanzen",
      totalBalance: "Gesamtsaldo",
      totalAccounts: "Konten",
      monthlyIncome: "Monatliche Einnahmen",
      monthlyExpenses: "Monatliche Ausgaben",
      fromLastMonth: "vs letzter Monat",
      currentAccount: "Girokonto",
      savingsAccount: "Sparkonto",
      creditCard: "Kreditkarte"
    }
  },
  it: {
    // Traductions italiennes spécialisées
    nav: {
      features: "Caratteristiche",
      pricing: "Prezzi",
      help: "Aiuto",
      login: "Accedi",
      openAccount: "Apri conto",
      dashboard: "La mia area cliente",
      accounts: "Conti",
      iban: "Il mio IBAN",
      transfers: "Bonifici",
      cards: "Carte",
      billing: "Fatturazione",
      history: "Cronologia",
      budgets: "Budget",
      settings: "Impostazioni",
      documents: "I miei documenti",
      logout: "Esci"
    },
    auth: {
      login: {
        title: "Accedi",
        subtitle: "Accedi al tuo account AmCbunq",
        createAccount: "Crea account",
        button: "Accedi"
      },
      register: {
        title: "Crea account",
        subtitle: "Unisciti ad AmCbunq in pochi passi",
        alreadyHaveAccount: "Hai già un account?",
        button: "Crea account"
      },
      email: "Indirizzo email",
      emailPlaceholder: "tuo@email.com",
      password: "Password",
      firstName: "Nome",
      lastName: "Cognome",
      phone: "Telefono",
      phonePlaceholder: "+39 6 12 34 56 78",
      birthDate: "Data di nascita"
    },
    dashboard: {
      welcome: "Ciao",
      overview: "Panoramica delle tue finanze",
      totalBalance: "Saldo totale",
      totalAccounts: "Conti",
      monthlyIncome: "Entrate mensili",
      monthlyExpenses: "Spese mensili",
      fromLastMonth: "vs mese scorso",
      currentAccount: "Conto Corrente",
      savingsAccount: "Conto di Risparmio",
      creditCard: "Carta di Credito"
    }
  },
  nl: {
    // Traductions néerlandaises spécialisées
    nav: {
      features: "Functies",
      pricing: "Prijzen",
      help: "Hulp",
      login: "Inloggen",
      openAccount: "Account openen",
      dashboard: "Mijn klantenruimte",
      accounts: "Rekeningen",
      iban: "Mijn IBAN",
      transfers: "Overboekingen",
      cards: "Kaarten",
      billing: "Facturering",
      history: "Geschiedenis",
      budgets: "Budgetten",
      settings: "Instellingen",
      documents: "Mijn documenten",
      logout: "Uitloggen"
    },
    auth: {
      login: {
        title: "Inloggen",
        subtitle: "Toegang tot uw AmCbunq-account",
        createAccount: "Account aanmaken",
        button: "Inloggen"
      },
      register: {
        title: "Account aanmaken",
        subtitle: "Word lid van AmCbunq in een paar stappen",
        alreadyHaveAccount: "Heeft u al een account?",
        button: "Account aanmaken"
      },
      email: "E-mailadres",
      emailPlaceholder: "uw@email.com",
      password: "Wachtwoord",
      firstName: "Voornaam",
      lastName: "Achternaam",
      phone: "Telefoon",
      phonePlaceholder: "+31 6 12 34 56 78",
      birthDate: "Geboortedatum"
    },
    dashboard: {
      welcome: "Hallo",
      overview: "Overzicht van uw financiën",
      totalBalance: "Totaal saldo",
      totalAccounts: "Rekeningen",
      monthlyIncome: "Maandelijkse inkomsten",
      monthlyExpenses: "Maandelijkse uitgaven",
      fromLastMonth: "vs vorige maand",
      currentAccount: "Lopende Rekening",
      savingsAccount: "Spaarrekening",
      creditCard: "Creditcard"
    }
  },
  pt: {
    // Traductions portuguaises spécialisées
    nav: {
      features: "Recursos",
      pricing: "Preços",
      help: "Ajuda",
      login: "Entrar",
      openAccount: "Abrir conta",
      dashboard: "Minha área de cliente",
      accounts: "Contas",
      iban: "Meu IBAN",
      transfers: "Transferências",
      cards: "Cartões",
      billing: "Faturação",
      history: "Histórico",
      budgets: "Orçamentos",
      settings: "Configurações",
      documents: "Meus documentos",
      logout: "Sair"
    },
    auth: {
      login: {
        title: "Entrar",
        subtitle: "Acesse sua conta AmCbunq",
        createAccount: "Criar conta",
        button: "Entrar"
      },
      register: {
        title: "Criar conta",
        subtitle: "Junte-se ao AmCbunq em poucos passos",
        alreadyHaveAccount: "Já tem uma conta?",
        button: "Criar conta"
      },
      email: "Endereço de email",
      emailPlaceholder: "seu@email.com",
      password: "Senha",
      firstName: "Nome",
      lastName: "Sobrenome",
      phone: "Telefone",
      phonePlaceholder: "+351 6 12 34 56 78",
      birthDate: "Data de nascimento"
    },
    dashboard: {
      welcome: "Olá",
      overview: "Visão geral das suas finanças",
      totalBalance: "Saldo total",
      totalAccounts: "Contas",
      monthlyIncome: "Rendimentos mensais",
      monthlyExpenses: "Despesas mensais",
      fromLastMonth: "vs mês passado",
      currentAccount: "Conta Corrente",
      savingsAccount: "Conta Poupança",
      creditCard: "Cartão de Crédito"
    }
  }
};

// Fonction pour fusionner les objets profondément
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

// Mettre à jour chaque fichier avec les traductions spécialisées
Object.keys(specializedTranslations).forEach(lang => {
  const langPath = path.join(__dirname, `src/locales/${lang}.json`);
  
  if (fs.existsSync(langPath)) {
    const existingContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    const updatedContent = deepMerge(existingContent, specializedTranslations[lang]);
    
    fs.writeFileSync(langPath, JSON.stringify(updatedContent, null, 2), 'utf8');
    console.log(`✅ ${lang}.json enrichi avec ${Object.keys(specializedTranslations[lang]).length} sections spécialisées`);
  }
});

console.log('\n🎉 Traductions spécialisées appliquées !');
console.log('\n📊 Amélioration:');
console.log('- Traductions bancaires spécialisées pour chaque langue');
console.log('- Terminologie financière appropriée');
console.log('- Formats de numéros de téléphone localisés');
console.log('- Contexte culturel adapté');

console.log('\n🧪 Pour tester les traductions:');
console.log('- Changez la langue dans l\'interface utilisateur');
console.log('- Vérifiez les pages d\'authentification et dashboard');
console.log('- Testez la navigation et les formulaires');
