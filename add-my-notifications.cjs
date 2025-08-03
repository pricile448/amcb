const http = require('http');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function addMyNotifications() {
  console.log('🔔 Création de vos notifications personnalisées\n');
  
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2'; // Votre UID
  
  try {
    // Demander les détails de la notification
    const title = await question('📝 Titre de la notification: ');
    const message = await question('💬 Message de la notification: ');
    
    console.log('\n🎨 Types disponibles:');
    console.log('1. info (ℹ️) - Information générale');
    console.log('2. success (✅) - Succès/Confirmation');
    console.log('3. warning (⚠️) - Avertissement');
    console.log('4. error (❌) - Erreur');
    console.log('5. feature (🆕) - Nouvelle fonctionnalité');
    
    const typeChoice = await question('\nChoisissez le type (1-5): ');
    const types = ['info', 'success', 'warning', 'error', 'feature'];
    const type = types[parseInt(typeChoice) - 1] || 'info';
    
    console.log('\n🚨 Priorités disponibles:');
    console.log('1. low (Basse)');
    console.log('2. medium (Moyenne)');
    console.log('3. high (Haute)');
    
    const priorityChoice = await question('\nChoisissez la priorité (1-3): ');
    const priorities = ['low', 'medium', 'high'];
    const priority = priorities[parseInt(priorityChoice) - 1] || 'medium';
    
    console.log('\n📂 Catégories disponibles:');
    console.log('1. general (Général)');
    console.log('2. security (Sécurité)');
    console.log('3. transaction (Transaction)');
    console.log('4. feature (Fonctionnalité)');
    console.log('5. support (Support)');
    
    const categoryChoice = await question('\nChoisissez la catégorie (1-5): ');
    const categories = ['general', 'security', 'transaction', 'feature', 'support'];
    const category = categories[parseInt(categoryChoice) - 1] || 'general';
    
    const readChoice = await question('\nMarquer comme lue ? (o/n): ');
    const read = readChoice.toLowerCase() === 'o';
    
    // Créer la notification
    const notification = {
      userId: userId,
      title: title,
      message: message,
      type: type,
      date: new Date().toISOString(),
      read: read,
      priority: priority,
      category: category
    };
    
    console.log('\n📤 Envoi de la notification...');
    
    // Envoyer à l'API
    const postData = JSON.stringify(notification);
    
    const options = {
      hostname: 'localhost',
      port: 5173,
      path: '/api/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('✅ Notification créée avec succès !');
          console.log('\n📋 Détails de la notification:');
          console.log(`Titre: ${title}`);
          console.log(`Type: ${type}`);
          console.log(`Priorité: ${priority}`);
          console.log(`Catégorie: ${category}`);
          console.log(`Lu: ${read ? 'Oui' : 'Non'}`);
          console.log('\n🎯 Ouvrez maintenant votre application pour voir la notification !');
        } else {
          console.log('❌ Erreur lors de la création:', res.statusCode);
          console.log('Réponse:', data);
        }
        rl.close();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erreur de connexion:', error.message);
      console.log('💡 Assurez-vous que le serveur est démarré (npm run dev)');
      rl.close();
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    rl.close();
  }
}

// Fonction pour ajouter plusieurs notifications rapidement
async function addQuickNotifications() {
  console.log('🚀 Ajout rapide de notifications de test...\n');
  
  const userId = 'YWu55QljgEM4J350kB7aKGf03TS2';
  
  const quickNotifications = [
    {
      title: 'Test de notification personnalisée',
      message: 'Ceci est un test de notification que vous avez créée vous-même !',
      type: 'info',
      priority: 'medium',
      category: 'general',
      read: false
    },
    {
      title: 'Nouvelle fonctionnalité disponible',
      message: 'Vous pouvez maintenant créer vos propres notifications directement depuis ce script !',
      type: 'feature',
      priority: 'high',
      category: 'feature',
      read: false
    },
    {
      title: 'Système de notifications opérationnel',
      message: 'Le système de notifications est maintenant entièrement fonctionnel avec scroll et modal !',
      type: 'success',
      priority: 'medium',
      category: 'general',
      read: false
    }
  ];
  
  let createdCount = 0;
  
  for (const notif of quickNotifications) {
    const notification = {
      userId: userId,
      ...notif,
      date: new Date().toISOString()
    };
    
    const postData = JSON.stringify(notification);
    
    const options = {
      hostname: 'localhost',
      port: 5173,
      path: '/api/notifications',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        createdCount++;
        if (res.statusCode === 201) {
          console.log(`✅ Notification ${createdCount} créée: ${notification.title}`);
        } else {
          console.log(`❌ Erreur notification ${createdCount}: ${res.statusCode}`);
        }
        
        if (createdCount === quickNotifications.length) {
          console.log('\n🎉 Toutes les notifications ont été créées !');
          console.log('🎯 Ouvrez votre application pour voir les nouvelles notifications !');
          process.exit(0);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erreur de connexion:', error.message);
      process.exit(1);
    });
    
    req.write(postData);
    req.end();
  }
}

// Menu principal
async function main() {
  console.log('🔔 Gestionnaire de Notifications Personnalisées\n');
  console.log('1. Créer une notification personnalisée (interactif)');
  console.log('2. Ajouter rapidement des notifications de test');
  console.log('3. Quitter');
  
  const choice = await question('\nChoisissez une option (1-3): ');
  
  switch (choice) {
    case '1':
      await addMyNotifications();
      break;
    case '2':
      await addQuickNotifications();
      break;
    case '3':
      console.log('👋 Au revoir !');
      rl.close();
      break;
    default:
      console.log('❌ Option invalide');
      rl.close();
  }
}

main(); 