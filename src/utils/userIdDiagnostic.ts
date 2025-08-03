// Utilitaire de diagnostic des userId pour le navigateur
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Types pour TypeScript
export interface UserData {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  verificationStatus?: string;
}

export function diagnoseUserIds(): Promise<void> {
  console.log('🔍 Diagnostic des userId:');
  console.log('========================');

  console.log('\n📋 1. Vérification du localStorage:');
  console.log('-----------------------------------');
  
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('✅ Utilisateur dans localStorage:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Email vérifié:', user.emailVerified);
      console.log('  Nom complet:', user.displayName);
      console.log('  Tous les champs:', Object.keys(user));
    } catch (error) {
      console.log('❌ Erreur parsing localStorage:', error);
    }
  } else {
    console.log('❌ Aucun utilisateur dans localStorage');
  }

  console.log('\n📋 2. Vérification de Firebase Auth:');
  console.log('------------------------------------');
  
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Utilisateur connecté dans Firebase Auth:');
        console.log('  UID:', user.uid);
        console.log('  Email:', user.email);
        console.log('  Email vérifié:', user.emailVerified);
        console.log('  Nom complet:', user.displayName);
        console.log('  Photo URL:', user.photoURL);
        console.log('  Date de création:', user.metadata.creationTime);
        console.log('  Dernière connexion:', user.metadata.lastSignInTime);
      } else {
        console.log('❌ Aucun utilisateur connecté dans Firebase Auth');
      }
      
      console.log('\n📋 3. Comparaison des IDs:');
      console.log('---------------------------');
      
      const localUserStr = localStorage.getItem('user');
      if (localUserStr && user) {
        try {
          const localUser = JSON.parse(localUserStr);
          console.log('LocalStorage ID:', localUser.id);
          console.log('Firebase Auth UID:', user.uid);
          
          if (localUser.id === user.uid) {
            console.log('✅ Les IDs correspondent !');
          } else {
            console.log('❌ Les IDs ne correspondent pas !');
            console.log('💡 Problème de synchronisation détecté');
          }
        } catch (error) {
          console.log('❌ Erreur lors de la comparaison:', error);
        }
      } else {
        console.log('⚠️ Impossible de comparer - données manquantes');
      }
      
      console.log('\n📋 4. Recommandations:');
      console.log('----------------------');
      
      if (!user) {
        console.log('🔧 Connectez-vous d\'abord à l\'application');
      } else if (!localUserStr) {
        console.log('🔧 Problème: localStorage vide mais Firebase Auth connecté');
        console.log('   Solution: Reconnectez-vous à l\'application');
      } else {
        try {
          const localUser = JSON.parse(localUserStr);
          if (localUser.id !== user.uid) {
            console.log('🔧 Problème: IDs différents');
            console.log('   Solution: Utilisez fixUserIds() pour corriger');
          } else {
            console.log('✅ Tout semble correct !');
          }
        } catch (error) {
          console.log('🔧 Problème: localStorage corrompu');
          console.log('   Solution: Videz le localStorage et reconnectez-vous');
        }
      }
      
      unsubscribe();
      resolve();
    });
  });
}

export function fixUserIds(): Promise<void> {
  console.log('🔧 Correction des userId:');
  console.log('========================');

  return new Promise((resolve) => {
    const userStr = localStorage.getItem('user');
    
    console.log('\n📋 État actuel:');
    console.log('---------------');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('LocalStorage ID:', user.id);
        console.log('LocalStorage Email:', user.email);
      } catch (error) {
        console.log('❌ Erreur parsing localStorage:', error);
      }
    } else {
      console.log('❌ Aucun utilisateur dans localStorage');
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Firebase Auth UID:', user.uid);
        console.log('Firebase Auth Email:', user.email);
        
        console.log('\n🔧 Correction en cours...');
        console.log('------------------------');
        
        // Créer un nouvel objet utilisateur avec les bonnes données
        const correctedUser: UserData = {
          id: user.uid, // Utiliser l'UID de Firebase Auth
          email: user.email || '',
          emailVerified: user.emailVerified,
          displayName: user.displayName || 'Utilisateur',
          photoURL: user.photoURL || undefined,
          // Conserver les autres champs existants
          ...(userStr ? JSON.parse(userStr) : {})
        };
        
        // Supprimer l'ancien ID s'il existe
        delete (correctedUser as any).oldId;
        
        // Sauvegarder dans localStorage
        localStorage.setItem('user', JSON.stringify(correctedUser));
        
        console.log('✅ Correction effectuée !');
        console.log('Nouvel ID:', correctedUser.id);
        console.log('Email:', correctedUser.email);
        console.log('Tous les champs:', Object.keys(correctedUser));
        
        console.log('\n📋 Vérification:');
        console.log('---------------');
        
        // Vérifier que la correction a fonctionné
        const newUserStr = localStorage.getItem('user');
        if (newUserStr) {
          const newUser = JSON.parse(newUserStr);
          if (newUser.id === user.uid) {
            console.log('✅ Synchronisation réussie !');
            console.log('Les userId sont maintenant corrects.');
          } else {
            console.log('❌ Problème persistant');
          }
        }
        
      } else {
        console.log('❌ Aucun utilisateur connecté dans Firebase Auth');
        console.log('💡 Connectez-vous d\'abord à l\'application');
      }
      
      unsubscribe();
      resolve();
    });
  });
}

// Fonction pour nettoyer le localStorage
export function clearUserData(): void {
  console.log('🧹 Nettoyage du localStorage:');
  console.log('=============================');
  
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  
  console.log('✅ localStorage nettoyé');
  console.log('💡 Reconnectez-vous à l\'application');
} 