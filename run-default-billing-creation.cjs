#!/usr/bin/env node

/**
 * Script pour exécuter la création des données de facturation par défaut pour tous les utilisateurs
 */

const { createDefaultBillingForAllUsers } = require('./create-default-billing-for-all-users.cjs');

async function main() {
  console.log('🚀 LANCEMENT DE LA CRÉATION DES DONNÉES DE FACTURATION PAR DÉFAUT');
  console.log('=' .repeat(70));
  
  try {
    await createDefaultBillingForAllUsers();
    console.log('\n🎉 CRÉATION TERMINÉE AVEC SUCCÈS !');
  } catch (error) {
    console.error('\n❌ ERREUR LORS DE LA CRÉATION:', error);
    process.exit(1);
  }
}

main();
