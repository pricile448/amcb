// Script de diagnostic rapide - Copiez-collez ce code dans la console du navigateur
console.log('🔍 Diagnostic rapide des userId:');
console.log('==============================');

// 1. Vérifier localStorage
console.log('\n📋 1. localStorage:');
const userStr = localStorage.getItem('user');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('✅ Utilisateur dans localStorage:', user);
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Tous les champs:', Object.keys(user));
  } catch (error) {
    console.log('❌ Erreur parsing localStorage:', error);
  }
} else {
  console.log('❌ Aucun utilisateur dans localStorage');
}

// 2. Vérifier Firebase Auth
console.log('\n📋 2. Firebase Auth:');
if (typeof firebase !== 'undefined' && firebase.auth) {
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    console.log('✅ Utilisateur connecté dans Firebase Auth:');
    console.log('  UID:', currentUser.uid);
    console.log('  Email:', currentUser.email);
  } else {
    console.log('❌ Aucun utilisateur connecté dans Firebase Auth');
  }
} else {
  console.log('❌ Firebase non disponible');
}

// 3. Vérifier l'API
console.log('\n📋 3. Test API:');
if (userStr) {
  const user = JSON.parse(userStr);
  fetch(`/api/user/${user.id}`)
    .then(response => {
      console.log('API Status:', response.status);
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    })
    .then(data => {
      console.log('✅ Données API:', data);
    })
    .catch(error => {
      console.log('❌ Erreur API:', error.message);
    });
} else {
  console.log('❌ Impossible de tester l\'API sans userId');
}

// 4. Recommandations
console.log('\n📋 4. Recommandations:');
if (!userStr) {
  console.log('🔧 Problème: localStorage vide');
  console.log('   Solution: Reconnectez-vous à l\'application');
} else {
  const user = JSON.parse(userStr);
  if (typeof firebase !== 'undefined' && firebase.auth) {
    const currentUser = firebase.auth().currentUser;
    if (currentUser && user.id !== currentUser.uid) {
      console.log('🔧 Problème: IDs différents');
      console.log('   Solution: Utilisez le bouton "🔧 Corriger" dans le panneau de debug');
    } else {
      console.log('✅ Tout semble correct !');
    }
  }
} 