const admin = require('firebase-admin');
const readline = require('readline');

// Configuration Firebase Admin
const serviceAccount = require('./firebase-config.cjs');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://amcbunq-default-rtdb.europe-west1.firebasedatabase.app"
  });
}

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function cleanTestBudgets() {
  console.log('🧹 NETTOYAGE DES BUDGETS DE TEST');
  console.log('================================\n');

  try {
    // Demander l'ID utilisateur
    const userId = await new Promise((resolve) => {
      rl.question('🔍 Entrez l\'ID utilisateur: ', resolve);
    });

    if (!userId) {
      console.log('❌ ID utilisateur requis');
      rl.close();
      return;
    }

    console.log(`\n🔍 Vérification de l'utilisateur ${userId}...`);

    // Vérifier que l'utilisateur existe
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log('❌ Utilisateur non trouvé');
      rl.close();
      return;
    }

    console.log('✅ Utilisateur trouvé');

    // Récupérer les budgets existants
    const userData = userDoc.data();
    const existingBudgets = userData.budgets || [];

    console.log(`📊 Budgets existants: ${existingBudgets.length}`);

    if (existingBudgets.length === 0) {
      console.log('📭 Aucun budget trouvé');
      rl.close();
      return;
    }

    // Identifier les budgets de test
    const testBudgets = [];
    const realBudgets = [];

    existingBudgets.forEach(budget => {
      const isTest = 
        budget.id === '1' || budget.id === '2' || budget.id === '3' || 
        budget.id === '4' || budget.id === '5' ||
        budget.name?.includes('test') || budget.name?.includes('Test') ||
        budget.name?.includes('Courses alimentaires') && budget.amount === 400 ||
        budget.name?.includes('Transport en commun') && budget.amount === 150 ||
        budget.name?.includes('Sorties et divertissements') && budget.amount === 200 ||
        budget.name?.includes('Loyer et charges') && budget.amount === 800 ||
        budget.name?.includes('Médecins et pharmacie') && budget.amount === 100;

      if (isTest) {
        testBudgets.push(budget);
      } else {
        realBudgets.push(budget);
      }
    });

    console.log(`🔴 Budgets de test identifiés: ${testBudgets.length}`);
    console.log(`✅ Budgets réels conservés: ${realBudgets.length}`);

    if (testBudgets.length === 0) {
      console.log('🎉 Aucun budget de test trouvé !');
      rl.close();
      return;
    }

    // Afficher les budgets de test trouvés
    console.log('\n📝 Budgets de test trouvés:');
    testBudgets.forEach((budget, index) => {
      const percentage = ((budget.spent / budget.amount) * 100).toFixed(1);
      console.log(`${index + 1}. ${budget.name} - ${budget.amount}€ (${budget.spent}€ dépensés, ${percentage}%)`);
    });

    // Demander confirmation
    const confirm = await new Promise((resolve) => {
      rl.question('\n❓ Voulez-vous supprimer ces budgets de test ? (oui/non): ', resolve);
    });

    if (confirm.toLowerCase() !== 'oui' && confirm.toLowerCase() !== 'o' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Opération annulée');
      rl.close();
      return;
    }

    // Supprimer les budgets de test
    console.log('\n🗑️ Suppression des budgets de test...');
    
    await db.collection('users').doc(userId).update({
      budgets: realBudgets,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ ${testBudgets.length} budgets de test supprimés`);
    console.log(`📊 Budgets restants: ${realBudgets.length}`);

    // Afficher les budgets restants
    if (realBudgets.length > 0) {
      console.log('\n📋 Budgets conservés:');
      realBudgets.forEach((budget, index) => {
        const percentage = ((budget.spent / budget.amount) * 100).toFixed(1);
        console.log(`${index + 1}. ${budget.name} - ${budget.amount}€ (${budget.spent}€ dépensés, ${percentage}%)`);
      });
    } else {
      console.log('\n📭 Aucun budget restant');
    }

    console.log('\n🎉 Nettoyage terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    rl.close();
  }
}

cleanTestBudgets().catch(console.error); 