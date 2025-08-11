#!/usr/bin/env node

/**
 * Script pour corriger les traductions de la page d'accueil dans toutes les langues
 * Usage: node fix-homepage-translations.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('🏠 Correction des traductions de la page d\'accueil');
console.log('===============================================\n');

// Traductions complètes de la page d'accueil pour chaque langue
const homeTranslations = {
  en: {
    home: {
      hero: {
        title: "The bank of the future, today",
        subtitle: "Manage your finances with ease with AmCbunq. Account opening in 5 minutes, instant transfers, and bank-level security.",
        openAccount: "Open Account",
        learnMore: "Learn More"
      },
      features: {
        title: "Why choose AmCbunq?",
        subtitle: "A modern and secure banking experience"
      },
      security: {
        title: "Bank-level Security",
        description: "Your data is protected by the latest encryption technologies and security protocols."
      },
      accounts: {
        title: "Multiple Accounts",
        description: "Current, savings, and business accounts adapted to all your needs."
      },
      transactions: {
        title: "Instant Transfers",
        description: "Send and receive money instantly, 24/7, anywhere in the world."
      },
      international: {
        title: "International",
        description: "Multi-currency accounts and competitive exchange rates for your international transactions."
      },
      benefits: {
        noFees: "No hidden fees",
        instant: "Instant transfers",
        secure: "Maximum security",
        support: "24/7 support"
      }
    }
  },
  es: {
    home: {
      hero: {
        title: "El banco del futuro, hoy",
        subtitle: "Gestiona tus finanzas con facilidad con AmCbunq. Apertura de cuenta en 5 minutos, transferencias instantáneas y seguridad de nivel bancario.",
        openAccount: "Abrir Cuenta",
        learnMore: "Saber Más"
      },
      features: {
        title: "¿Por qué elegir AmCbunq?",
        subtitle: "Una experiencia bancaria moderna y segura"
      },
      security: {
        title: "Seguridad de Nivel Bancario",
        description: "Tus datos están protegidos por las últimas tecnologías de encriptación y protocolos de seguridad."
      },
      accounts: {
        title: "Múltiples Cuentas",
        description: "Cuentas corrientes, de ahorro y empresariales adaptadas a todas tus necesidades."
      },
      transactions: {
        title: "Transferencias Instantáneas",
        description: "Envía y recibe dinero al instante, 24/7, en cualquier lugar del mundo."
      },
      international: {
        title: "Internacional",
        description: "Cuentas multidivisa y tipos de cambio competitivos para tus transacciones internacionales."
      },
      benefits: {
        noFees: "Sin comisiones ocultas",
        instant: "Transferencias instantáneas",
        secure: "Máxima seguridad", 
        support: "Soporte 24/7"
      }
    }
  },
  it: {
    home: {
      hero: {
        title: "La banca del futuro, oggi",
        subtitle: "Gestisci le tue finanze con facilità con AmCbunq. Apertura conto in 5 minuti, bonifici istantanei e sicurezza di livello bancario.",
        openAccount: "Apri Conto",
        learnMore: "Scopri di Più"
      },
      features: {
        title: "Perché scegliere AmCbunq?",
        subtitle: "Un'esperienza bancaria moderna e sicura"
      },
      security: {
        title: "Sicurezza di Livello Bancario",
        description: "I tuoi dati sono protetti dalle più recenti tecnologie di crittografia e protocolli di sicurezza."
      },
      accounts: {
        title: "Conti Multipli",
        description: "Conti correnti, di risparmio e aziendali adattati a tutte le tue esigenze."
      },
      transactions: {
        title: "Bonifici Istantanei",
        description: "Invia e ricevi denaro istantaneamente, 24/7, ovunque nel mondo."
      },
      international: {
        title: "Internazionale",
        description: "Conti multivaluta e tassi di cambio competitivi per le tue transazioni internazionali."
      },
      benefits: {
        noFees: "Nessuna commissione nascosta",
        instant: "Bonifici istantanei",
        secure: "Massima sicurezza",
        support: "Supporto 24/7"
      }
    }
  },
  de: {
    home: {
      hero: {
        title: "Die Bank der Zukunft, heute",
        subtitle: "Verwalten Sie Ihre Finanzen einfach mit AmCbunq. Kontoeröffnung in 5 Minuten, sofortige Überweisungen und Sicherheit auf Bankniveau.",
        openAccount: "Konto Eröffnen",
        learnMore: "Mehr Erfahren"
      },
      features: {
        title: "Warum AmCbunq wählen?",
        subtitle: "Ein modernes und sicheres Banking-Erlebnis"
      },
      security: {
        title: "Sicherheit auf Bankniveau",
        description: "Ihre Daten werden durch die neuesten Verschlüsselungstechnologien und Sicherheitsprotokolle geschützt."
      },
      accounts: {
        title: "Mehrere Konten",
        description: "Giro-, Spar- und Geschäftskonten, die an alle Ihre Bedürfnisse angepasst sind."
      },
      transactions: {
        title: "Sofortige Überweisungen",
        description: "Senden und empfangen Sie Geld sofort, 24/7, überall auf der Welt."
      },
      international: {
        title: "International",
        description: "Mehrwährungskonten und wettbewerbsfähige Wechselkurse für Ihre internationalen Transaktionen."
      },
      benefits: {
        noFees: "Keine versteckten Gebühren",
        instant: "Sofortige Überweisungen",
        secure: "Maximale Sicherheit",
        support: "24/7 Support"
      }
    }
  },
  nl: {
    home: {
      hero: {
        title: "De bank van de toekomst, vandaag",
        subtitle: "Beheer uw financiën eenvoudig met AmCbunq. Rekening opening in 5 minuten, onmiddellijke overboekingen en beveiliging op bankniveau.",
        openAccount: "Rekening Openen",
        learnMore: "Meer Weten"
      },
      features: {
        title: "Waarom AmCbunq kiezen?",
        subtitle: "Een moderne en veilige bankervaring"
      },
      security: {
        title: "Beveiliging op Bankniveau",
        description: "Uw gegevens worden beschermd door de nieuwste encryptietechnologieën en beveiligingsprotocollen."
      },
      accounts: {
        title: "Meerdere Rekeningen",
        description: "Betaal-, spaar- en bedrijfsrekeningen aangepast aan al uw behoeften."
      },
      transactions: {
        title: "Onmiddellijke Overboekingen",
        description: "Verzend en ontvang geld onmiddellijk, 24/7, overal ter wereld."
      },
      international: {
        title: "Internationaal",
        description: "Multi-valuta rekeningen en concurrerende wisselkoersen voor uw internationale transacties."
      },
      benefits: {
        noFees: "Geen verborgen kosten",
        instant: "Onmiddellijke overboekingen",
        secure: "Maximale beveiliging",
        support: "24/7 ondersteuning"
      }
    }
  },
  pt: {
    home: {
      hero: {
        title: "O banco do futuro, hoje",
        subtitle: "Gerencie suas finanças com facilidade com AmCbunq. Abertura de conta em 5 minutos, transferências instantâneas e segurança de nível bancário.",
        openAccount: "Abrir Conta",
        learnMore: "Saber Mais"
      },
      features: {
        title: "Por que escolher AmCbunq?",
        subtitle: "Uma experiência bancária moderna e segura"
      },
      security: {
        title: "Segurança de Nível Bancário",
        description: "Seus dados estão protegidos pelas mais recentes tecnologias de criptografia e protocolos de segurança."
      },
      accounts: {
        title: "Múltiplas Contas",
        description: "Contas correntes, poupança e empresariais adaptadas a todas as suas necessidades."
      },
      transactions: {
        title: "Transferências Instantâneas",
        description: "Envie e receba dinheiro instantaneamente, 24/7, em qualquer lugar do mundo."
      },
      international: {
        title: "Internacional",
        description: "Contas multi-moeda e taxas de câmbio competitivas para suas transações internacionais."
      },
      benefits: {
        noFees: "Sem taxas ocultas",
        instant: "Transferências instantâneas",
        secure: "Máxima segurança",
        support: "Suporte 24/7"
      }
    }
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
Object.keys(homeTranslations).forEach(lang => {
  const langPath = path.join(__dirname, `src/locales/${lang}.json`);
  
  // Charger le contenu existant
  let existingContent = {};
  if (fs.existsSync(langPath)) {
    existingContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  }
  
  // Fusionner les traductions de la page d'accueil
  const updatedContent = deepMerge(existingContent, homeTranslations[lang]);
  
  // Sauvegarder
  fs.writeFileSync(langPath, JSON.stringify(updatedContent, null, 2), 'utf8');
  
  console.log(`✅ ${lang.toUpperCase()}: Traductions de la page d'accueil corrigées`);
});

console.log('\n🎉 Correction terminée !');
console.log('📋 Impact:');
console.log('- Page d\'accueil entièrement traduite dans toutes les langues');
console.log('- Hero section traduit : titre, sous-titre, boutons');
console.log('- Section fonctionnalités traduite');
console.log('- Tous les avantages traduits');

console.log('\n🧪 Test:');
console.log('1. Aller sur la page d\'accueil');
console.log('2. Changer la langue vers Italien'); 
console.log('3. Le titre devrait devenir "La banca del futuro, oggi"');
console.log('4. Actualiser - la langue devrait rester en italien');
