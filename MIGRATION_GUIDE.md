# Guide de Migration des Utilisateurs Existants

## 🎯 Objectif

Ce guide explique comment migrer tous vos utilisateurs existants vers la nouvelle structure de sous-documents, en préservant leurs données actuelles et en ajoutant automatiquement les éléments manquants.

## 📋 Prérequis

- ✅ Firebase Admin SDK configuré
- ✅ Accès à votre projet Firestore
- ✅ Node.js installé
- ✅ Permissions d'écriture sur Firestore

## 🚀 Installation et Configuration

### 1. Installer les dépendances

```bash
npm install firebase firebase-admin
```

### 2. Configurer Firebase

Modifiez le fichier `migration-config.js` avec vos informations Firebase :

```javascript
firebase: {
  apiKey: "votre-vraie-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-vrai-project-id",
  // ... autres valeurs
}
```

### 3. Vérifier la configuration

```bash
node migrate-existing-users.cjs help
```

## 🔧 Utilisation du Script

### Mode Test (Recommandé en premier)

```bash
# Test sur un utilisateur spécifique
node migrate-existing-users.cjs test USER_ID

# Test complet sans modification (dry run)
# Modifiez dryRun: true dans migration-config.js
node migrate-existing-users.cjs
```

### Migration Complète

```bash
# 1. Vérifier la configuration
node migrate-existing-users.cjs help

# 2. Lancer la migration
node migrate-existing-users.cjs
```

## 📊 Fonctionnalités du Script

### ✅ **Sécurité et Sauvegarde**
- Sauvegarde automatique avant migration
- Mode dry run pour tester sans risque
- Traitement par lots pour éviter les timeouts
- Vérification des permissions

### ✅ **Intelligence de Migration**
- Détection automatique des documents existants
- Création uniquement des éléments manquants
- Préservation des données actuelles
- Gestion des erreurs par utilisateur

### ✅ **Monitoring et Logs**
- Barre de progression en temps réel
- Logs détaillés de chaque opération
- Statistiques complètes de migration
- Sauvegarde des résultats

## 🎛️ Configuration Avancée

### Paramètres de Migration

```javascript
migration: {
  dryRun: false,                    // Vraie migration
  batchSize: 100,                   // Plus d'utilisateurs par lot
  backupBeforeMigration: true,      // Sauvegarde obligatoire
  logLevel: 'debug',                // Logs détaillés
  pauseBetweenBatches: 2000        // Pause plus longue
}
```

### Collections à Migrer

```javascript
collections: {
  accounts: true,        // Comptes bancaires
  beneficiaries: true,   // Bénéficiaires
  budgets: true,         // Budgets
  billing: true,         // Facturation
  cardLimits: true,      // Limites de cartes
  documents: true,       // Documents
  notifications: true,   // Notifications
  transactions: true,    // Transactions
  transfers: true        // Virements
}
```

## 📈 Structure Créée

### Pour Chaque Utilisateur

```
users/{userId}/
├── accounts/{userId}          # Comptes bancaires
├── beneficiaries/{userId}     # Bénéficiaires
├── budgets/{userId}          # Budgets
├── billing/{userId}          # Facturation
├── cardLimits/{userId}       # Limites de cartes
├── documents/{userId}        # Documents
├── notifications/{userId}    # Préférences de notifications
├── transactions/{userId}     # Historique des transactions
└── transfers/{userId}        # Virements
```

### Données par Défaut

- **Comptes** : Tableau vide prêt à recevoir des comptes
- **Bénéficiaires** : Tableau vide pour les transferts
- **Budgets** : Structure prête pour la gestion budgétaire
- **Facturation** : Invoices et méthodes de paiement vides
- **Notifications** : Préférences par défaut (email: true, push: true)
- **Transactions** : Historique vide
- **Virements** : Liste des virements vide

## 🔍 Vérification Post-Migration

### 1. Vérifier les Collections

```bash
# Dans Firebase Console
# Vérifiez que toutes les collections existent
# Et qu'elles contiennent un document par utilisateur
```

### 2. Tester un Utilisateur

```bash
# Test de migration sur un utilisateur spécifique
node migrate-existing-users.cjs test USER_ID
```

### 3. Vérifier les Permissions

```bash
# Tester l'accès aux nouvelles collections
# Vérifier que les règles Firestore fonctionnent
```

## ⚠️ Points d'Attention

### Avant la Migration

1. **Sauvegarde** : Le script crée automatiquement une sauvegarde
2. **Test** : Commencez toujours par un dry run
3. **Permissions** : Vérifiez vos règles Firestore
4. **Quota** : Surveillez votre utilisation Firestore

### Pendant la Migration

1. **Ne pas interrompre** : Laissez le script se terminer
2. **Surveiller les logs** : Vérifiez qu'il n'y a pas d'erreurs
3. **Temps** : La migration peut prendre plusieurs minutes selon le nombre d'utilisateurs

### Après la Migration

1. **Vérifier les données** : Contrôlez que tout est créé
2. **Tester l'application** : Vérifiez que l'UI fonctionne
3. **Surveiller les performances** : Vérifiez que l'app reste rapide

## 🚨 Gestion des Erreurs

### Erreurs Communes

```bash
# Erreur de permissions
❌ Permission denied on collection 'users'

# Erreur de configuration Firebase
❌ Firebase: Error (auth/invalid-api-key)

# Erreur de quota
❌ Quota exceeded for collection
```

### Solutions

1. **Permissions** : Vérifiez vos règles Firestore
2. **Configuration** : Vérifiez vos clés Firebase
3. **Quota** : Attendez ou contactez Firebase Support

## 📝 Logs et Monitoring

### Niveaux de Log

- **DEBUG** : Détails complets de chaque opération
- **INFO** : Informations générales (recommandé)
- **WARN** : Avertissements et problèmes mineurs
- **ERROR** : Erreurs critiques

### Exemple de Log

```bash
🚀 Début de la migration des utilisateurs existants

🔍 Récupération de tous les utilisateurs...
✅ 150 utilisateurs trouvés

💾 Création de la sauvegarde...
✅ Sauvegarde créée: backup_1703123456789

🔄 Début de la migration de 150 utilisateurs...

📦 Traitement du lot 1/3
🔄 [██████████████████████████████████████████████████] 100% (150/150) Migration de user@example.com

============================================================
🎯 MIGRATION TERMINÉE !
============================================================
📊 Résumé de la migration:
   • Total d'utilisateurs: 150
   • Migrations réussies: 148
   • Migrations partielles: 2
   • Erreurs: 0
   • Déjà complets: 0
   • Documents créés: 1200
   • Erreurs totales: 0
```

## 🔄 Rollback et Récupération

### En Cas de Problème

1. **Utiliser la sauvegarde** : Le script crée une sauvegarde automatique
2. **Restaurer manuellement** : Utilisez les données de la collection `migrations`
3. **Contacter le support** : Si le problème persiste

### Fichiers de Sauvegarde

- **Backup** : `migrations/backup_TIMESTAMP`
- **Statistiques** : `migrations/stats_TIMESTAMP`
- **Logs** : Console et collection `migrations`

## 🎯 Prochaines Étapes

### Après la Migration

1. **Tester l'application** : Vérifiez que tout fonctionne
2. **Former les utilisateurs** : Expliquez les nouvelles fonctionnalités
3. **Surveiller l'utilisation** : Vérifiez les performances
4. **Planifier les évolutions** : Préparez les prochaines fonctionnalités

### Évolutions Futures

- Ajout de nouvelles collections
- Modification des structures existantes
- Migration de données entre collections
- Optimisation des performances

## 📞 Support

### En Cas de Problème

1. **Vérifiez les logs** : Commencez par analyser les erreurs
2. **Testez en mode dry run** : Vérifiez la configuration
3. **Consultez la documentation** : Ce guide et les commentaires du code
4. **Contactez l'équipe** : Si le problème persiste

### Ressources Utiles

- [Documentation Firebase](https://firebase.google.com/docs)
- [Guide Firestore](https://firebase.google.com/docs/firestore)
- [Règles de sécurité](https://firebase.google.com/docs/firestore/security)

---

**🎉 Félicitations !** Votre migration est maintenant prête. Commencez par un test et n'hésitez pas à ajuster la configuration selon vos besoins.
