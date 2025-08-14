# Logique de Visibilité de Facturation selon le Statut KYC

## Vue d'ensemble

La page de facturation a été modifiée pour gérer automatiquement le champ `billingVisible` selon le statut KYC de l'utilisateur. **Seuls les administrateurs peuvent modifier ce comportement**.

## 🔒 Règles de Sécurité

### 1. **Utilisateurs NON vérifiés (KYC)**
- `billingVisible` peut être `true` ou `false`
- La facturation s'affiche normalement si `billingVisible = true`
- La facturation est masquée si `billingVisible = false`

### 2. **Utilisateurs VÉRIFIÉS (KYC)**
- `billingVisible` est **automatiquement mis à `false`**
- La facturation est **toujours masquée**
- **Seul un administrateur peut maintenir `billingVisible = true`**

## 🔄 Comportement Automatique

### Mise à jour automatique lors de la connexion
```typescript
// Si l'utilisateur est vérifié (KYC), billingVisible doit être false
if (userStatus === 'verified' && isBillingVisible !== false) {
  // Mise à jour automatique dans Firestore
  await updateDoc(userDocRef, { billingVisible: false });
  isBillingVisible = false;
}
```

### Valeurs par défaut
- **Statut non vérifié** : `billingVisible = true` (facturation visible)
- **Statut vérifié** : `billingVisible = false` (facturation masquée)

## 🛡️ Contrôle Administratif

### Script d'administration
```bash
# Vérifier l'état actuel
node admin-billing-visibility.cjs <userId>

# Forcer billingVisible = true (admin seulement)
node admin-billing-visibility.cjs <userId> true

# Mettre billingVisible = false
node admin-billing-visibility.cjs <userId> false
```

### ⚠️ Avertissements pour les admins
- Le script affiche des avertissements si un utilisateur vérifié a `billingVisible = true`
- La facturation sera automatiquement masquée lors de la prochaine connexion
- Seuls les admins peuvent maintenir `billingVisible = true` pour les utilisateurs vérifiés

## 📋 Cas d'usage

### Cas 1: Utilisateur non vérifié
- `billingVisible = true` → Facturation visible ✅
- `billingVisible = false` → Facturation masquée ❌
- `billingVisible = undefined` → Facturation visible par défaut ✅

### Cas 2: Utilisateur vérifié
- `billingVisible = true` → **Sera automatiquement mis à false** ⚠️
- `billingVisible = false` → Facturation masquée ✅
- `billingVisible = undefined` → Facturation masquée par défaut ✅

## 🔧 Implémentation Technique

### Dépendances
```typescript
useEffect(() => {
  loadBillingData();
}, [userStatus]); // userStatus comme dépendance
```

### Logique de mise à jour
```typescript
// 1. Vérifier le statut KYC
// 2. Mettre à jour billingVisible automatiquement si nécessaire
// 3. Appliquer la visibilité selon la valeur finale
```

## 🚨 Sécurité

### Protection automatique
- Les utilisateurs vérifiés ne peuvent pas voir la facturation
- Même si `billingVisible = true` dans Firestore, il sera automatiquement mis à `false`
- Seuls les administrateurs peuvent contourner cette protection

### Règles Firestore
- Les utilisateurs ne peuvent pas modifier leur propre champ `billingVisible`
- Seuls les administrateurs peuvent modifier ce champ
- Le champ est protégé par les règles de sécurité

## 📊 Monitoring

### Logs automatiques
- Détection des utilisateurs vérifiés
- Mise à jour automatique de `billingVisible`
- Avertissements pour les configurations anormales

### Vérification d'état
```bash
# Vérifier l'état d'un utilisateur
node admin-billing-visibility.cjs <userId>

# Affiche:
# - Statut KYC
# - Valeur billingVisible
# - Comportement attendu
# - Avertissements si nécessaire
```

## 🔄 Migration

### Pour les utilisateurs existants
- **Non vérifiés** : Aucun changement, `billingVisible` reste inchangé
- **Vérifiés** : `billingVisible` sera automatiquement mis à `false` lors de la prochaine connexion

### Pour les nouveaux utilisateurs
- **Non vérifiés** : `billingVisible = true` par défaut
- **Vérifiés** : `billingVisible = false` automatiquement

## 🆘 Dépannage

### Problème : La facturation ne s'affiche pas pour un utilisateur non vérifié
1. Vérifier que `billingVisible = true` dans Firestore
2. Vérifier que l'utilisateur n'est pas vérifié (KYC)
3. Vérifier les logs pour les erreurs

### Problème : La facturation s'affiche pour un utilisateur vérifié
1. Vérifier que `billingVisible = false` dans Firestore
2. La facturation sera automatiquement masquée lors de la prochaine connexion
3. Utiliser le script admin si nécessaire

### Problème : Mise à jour automatique échoue
1. Vérifier les permissions Firestore
2. Vérifier la configuration Firebase
3. Consulter les logs d'erreur

## 📞 Support Administrateur

### Accès requis
- Permissions d'administration sur Firestore
- Accès au script `admin-billing-visibility.cjs`
- Connaissance des règles de sécurité

### Procédures d'urgence
1. Utiliser le script admin pour vérifier l'état
2. Forcer `billingVisible = false` si nécessaire
3. Contacter l'équipe de développement

---

**⚠️ IMPORTANT : Ce système est conçu pour la sécurité. Ne contournez pas les règles automatiques sans justification administrative valide.**
