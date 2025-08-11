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

async function addRealBudgets() {
  console.log('💰 AJOUT DE BUDGETS RÉELS');
  console.log('========================\n');

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

    // Budgets réels à ajouter
    const realBudgets = [
      {
        id: `budget_${Date.now()}_1`,
        userId: userId,
        category: 'Alimentation',
        name: 'Courses alimentaires mensuelles',
        amount: 450,
        spent: 320,
        period: 'monthly',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        status: 'on-track',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `budget_${Date.now()}_2`,
        userId: userId,
        category: 'Transport',
        name: 'Transport en commun',
        amount: 120,
        spent: 95,
        period: 'monthly',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        status: 'under-budget',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `budget_${Date.now()}_3`,
        userId: userId,
        category: 'Loisirs',
        name: 'Sorties et divertissements',
        amount: 200,
        spent: 180,
        period: 'monthly',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        status: 'on-track',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `budget_${Date.now()}_4`,
        userId: userId,
        category: 'Logement',
        name: 'Loyer et charges',
        amount: 850,
        spent: 850,
        period: 'monthly',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        status: 'on-track',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `budget_${Date.now()}_5`,
        userId: userId,
        category: 'Santé',
        name: 'Médecins et pharmacie',
        amount: 80,
        spent: 65,
        period: 'monthly',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        status: 'under-budget',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `budget_${Date.now()}_6`,
        userId: userId,
        category: 'Épargne',
        name: 'Épargne mensuelle',
        amount: 300,
        spent: 300,
        period: 'monthly',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 31),
        status: 'on-track',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Récupérer les budgets existants
    const userData = userDoc.data();
    const existingBudgets = userData.budgets || [];

    // Filtrer les budgets de test existants
    const testBudgetIds = ['1', '2', '3', '4', '5'];
    const realExistingBudgets = existingBudgets.filter(budget => 
      !testBudgetIds.includes(budget.id) && 
      !budget.name?.includes('test') && 
      !budget.name?.includes('Test')
    );

    console.log(`📊 Budgets existants: ${existingBudgets.length}`);
    console.log(`✅ Budgets réels conservés: ${realExistingBudgets.length}`);
    console.log(`🗑️ Budgets de test à supprimer: ${existingBudgets.length - realExistingBudgets.length}`);

    // Combiner les budgets existants réels avec les nouveaux
    const allBudgets = [...realExistingBudgets, ...realBudgets];

    // Mettre à jour le document utilisateur
    await db.collection('users').doc(userId).update({
      budgets: allBudgets,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`\n✅ ${realBudgets.length} budgets réels ajoutés`);
    console.log(`📊 Total budgets: ${allBudgets.length}`);

    // Afficher les budgets ajoutés
    console.log('\n📝 Budgets ajoutés:');
    realBudgets.forEach((budget, index) => {
      const percentage = ((budget.spent / budget.amount) * 100).toFixed(1);
      console.log(`${index + 1}. ${budget.name} - ${budget.amount}€ (${budget.spent}€ dépensés, ${percentage}%)`);
    });

    console.log('\n🎉 Budgets réels ajoutés avec succès !');
    console.log('💡 Vous pouvez maintenant voir ces budgets dans votre application.');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des budgets:', error);
  } finally {
    rl.close();
  }
}

addRealBudgets().catch(console.error); 