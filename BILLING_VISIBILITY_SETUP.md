# Configuration de la Visibilité de la Facturation

## Vue d'ensemble

La page de facturation a été modifiée pour lire le champ `billingVisible` depuis Firestore et masquer/afficher la facturation en conséquence.

## Fonctionnalités

### ✅ Affichage conditionnel
- **Quand `billingVisible = true`** : La facturation est affichée normalement
- **Quand `billingVisible = false`** : La facturation est masquée avec le message "Aucune facturation disponible"

### 🔧 Comportement par défaut
- Si le champ `billingVisible` n'est pas défini dans Firestore, il est considéré comme `true` par défaut
- Cela garantit la compatibilité avec les utilisateurs existants

## Structure des données Firestore

### Collection `users`
```typescript
interface User {
  // ... autres champs
  billingVisible?: boolean; // true = visible, false = masqué
  billingIban?: string;     // IBAN de facturation
  billingBic?: string;      // BIC de facturation
  billingHolder?: string;   // Titulaire du compte
  billingText?: string;     // Messages de la banque
}
```

## Messages d'interface

### Français
- **Titre** : "Aucune facturation disponible"
- **Description** : "La facturation n'est pas disponible pour votre compte."
- **Contact** : "Contactez votre conseiller pour plus d'informations."

### Anglais
- **Title** : "No billing available"
- **Description** : "Billing is not available for your account."
- **Contact** : "Contact your advisor for more information."

### Autres langues
Les traductions sont disponibles en : allemand, espagnol, italien, néerlandais, portugais.

## Script de test

Un script de test est disponible pour modifier le champ `billingVisible` :

```bash
# Vérifier la valeur actuelle
node test-billing-visibility.cjs <userId>

# Activer la facturation
node test-billing-visibility.cjs <userId> true

# Masquer la facturation
node test-billing-visibility.cjs <userId> false
```

## Utilisation

### 1. Masquer la facturation pour un utilisateur
```bash
node test-billing-visibility.cjs abc123 false
```

### 2. Afficher la facturation pour un utilisateur
```bash
node test-billing-visibility.cjs abc123 true
```

### 3. Vérifier l'état actuel
```bash
node test-billing-visibility.cjs abc123
```

## Cas d'usage

### 🚫 Masquer la facturation
- Utilisateurs en cours de vérification
- Comptes temporairement suspendus
- Utilisateurs avec des restrictions spéciales

### ✅ Afficher la facturation
- Utilisateurs vérifiés
- Comptes actifs
- Utilisateurs avec accès complet

## Sécurité

- Seuls les administrateurs peuvent modifier le champ `billingVisible`
- Les utilisateurs ne peuvent pas modifier leur propre visibilité de facturation
- Le champ est protégé par les règles Firestore

## Dépannage

### Problème : La facturation ne s'affiche pas
1. Vérifier que `billingVisible = true` dans Firestore
2. Vérifier que l'utilisateur a des données de facturation (`billingIban`)
3. Vérifier que l'utilisateur est vérifié (KYC)

### Problème : La facturation s'affiche alors qu'elle devrait être masquée
1. Vérifier que `billingVisible = false` dans Firestore
2. Vider le cache du navigateur
3. Vérifier que la page a été rechargée

## Migration

### Pour les utilisateurs existants
- Aucune action requise
- Le champ `billingVisible` sera `true` par défaut
- La facturation continuera de s'afficher normalement

### Pour les nouveaux utilisateurs
- Définir `billingVisible` selon les besoins
- `true` pour afficher la facturation
- `false` pour masquer la facturation

## Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Utiliser le script de test
3. Contacter l'équipe de développement
