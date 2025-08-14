# 🚨 Guide de Dépannage - Migration des Utilisateurs

## 🚨 **PROBLÈMES COURANTS ET SOLUTIONS**

### ❌ **Erreur 1: "Cannot find module 'firebase/app'"**

**Symptôme:**
```bash
Error: Cannot find module 'firebase/app'
```

**Solution:**
```bash
# Installer les dépendances Firebase
npm install firebase firebase-admin

# Ou si vous utilisez yarn
yarn add firebase firebase-admin
```

---

### ❌ **Erreur 2: "Invalid API key"**

**Symptôme:**
```bash
Firebase: Error (auth/invalid-api-key)
```

**Solution:**
1. Ouvrez `migration-config.js`
2. Remplacez `"your-api-key-here"` par votre vraie clé API
3. Vérifiez dans Firebase Console > Paramètres du projet > Général

---

### ❌ **Erreur 3: "Permission denied"**

**Symptôme:**
```bash
Permission denied on collection 'users'
```

**Solution:**
1. Vérifiez vos règles Firestore dans Firebase Console
2. Assurez-vous que l'authentification est configurée
3. Vérifiez que votre clé API a les bonnes permissions

---

### ❌ **Erreur 4: "Project not found"**

**Symptôme:**
```bash
Firebase: Error (auth/project-not-found)
```

**Solution:**
1. Vérifiez votre `projectId` dans `migration-config.js`
2. Assurez-vous que le projet existe dans Firebase Console
3. Vérifiez que vous êtes connecté au bon compte Google

---

### ❌ **Erreur 5: "Quota exceeded"**

**Symptôme:**
```bash
Quota exceeded for collection
```

**Solution:**
1. Attendez que le quota se renouvelle (généralement à minuit)
2. Vérifiez votre utilisation dans Firebase Console
3. Contactez Firebase Support si le problème persiste

---

## 🔧 **ÉTAPES DE DÉPANNAGE**

### **Étape 1: Vérifier la Configuration**
```bash
# Lancer le script de démarrage
node start-migration.cjs
```

### **Étape 2: Tester la Configuration**
```bash
# Tester la configuration Firebase
node test-migration-setup.cjs
```

### **Étape 3: Tester sur un Utilisateur**
```bash
# Remplacer USER_ID par un vrai ID d'utilisateur
node migrate-existing-users.cjs test USER_ID
```

### **Étape 4: Vérifier les Logs**
```bash
# Afficher l'aide du script
node migrate-existing-users.cjs help
```

---

## 📋 **CHECKLIST DE VÉRIFICATION**

### ✅ **Avant de Lancer la Migration**

- [ ] Dépendances Firebase installées (`npm install firebase firebase-admin`)
- [ ] Configuration Firebase complète dans `migration-config.js`
- [ ] Clés API valides et à jour
- [ ] Projet Firebase accessible
- [ ] Permissions Firestore configurées
- [ ] Mode dry run testé (`dryRun: true`)

### ✅ **Pendant la Migration**

- [ ] Script lancé avec les bonnes permissions
- [ ] Connexion internet stable
- [ ] Pas d'interruption du script
- [ ] Logs surveillés pour détecter les erreurs

### ✅ **Après la Migration**

- [ ] Vérification des collections créées
- [ ] Test de l'application
- [ ] Vérification des performances
- [ ] Sauvegarde des résultats

---

## 🆘 **EN CAS D'URGENCE**

### **1. Arrêter la Migration**
```bash
# Appuyez sur Ctrl+C pour arrêter le script
# Ne fermez pas brutalement le terminal
```

### **2. Vérifier l'État**
```bash
# Vérifier les collections dans Firebase Console
# Regarder les logs pour identifier le problème
```

### **3. Restaurer depuis la Sauvegarde**
```bash
# Le script crée automatiquement des sauvegardes
# Vérifiez la collection 'migrations' dans Firestore
```

### **4. Contacter le Support**
- Vérifiez d'abord ce guide de dépannage
- Consultez la documentation Firebase
- Contactez l'équipe technique

---

## 🔍 **DIAGNOSTIC AUTOMATIQUE**

### **Lancer le Diagnostic Complet**
```bash
# Diagnostic automatique
node test-migration-setup.cjs

# Diagnostic avec un utilisateur spécifique
node test-migration-setup.cjs USER_ID
```

### **Ce que fait le Diagnostic**
- ✅ Vérifie la configuration Firebase
- ✅ Teste la connexion à Firestore
- ✅ Vérifie les permissions
- ✅ Analyse la structure des collections
- ✅ Teste un utilisateur spécifique

---

## 📚 **RESSOURCES UTILES**

### **Documentation Officielle**
- [Firebase Console](https://console.firebase.google.com/)
- [Documentation Firebase](https://firebase.google.com/docs)
- [Guide Firestore](https://firebase.google.com/docs/firestore)

### **Fichiers de Migration**
- `start-migration.cjs` - Démarrage guidé
- `test-migration-setup.cjs` - Diagnostic automatique
- `migrate-existing-users.cjs` - Script principal
- `migration-config.js` - Configuration

### **Guides Complets**
- `MIGRATION_GUIDE.md` - Guide détaillé
- `MIGRATION_README.md` - Guide rapide

---

## 🎯 **COMMANDES DE RÉCUPÉRATION**

### **Redémarrer la Migration**
```bash
# Après correction des erreurs
node start-migration.cjs
```

### **Vérifier l'État Actuel**
```bash
# Voir les collections existantes
node test-migration-setup.cjs
```

### **Mode Test Sécurisé**
```bash
# Tester sans modifier les données
# Modifiez dryRun: true dans migration-config.js
node migrate-existing-users.cjs
```

---

**💡 Conseil:** Commencez toujours par le mode test et vérifiez la configuration avant de lancer la vraie migration !
