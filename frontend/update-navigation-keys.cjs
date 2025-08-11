#!/usr/bin/env node

/**
 * Script pour mettre à jour toutes les langues avec les nouvelles clés de navigation
 * Usage: node update-navigation-keys.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Mise à jour des clés de navigation dans toutes les langues');
console.log('==========================================================\n');

// Charger le fichier français mis à jour (référence)
const frPath = path.join(__dirname, 'src/locales/fr.json');
const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));

console.log('📚 Référence française chargée');

// Traductions spécialisées pour les nouvelles clés
const newTranslations = {
  en: {
    common: {
      defaultUser: "AmCbunq Client",
      defaultClient: "Client", 
      defaultCompany: "AmCbunq"
    },
    nav: {
      messages: "Messages",
      verification: "Identity Verification",
      transactions: "Transactions"
    },
    messages: {
      unavailable: "Messages unavailable",
      temporarilyUnavailable: "Messages temporarily unavailable",
      unavailableUnverified: "To access chat with our support, you must first verify your identity.",
      unavailablePending: "Messaging will be available once your identity verification is complete. Your file is under review.",
      unavailableVerifyIdentity: "Messages unavailable - Verify your identity"
    }
  },
  es: {
    common: {
      defaultUser: "Cliente AmCbunq",
      defaultClient: "Cliente",
      defaultCompany: "AmCbunq"
    },
    nav: {
      messages: "Mensajes", 
      verification: "Verificación de Identidad",
      transactions: "Transacciones"
    },
    messages: {
      unavailable: "Mensajes no disponibles",
      temporarilyUnavailable: "Mensajes temporalmente no disponibles",
      unavailableUnverified: "Para acceder al chat con nuestro soporte, primero debe verificar su identidad.",
      unavailablePending: "La mensajería estará disponible una vez que se complete su verificación de identidad. Su expediente está en revisión.",
      unavailableVerifyIdentity: "Mensajes no disponibles - Verifique su identidad"
    }
  },
  de: {
    common: {
      defaultUser: "AmCbunq Kunde",
      defaultClient: "Kunde",
      defaultCompany: "AmCbunq"
    },
    nav: {
      messages: "Nachrichten",
      verification: "Identitätsprüfung", 
      transactions: "Transaktionen"
    },
    messages: {
      unavailable: "Nachrichten nicht verfügbar",
      temporarilyUnavailable: "Nachrichten vorübergehend nicht verfügbar",
      unavailableUnverified: "Um auf den Chat mit unserem Support zuzugreifen, müssen Sie zuerst Ihre Identität verifizieren.",
      unavailablePending: "Messaging wird verfügbar sein, sobald Ihre Identitätsprüfung abgeschlossen ist. Ihre Akte wird überprüft.",
      unavailableVerifyIdentity: "Nachrichten nicht verfügbar - Identität verifizieren"
    }
  },
  it: {
    common: {
      defaultUser: "Cliente AmCbunq",
      defaultClient: "Cliente",
      defaultCompany: "AmCbunq"
    },
    nav: {
      messages: "Messaggi",
      verification: "Verifica Identità",
      transactions: "Transazioni"
    },
    messages: {
      unavailable: "Messaggi non disponibili",
      temporarilyUnavailable: "Messaggi temporaneamente non disponibili", 
      unavailableUnverified: "Per accedere alla chat con il nostro supporto, devi prima verificare la tua identità.",
      unavailablePending: "La messaggistica sarà disponibile una volta completata la verifica dell'identità. Il tuo dossier è in revisione.",
      unavailableVerifyIdentity: "Messaggi non disponibili - Verifica la tua identità"
    }
  },
  nl: {
    common: {
      defaultUser: "AmCbunq Klant",
      defaultClient: "Klant",
      defaultCompany: "AmCbunq" 
    },
    nav: {
      messages: "Berichten",
      verification: "Identiteitsverificatie",
      transactions: "Transacties"
    },
    messages: {
      unavailable: "Berichten niet beschikbaar",
      temporarilyUnavailable: "Berichten tijdelijk niet beschikbaar",
      unavailableUnverified: "Om toegang te krijgen tot chat met onze ondersteuning, moet u eerst uw identiteit verifiëren.",
      unavailablePending: "Messaging zal beschikbaar zijn zodra uw identiteitsverificatie is voltooid. Uw dossier wordt beoordeeld.",
      unavailableVerifyIdentity: "Berichten niet beschikbaar - Verifieer uw identiteit"
    }
  },
  pt: {
    common: {
      defaultUser: "Cliente AmCbunq",
      defaultClient: "Cliente",
      defaultCompany: "AmCbunq"
    },
    nav: {
      messages: "Mensagens",
      verification: "Verificação de Identidade", 
      transactions: "Transações"
    },
    messages: {
      unavailable: "Mensagens indisponíveis",
      temporarilyUnavailable: "Mensagens temporariamente indisponíveis",
      unavailableUnverified: "Para aceder ao chat com o nosso suporte, deve primeiro verificar a sua identidade.",
      unavailablePending: "As mensagens estarão disponíveis assim que a sua verificação de identidade estiver concluída. O seu processo está em análise.",
      unavailableVerifyIdentity: "Mensagens indisponíveis - Verifique a sua identidade"
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
const languages = ['en', 'es', 'de', 'it', 'nl', 'pt'];

languages.forEach(lang => {
  const langPath = path.join(__dirname, `src/locales/${lang}.json`);
  
  // Charger le contenu existant
  let existingContent = {};
  if (fs.existsSync(langPath)) {
    existingContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  }
  
  // Fusionner les nouvelles traductions avec le contenu existant
  const updatedContent = deepMerge(existingContent, newTranslations[lang]);
  
  // S'assurer que toutes les clés françaises sont présentes
  const finalContent = deepMerge(frContent, updatedContent);
  
  // Sauvegarder
  fs.writeFileSync(langPath, JSON.stringify(finalContent, null, 2), 'utf8');
  console.log(`✅ ${lang.toUpperCase()}: Nouvelles clés de navigation ajoutées`);
});

console.log('\n🎉 Mise à jour terminée !');
console.log('\n📊 Nouvelles clés ajoutées:');
console.log('- common.defaultUser, defaultClient, defaultCompany');
console.log('- nav.messages, verification, transactions');
console.log('- messages.* (5 nouvelles clés)');

console.log('\n🧪 Prochaines étapes:');
console.log('1. Tester l\'application dans toutes les langues');
console.log('2. Vérifier que les menus changent correctement');
console.log('3. Valider les messages de navigation');
console.log('4. Corriger les autres fichiers avec du texte français en dur');
