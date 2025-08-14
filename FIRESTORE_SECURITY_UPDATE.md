# 🔒 Mise à Jour des Règles de Sécurité Firestore

## 📋 Vue d'ensemble

Cette mise à jour résout l'erreur **"Missing or insufficient permissions"** en autorisant l'accès aux champs de facturation et autres champs nécessaires dans Firestore.

## 🚨 Problème identifié

L'erreur `FirebaseError: Missing or insufficient permissions` se produisait car :

1. **Champs de facturation bloqués** : `billingBic`, `billingHolder`, `billingIban`, `billingText`, `billingVisible`
2. **Champs de vérification bloqués** : `emailVerificationCode`, `emailVerifiedAt`, etc.
3. **Champs de validation bloqués** : `phoneVerified`, `validatedAt`, `verifiedAt`

## ✅ Solution appliquée

### 1. Mise à jour des règles utilisateur

Les utilisateurs peuvent maintenant mettre à jour ces champs :

```javascript
// 🆕 NOUVEAUX CHAMPS AUTORISÉS
'billingBic', 'billingHolder', 'billingIban', 'billingText', 'billingVisible',
'emailVerificationCode', 'emailVerificationCodeExpires', 'emailVerifiedAt',
'phoneVerified', 'isPhoneVerified', 'validatedAt', 'verifiedAt'
```

### 2. Règles spéciales pour les administrateurs

```javascript
// 🆕 RÈGLE SPÉCIALE POUR LES DONNÉES DE FACTURATION
// Permet aux admins de gérer les données de facturation de tous les utilisateurs
match /users/{userId}/billing/{document=**} {
  allow read, write: if request.auth != null 
    && exists(/databases/$(database)/documents/users/$(request.auth.uid))
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

## 🔧 Déploiement

### Option 1 : Script automatique (recommandé)

```bash
node deploy-firestore-rules.cjs
```

### Option 2 : Manuel

```bash
firebase deploy --only firestore:rules
```

## 📊 Impact sur la sécurité

### ✅ Améliorations
- **Accès aux données de facturation** : Les utilisateurs peuvent maintenant gérer leurs informations de facturation
- **Synchronisation email** : Plus d'erreurs de permissions pour la vérification email
- **Gestion des données** : Accès aux champs de validation et de statut

### 🔒 Maintien de la sécurité
- **Authentification requise** : Toutes les opérations nécessitent une authentification
- **Isolation des données** : Les utilisateurs ne peuvent accéder qu'à leurs propres données
- **Contrôle admin** : Seuls les administrateurs peuvent accéder aux données de tous les utilisateurs

## 🧪 Test des nouvelles règles

Après le déploiement, testez :

1. **Création de données de facturation** dans la page de facturation
2. **Synchronisation du statut email** lors de la connexion
3. **Mise à jour des informations utilisateur** dans le profil
4. **Accès admin** aux données de facturation (si vous êtes admin)

## 🚨 Vérifications post-déploiement

1. **Console Firebase** : Vérifiez que les règles sont déployées
2. **Logs d'application** : Plus d'erreurs de permissions
3. **Fonctionnalités** : Testez la création et mise à jour des données
4. **Sécurité** : Vérifiez que les utilisateurs ne peuvent pas accéder aux données d'autres utilisateurs

## 🔄 Rollback (si nécessaire)

Si des problèmes surviennent, vous pouvez revenir aux anciennes règles :

```bash
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules
```

## 📝 Notes importantes

- **Redémarrage requis** : L'application peut nécessiter un redémarrage pour prendre en compte les nouvelles règles
- **Cache** : Les règles sont mises en cache, il peut y avoir un délai de quelques minutes
- **Monitoring** : Surveillez les logs Firestore pour détecter d'éventuels problèmes

## 🆘 Support

En cas de problème après le déploiement :

1. **Vérifiez les logs** dans la console Firebase
2. **Testez les fonctionnalités** une par une
3. **Vérifiez l'authentification** des utilisateurs
4. **Contactez l'équipe** si le problème persiste

---

**Note** : Cette mise à jour améliore la fonctionnalité tout en maintenant un niveau de sécurité approprié.
