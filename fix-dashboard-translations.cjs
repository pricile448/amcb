const fs = require('fs');
const path = require('path');

// Textes hardcodés trouvés dans DashboardPage.tsx
const hardcodedTexts = {
  "Bonjour": "dashboard.welcome",
  "Votre tableau de bord financier": "dashboard.overview",
  "Masquer": "common.hide",
  "Afficher": "common.show",
  "les soldes": "dashboard.balances",
  "Vérifié": "verification.status.approved",
  "En cours": "verification.status.pending",
  "Non vérifié": "verification.status.unverified",
  "Solde total": "dashboard.totalBalance",
  "Compte courant": "dashboard.currentAccount",
  "Compte épargne": "dashboard.savingsAccount",
  "RIB non disponible": "dashboard.ribUnavailable",
  "Vérifiez votre identité pour accéder à votre RIB": "dashboard.ribVerificationRequired",
  "Demandez votre RIB sur la page IBAN": "dashboard.ribRequestPage",
  "Actions rapides": "dashboard.quickActions",
  "Virement": "transfers.title",
  "Transférer": "transfers.transfer",
  "Dépôt": "accounts.deposit",
  "Ajouter": "common.add",
  "Cartes": "nav.cards",
  "Gérer": "common.manage",
  "Paiements": "payments.title",
  "Rapides": "payments.quick",
  "Mes Comptes": "accounts.title",
  "Voir tous": "dashboard.viewAll",
  "Transactions récentes": "dashboard.recentTransactions",
  "Offre Spéciale": "offers.special",
  "Ouvrez un compte épargne et bénéficiez de 2% d'intérêts pendant 6 mois !": "offers.savingsAccount",
  "En savoir plus": "common.learnMore",
  "Protection Premium": "protection.premium",
  "Protégez vos transactions avec notre assurance fraudes avancée.": "protection.description",
  "Activer": "common.activate",
  "Cadeau de bienvenue !": "referral.welcome",
  "Parrainez un ami et recevez 50€ chacun. Conditions applicables.": "referral.description",
  "Parrainer": "referral.refer"
};

// Ajouter les nouvelles clés au fichier fr.json
function addNewKeysToFrench() {
  const frPath = path.join(__dirname, 'src', 'locales', 'fr.json');
  const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  
  // Ajouter les nouvelles clés manquantes
  const newKeys = {
    "common": {
      ...fr.common,
      "hide": "Masquer",
      "show": "Afficher",
      "add": "Ajouter",
      "learnMore": "En savoir plus",
      "activate": "Activer",
      "manage": "Gérer"
    },
    "dashboard": {
      ...fr.dashboard,
      "balances": "les soldes",
      "ribUnavailable": "RIB non disponible",
      "ribVerificationRequired": "Vérifiez votre identité pour accéder à votre RIB",
      "ribRequestPage": "Demandez votre RIB sur la page IBAN"
    },
    "verification": {
      ...fr.verification,
      "status": {
        ...fr.verification?.status,
        "unverified": "Non vérifié"
      }
    },
    "payments": {
      "title": "Paiements",
      "quick": "Rapides"
    },
    "offers": {
      "special": "Offre Spéciale",
      "savingsAccount": "Ouvrez un compte épargne et bénéficiez de 2% d'intérêts pendant 6 mois !"
    },
    "protection": {
      "premium": "Protection Premium",
      "description": "Protégez vos transactions avec notre assurance fraudes avancée."
    },
    "referral": {
      "welcome": "Cadeau de bienvenue !",
      "description": "Parrainez un ami et recevez 50€ chacun. Conditions applicables.",
      "refer": "Parrainer"
    },
    "accounts": {
      ...fr.accounts,
      "deposit": "Dépôt"
    }
  };
  
  // Fusionner les nouvelles clés
  const updatedFr = { ...fr, ...newKeys };
  
  fs.writeFileSync(frPath, JSON.stringify(updatedFr, null, 2));
  console.log('✅ Nouvelles clés ajoutées au fichier fr.json');
}

// Ajouter les traductions aux autres langues
function addTranslationsToOtherLanguages() {
  const languages = ['en', 'es', 'pt', 'it', 'nl', 'de'];
  
  const translations = {
    en: {
      "common": {
        "hide": "Hide",
        "show": "Show",
        "add": "Add",
        "learnMore": "Learn more",
        "activate": "Activate",
        "manage": "Manage"
      },
      "dashboard": {
        "balances": "balances",
        "ribUnavailable": "IBAN unavailable",
        "ribVerificationRequired": "Verify your identity to access your IBAN",
        "ribRequestPage": "Request your IBAN on the IBAN page"
      },
      "verification": {
        "status": {
          "unverified": "Unverified"
        }
      },
      "payments": {
        "title": "Payments",
        "quick": "Quick"
      },
      "offers": {
        "special": "Special Offer",
        "savingsAccount": "Open a savings account and get 2% interest for 6 months!"
      },
      "protection": {
        "premium": "Premium Protection",
        "description": "Protect your transactions with our advanced fraud insurance."
      },
      "referral": {
        "welcome": "Welcome Gift!",
        "description": "Refer a friend and receive €50 each. Terms apply.",
        "refer": "Refer"
      },
      "accounts": {
        "deposit": "Deposit"
      }
    },
    es: {
      "common": {
        "hide": "Ocultar",
        "show": "Mostrar",
        "add": "Añadir",
        "learnMore": "Saber más",
        "activate": "Activar",
        "manage": "Gestionar"
      },
      "dashboard": {
        "balances": "saldos",
        "ribUnavailable": "IBAN no disponible",
        "ribVerificationRequired": "Verifica tu identidad para acceder a tu IBAN",
        "ribRequestPage": "Solicita tu IBAN en la página IBAN"
      },
      "verification": {
        "status": {
          "unverified": "No verificado"
        }
      },
      "payments": {
        "title": "Pagos",
        "quick": "Rápidos"
      },
      "offers": {
        "special": "Oferta Especial",
        "savingsAccount": "¡Abre una cuenta de ahorro y obtén 2% de interés durante 6 meses!"
      },
      "protection": {
        "premium": "Protección Premium",
        "description": "Protege tus transacciones con nuestro seguro de fraude avanzado."
      },
      "referral": {
        "welcome": "¡Regalo de bienvenida!",
        "description": "Recomienda a un amigo y recibe €50 cada uno. Condiciones aplicables.",
        "refer": "Recomendar"
      },
      "accounts": {
        "deposit": "Depósito"
      }
    },
    pt: {
      "common": {
        "hide": "Ocultar",
        "show": "Mostrar",
        "add": "Adicionar",
        "learnMore": "Saber mais",
        "activate": "Ativar",
        "manage": "Gerir"
      },
      "dashboard": {
        "balances": "saldos",
        "ribUnavailable": "IBAN indisponível",
        "ribVerificationRequired": "Verifique sua identidade para acessar seu IBAN",
        "ribRequestPage": "Solicite seu IBAN na página IBAN"
      },
      "verification": {
        "status": {
          "unverified": "Não verificado"
        }
      },
      "payments": {
        "title": "Pagamentos",
        "quick": "Rápidos"
      },
      "offers": {
        "special": "Oferta Especial",
        "savingsAccount": "Abra uma conta poupança e obtenha 2% de juros durante 6 meses!"
      },
      "protection": {
        "premium": "Proteção Premium",
        "description": "Proteja suas transações com nosso seguro de fraude avançado."
      },
      "referral": {
        "welcome": "Presente de boas-vindas!",
        "description": "Indique um amigo e receba €50 cada um. Condições aplicáveis.",
        "refer": "Indicar"
      },
      "accounts": {
        "deposit": "Depósito"
      }
    },
    it: {
      "common": {
        "hide": "Nascondi",
        "show": "Mostra",
        "add": "Aggiungi",
        "learnMore": "Scopri di più",
        "activate": "Attiva",
        "manage": "Gestisci"
      },
      "dashboard": {
        "balances": "saldi",
        "ribUnavailable": "IBAN non disponibile",
        "ribVerificationRequired": "Verifica la tua identità per accedere al tuo IBAN",
        "ribRequestPage": "Richiedi il tuo IBAN nella pagina IBAN"
      },
      "verification": {
        "status": {
          "unverified": "Non verificato"
        }
      },
      "payments": {
        "title": "Pagamenti",
        "quick": "Rapidi"
      },
      "offers": {
        "special": "Offerta Speciale",
        "savingsAccount": "Apri un conto di risparmio e ottieni il 2% di interesse per 6 mesi!"
      },
      "protection": {
        "premium": "Protezione Premium",
        "description": "Proteggi le tue transazioni con la nostra assicurazione antifrode avanzata."
      },
      "referral": {
        "welcome": "Regalo di benvenuto!",
        "description": "Raccomanda un amico e ricevi €50 ciascuno. Condizioni applicabili.",
        "refer": "Raccomanda"
      },
      "accounts": {
        "deposit": "Deposito"
      }
    },
    nl: {
      "common": {
        "hide": "Verbergen",
        "show": "Tonen",
        "add": "Toevoegen",
        "learnMore": "Meer weten",
        "activate": "Activeren",
        "manage": "Beheren"
      },
      "dashboard": {
        "balances": "saldi",
        "ribUnavailable": "IBAN niet beschikbaar",
        "ribVerificationRequired": "Verificeer uw identiteit om toegang te krijgen tot uw IBAN",
        "ribRequestPage": "Vraag uw IBAN aan op de IBAN pagina"
      },
      "verification": {
        "status": {
          "unverified": "Niet geverifieerd"
        }
      },
      "payments": {
        "title": "Betalingen",
        "quick": "Snel"
      },
      "offers": {
        "special": "Speciale Aanbieding",
        "savingsAccount": "Open een spaarrekening en krijg 2% rente voor 6 maanden!"
      },
      "protection": {
        "premium": "Premium Bescherming",
        "description": "Bescherm uw transacties met onze geavanceerde fraude-verzekering."
      },
      "referral": {
        "welcome": "Welkomstgeschenk!",
        "description": "Verwijs een vriend en ontvang €50 elk. Voorwaarden van toepassing.",
        "refer": "Verwijzen"
      },
      "accounts": {
        "deposit": "Storten"
      }
    },
    de: {
      "common": {
        "hide": "Ausblenden",
        "show": "Anzeigen",
        "add": "Hinzufügen",
        "learnMore": "Mehr erfahren",
        "activate": "Aktivieren",
        "manage": "Verwalten"
      },
      "dashboard": {
        "balances": "Kontostände",
        "ribUnavailable": "IBAN nicht verfügbar",
        "ribVerificationRequired": "Verifizieren Sie Ihre Identität, um auf Ihre IBAN zuzugreifen",
        "ribRequestPage": "Fordern Sie Ihre IBAN auf der IBAN-Seite an"
      },
      "verification": {
        "status": {
          "unverified": "Nicht verifiziert"
        }
      },
      "payments": {
        "title": "Zahlungen",
        "quick": "Schnell"
      },
      "offers": {
        "special": "Sonderangebot",
        "savingsAccount": "Eröffnen Sie ein Sparkonto und erhalten Sie 2% Zinsen für 6 Monate!"
      },
      "protection": {
        "premium": "Premium-Schutz",
        "description": "Schützen Sie Ihre Transaktionen mit unserer fortschrittlichen Betrugsversicherung."
      },
      "referral": {
        "welcome": "Willkommensgeschenk!",
        "description": "Empfehlen Sie einen Freund und erhalten Sie jeweils €50. Bedingungen gelten.",
        "refer": "Empfehlen"
      },
      "accounts": {
        "deposit": "Einzahlung"
      }
    }
  };
  
  languages.forEach(lang => {
    const langPath = path.join(__dirname, 'src', 'locales', `${lang}.json`);
    const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    
    // Fusionner les nouvelles traductions
    const updatedLang = { ...langData, ...translations[lang] };
    
    fs.writeFileSync(langPath, JSON.stringify(updatedLang, null, 2));
    console.log(`✅ Traductions ajoutées au fichier ${lang}.json`);
  });
}

// Exécuter le script
console.log('🔧 Correction des traductions du dashboard...');
addNewKeysToFrench();
addTranslationsToOtherLanguages();
console.log('✅ Toutes les traductions du dashboard ont été ajoutées !');
