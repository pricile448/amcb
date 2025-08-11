const fs = require('fs');
const path = require('path');

// Mappage des textes hardcodés vers les clés de traduction
const textMappings = {
  // AccountsPage.tsx
  '"Actif"': 't("accounts.active")',
  '"En cours"': 't("verification.status.pending")',
  '"En attente"': 't("transfers.status.pending")',
  
  // IbanPage.tsx
  '"Erreur"': 't("common.error")',
  
  // HelpPage.tsx
  '"Mon IBAN"': 't("nav.iban")',
  '"Historique"': 't("nav.history")',
  '"Télécharger"': 't("common.upload")',
  '"Email"': 't("settings.email")',
  '"Téléphone"': 't("settings.phone")',
  
  // DocumentsPage.tsx
  '"Télécharger"': 't("common.upload")',
  
  // HistoryPage.tsx
  '"Terminé"': 't("transfers.status.completed")',
  '"En attente"': 't("transfers.status.pending")',
  '"Échoué"': 't("transfers.status.failed")'
};

// Fonction pour remplacer les textes hardcodés dans un fichier
function replaceHardcodedTexts(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let replacements = 0;
    
    // Vérifier si le fichier importe déjà useTranslation
    const hasUseTranslation = content.includes('useTranslation') || content.includes('useTranslation');
    
    // Ajouter l'import useTranslation si nécessaire
    if (!hasUseTranslation) {
      const importMatch = content.match(/import.*from.*['"]react['"]/);
      if (importMatch) {
        content = content.replace(
          importMatch[0],
          `${importMatch[0]}, { useTranslation }`
        );
      } else {
        // Ajouter l'import React avec useTranslation
        content = content.replace(
          /import React.*from ['"]react['"]/,
          'import React, { useTranslation } from "react"'
        );
      }
      
      // Ajouter const { t } = useTranslation(); après les imports
      const componentMatch = content.match(/(const\s+\w+\s*:\s*React\.FC\s*=\s*\(\)\s*=>\s*{)/);
      if (componentMatch) {
        content = content.replace(
          componentMatch[0],
          `${componentMatch[0]}\n  const { t } = useTranslation();`
        );
      }
    }
    
    // Remplacer les textes hardcodés
    Object.keys(textMappings).forEach(hardcodedText => {
      const translationKey = textMappings[hardcodedText];
      const regex = new RegExp(hardcodedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      
      if (content.match(regex)) {
        content = content.replace(regex, translationKey);
        replacements++;
        console.log(`  ✅ Remplacé: ${hardcodedText} → ${translationKey}`);
      }
    });
    
    // Écrire le fichier modifié
    fs.writeFileSync(filePath, content, 'utf8');
    return replacements;
    
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${filePath}:`, error.message);
    return 0;
  }
}

// Fonction pour traiter tous les fichiers
function processAllFiles() {
  console.log('🔧 Remplacement des textes hardcodés...\n');
  
  const files = [
    'src/pages/dashboard/AccountsPage.tsx',
    'src/pages/dashboard/IbanPage.tsx',
    'src/pages/dashboard/HelpPage.tsx',
    'src/pages/dashboard/DocumentsPage.tsx',
    'src/pages/dashboard/HistoryPage.tsx'
  ];
  
  let totalReplacements = 0;
  
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
      console.log(`📄 Traitement de ${file}:`);
      const replacements = replaceHardcodedTexts(filePath);
      totalReplacements += replacements;
      
      if (replacements === 0) {
        console.log(`  ℹ️  Aucun remplacement effectué`);
      }
    } else {
      console.log(`⚠️  Fichier non trouvé: ${file}`);
    }
  });
  
  console.log(`\n✅ Total des remplacements: ${totalReplacements}`);
  return totalReplacements;
}

// Exécuter le script
console.log('🚀 Début du remplacement des textes hardcodés...\n');

const totalReplacements = processAllFiles();

console.log('\n🎉 Remplacement terminé !');
console.log('📝 Prochaines étapes:');
console.log('1. Tester la compilation avec: npm run build');
console.log('2. Vérifier que toutes les traductions fonctionnent');
console.log('3. Tester le changement de langue sur toutes les pages');
