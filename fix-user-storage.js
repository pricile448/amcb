// Script de correction rapide - Copiez-collez ce code dans la console du navigateur
console.log('🔧 Correction rapide du localStorage:');
console.log('===================================');

// Vérifier Firebase Auth
if (typeof firebase !== 'undefined' && firebase.auth) {
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    console.log('✅ Utilisateur trouvé dans Firebase Auth:');
    console.log('  UID:', currentUser.uid);
    console.log('  Email:', currentUser.email);
    
    // Créer un objet utilisateur complet
    const correctedUser = {
      id: currentUser.uid,
      email: currentUser.email,
      emailVerified: currentUser.emailVerified,
      displayName: currentUser.displayName || 'Utilisateur',
      photoURL: currentUser.photoURL,
      // Ajouter des champs par défaut
      firstName: 'Client',
      lastName: 'AmCbunq',
      verificationStatus: 'pending'
    };
    
    // Sauvegarder dans localStorage
    localStorage.setItem('user', JSON.stringify(correctedUser));
    
    console.log('✅ localStorage corrigé avec:', correctedUser);
    console.log('🔄 Rechargez la page pour voir les changements');
    
    // Recharger la page après 2 secondes
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } else {
    console.log('❌ Aucun utilisateur connecté dans Firebase Auth');
    console.log('💡 Connectez-vous d\'abord à l\'application');
  }
} else {
  console.log('❌ Firebase non disponible');
  console.log('💡 Assurez-vous d\'être sur la page de l\'application');
} 