# 🚀 Migration des Utilisateurs Existants - Guide Rapide

## 📁 Fichiers Créés

- **`migrate-existing-users.cjs`** - Script principal de migration
- **`migration-config.js`** - Configuration Firebase et paramètres
- **`test-migration-setup.cjs`** - Test de la configuration
- **`MIGRATION_GUIDE.md`** - Guide complet détaillé

## ⚡ Démarrage Rapide

### 1. Configuration
```bash
# Modifier migration-config.js avec vos clés Firebase
nano migration-config.js
```

### 2. Test de Configuration
```bash
# Tester la configuration
node test-migration-setup.cjs

# Tester avec un utilisateur spécifique
node test-migration-setup.cjs USER_ID
```

### 3. Migration
```bash
# Test sur un utilisateur (recommandé en premier)
node migrate-existing-users.cjs test USER_ID

# Migration complète de tous les utilisateurs
node migrate-existing-users.cjs
```

## 🎯 Ce que fait la Migration

✅ **Crée automatiquement** tous les sous-documents manquants pour chaque utilisateur  
✅ **Préserve** leurs données existantes  
✅ **Ajoute** la structure complète (comptes, budgets, facturation, etc.)  
✅ **Sauvegarde** automatiquement avant migration  
✅ **Traite par lots** pour éviter les timeouts  

## 🔒 Sécurité

- **Mode dry run** pour tester sans risque
- **Sauvegarde automatique** avant modification
- **Vérification des permissions** avant migration
- **Logs détaillés** de chaque opération

## 📊 Structure Créée

Pour chaque utilisateur existant, le script crée :
- `accounts/{userId}` - Comptes bancaires
- `beneficiaries/{userId}` - Bénéficiaires
- `budgets/{userId}` - Budgets
- `billing/{userId}` - Facturation
- `cardLimits/{userId}` - Limites de cartes
- `documents/{userId}` - Documents
- `notifications/{userId}` - Préférences
- `transactions/{userId}` - Transactions
- `transfers/{userId}` - Virements

## ⚠️ Points Importants

1. **Commencez par un test** sur un utilisateur spécifique
2. **Vérifiez votre configuration** Firebase avant migration
3. **Ne pas interrompre** le script pendant la migration
4. **Surveillez les logs** pour détecter les erreurs

## 🆘 En Cas de Problème

```bash
# Vérifier la configuration
node test-migration-setup.cjs

# Afficher l'aide
node migrate-existing-users.cjs help

# Consulter le guide complet
cat MIGRATION_GUIDE.md
```

## 📚 Documentation Complète

Consultez **`MIGRATION_GUIDE.md`** pour :
- Configuration détaillée
- Gestion des erreurs
- Monitoring et logs
- Rollback et récupération
- Évolutions futures

---

**🎉 Prêt à migrer vos utilisateurs existants !**
