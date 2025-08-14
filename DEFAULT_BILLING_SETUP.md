# Configuration des Données de Facturation par Défaut

## Vue d'ensemble

Ce système permet de créer automatiquement des données de facturation par défaut pour tous les utilisateurs de l'application AmCbunq.

## 📋 Structure des Données de Facturation

### Champs créés automatiquement
```typescript
interface BillingData {
  billingBic: string;        // Code BIC/SWIFT de la banque
  billingHolder: string;     // Nom du titulaire du compte
  billingIban: string;       // Numéro IBAN de facturation
  billingText: string;       // Message de bienvenue personnalisé
  billingVisible: boolean;   // Visibilité de la facturation (true par défaut)
}
```

### Valeurs par défaut
- **billingBic**: `'SMOEFRP1'`
- **billingHolder**: `'[Prénom] [Nom]'` ou `'AmCbunq Client'`
- **billingIban**: `'FR76 1234 5678 9012 3456 7890 123'`
- **billingText**: Message de bienvenue personnalisé
- **billingVisible**: `true` (par défaut)

## 🚀 Utilisation des Scripts

### 1. Créer des données de facturation pour TOUS les utilisateurs
```bash
node run-default-billing-creation.cjs
```

### 2. Créer des données de facturation pour un utilisateur spécifique
```bash
node create-default-billing-for-all-users.cjs <userId>
```

### 3. Vérifier l'état d'un utilisateur
```bash
node admin-billing-visibility.cjs <userId>
```

## 📊 Comportement du Script Principal

### Utilisateurs existants
- **Avec données de facturation complètes** : Ignorés (pas de modification)
- **Sans données de facturation** : Création des données par défaut
- **Avec données partielles** : Complétion des champs manquants

### Nouveaux utilisateurs
- Les données de facturation seront créées automatiquement lors de leur première connexion
- `billingVisible` sera `true` par défaut
- Le statut KYC déterminera si la facturation reste visible

## 🔒 Logique de Sécurité

### Règles automatiques
- **Utilisateurs non vérifiés** : `billingVisible = true` (facturation visible)
- **Utilisateurs vérifiés** : `billingVisible` sera automatiquement mis à `false`

### Protection des données existantes
- Le script ne remplace pas les données de facturation existantes
- Il complète seulement les champs manquants
- Les valeurs personnalisées sont préservées

## 📝 Exemples d'Utilisation

### Exemple 1: Création pour tous les utilisateurs
```bash
# Lancer la création pour tous les utilisateurs
node run-default-billing-creation.cjs

# Sortie attendue:
# 🚀 LANCEMENT DE LA CRÉATION DES DONNÉES DE FACTURATION PAR DÉFAUT
# 📋 150 utilisateurs trouvés
# ✅ Succès: 120 utilisateurs
# ❌ Erreurs: 2 utilisateurs
# ⏭️  Ignorés: 28 utilisateurs
# 🎉 CRÉATION TERMINÉE AVEC SUCCÈS !
```

### Exemple 2: Création pour un utilisateur spécifique
```bash
# Créer les données pour l'utilisateur abc123
node create-default-billing-for-all-users.cjs abc123

# Sortie attendue:
# 🎯 Création des données de facturation pour l'utilisateur spécifique abc123...
# ✅ Données de facturation créées/mises à jour pour abc123
```

## ⚠️ Précautions

### Avant l'exécution
1. **Sauvegarde** : Vérifiez que vous avez une sauvegarde de votre base de données
2. **Test** : Testez d'abord sur un environnement de développement
3. **Permissions** : Assurez-vous d'avoir les droits d'écriture sur Firestore

### Pendant l'exécution
- Le script traite les utilisateurs un par un pour éviter la surcharge
- Une pause de 100ms est appliquée entre chaque utilisateur
- Les erreurs sont loggées mais n'arrêtent pas le processus

### Après l'exécution
- Vérifiez les logs pour identifier les éventuelles erreurs
- Testez la page de facturation pour quelques utilisateurs
- Vérifiez que les données sont correctement affichées

## 🔧 Personnalisation

### Modifier les valeurs par défaut
Éditez le fichier `create-default-billing-for-all-users.cjs` :

```javascript
const DEFAULT_BILLING_DATA = {
  billingBic: 'VOTRE_BIC',           // Votre code BIC
  billingHolder: 'Votre Banque',      // Nom de votre banque
  billingIban: 'VOTRE_IBAN',          // Votre IBAN par défaut
  billingText: 'Votre message',       // Votre message personnalisé
  billingVisible: true                // Visibilité par défaut
};
```

### Modifier le message de bienvenue
```javascript
billingText: `Bienvenue ${userData.firstName || 'Client'} dans votre espace de facturation AmCbunq. 
Utilisez ce RIB pour vos opérations de facturation et de validation de compte.`
```

## 📊 Monitoring et Vérification

### Vérifier la création
```bash
# Vérifier un utilisateur spécifique
node admin-billing-visibility.cjs <userId>

# Vérifier plusieurs utilisateurs
for userId in user1 user2 user3; do
  node admin-billing-visibility.cjs $userId
done
```

### Logs de vérification
Le script affiche :
- Nombre d'utilisateurs traités
- Succès et erreurs
- Utilisateurs ignorés (déjà configurés)
- Détails des données créées

## 🆘 Dépannage

### Problème : Erreur de permissions
```
❌ Erreur lors de la création des données de facturation pour userId: 
FirebaseError: Missing or insufficient permissions
```
**Solution** : Vérifiez les règles de sécurité Firestore

### Problème : Erreur de connexion
```
❌ Erreur fatale lors de la création des données de facturation: 
FirebaseError: Failed to get document because the client is offline
```
**Solution** : Vérifiez votre connexion internet et la configuration Firebase

### Problème : Données non créées
```
✅ Succès: 0 utilisateurs
❌ Erreurs: 0 utilisateurs
⏭️  Ignorés: 150 utilisateurs
```
**Solution** : Tous les utilisateurs avaient déjà des données complètes

## 📞 Support

### En cas de problème
1. Vérifiez les logs d'erreur
2. Testez sur un utilisateur spécifique
3. Vérifiez la configuration Firebase
4. Contactez l'équipe de développement

### Informations utiles
- Version du script : 1.0
- Compatible avec : Firebase v9+
- Dépendances : firebase, dotenv

---

**✅ Prêt à créer des données de facturation par défaut pour tous vos utilisateurs !**
